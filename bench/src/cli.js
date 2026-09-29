#!/usr/bin/env node
/**
 * Public bench command line. Commands keep their JSON output and exit codes
 * stable for shell/CI callers: 0 means success, 1 means an unresolved result,
 * and 2 means invalid input or an inference error.
 * @module cli
 */
import { access, lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { assertOutsideRepository, optionValue, parseMaxSteps, resolvedRate } from './cli-utils.js';
import { grade } from './grader.js';
import { infer } from './infer.js';
import { getTask, root, tasks } from './schema.js';
import { prepare } from './workspace.js';

const usage = 'usage: bench list | inspect ID | prepare ID --workspace PATH | infer ID --workspace PATH [--model MODEL] [--api-key-file PATH] [--skill PATH] [--max-steps N] [--output FILE] | prepare-all --workspaces PATH | grade ID [--workspace PATH] [--output FILE] | grade-all --workspaces PATH [--output-dir PATH] | summary RESULT.json...';

/** Emit one machine-readable JSON value to stdout. */
function print(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

/** Keep hidden grading fields out of inspect and prepare responses. */
function publicTask({ id, category, difficulty, description, aiuiVersion }) {
  return { id, category, difficulty, description, aiuiVersion };
}

/** Read a mandatory CLI option and add command context to its error. */
function requireOption(options, name, command) {
  const value = optionValue(options, name);
  if (!value) throw new Error(`${command} requires ${name} PATH`);
  return value;
}

/** Create parent directories and save a pretty-printed JSON artifact. */
async function saveJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

/** Check a path with lstat so even a dangling symlink counts as existing. */
async function exists(file) {
  try {
    await lstat(file);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

/** Prepare all starting fixtures after checking that no target is occupied. */
async function prepareAll(options) {
  const base = path.resolve(requireOption(options, '--workspaces', 'prepare-all'));
  const catalog = await tasks();

  for (const task of catalog) {
    if (await exists(path.join(base, task.id))) {
      throw new Error(`destination already exists: ${task.id}`);
    }
  }
  for (const task of catalog) await prepare(task, path.join(base, task.id));

  print(catalog.map(task => ({ ...publicTask(task), workspace: path.join(base, task.id) })));
}

/** Grade one workspace per catalog task and optionally save each result. */
async function gradeAll(options) {
  const base = path.resolve(requireOption(options, '--workspaces', 'grade-all'));
  const outputDir = optionValue(options, '--output-dir');
  const results = [];

  for (const task of await tasks()) {
    const workspace = path.join(base, task.id);
    await access(workspace);
    const result = await grade(task, workspace);
    results.push(result);
    if (outputDir) await saveJson(path.resolve(outputDir, `${task.id}.json`), result);
  }

  const resolved = results.filter(result => result.resolved).length;
  print({ resolved, total: results.length, resolvedRate: resolvedRate(resolved, results.length), results });
  if (resolved !== results.length) process.exitCode = 1;
}

/**
 * Read the API key from an explicit file or the environment. An explicitly
 * supplied empty file is an error rather than a fallback to another key.
 * Never include the key in CLI JSON output or result artifacts.
 */
async function apiKeyFromOptions(options) {
  const keyFile = optionValue(options, '--api-key-file');
  if (keyFile) {
    const file = path.resolve(keyFile);
    const apiKey = (await readFile(file, 'utf8')).trim();
    if (!apiKey) throw new Error(`API key file is empty: ${file}`);
    return apiKey;
  }
  if (!process.env.DEEPSEEK_API_KEY) {
    throw new Error('set DEEPSEEK_API_KEY or pass --api-key-file PATH for infer');
  }
  return process.env.DEEPSEEK_API_KEY;
}

/**
 * Guard the workspace both before creation and after realpath resolution,
 * then run the model and save its full trace. The CLI prints only a compact
 * outcome, leaving trace and grading details in the output file.
 */
async function inferTask(id, options) {
  const task = await getTask(id);
  const workspace = path.resolve(requireOption(options, '--workspace', 'infer'));
  const maxSteps = parseMaxSteps(optionValue(options, '--max-steps'));
  const model = optionValue(options, '--model') || 'deepseek-flash';
  const skill = path.resolve(optionValue(options, '--skill') || path.join(root, '../skills/aiui-dev'));
  const outputFile = optionValue(options, '--output');

  const repository = await realpath(path.resolve(root, '..'));
  await assertOutsideRepository(repository, workspace);
  const apiKey = await apiKeyFromOptions(options);
  if (!await exists(workspace)) await prepare(task, workspace);
  await assertOutsideRepository(repository, await realpath(workspace));

  const result = await infer(task, workspace, { apiKey, model, skill, maxSteps });
  const outputPath = path.resolve(outputFile || path.join(root, 'results', `${task.id}-${Date.now()}.json`));
  await saveJson(outputPath, result);

  print({
    task: id,
    model: result.model,
    status: result.status,
    resolved: result.grading?.resolved ?? false,
    required: result.grading && {
      passed: result.grading.required.passed,
      total: result.grading.required.total,
    },
    regression: result.grading && {
      passed: result.grading.regression.passed,
      total: result.grading.regression.total,
    },
    constraintViolations: result.grading?.constraints.violations ?? null,
    output: outputPath,
  });

  if (result.status === 'error') process.exitCode = 2;
  else if (result.status !== 'completed' || !result.grading?.resolved) process.exitCode = 1;
}

/** Grade one prepared workspace, or the checked-in starting fixture. */
async function gradeTask(id, options) {
  const task = await getTask(id);
  const workspace = path.resolve(optionValue(options, '--workspace') || path.join(task.directory, task.workspace));
  const result = await grade(task, workspace);
  const outputFile = optionValue(options, '--output');

  if (outputFile) await saveJson(path.resolve(outputFile), result);
  print(result);
  if (!result.resolved) process.exitCode = 1;
}

/** Aggregate grade JSON files and completed infer JSON files. */
async function summarize(files) {
  if (files.length === 0) throw new Error('summary requires result JSON files');
  const results = await Promise.all(files.map(async file => JSON.parse(await readFile(file, 'utf8'))));
  const resolved = results.filter(result =>
    result.grading ? result.status === 'completed' && result.grading.resolved : result.resolved).length;
  const rate = resolvedRate(resolved, results.length);
  print({
    resolved,
    total: results.length,
    resolvedRate: rate,
    display: `Resolved: ${resolved} / ${results.length}\nResolved Rate: ${Math.round(rate * 100)}%`,
  });
}

/** Dispatch subcommands; batch commands do not consume a task ID. */
async function main([command, id, ...options]) {
  switch (command) {
    case 'list':
      print((await tasks()).map(publicTask));
      break;
    case 'inspect':
      print(publicTask(await getTask(id)));
      break;
    case 'prepare': {
      const task = await getTask(id);
      const workspace = path.resolve(requireOption(options, '--workspace', 'prepare'));
      await prepare(task, workspace);
      print({ task: id, workspace, description: task.description });
      break;
    }
    case 'prepare-all':
      await prepareAll([id, ...options]);
      break;
    case 'grade':
      await gradeTask(id, options);
      break;
    case 'grade-all':
      await gradeAll([id, ...options]);
      break;
    case 'infer':
      await inferTask(id, options);
      break;
    case 'summary':
      await summarize([id, ...options].filter(Boolean));
      break;
    default:
      throw new Error(usage);
  }
}

try {
  await main(process.argv.slice(2));
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 2;
}
