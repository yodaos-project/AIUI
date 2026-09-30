import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getTask, tasks } from '../src/schema.js';
import { prepare } from '../src/workspace.js';
import { grade } from '../src/grader.js';
import { validateWorkspace } from '../src/validator.js';

async function fixture(id, callback) {
  const base = await mkdtemp(path.join(os.tmpdir(), 'aiui-bench-'));
  const workspace = path.join(base, 'workspace');
  try { const task = await getTask(id); await prepare(task, workspace); return await callback(task, workspace); }
  finally { await rm(base, { recursive: true, force: true }); }
}

test('all 79 task schemas load', async () => { assert.equal((await tasks()).length, 79); });
test('initial broken state fails required but preserves regression', async () => fixture('007-fix-state', async (task, workspace) => {
  const result = await grade(task, workspace);
  assert.equal(result.resolved, false);
  assert.equal(result.required.passed, 0);
  assert.equal(result.regression.passed, result.regression.total);
}));
test('a repaired Page resolves from behavior, without golden patch matching', async () => fixture('007-fix-state', async (task, workspace) => {
  const file = path.join(workspace, 'pages/index/index.ink');
  const source = `<script def>{"navigationBarTitleText":"Counter"}</script>
<script setup>export default { data: { count: 0 }, increment() { this.setData({ count: this.data.count + 1 }); }, decrement() { this.setData({ count: this.data.count - 1 }); } };</script>
<page><view><text>{{count}}</text><button bindtap="increment">+</button><button bindtap="decrement">-</button></view></page><style>.root { display: flex; }</style>`;
  await writeFile(file, source);
  const result = await grade(task, workspace);
  assert.equal(result.resolved, true, JSON.stringify(result.constraints.details));
}));
test('validator detects removed manifest field and unsupported browser event', async () => fixture('009-migrate-worker', async (_, workspace) => {
  const result = await validateWorkspace(workspace);
  assert.ok(result.issues.some(issue => issue.rule === 'removed-workers'));
}));
test('empty Page and Widget arrays do not count as an app entry', async () => fixture('001-create-page', async (_, workspace) => {
  for (const manifest of [{ pages: [] }, { widgets: [] }, { pages: [], widgets: [] }]) {
    await writeFile(path.join(workspace, 'app.json'), JSON.stringify(manifest));
    const result = await validateWorkspace(workspace);
    assert.ok(result.issues.some(issue => issue.rule === 'entry'), JSON.stringify(manifest));
  }
  await writeFile(path.join(workspace, 'app.json'), JSON.stringify({ pages: [], widgets: [{ path: 'widgets/status/index', family: '1x1' }] }));
  assert.ok(!(await validateWorkspace(workspace)).issues.some(issue => issue.rule === 'entry'));
}));
test('invalid permissions report issues without aborting geolocation validation', async () => fixture('001-create-page', async (_, workspace) => {
  await writeFile(path.join(workspace, 'app.json'), JSON.stringify({ pages: ['pages/index/index'], permissions: {} }));
  await mkdir(path.join(workspace, 'pages/index'), { recursive: true });
  await writeFile(path.join(workspace, 'pages/index/index.ink'), `<script def>{}</script><script setup>export default { locate() { navigator.geolocation.getCurrentPosition(() => {}); } };</script><page><view><button bindtap="locate">Locate</button></view></page><style></style>`);
  const result = await validateWorkspace(workspace);
  assert.ok(result.issues.some(issue => issue.rule === 'permission'));
  assert.ok(result.issues.some(issue => issue.rule === 'geolocation-permission'));
}));
test('single-quoted and colon event bindings report missing handlers', async () => fixture('001-create-page', async (_, workspace) => {
  await mkdir(path.join(workspace, 'pages/index'), { recursive: true });
  await writeFile(path.join(workspace, 'pages/index/index.ink'), `<script def>{}</script><script setup>export default { present() {} };</script><page><view><button bindtap='missingSingle'>One</button><button bind:tap="missingColon">Two</button><button catch:tap='present'>Three</button></view></page><style></style>`);
  const result = await validateWorkspace(workspace);
  assert.deepEqual(result.issues.filter(issue => issue.rule === 'event-handler').map(issue => issue.message), ['missing handler missingSingle', 'missing handler missingColon']);
}));
test('widget contract detects mismatch and unsupported WXSS', async () => fixture('003-create-widget', async (_, workspace) => {
  await writeFile(path.join(workspace, 'app.json'), JSON.stringify({ pages: ['pages/index/index'], widgets: [{ path: 'widgets/status/index', family: '1x1' }] }));
  await mkdir(path.join(workspace, 'widgets/status'), { recursive: true });
  await writeFile(path.join(workspace, 'widgets/status/index.ink'), `<script def>{"widget":{"family":"1x2"}}</script><script setup>export default {};</script><widget><view><text>Status</text></view></widget><style>.x { position: sticky; }</style>`);
  const result = await validateWorkspace(workspace);
  assert.ok(result.issues.some(issue => issue.rule === 'widget-family'));
  assert.ok(result.issues.some(issue => issue.rule === 'wxss'));
}));

test('Worker open event must synchronously extend asynchronous work', async () => fixture('004-create-worker', async (task, workspace) => {
  await mkdir(path.join(workspace, 'workers'), { recursive: true });
  await writeFile(path.join(workspace, 'app.json'), JSON.stringify({ pages: ['pages/index/index'], agentWorkers: [{ name: 'sync', script: 'workers/sync.js', trigger: { type: 'open' }, lifetime: 'foreground' }] }));
  await writeFile(path.join(workspace, 'workers/sync.js'), `export default { latestStatus: 'idle', onOpen(event) { event.waitUntil(Promise.resolve().then(() => { this.latestStatus = 'ready'; })); } };`);
  assert.equal((await grade(task, workspace)).resolved, true);
  await writeFile(path.join(workspace, 'workers/sync.js'), `export default { latestStatus: 'idle', async onOpen(event) { await Promise.resolve(); event.waitUntil(Promise.resolve()); } };`);
  assert.equal((await grade(task, workspace)).resolved, false);
}));

test('location check observes both success and permission denial', async () => fixture('010-constraint-location', async (task, workspace) => {
  await writeFile(path.join(workspace, 'app.json'), JSON.stringify({ pages: ['pages/index/index'], permissions: ['GEOLOCATION'] }));
  await mkdir(path.join(workspace, 'pages/index'), { recursive: true });
  await writeFile(path.join(workspace, 'pages/index/index.ink'), `<script def>{}</script>
<script setup>export default { data: { latitude: null, longitude: null, status: 'idle' }, requestPosition() { navigator.geolocation.getCurrentPosition(position => { this.setData({ latitude: position.coords.latitude, longitude: position.coords.longitude }); }, error => { this.setData({ status: 'denied' }); }); } };</script>
<page><view><text>{{latitude}}</text><text>{{longitude}}</text><text>{{status}}</text><button bindtap="requestPosition">Locate</button></view></page><style>.root { display: flex; }</style>`);
  assert.equal((await grade(task, workspace)).resolved, true);
}));

test('no-DOM constraint checks all workspace source files', async () => fixture('011-constraint-no-dom', async (task, workspace) => {
  await mkdir(path.join(workspace, 'pages/index'), { recursive: true });
  await writeFile(path.join(workspace, 'pages/index/index.ink'), `<script def>{}</script>
<script setup>export default { data: { status: 'idle' }, activate() { this.setData({ status: 'active' }); } };</script>
<page><view><text>{{status}}</text><button bindtap="activate">Activate</button></view></page><style>.root { display: flex; }</style>`);
  assert.equal((await grade(task, workspace)).resolved, true);

  await writeFile(path.join(workspace, 'unused.js'), "document.querySelector('button');");
  const withDom = await grade(task, workspace);
  assert.equal(withDom.resolved, false);
  assert.deepEqual(withDom.constraints.checks, [{ id: 'no-dom', passed: false, message: 'condition not met' }]);

  await rm(path.join(workspace, 'unused.js'));
  await writeFile(path.join(workspace, 'unused.wxml'), '<button onclick="activate">Activate</button>');
  assert.equal((await grade(task, workspace)).constraints.checks[0].passed, false);
}));


test('toggle behavior follows the button binding rather than a fixed handler name', async () => fixture('005-modify-toggle', async (task, workspace) => {
  await writeFile(path.join(workspace, 'pages/index/index.ink'), `<script def>{"navigationBarTitleText":"Status"}</script>
<script setup>export default { data: { title: 'Status', enabled: false }, onLoad() { this.setData({ enabled: false }); }, toggleEnabled() { this.setData({ enabled: !this.data.enabled }); } };</script>
<page><view><text>{{title}}</text><text>{{enabled}}</text><button bindtap="toggleEnabled">Toggle</button></view></page><style>.root { display: flex; }</style>`);
  assert.equal((await grade(task, workspace)).resolved, true);
}));
test('function-valued object properties are valid template handlers', async () => fixture('005-modify-toggle', async (task, workspace) => {
  await writeFile(path.join(workspace, 'pages/index/index.ink'), `<script def>{}</script>
<script setup>export default { data: { title: 'Status', enabled: false }, onLoad: function () { this.setData({ enabled: false }); }, onTap: function () { this.setData({ enabled: !this.data.enabled }); } };</script>
<page><view><text>{{title}}</text><text>{{enabled}}</text><button bindtap="onTap">Toggle</button></view></page><style>.root { display: flex; }</style>`);
  const validation = await validateWorkspace(workspace);
  assert.ok(!validation.issues.some(issue => issue.rule === 'event-handler'), JSON.stringify(validation.issues));
  assert.equal((await grade(task, workspace)).resolved, true);
}));

test('widget metadata accepts punctuation without changing the requested meaning', async () => fixture('003-create-widget', async (task, workspace) => {
  await writeFile(path.join(workspace, 'app.json'), JSON.stringify({ pages: ['pages/index/index'], widgets: [{ path: 'widgets/status/index', family: '1x1', displayName: 'Status', description: 'Shows status.' }] }));
  await mkdir(path.join(workspace, 'widgets/status'), { recursive: true });
  await writeFile(path.join(workspace, 'widgets/status/index.ink'), `<script def>{"widget":{"family":"1x1"}}</script><script setup>export default { data: { status: 'waiting' }, onAttach() { this.setData({ status: 'ready' }); } };</script><widget><view><text>{{status}}</text></view></widget><style>.widget { width: 100%; height: 100%; }</style>`);
  assert.equal((await grade(task, workspace)).resolved, true);
}));
