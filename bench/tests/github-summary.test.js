import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { markdownActionSummary } from '../scripts/github-summary.js';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../scripts/github-summary.js');

test('Actions summary compares selected models before their detailed reports', () => {
  const output = markdownActionSummary([
    {
      summary: { model: 'model-a', resolved: 18, total: 19, resolvedRate: 18 / 19, cost: { complete: true, estimatedUsd: 1.9 } },
      report: '# AIUI Coding Benchmark\n\nModel: `model-a`\n\n| Task | Status |\n| --- | --- |\n| 001-create-page | completed |\n',
    },
    {
      summary: { model: 'model-b', resolved: 17, total: 19, resolvedRate: 17 / 19, cost: { complete: false, estimatedUsd: null } },
      report: '# AIUI Coding Benchmark\n\nModel: `model-b`\n\n| Task | Status |\n| --- | --- |\n| 002-create-counter | max_steps |\n',
    },
  ]);

  assert.match(output, /^# AIUI Coding Benchmark\n\n\| Model \| Resolved \| Avg\. cost/);
  assert.match(output, /\| `model-a` \| 18\/19 \(95%\) \| \$0\.100000 \|/);
  assert.match(output, /\| `model-b` \| 17\/19 \(89%\) \| N\/A \|/);
  assert.equal(output.match(/<details>/g)?.length, 2);
  assert.ok(output.indexOf('## Details') < output.indexOf('001-create-page'));
  assert.ok(output.indexOf('001-create-page') < output.indexOf('002-create-counter'));
  assert.equal(output.match(/# AIUI Coding Benchmark/g)?.length, 1);
});

test('Actions summary explains when no model report exists', () => {
  assert.match(markdownActionSummary([]), /No benchmark reports were produced/);
});

test('Actions summary command reads one row per completed model report', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'aiui-actions-summary-'));
  try {
    for (const [model, cost] of [['model-a', 0.4], ['model-b', 0.8]]) {
      const output = path.join(directory, model);
      await mkdir(output);
      await writeFile(path.join(output, 'summary.json'), JSON.stringify({
        model, resolved: 1, total: 2, resolvedRate: 0.5,
        cost: { complete: true, estimatedUsd: cost },
      }));
      await writeFile(path.join(output, 'report.md'), `# AIUI Coding Benchmark\n\n${model} task details\n`);
    }
    const run = spawnSync(process.execPath, [script, directory], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /\| `model-a` \| 1\/2 \(50%\) \| \$0\.200000 \|/);
    assert.match(run.stdout, /\| `model-b` \| 1\/2 \(50%\) \| \$0\.400000 \|/);
    assert.equal(run.stdout.match(/<details>/g)?.length, 2);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
