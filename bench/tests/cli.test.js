import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { lstat, mkdtemp, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertOutsideRepository, parseMaxSteps, resolvedRate } from '../src/cli-utils.js';

const benchRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repository = path.resolve(benchRoot, '..');
const cli = path.join(benchRoot, 'src/cli.js');
function run(args, env = {}) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: repository, encoding: 'utf8', env: { ...process.env, DEEPSEEK_API_KEY: 'test-key', ...env } });
}
async function absent(file) { return lstat(file).then(() => false, error => error.code === 'ENOENT'); }

test('CLI rejects missing option values before creating a workspace', async () => {
  const missing = run(['infer', '001-create-page', '--workspace', '--model', 'deepseek-flash']);
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /--workspace requires a value/);
  const prepare = run(['prepare', '001-create-page', '--workspace', '--model']);
  assert.equal(prepare.status, 2);
  assert.match(prepare.stderr, /--workspace requires a value/);
});

test('CLI rejects explicit zero and non-numeric max steps before preparing', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'aiui-cli-steps-'));
  try {
    for (const value of ['0', 'abc', '101']) {
      const destination = path.join(parent, `run-${value}`);
      const result = run(['infer', '001-create-page', '--workspace', destination, '--max-steps', value]);
      assert.equal(result.status, 2);
      assert.match(result.stderr, /maxSteps must be between 1 and 100/);
      assert.equal(await absent(destination), true);
    }
    assert.equal(parseMaxSteps(undefined), 30);
    assert.equal(parseMaxSteps('1'), 1);
  } finally { await rm(parent, { recursive: true, force: true }); }
});

test('CLI reports an empty key file even when an environment key exists', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'aiui-cli-key-'));
  try {
    const keyFile = path.join(parent, 'empty.key');
    const destination = path.join(parent, 'workspace');
    await writeFile(keyFile, '  \n');
    const result = run(['infer', '001-create-page', '--workspace', destination, '--api-key-file', keyFile]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /API key file is empty/);
    assert.equal(await absent(destination), true);
  } finally { await rm(parent, { recursive: true, force: true }); }
});

test('CLI rejects a symlinked path into the repository before preparing', async () => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'aiui-cli-path-'));
  try {
    const alias = path.join(parent, 'repo-alias');
    await symlink(repository, alias, 'dir');
    const destination = path.join(alias, 'bench', `guard-${path.basename(parent)}`);
    const canonicalRepository = await realpath(repository);
    await assert.rejects(assertOutsideRepository(canonicalRepository, destination), /outside the AIUI repository/);
    const result = run(['infer', '001-create-page', '--workspace', destination]);
    assert.equal(result.status, 2);
    assert.match(result.stderr, /outside the AIUI repository/);
    assert.equal(await absent(destination), true);
  } finally { await rm(parent, { recursive: true, force: true }); }
});

test('empty grade sets have a finite zero resolved rate', () => {
  assert.equal(resolvedRate(0, 0), 0);
  assert.equal(resolvedRate(2, 4), 0.5);
});
