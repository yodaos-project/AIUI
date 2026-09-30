import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getTask, tasks } from '../src/schema.js';
import { prepare } from '../src/workspace.js';
import { grade } from '../src/grader.js';
import { loadLogic } from '../src/behavior.js';

async function fixture(id, callback) {
  const base = await mkdtemp(path.join(os.tmpdir(), 'aiui-bench-'));
  const workspace = path.join(base, 'workspace');
  try { const task = await getTask(id); await prepare(task, workspace); return await callback(task, workspace); }
  finally { await rm(base, { recursive: true, force: true }); }
}
async function put(workspace, relative, contents) {
  const file = path.join(workspace, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, contents);
}
function page(logic, content) {
  return `<script def>{}</script><script setup>${logic}</script><page><view>${content}</view></page><style>.root { display: flex; }</style>`;
}

const solutions = {
  '012-create-multifile': async workspace => {
    await put(workspace, 'app.json', JSON.stringify({ pages: ['pages/index/index', 'pages/settings/index'] }));
    await put(workspace, 'pages/settings/index.json', '{}');
    await put(workspace, 'pages/settings/index.wxml', '<view><text>{{count}}</text><button bindtap="add">Increment</button></view>');
    await put(workspace, 'pages/settings/index.wxss', '.root { display: flex; }');
    await put(workspace, 'pages/settings/index.js', 'export default { data: { count: 0 }, add() { this.setData({ count: this.data.count + 1 }); } };');
  },
  '013-modify-watch': async workspace => {
    await put(workspace, 'app.json', JSON.stringify({ pages: ['pages/index/index'], permissions: ['GEOLOCATION'] }));
    await put(workspace, 'pages/index/index.ink', page(`export default { data: { title: 'Home', latitude: null, longitude: null }, watch() { this.watchId = navigator.geolocation.watchPosition(position => this.setData({ latitude: position.coords.latitude, longitude: position.coords.longitude }), () => {}); }, onUnload() { navigator.geolocation.clearWatch(this.watchId); } };`, '<text>{{title}}</text><text>{{latitude}}</text><text>{{longitude}}</text><button bindtap="watch">Watch</button>'));
  },
  '014-fix-worker-open': async workspace => {
    await put(workspace, 'workers/sync.js', `export default { latestStatus: 'idle', onOpen(event) { event.waitUntil(Promise.resolve().then(() => { this.latestStatus = 'ready'; })); } };`);
  },
  '015-fix-widget-lifecycle': async workspace => {
    await put(workspace, 'widgets/status/index.ink', `<script def>{"widget":{"family":"1x1"}}</script><script setup>export default { data: { status: 'idle' }, onAttach() { this.setData({ status: 'active' }); }, onDetach() { this.setData({ status: 'idle' }); } };</script><widget><view><text>{{status}}</text></view></widget><style>.root { width: 100%; height: 100%; }</style>`);
  },
  '016-create-storage': async workspace => {
    await put(workspace, 'pages/index/index.ink', page(`import wx from 'wx'; export default { data: { count: 3, restored: null }, save() { wx.setStorageSync('aiui-bench-count', this.data.count); }, load() { this.setData({ restored: wx.getStorageSync('aiui-bench-count') }); } };`, '<text>{{restored}}</text><button bindtap="save">Save</button><button bindtap="load">Load</button>'));
  },
  '017-create-overlay': async workspace => {
    await put(workspace, 'app.json', JSON.stringify({ pages: ['pages/index/index'], widgets: [{ path: 'widgets/weather/index', family: '1x1', displayName: 'Weather', description: 'Shows weather', placement: 'overlay' }] }));
    await put(workspace, 'pages/index/index.ink', page(`export default { data: { title: 'Home' }, show() { window.open('widgets/weather/index?city=hangzhou', '_widget'); } };`, '<text>{{title}}</text><button bindtap="show">Open Weather</button>'));
    await put(workspace, 'widgets/weather/index.ink', `<script def>{"widget":{"family":"1x1"}}</script><script setup>export default { data: { city: 'hangzhou' } };</script><widget><view><text>{{city}}</text></view></widget><style>.root { width: 100%; height: 100%; }</style>`);
  },
  '018-modify-voice-wakeup': async workspace => {
    await put(workspace, 'pages/index/index.ink', page(`export default { data: { wakeups: 0 }, onVoiceWakeup(event) { this.setData({ wakeups: this.data.wakeups + 1 }); } };`, '<text>{{wakeups}}</text>'));
  },
  '019-migrate-page': async workspace => {
    await put(workspace, 'pages/index/index.ink', page(`export default { data: { count: 0 }, increment() { this.setData({ count: this.data.count + 1 }); } };`, '<text>{{count}}</text><button bindtap="increment">Increment</button>'));
  },
};

test('the expanded catalog has fifty-five unique numbered tasks', async () => {
  const all = await tasks();
  assert.equal(all.length, 55);
  assert.deepEqual(all.map(task => task.id.slice(0, 3)), Array.from({ length: 55 }, (_, index) => String(index + 1).padStart(3, '0')));
});
for (const [id, solve] of Object.entries(solutions)) {
  test(`${id}: starting fixture fails and a behaviorally correct implementation resolves`, async () => fixture(id, async (task, workspace) => {
    assert.equal((await grade(task, workspace)).resolved, false);
    await solve(workspace);
    const result = await grade(task, workspace);
    assert.equal(result.resolved, true, JSON.stringify(result));
  }));
}

test('watching without clearing the returned ID fails', async () => fixture('013-modify-watch', async (task, workspace) => {
  await solutions['013-modify-watch'](workspace);
  const file = path.join(workspace, 'pages/index/index.ink');
  const { readFile } = await import('node:fs/promises');
  await writeFile(file, (await readFile(file, 'utf8')).replace('navigator.geolocation.clearWatch(this.watchId);', 'this.watchId = null;'));
  assert.equal((await grade(task, workspace)).resolved, false);
}));

test('an overlay opened as a Page fails', async () => fixture('017-create-overlay', async (task, workspace) => {
  await solutions['017-create-overlay'](workspace);
  const file = path.join(workspace, 'pages/index/index.ink');
  const { readFile } = await import('node:fs/promises');
  await writeFile(file, (await readFile(file, 'utf8')).replace("'_widget'", "'_self'"));
  assert.equal((await grade(task, workspace)).resolved, false);
}));

test('storage accepts formatted display but rejects a hardcoded read result', async () => fixture('016-create-storage', async (task, workspace) => {
  await solutions['016-create-storage'](workspace);
  const file = path.join(workspace, 'pages/index/index.ink');
  const { readFile } = await import('node:fs/promises');
  let source = await readFile(file, 'utf8');
  source = source.replace("restored: wx.getStorageSync('aiui-bench-count')", "restored: String(wx.getStorageSync('aiui-bench-count'))");
  source = source.replace('{{restored}}', "{{restored === '' ? '--' : restored}}");
  await writeFile(file, source);
  assert.equal((await grade(task, workspace)).resolved, true);
  await writeFile(file, source.replace("String(wx.getStorageSync('aiui-bench-count'))", "'8'"));
  assert.equal((await grade(task, workspace)).resolved, false);
}));

test('behavior runner loads local imports and named exports used by a handler', async () => fixture('005-modify-toggle', async (_, workspace) => {
  await put(workspace, 'pages/index/math.js', `export const factor = 4;
export function add(a, b) { return a + b; }
const offset = 3;
export { offset as extra };
export default { base: 2 };`);
  await put(workspace, 'pages/index/proxy.js', `export { factor as multiplier } from './math.js';`);
  await put(workspace, 'pages/index/index.ink', page(`import math, { add, extra } from './math.js';
import { multiplier } from './proxy.js';
export const label = 'sum';
export default { data: { count: 0 }, calculate() { this.setData({ count: add(math.base + extra, multiplier) }); } };`, '<text>{{count}}</text>'));
  const logic = await loadLogic(workspace, 'pages/index/index.ink');
  logic.call('calculate');
  assert.equal(JSON.parse(logic.snapshot()).data.count, 9);
}));

test('behavior runner binds explicit mocks for external named imports', async () => fixture('005-modify-toggle', async (_, workspace) => {
  await put(workspace, 'pages/index/index.ink', page(`import { multiply as product } from 'math-api';
export default { data: { count: 0 }, calculate() { this.setData({ count: product(3, 4) }); } };`, '<text>{{count}}</text>'));
  const logic = await loadLogic(workspace, 'pages/index/index.ink', { modules: { 'math-api': { multiply: (a, b) => a * b } } });
  logic.call('calculate');
  assert.equal(JSON.parse(logic.snapshot()).data.count, 12);
}));
