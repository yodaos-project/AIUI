import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownReport, summarizeRuns } from '../scripts/run-all.js';

const runner = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../scripts/run-all.js');

test('run-all counts unresolved and missing records and renders the report', () => {
  const results = [
    { task: '001-create-page', status: 'completed', resolved: true, required: { passed: 2, total: 2 }, regression: { passed: 0, total: 0 }, constraintViolations: 0, usage: { promptTokens: 10, completionTokens: 3 } },
    { task: '002-create-counter', status: 'max_steps', resolved: false, required: { passed: 1, total: 2 }, regression: { passed: 0, total: 0 }, constraintViolations: 0, usage: { promptTokens: 8, completionTokens: 2 } },
    { task: '003-create-widget', status: 'cli_error', resolved: false, error: 'no result file' },
  ];
  const summary = summarizeRuns(results, 'deepseek-flash', 'start', 'finish');

  assert.equal(summary.resolved, 1);
  assert.equal(summary.total, 3);
  assert.equal(summary.resolvedRate, 1 / 3);
  assert.deepEqual(summary.usage, { promptTokens: 18, completionTokens: 5 });
  assert.match(markdownReport(summary), /^# AIUI Coding Benchmark/);
  assert.match(markdownReport(summary), /003-create-widget.*cli_error/);
  assert.match(markdownReport(summary), /no result file/);
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
