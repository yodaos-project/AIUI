import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getTask, root, validateTask } from '../src/schema.js';
import { prepare } from '../src/workspace.js';
import { grade } from '../src/grader.js';
import { checkStyle } from '../src/style.js';
import { executeTool } from '../src/agent-tools.js';
import { loadLogic } from '../src/behavior.js';

const pagePath = 'pages/index/index.ink';
const page = (logic, template, css = '.root { display: flex; }') =>
  `<script def>{}</script><script setup>${logic}</script><page>${template}</page><style>${css}</style>`;
async function fixture(id, callback) {
  const base = await mkdtemp(path.join(os.tmpdir(), 'aiui-compat-'));
  const workspace = path.join(base, 'workspace');
  try {
    const task = await getTask(id);
    await prepare(task, workspace);
    const put = async (file, content) => {
      await mkdir(path.dirname(path.join(workspace, file)), { recursive: true });
      await writeFile(path.join(workspace, file), content);
    };
    await callback(task, workspace, put, base);
  } finally { await rm(base, { recursive: true, force: true }); }
}
function only(task, required) {
  return { ...task, grading: { required, regression: [], constraints: [] } };
}

test('0.19 styles and animation events are supported; known exclusions and missing handlers still fail', async () => fixture('002-create-counter', async (task, workspace, put) => {
  const source = page('export default { done() {} };', '<text class="root" bindanimationend="done">Status</text>',
    '.root { white-space: nowrap; text-overflow: ellipsis; visibility: visible; animation: enter 1s; } @keyframes enter { from { opacity: 0; } to { opacity: 1; } }');
  const spec = only(task, []);
  await put(pagePath, source);
  assert.equal((await grade(spec, workspace)).resolved, true);
  for (const broken of [source.replace('visibility: visible', 'position: sticky'), source.replace('animation: enter 1s', 'animation-play-state: paused'), source.replace('done() {}', '')]) {
    await put(pagePath, broken);
    assert.equal((await grade(spec, workspace)).resolved, false);
  }
}));

test('logical Page checks accept multi-file authoring and reject incomplete or dual forms', async () => fixture('024-advance-level', async (task, workspace, put) => {
  await put('pages/index/index.json', '{}');
  await put('pages/index/index.wxml', '<view><text>{{level}}</text><button bindtap="next">Next Level</button></view>');
  await put('pages/index/index.wxss', '.root { display: flex; }');
  await put('pages/index/index.js', 'export default { data: { level: 1 }, next() { this.setData({level: this.data.level + 1}); } };');
  assert.equal((await grade(task, workspace)).resolved, true);
  await rm(path.join(workspace, 'pages/index/index.wxss'));
  assert.equal((await grade(task, workspace)).resolved, false);
  await put('pages/index/index.wxss', '');
  await put(pagePath, page('export default {};', '<view />'));
  assert.equal((await grade(task, workspace)).resolved, false);
}));

test('idempotent state changes need no redundant second patch, but direct mutation is rejected', async () => fixture('034-mark-read', async (task, workspace, put) => {
  const source = page('export default { data: { title: "Home", unread: 3 }, act() { if (this.data.unread === 0) return; this.setData({unread: 0}); } };',
    '<text>{{title}}</text><text>{{unread}}</text><button bindtap="act">Mark Read</button>');
  await put(pagePath, source);
  assert.equal((await grade(task, workspace)).resolved, true);
  await put(pagePath, source.replace('this.setData({unread: 0});', 'this.data.unread = 0;'));
  assert.equal((await grade(task, workspace)).resolved, false);
}));

test('scenario initializes optional onLoad once, honors explicit queries, and allows absent onShow', async () => fixture('002-create-counter', async (task, workspace, put) => {
  await put(pagePath, page('export default { data: { loads: 0, query: "" }, onLoad(query) { this.setData({loads: this.data.loads + 1, query: query.id || "default"}); } };', '<text>{{query}}</text>'));
  const check = { id: 'lifecycle', type: 'scenario', path: pagePath, steps: [
    { action: 'call', method: 'onShow' }, { action: 'expect', data: { loads: 1, query: 'default' } },
    { action: 'call', method: 'onShow' }, { action: 'expect', data: { loads: 1 } },
  ] };
  assert.equal((await grade(only(task, [check]), workspace)).resolved, true);
  check.steps = [{ action: 'call', method: 'onLoad', arg: { id: 'supplied' } }, { action: 'expect', data: { loads: 1, query: 'supplied' } }];
  assert.equal((await grade(only(task, [check]), workspace)).resolved, true);
  check.steps = [{ action: 'call', method: 'missingHandler' }, { action: 'expect', data: {} }];
  assert.equal((await grade(only(task, [check]), workspace)).resolved, false);
}));

test('request URLs compare decoded query semantics and still reject changed values', async () => fixture('002-create-counter', async (task, workspace, put) => {
  await put(pagePath, page('export default { load() { fetch("https://example.test/search?lang=en&q=new+%26+1"); } };', '<button bindtap="load">Search</button>'));
  const check = { id: 'encoding', type: 'scenario', path: pagePath, steps: [
    { action: 'call', button: 'Search' },
    { action: 'expect', effects: { requestUrls: ['https://example.test/search?q=new%20%26%201&lang=en'] } },
  ] };
  assert.equal((await grade(only(task, [check]), workspace)).resolved, true);
  check.steps[1].effects.requestUrls[0] = 'https://example.test/search?q=wrong&lang=en';
  assert.equal((await grade(only(task, [check]), workspace)).resolved, false);
}));

test('style checks tolerate unrelated state/media rules and expose conditional uncertainty', async () => fixture('076-widget-relative-layout', async (task, workspace, put) => {
  const source = page('export default {};', '<view class="root" />', '.root { width: 100%; height: 100%; } .action:focus { outline: 1px solid green; } @media (min-width: 360px) { .action { color: red; } }');
  const check = { id: 'size', type: 'style', path: pagePath, className: 'root', declarations: { width: '100%', height: '100%' } };
  assert.equal(checkStyle(source, check).passed, true);
  const conditional = source.replace('.action { color: red; }', '.root { width: 50%; }');
  assert.equal(checkStyle(conditional, check).passed, null);
  // The same uncertainty is visible in grading and never resolves the task.
  await put('app.json', '{"pages":["pages/index/index"]}');
  await put(pagePath, conditional);
  const result = await grade(only(task, [check]), workspace);
  assert.equal(result.resolved, false);
  assert.equal(result.required.unverified, 1);
  assert.equal(result.required.checks[0].passed, null);
  assert.equal(checkStyle(source.replace('width: 100%', 'width: 50%'), check).passed, false);
}));

test('watch scenarios use live handles, ignore stale updates, and accept cleared hidden coordinates', async () => fixture('071-watch-resume', async (task, workspace, put) => {
  const logic = `export default { data: { title: 'Watch Resume', info: '', latitude: null },
    onShow() { this.stop(); const generation = this.generation; this.watch = navigator.geolocation.watchPosition(pos => { if (generation === this.generation) this.setData({latitude: pos.coords.latitude}); }, () => {}); },
    stop() { this.generation = (this.generation || 0) + 1; if (this.watch != null) navigator.geolocation.clearWatch(this.watch); this.watch = null; },
    onHide() { this.stop(); this.setData({latitude: null}); }, onUnload() { this.stop(); }, about() { this.setData({info:'AIUI'}); } };`;
  const source = page(logic, '<text>{{title}}</text><text>{{latitude}}</text><button bindtap="about">About</button>');
  await put(pagePath, source);
  assert.equal((await grade(task, workspace)).resolved, true);
  await put(pagePath, source.replace('generation === this.generation', 'true'));
  assert.equal((await grade(task, workspace)).resolved, false, 'late callbacks must not overwrite current coordinates');
  await put(pagePath, source.replace('navigator.geolocation.clearWatch(this.watch)', 'void this.watch'));
  assert.equal((await grade(task, workspace)).resolved, false, 'leaked watches remain failures');
  const invalid = structuredClone(task);
  invalid.grading.required[1].steps[2].request = 'unknown';
  assert.throws(() => validateTask(invalid, task.directory), /scenario request/);
}));

test('delete tool removes only regular workspace files and never follows symlinks', async () => fixture('001-create-page', async (_, workspace, put, base) => {
  const options = { workspace, skill: path.resolve(root, '../skills/aiui-dev') };
  await put('old.js', 'obsolete');
  assert.equal((await executeTool('delete_workspace', { path: 'old.js' }, options)).deleted, true);
  assert.equal((await executeTool('delete_workspace', { path: 'old.js' }, options)).deleted, false);
  await assert.rejects(executeTool('delete_workspace', { path: '../escape' }, options), /project-relative/);
  await mkdir(path.join(workspace, 'pages'));
  await assert.rejects(executeTool('delete_workspace', { path: 'pages' }, options), /regular project files/);
  await put('keep.js', 'keep');
  await symlink(path.join(workspace, 'keep.js'), path.join(workspace, 'linked.js'));
  await assert.rejects(executeTool('delete_workspace', { path: 'linked.js' }, options), /symlinks/);
  await symlink(base, path.join(workspace, 'outside'));
  await assert.rejects(executeTool('delete_workspace', { path: 'outside/keep.js' }, options), /symlinks/);
  assert.equal(await readFile(path.join(workspace, 'keep.js'), 'utf8'), 'keep');
}));

test('public validation parses source without executing it or exposing hidden task checks', async () => fixture('001-create-page', async (_, workspace, put) => {
  const options = { workspace, skill: path.resolve(root, '../skills/aiui-dev') };
  await put(pagePath, page('throw new Error("must not execute"); export default {};', '<text>Hello</text>'));
  const valid = await executeTool('validate_workspace', {}, options);
  assert.equal(valid.valid, true, JSON.stringify(valid));
  assert.ok(valid.notVerified.includes('runtime behavior'));
  assert.equal(valid.grading, undefined);
  await put(pagePath, page('export default { broken( };', '<text>Hello</text>'));
  const invalid = await executeTool('validate_workspace', {}, options);
  assert.equal(invalid.valid, false);
  assert.ok(invalid.issues.some(issue => issue.rule === 'javascript-syntax'));
  await put('bad.json', '{broken');
  assert.ok((await executeTool('validate_workspace', {}, options)).issues.some(issue => issue.rule === 'json-syntax'));
}));

test('setData supports dot paths and callback re-entry without firing ready', async () => fixture('002-create-counter', async (_, workspace, put) => {
  await put(pagePath, page(`export default { data: { status: { label: 'waiting' }, calls: 0 },
    update() { this.setData({'status.label': 'ready'}, () => this.setData({calls: this.data.calls + 1})); },
    onReady() { throw new Error('syntax/data synchronization is not first-frame presentation'); } };`, '<text>{{status.label}}</text>'));
  const logic = await loadLogic(workspace, pagePath);
  logic.call('update');
  assert.deepEqual(JSON.parse(logic.snapshot()).data, {status: {label: 'ready'}, calls: 1});
}));
