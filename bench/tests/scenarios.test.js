import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getTask, tasks, validateTask } from '../src/schema.js';
import { prepare } from '../src/workspace.js';
import { grade } from '../src/grader.js';

const solutions = JSON.parse(await readFile(new URL('./fixtures/scenario-solutions.json', import.meta.url), 'utf8'));
const catalog = JSON.parse(await readFile(new URL('./fixtures/expanded-catalog.json', import.meta.url), 'utf8'));
async function put(workspace, file, content) {
  await mkdir(path.dirname(path.join(workspace, file)), { recursive: true });
  await writeFile(path.join(workspace, file), content);
}
async function fixture(id, callback) {
  const base = await mkdtemp(path.join(os.tmpdir(), 'aiui-scenario-'));
  const workspace = path.join(base, 'workspace');
  try {
    const task = await getTask(id);
    await prepare(task, workspace);
    return await callback(task, workspace);
  } finally { await rm(base, { recursive: true, force: true }); }
}

test('the new catalog adds 24 distinct scenarios without answer files or prompt guidance', async () => {
  const all = await tasks();
  assert.equal(all.length, 79);
  assert.equal(catalog.length, 24);
  for (const [id, category] of catalog) {
    const task = await getTask(id);
    assert.equal(task.category, category);
    assert.doesNotMatch(task.description, /aiui-dev|references\/|DESIGN\.md|grading|golden|longhand/i);
    const files = await readdir(path.join(task.directory, 'workspace'));
    assert.ok(!files.includes('task.json'));
    assert.ok(!files.includes('scenario-solutions.json'));
    assert.ok(!files.includes('DESIGN.md'));
  }
});

for (const [id, solution] of Object.entries(solutions)) {
  test(`${id}: initial failure, valid solution, domain failure, and regression protection`, async () => fixture(id, async (task, workspace) => {
    const initial = await grade(task, workspace);
    assert.equal(initial.resolved, false, 'starting workspace must still need work');
    for (const [file, content] of Object.entries(solution.files)) await put(workspace, file, content);
    const solved = await grade(task, workspace);
    assert.equal(solved.resolved, true, JSON.stringify(solved));
    const bad = solution.negative;
    const source = await readFile(path.join(workspace, bad.path), 'utf8');
    assert.ok(source.includes(bad.from), 'negative mutation must target actual source');
    await put(workspace, bad.path, source.replace(bad.from, bad.to));
    const broken = await grade(task, workspace);
    assert.equal(broken.resolved, false, `${id}: important failure was not detected`);
    for (const [file, content] of Object.entries(solution.files)) await put(workspace, file, content);
    const main = task.grading.regression.find(check => check.id === 'about-action' || check.id === 'preserve-about');
    const page = await readFile(path.join(workspace, main.path), 'utf8');
    const regressionBroken = page.replace(/this\.setData\(\{\s*info:\s*["']AIUI["']\s*\}\);/, 'this.setData({info:"broken"});');
    assert.notEqual(regressionBroken, page);
    await put(workspace, main.path, regressionBroken);
    const regression = await grade(task, workspace);
    assert.equal(regression.resolved, false);
    assert.ok(regression.regression.passed < regression.regression.total);
  }));
}

test('scenario schema rejects unknown actions, invalid effects, and unsafe nested paths', async () => {
  const task = await getTask('058-detail-navigation');
  const check = task.grading.required.find(item => item.type === 'scenario');
  for (const update of [
    { steps: [] }, { steps: [{action:'shell', command:'exit'}] },
    { steps: [{action:'expect', data:[]}] },
    { steps: [{action:'call', method:'open', button:'Open'}, {action:'expect', data:{}}] },
    { steps: [{action:'advance', ms:-1}, {action:'expect', data:{}}] },
    { steps: [{action:'call', method:'open', instance:'missing'}, {action:'expect', data:{}}] },
    { instances: {detail:{path:'../secret.js'}} },
    { instances: {detail:{path:'pages/detail/index.js', templatePath:'/secret.wxml'}} },
  ]) {
    const modified = structuredClone(task);
    Object.assign(modified.grading.required.find(item => item.id === check.id), update);
    assert.throws(() => validateTask(modified, task.directory));
  }
});

test('input scenario follows the live binding rather than a prescribed handler name', async () => fixture('056-filter-results', async (task, workspace) => {
  const source = solutions[task.id].files['pages/index/index.ink'].replace(/onInput/g, 'applyFilter');
  await put(workspace, 'pages/index/index.ink', source);
  assert.equal((await grade(task, workspace)).resolved, true);
  await put(workspace, 'pages/index/index.ink', source.replace('bindinput="applyFilter"', 'bindinput="clear"'));
  assert.equal((await grade(task, workspace)).resolved, false);
}));

test('pending fetch work cannot stall grading', async () => fixture('066-network-retry', async (task, workspace) => {
  const file = 'pages/index/index.ink';
  const source = solutions[task.id].files[file].replace('const response=await fetch(this.data.endpoint);', 'await new Promise(() => {}); const response=await fetch(this.data.endpoint);');
  await put(workspace, file, source);
  assert.equal((await grade(task, workspace)).resolved, false);
}));

test('network recovery accepts the documented callback-based request API', async () => fixture('066-network-retry', async (task, workspace) => {
  const file = 'pages/index/index.ink';
  const source = solutions[task.id].files[file].replace(/async load\(\) \{[^\n]+\}/, `load() {
    this.setData({loading:true,status:'Loading'});
    wx.request({url:this.data.endpoint,
      success: response => { if (response.statusCode >= 400) this.setData({status:'Load failed'}); else this.setData({items:response.data.items,status:'Ready'}); },
      fail: () => this.setData({status:'Load failed'}),
      complete: () => this.setData({loading:false})
    });
  }`).replace('<script setup>', "<script setup>\nimport wx from 'wx';");
  await put(workspace, file, source);
  const result = await grade(task, workspace);
  assert.equal(result.resolved, true, JSON.stringify(result));
}));

test('worker scenario rejects asynchronously registered waitUntil', async () => fixture('072-worker-storage', async (task, workspace) => {
  for (const [file, content] of Object.entries(solutions[task.id].files)) await put(workspace, file, content);
  const file = 'workers/launches.js';
  const source = solutions[task.id].files[file].replace('onOpen(event) { event.waitUntil(', 'async onOpen(event) { await Promise.resolve(); event.waitUntil(');
  await put(workspace, file, source);
  assert.equal((await grade(task, workspace)).resolved, false);
}));

test('timer callbacks retain the behavior harness execution timeout', async () => fixture('069-page-timer-cleanup', async (task, workspace) => {
  const file = 'pages/index/index.ink';
  const source = solutions[task.id].files[file].replace('()=>this.setData({ticks:this.data.ticks+1})', '()=>{ while (true) {} }');
  await put(workspace, file, source);
  const result = await grade(task, workspace);
  assert.equal(result.resolved, false);
  assert.match(result.required.checks[0].message, /timed out/);
}));

test('template attributes must belong to the requested real element', async () => fixture('056-filter-results', async (task, workspace) => {
  const file = 'pages/index/index.ink';
  const source = solutions[task.id].files[file];
  await put(workspace, file, source.replace('value="{{query}}"', 'value=""') + '<!-- <input value="{{query}}"/> -->');
  const result = await grade(task, workspace);
  assert.equal(result.required.checks.find(check => check.id === 'query-input').passed, false);
}));

test('search race accepts cancellation as an alternative to version counters', async () => fixture('067-latest-search', async (task, workspace) => {
  const file = 'pages/index/index.ink';
  const source = solutions[task.id].files[file].replace(/async search\(\) \{[^\n]+\}/, `async search() {
    this.controller?.abort();
    const controller = this.controller = new AbortController();
    this.setData({loading:true});
    try {
      const response = await fetch(this.data.endpoint+'?q='+encodeURIComponent(this.data.query), {signal:controller.signal});
      const body = await response.json();
      this.setData({results:body.items,loading:false});
    } catch (error) { if (!controller.signal.aborted) throw error; }
  }`);
  await put(workspace, file, source);
  const result = await grade(task, workspace);
  assert.equal(result.resolved, true, JSON.stringify(result));
}));
