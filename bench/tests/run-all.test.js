import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownReport, runConcurrent, summarizeRuns } from '../scripts/run-all.js';

const runner = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../scripts/run-all.js');

test('concurrent runner caps active tasks and preserves catalog order', async () => {
  const releases = new Map();
  const started = [];
  const pending = runConcurrent([0, 1, 2, 3], 2, async id => {
    started.push(id);
    await new Promise(resolve => releases.set(id, resolve));
    return id;
  });
  assert.deepEqual(started, [0, 1]);
  releases.get(1)();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(started, [0, 1, 2]);
  releases.get(2)();
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(started, [0, 1, 2, 3]);
  releases.get(3)();
  releases.get(0)();
  assert.deepEqual(await pending, [0, 1, 2, 3]);
});

test('concurrent runner supports serial execution and validates limits', async () => {
  let active = 0;
  await runConcurrent([0, 1, 2], 1, async () => {
    assert.equal(++active, 1);
    await new Promise(resolve => setImmediate(resolve));
    active--;
  });
  for (const value of [0, -1, 1.5, 33, NaN]) {
    await assert.rejects(runConcurrent([], value, () => {}), /--concurrency/);
  }
});

test('concurrent runner waits for active tasks before propagating an error', async () => {
  let release;
  let finished = false;
  const pending = runConcurrent([0, 1], 2, async id => {
    if (id === 0) throw new Error('failed');
    await new Promise(resolve => { release = resolve; });
    finished = true;
  });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(finished, false);
  release();
  await assert.rejects(pending, /failed/);
  assert.equal(finished, true);
});

test('run-all counts unresolved and missing records and renders the report', () => {
  const results = [
    { task: '001-create-page', status: 'completed', resolved: true, required: { passed: 2, total: 2 }, regression: { passed: 0, total: 0 }, constraintViolations: 0, usage: { promptTokens: 10, completionTokens: 3 }, cost: { estimatedUsd: 0.015, knownUsd: 0.015, complete: true, pricingSource: 'https://example.test/pricing', pricingAsOf: '2026-09-30' } },
    { task: '002-create-counter', status: 'max_steps', resolved: false, required: { passed: 1, total: 2 }, regression: { passed: 0, total: 0 }, constraintViolations: 0, usage: { promptTokens: 8, completionTokens: 2 }, cost: { estimatedUsd: 0.02, knownUsd: 0.02, complete: true } },
    { task: '003-create-widget', status: 'cli_error', resolved: false, error: 'no result file' },
  ];
  const summary = summarizeRuns(results, 'deepseek-flash', 'start', 'finish');

  assert.equal(summary.resolved, 1);
  assert.equal(summary.total, 3);
  assert.equal(summary.resolvedRate, 1 / 3);
  assert.deepEqual(summary.usage, { promptTokens: 18, completionTokens: 5 });
  assert.equal(summary.cost.estimatedUsd, null);
  assert.equal(summary.cost.unpricedTasks, 1);
  assert.ok(Math.abs(summary.cost.knownUsd - 0.035) < 1e-12);
  assert.match(markdownReport(summary), /^# AIUI Coding Benchmark/);
  assert.match(markdownReport(summary), /Est\. cost \(USD\)/);
  assert.match(markdownReport(summary), /001-create-page.*\$0\.015000/);
  assert.match(markdownReport(summary), /003-create-widget.*N\/A/);
  assert.match(markdownReport(summary), /known subtotal \$0\.035000/);
  assert.match(markdownReport(summary), /003-create-widget.*cli_error/);
  assert.match(markdownReport(summary), /no result file/);
});

test('run-all totals USD estimates when every task has complete usage', () => {
  const results = [
    { task: '001-create-page', resolved: true, cost: { complete: true, knownUsd: 0.015, estimatedUsd: 0.015 } },
    { task: '002-create-counter', resolved: false, cost: { complete: true, knownUsd: 0.02, estimatedUsd: 0.02 } },
  ];
  const summary = summarizeRuns(results, 'deepseek-flash', 'start', 'finish');
  assert.equal(summary.cost.complete, true);
  assert.ok(Math.abs(summary.cost.estimatedUsd - 0.035) < 1e-12);
  assert.match(markdownReport(summary), /Estimated API cost \(USD\): \*\*\$0\.035000\*\*/);
});

test('run-all preserves grading versions and identifies mixed historical rules', () => {
  const current = summarizeRuns([{gradingVersion: 2}], 'model', 'start', 'finish');
  assert.equal(current.gradingVersion, 2);
  const mixed = summarizeRuns([{gradingVersion: 1}, {gradingVersion: 2}], 'model', 'start', 'finish');
  assert.equal(mixed.gradingVersion, null);
  assert.deepEqual(mixed.gradingVersions, [1, 2]);
  assert.match(markdownReport(mixed), /Grading version: unknown or mixed/);
});

test('run-all rejects a missing secret before creating result files', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'aiui-bench-run-all-'));
  try {
    const outputDir = path.join(parent, 'results');
    const result = spawnSync(process.execPath, [runner, '--output-dir', outputDir], {
      encoding: 'utf8',
      env: { ...process.env, DEEPSEEK_API_KEY: '' },
    });
    assert.equal(result.status, 2);
    assert.match(result.stderr, /DEEPSEEK_API_KEY is missing/);
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
});
