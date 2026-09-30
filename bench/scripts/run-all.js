#!/usr/bin/env node
/** Run every bench task through the public infer CLI and collect CI artifacts. */
import { spawn } from 'node:child_process';
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { optionValue, parseMaxSteps, resolvedRate } from '../src/cli-utils.js';
import { root, tasks } from '../src/schema.js';

const repository = path.resolve(root, '..');
const cli = path.join(root, 'src/cli.js');

/** Reduce a full infer record to fields useful in the aggregate report. */
function resultFor(task, infer, exitCode, stderr) {
  if (!infer) {
    return { task, status: 'cli_error', resolved: false, exitCode, error: stderr.trim() || `CLI exited ${exitCode}` };
  }

  return {
    task,
    status: infer.status,
    resolved: infer.status === 'completed' && infer.grading?.resolved === true,
    exitCode,
    required: infer.grading?.required && {
      passed: infer.grading.required.passed,
      total: infer.grading.required.total,
    },
    regression: infer.grading?.regression && {
      passed: infer.grading.regression.passed,
      total: infer.grading.regression.total,
    },
    constraintViolations: infer.grading?.constraints?.violations ?? null,
    usage: infer.usage || { promptTokens: 0, completionTokens: 0 },
    cost: infer.cost || null,
    ...(infer.error ? { error: infer.error } : {}),
  };
}

/**
 * Summarize all catalog entries, including runs that failed before writing an
 * infer JSON file. A missing record must never inflate the resolved rate.
 */
export function summarizeRuns(results, model, startedAt, finishedAt) {
  const resolved = results.filter(result => result.resolved).length;
  const usage = results.reduce((total, result) => ({
    promptTokens: total.promptTokens + (result.usage?.promptTokens || 0),
    completionTokens: total.completionTokens + (result.usage?.completionTokens || 0),
  }), { promptTokens: 0, completionTokens: 0 });
  const knownUsd = results.reduce((total, result) => total + (result.cost?.knownUsd || 0), 0);
  const unpricedTasks = results.filter(result => !result.cost?.complete).length;

  return {
    schemaVersion: 1,
    model,
    startedAt,
    finishedAt,
    resolved,
    total: results.length,
    resolvedRate: resolvedRate(resolved, results.length),
    usage,
    cost: {
      currency: 'USD',
      estimatedUsd: unpricedTasks ? null : knownUsd,
      knownUsd,
      complete: unpricedTasks === 0,
      unpricedTasks,
      pricingSource: results.find(result => result.cost?.pricingSource)?.cost.pricingSource ?? null,
      pricingAsOf: results.find(result => result.cost?.pricingAsOf)?.cost.pricingAsOf ?? null,
    },
    results,
  };
}

/** Keep small token charges visible without rounding the stored USD amount. */
function displayUsd(amount) {
  return Number.isFinite(amount) ? `$${amount.toFixed(6)}` : 'N/A';
}

/** Render a GitHub job summary and a matching artifact report. */
export function markdownReport(summary) {
  const rows = summary.results.map(result => {
    const required = result.required ? `${result.required.passed}/${result.required.total}` : '—';
    const regression = result.regression ? `${result.regression.passed}/${result.regression.total}` : '—';
    return `| \`${result.task}\` | ${result.status} | ${result.resolved ? 'yes' : 'no'} | ${required} | ${regression} | ${result.constraintViolations ?? '—'} | ${displayUsd(result.cost?.estimatedUsd)} |`;
  });
  const failures = summary.results.filter(result => !result.resolved).map(result => {
    const failed = result.error || `required ${result.required?.passed ?? '—'}/${result.required?.total ?? '—'}, constraints ${result.constraintViolations ?? '—'}`;
    return `- \`${result.task}\`: ${failed.replace(/[\r\n|]/g, ' ')}`;
  });

  return [
    '# AIUI Coding Benchmark',
    '',
    `Model: \`${summary.model}\``,
    `Resolved: **${summary.resolved}/${summary.total} (${Math.round(summary.resolvedRate * 100)}%)**`,
    `Tokens: ${summary.usage.promptTokens} prompt, ${summary.usage.completionTokens} completion`,
    `Estimated API cost (USD): **${displayUsd(summary.cost.estimatedUsd)}**${summary.cost.complete ? '' : ` (known subtotal ${displayUsd(summary.cost.knownUsd)}; ${summary.cost.unpricedTasks} task(s) unavailable)`}`,
    `Pricing: [published DeepSeek USD token rates](${summary.cost.pricingSource || 'https://api-docs.deepseek.com/quick_start/pricing/'}), snapshot ${summary.cost.pricingAsOf || 'unknown'}; cache hit/miss and UTC peak hours are applied per request. Estimates may differ from billed charges.`,
    '',
    '| Task | Status | Resolved | Required | Regression | Violations | Est. cost (USD) |',
    '| --- | --- | --- | ---: | ---: | ---: | ---: |',
    ...rows,
    ...(failures.length ? ['', '## Unresolved or failed', '', ...failures] : []),
    '',
    'The artifact contains each infer trace, the generated workspaces, and summary.json.',
    '',
  ].join('\n');
}

/** Invoke the existing infer command once, retaining stdout and stderr. */
async function runTask(task, workspaceRoot, outputDir, model, maxSteps) {
  const id = task.id;
  const outputFile = path.join(outputDir, `${id}.infer.json`);
  const args = [
    cli, 'infer', id,
    '--workspace', path.join(workspaceRoot, id),
    '--model', model,
    '--max-steps', String(maxSteps),
    '--output', outputFile,
  ];
  const child = spawn(process.execPath, args, { cwd: repository, stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '';
  let stderr = '';
  child.stdout.on('data', chunk => { stdout += chunk; });
  child.stderr.on('data', chunk => { stderr += chunk; });
  const exitCode = await new Promise((resolve, reject) => {
    child.once('close', resolve);
    child.once('error', reject);
  }).catch(error => {
    stderr += String(error?.message ?? error);
    return null;
  });

  await writeFile(path.join(outputDir, `${id}.stdout.json`), stdout);
  if (stderr) await writeFile(path.join(outputDir, `${id}.stderr.txt`), stderr);
  let infer = null;
  try {
    infer = JSON.parse(await readFile(outputFile, 'utf8'));
  } catch {
    // A CLI error can occur before the infer record is written. Keep it in
    // the aggregate report and continue with the remaining catalog entries.
  }
  return resultFor(id, infer, exitCode, stderr);
}

async function main(args) {
  if (!process.env.DEEPSEEK_API_KEY?.trim()) {
    throw new Error('DEEPSEEK_API_KEY is missing; configure the GitHub Actions secret');
  }

  const model = optionValue(args, '--model') || 'deepseek-flash';
  const maxSteps = parseMaxSteps(optionValue(args, '--max-steps'));
  const outputDir = path.resolve(optionValue(args, '--output-dir') || path.join(root, 'results', `run-${Date.now()}`));
  const catalog = await tasks();
  if (catalog.length === 0) throw new Error('no benchmark tasks found');

  await mkdir(path.dirname(outputDir), { recursive: true });
  await mkdir(outputDir);
  const workspaceRoot = await mkdtemp(path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'aiui-bench-'));
  const startedAt = new Date().toISOString();
  const results = [];

  try {
    for (const task of catalog) {
      const result = await runTask(task, workspaceRoot, outputDir, model, maxSteps);
      results.push(result);
      process.stdout.write(`${task.id}: ${result.status}, resolved=${result.resolved}\n`);
    }

    await cp(workspaceRoot, path.join(outputDir, 'workspaces'), { recursive: true });
  } finally {
    await rm(workspaceRoot, { recursive: true, force: true });
  }

  const summary = summarizeRuns(results, model, startedAt, new Date().toISOString());
  const report = markdownReport(summary);
  await writeFile(path.join(outputDir, 'summary.json'), `${JSON.stringify(summary, null, 2)}\n`);
  await writeFile(path.join(outputDir, 'report.md'), report);
  process.stdout.write(`Resolved ${summary.resolved}/${summary.total}; results: ${outputDir}\n`);
  if (summary.resolved !== summary.total) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    await main(process.argv.slice(2));
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
