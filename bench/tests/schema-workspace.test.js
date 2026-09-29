import test from 'node:test';
import assert from 'node:assert/strict';
import { lstat, mkdir, mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { loadTasks, validateTask } from '../src/schema.js';
import { prepare } from '../src/workspace.js';

const taskJson = (id, category, check = null) => ({
  schemaVersion: 1, id, category, difficulty: 'easy', description: 'Fixture', aiuiVersion: 'current', workspace: './workspace',
  grading: { required: check ? [check] : [], regression: [], constraints: [] },
});
async function absent(file) { return lstat(file).then(() => false, error => error.code === 'ENOENT'); }

test('catalog skips missing categories and files, then rejects duplicate task IDs', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'aiui-schema-'));
  try {
    assert.deepEqual(await loadTasks(root), []);
    await mkdir(path.join(root, 'create', 'shared'), { recursive: true });
    await writeFile(path.join(root, 'create', 'notes.txt'), 'ignore me');
    await writeFile(path.join(root, 'create', 'shared', 'task.json'), JSON.stringify(taskJson('shared', 'create')));
    assert.deepEqual((await loadTasks(root)).map(task => task.id), ['shared']);
    await mkdir(path.join(root, 'fix', 'shared'), { recursive: true });
    await writeFile(path.join(root, 'fix', 'shared', 'task.json'), JSON.stringify(taskJson('shared', 'fix')));
    await assert.rejects(loadTasks(root), /duplicate task id: shared/);
  } finally { await rm(root, { recursive: true, force: true }); }
});

test('schema requires and validates every path-bearing check field', () => {
  const directory = path.join(os.tmpdir(), 'create', 'fixture');
  const badChecks = [
    [{ id: 'file', type: 'file' }, /missing path/],
    [{ id: 'file', type: 'file', path: 42 }, /unsafe check path/],
    [{ id: 'behavior', type: 'behavior', path: 'pages/index.js', templatePath: 42 }, /unsafe check path/],
    [{ id: 'route', type: 'route', value: '../secret' }, /unsafe check path/],
    [{ id: 'order', type: 'routeOrder', before: 'pages/home', after: '/tmp/outside' }, /unsafe check path/],
    [{ id: 'overlay', type: 'overlayBehavior', path: 'pages/index.ink', widgetPath: '../outside' }, /unsafe check path/],
  ];
  for (const [check, message] of badChecks) assert.throws(() => validateTask(taskJson('fixture', 'create', check), directory), message);
  assert.equal(validateTask(taskJson('fixture', 'create', { id: 'page', type: 'file', path: 'pages/index.ink' }), directory).id, 'fixture');
});

test('prepare rejects existing and dangling source symlinks before copying', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'aiui-prepare-'));
  const source = path.join(root, 'task', 'workspace');
  try {
    await mkdir(path.join(source, 'nested'), { recursive: true });
    await writeFile(path.join(source, 'app.json'), '{}');
    const external = path.join(root, 'outside.txt');
    await writeFile(external, 'outside');
    const link = path.join(source, 'nested', 'link');
    const task = { directory: path.join(root, 'task') };
    for (const target of [external, path.join(root, 'missing.txt')]) {
      await symlink(target, link);
      const destination = path.join(root, `copy-${path.basename(target)}`);
      await assert.rejects(prepare(task, destination), /task workspace contains a symlink/);
      assert.equal(await absent(destination), true);
      await rm(link);
    }
    const destination = path.join(root, 'clean-copy');
    await prepare(task, destination);
    assert.equal(await absent(path.join(destination, 'app.json')), false);
  } finally { await rm(root, { recursive: true, force: true }); }
});
