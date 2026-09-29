import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getTask } from '../src/schema.js';
import { prepare } from '../src/workspace.js';
import { grade } from '../src/grader.js';

async function fixture(id, callback) {
  const base = await mkdtemp(path.join(os.tmpdir(), 'aiui-grader-'));
  const workspace = path.join(base, 'workspace');
  try { const task = await getTask(id); await prepare(task, workspace); return await callback(task, workspace); }
  finally { await rm(base, { recursive: true, force: true }); }
}
async function put(workspace, relative, value) {
  const file = path.join(workspace, relative);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, value);
}
function page(logic, body) {
  return `<script def>{}</script><script setup>${logic}</script><page><view>${body}</view></page><style>.root { display: flex; }</style>`;
}
function withChecks(task, checks) {
  return { ...task, grading: { required: checks, regression: [], constraints: [] } };
}

test('behavior awaits each asynchronous button handler', async () => fixture('005-modify-toggle', async (task, workspace) => {
  await put(workspace, 'pages/index/index.ink', page(`export default { data: { title: 'Status', enabled: false }, onLoad() { this.setData({ enabled: false }); }, async toggle() { await Promise.resolve(); this.setData({ enabled: !this.data.enabled }); } };`, '<text>{{title}}</text><text>{{enabled}}</text><button bindtap="toggle">Toggle</button>'));
  assert.equal((await grade(task, workspace)).resolved, true);
}));

test('location uses a separate multi-file template and awaits the callback', async () => fixture('010-constraint-location', async (task, workspace) => {
  await put(workspace, 'app.json', JSON.stringify({ pages: ['pages/index/index'], permissions: ['GEOLOCATION'] }));
  await put(workspace, 'pages/index/index.json', '{}');
  await put(workspace, 'pages/index/index.wxml', '<view><text>{{latitude}}</text><button bindtap="locate">Locate</button></view>');
  await put(workspace, 'pages/index/index.wxss', '.root { display: flex; }');
  await put(workspace, 'pages/index/index.js', `export default { data: { latitude: null, longitude: null, status: 'idle' }, async locate() { await Promise.resolve(); navigator.geolocation.getCurrentPosition(async position => { await Promise.resolve(); this.setData({ latitude: String(position.coords.latitude), longitude: String(position.coords.longitude) }); }, async error => { await Promise.resolve(); this.setData({ status: 'denied' }); }); } };`);
  const checks = [
    { id: 'success', type: 'locationBehavior', path: 'pages/index/index.js', templatePath: 'pages/index/index.wxml', buttonLabel: 'Locate', expect: { latitude: 30, longitude: 120 } },
    { id: 'error', type: 'locationBehavior', path: 'pages/index/index.js', templatePath: 'pages/index/index.wxml', buttonLabel: 'Locate', outcome: 'error', expect: { status: 'denied' } },
  ];
  assert.equal((await grade(withChecks(task, checks), workspace)).resolved, true);
}));

test('button lookup matches the complete label and a wrapping tap handler', async () => fixture('005-modify-toggle', async (task, workspace) => {
  await put(workspace, 'pages/index/index.ink', page(`export default { data: { status: 'idle' }, bad() { this.setData({ status: 'wrong' }); }, good() { this.setData({ status: 'correct' }); } };`, '<button bindtap="bad">Forget</button><view bindtap="good"><button data-hint="x > y"><text>Get</text></button></view>'));
  const check = { id: 'get', type: 'behavior', path: 'pages/index/index.ink', calls: [{ button: 'Get' }], expect: { status: 'correct' } };
  assert.equal((await grade(withChecks(task, [check]), workspace)).resolved, true);
}));

test('watch behavior awaits async start, update, and cleanup', async () => fixture('013-modify-watch', async (task, workspace) => {
  await put(workspace, 'app.json', JSON.stringify({ pages: ['pages/index/index'], permissions: ['GEOLOCATION'] }));
  await put(workspace, 'pages/index/index.ink', page(`export default { data: { latitude: null, longitude: null }, async watch() { await Promise.resolve(); this.watchId = navigator.geolocation.watchPosition(async position => { await Promise.resolve(); this.setData({ latitude: position.coords.latitude, longitude: position.coords.longitude }); }, () => {}); }, async onUnload() { await Promise.resolve(); navigator.geolocation.clearWatch(this.watchId); } };`, '<button bindtap="watch">Watch</button>'));
  const check = { id: 'watch', type: 'watchBehavior', path: 'pages/index/index.ink', buttonLabel: 'Watch', stopMethod: 'onUnload', expect: { latitude: 30, longitude: 120 } };
  assert.equal((await grade(withChecks(task, [check]), workspace)).resolved, true);
}));

test('overlay and voice checks await async handlers', async () => {
  await fixture('017-create-overlay', async (task, workspace) => {
    await put(workspace, 'app.json', JSON.stringify({ pages: ['pages/index/index'], widgets: [{ path: 'widgets/weather/index', family: '1x1', displayName: 'Weather', description: 'Shows weather', placement: 'overlay' }] }));
    await put(workspace, 'widgets/weather/index.ink', `<script def>{"widget":{"family":"1x1"}}</script><script setup>export default {};</script><widget><view><text>Weather</text></view></widget><style>.root { width: 100%; height: 100%; }</style>`);
    await put(workspace, 'pages/index/index.ink', page(`export default { async show() { await Promise.resolve(); window.open('widgets/weather/index?city=hangzhou', '_widget'); } };`, '<button bindtap="show">Open Weather</button>'));
    const check = { id: 'overlay', type: 'overlayBehavior', path: 'pages/index/index.ink', buttonLabel: 'Open Weather', widgetPath: 'widgets/weather/index', url: 'widgets/weather/index?city=hangzhou' };
    assert.equal((await grade(withChecks(task, [check]), workspace)).resolved, true);
  });
  await fixture('018-modify-voice-wakeup', async (task, workspace) => {
    await put(workspace, 'pages/index/index.ink', page(`export default { data: { wakeups: 0 }, async onVoiceWakeup() { await Promise.resolve(); this.setData({ wakeups: this.data.wakeups + 1 }); } };`, '<text>{{wakeups}}</text>'));
    assert.equal((await grade(task, workspace)).resolved, true);
  });
});

test('unknown check types reject the grading spec', async () => fixture('005-modify-toggle', async (task, workspace) => {
  await assert.rejects(grade(withChecks(task, [{ id: 'typo', type: 'behavoir' }]), workspace), /unsupported check type: behavoir/);
}));
