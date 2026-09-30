import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { getTask, root, tasks, validateTask } from '../src/schema.js';
import { prepare } from '../src/workspace.js';
import { grade } from '../src/grader.js';
import { matchesStyle } from '../src/style.js';

const pagePath = 'pages/index/index.ink';
const solutions = {
  '051-design-canvas': `.canvas { width: 480px; height: 352px; box-sizing: border-box;
    padding-top: 12px; padding-bottom: 12px; padding-left: 16px; padding-right: 16px; background-color: #000; }
    .title { color: rgba(64, 255, 94, .72); font-family: sans-serif; font-size: 14px; font-weight: 400; }`,
  '052-design-typography': `.title { font-family: sans-serif; font-size: 22px; font-weight: 500; color: rgba(64,255,94,.72); }
    .value { font-family: monospace; font-size: 13px; font-weight: 500; color: #40FF5E; }
    .metadata { font-family: sans-serif; font-size: 12px; font-weight: 400; color: rgba(64,255,94,.48); }`,
  '053-design-button': `.action { min-height: 32px; background-color: transparent; border-width: 1px; border-style: solid;
    border-color: rgba(64,255,94,.48); border-radius: 4px; color: rgba(64,255,94,.72); font-family: sans-serif;
    font-size: 11px; font-weight: 500; text-transform: uppercase; }
    .status { font-family: sans-serif; font-size: 14px; font-weight: 400; color: rgba(64,255,94,.72); }`,
  '054-design-list': `.device-row { background-color: transparent; min-height: 40px; padding-top: 8px; padding-bottom: 8px;
    padding-left: 0px; padding-right: 0px; border-bottom-width: 1px; border-bottom-style: solid;
    border-bottom-color: rgba(64,255,94,.24); border-radius: 0px; }
    .device-title { font-family: sans-serif; font-size: 14px; font-weight: 400; color: rgba(64,255,94,.72); }`,
  '055-design-error-state': `.error { background-color: rgba(64,255,94,.06); border-width: 1px; border-style: dashed;
    border-color: rgba(64,255,94,.72); border-radius: 4px; padding-top: 8px; padding-bottom: 8px;
    padding-left: 8px; padding-right: 8px; }
    .error-label, .error-message, .error-icon { color: rgba(64,255,94,.72); font-family: sans-serif; font-size: 12px; font-weight: 400; }`,
};
const negatives = {
  '051-design-canvas': ['padding-left: 16px', 'padding-left: 0px'],
  '052-design-typography': ['font-size: 12px', 'font-size: 10px'],
  '053-design-button': ['background-color: transparent', 'background-color: #40ff5e'],
  '054-design-list': ['border-bottom-width: 1px', 'border-bottom-width: 4px'],
  '055-design-error-state': ['border-style: dashed', 'border-style: solid'],
};

async function fixture(id, callback) {
  const base = await mkdtemp(path.join(os.tmpdir(), 'aiui-design-'));
  const workspace = path.join(base, 'workspace');
  try {
    const task = await getTask(id);
    await prepare(task, workspace);
    return await callback(task, workspace);
  } finally { await rm(base, { recursive: true, force: true }); }
}

async function solution(id, workspace) {
  const original = await readFile(path.join(workspace, pagePath), 'utf8');
  let source = original.replace(/<style>[\s\S]*?<\/style>/, `<style>${solutions[id]}</style>`);
  if (id === '055-design-error-state') source = source.replace('<text class="error-label">', '<text class="error-icon">△</text><text class="error-label">');
  return source;
}

test('design catalog contains exactly five tasks and reuses the shared skill references', async () => {
  const design = (await tasks()).filter(task => task.category === 'design');
  assert.deepEqual(design.map(task => task.id), Object.keys(solutions));
  for (const reference of ['references/design/monochrome-green.md', 'references/wxss.md']) {
    assert.ok((await readFile(path.join(root, '../skills/aiui-dev', reference), 'utf8')).trim());
    for (const task of design) assert.ok(task.description.includes(reference));
  }
  for (const task of design) {
    assert.deepEqual((await readdir(path.join(task.directory, 'workspace'))).sort(), ['app.js', 'app.json', 'pages']);
  }
});

for (const id of Object.keys(solutions)) {
  test(`${id}: initial failure, valid design, bad token, dead styles, and preserved behavior`, async () => fixture(id, async (task, workspace) => {
    const initial = await grade(task, workspace);
    assert.equal(initial.resolved, false);
    assert.ok(initial.required.passed < initial.required.total);
    assert.equal(initial.regression.passed, initial.regression.total);
    assert.equal(initial.constraints.violations, 0);
    const file = path.join(workspace, pagePath);
    const source = await solution(id, workspace);
    await writeFile(file, source);
    const solved = await grade(task, workspace);
    assert.equal(solved.resolved, true, JSON.stringify(solved));
    await writeFile(file, source.replace(...negatives[id]));
    assert.equal((await grade(task, workspace)).resolved, false);
    await writeFile(file, source.replace(/class="/g, 'class="unused-'));
    const dead = await grade(task, workspace);
    assert.equal(dead.resolved, false);
    assert.ok(dead.required.passed < dead.required.total);
    await writeFile(file, source.replace(/this\.setData\(\{[^;]+?\}\);/, 'this.setData({});'));
    const regression = await grade(task, workspace);
    assert.equal(regression.required.passed, regression.required.total);
    assert.ok(regression.regression.passed < regression.regression.total);
    assert.equal(regression.resolved, false);
  }));
}

test('error design needs the triangle and explicit ERROR label as well as luminance', async () => fixture('055-design-error-state', async (task, workspace) => {
  const source = await solution(task.id, workspace);
  for (const broken of [source.replace('△', ''), source.replace('ERROR', 'STATUS'), source.replace('class="error-message"', 'class="unused"')]) {
    await writeFile(path.join(workspace, pagePath), broken);
    assert.equal((await grade(task, workspace)).resolved, false);
  }
}));

test('list design preserves both styled rows and their bound titles', async () => fixture('054-design-list', async (task, workspace) => {
  const source = await solution(task.id, workspace);
  for (const broken of [
    source.replace('class="device-row"', 'class="unused"'),
    source.replace('{{first}}', '{{second}}'),
    source.replace('class="device-title second-title"', 'class="unused"'),
  ]) {
    await writeFile(path.join(workspace, pagePath), broken);
    assert.equal((await grade(task, workspace)).resolved, false);
  }
}));

test('inspect and prepare expose the skill reference in the description without private grading checks', async () => fixture('051-design-canvas', async (task, workspace) => {
  const inspect = spawnSync(process.execPath, [path.join(root, 'src/cli.js'), 'inspect', task.id], { encoding: 'utf8' });
  assert.equal(inspect.status, 0, inspect.stderr);
  const publicTask = JSON.parse(inspect.stdout);
  assert.equal(publicTask.category, 'design');
  assert.equal(publicTask.description, task.description);
  assert.equal(publicTask.grading, undefined);
  assert.equal(publicTask.directory, undefined);
  assert.deepEqual((await readdir(workspace)).sort(), ['app.js', 'app.json', 'pages']);
}));

const check = { className: 'title', tag: 'text', binding: 'title', declarations: { color: '#000000', 'font-size': '14px' } };
const template = '<page><text class="title">{{title}}</text></page>';
const sample = css => `${template}<style>${css}</style>`;

test('style checker handles comments, comma lists, source order, and equivalent literal formatting', () => {
  assert.equal(matchesStyle(sample('/* .title { color: red; } */ .other, .title { color: #000; font-size: 14px; }'), check), true);
  assert.equal(matchesStyle(sample('.title { color: red; font-size: 14px; } .title { color: #000; }'), check), true);
  assert.equal(matchesStyle(sample('.title { color: #000; font-size: 14px; } .title { color: red; }'), check), false);
  assert.equal(matchesStyle(sample('.title { color: #000; font-size: 14px; font-size: 10px; }'), check), false);
});

test('style checker rejects decoys, overriding inline styles, and unsupported cascade syntax', () => {
  const css = '.title { color: #000; font-size: 14px; }';
  assert.equal(matchesStyle(`<page><text>{{title}}</text></page><!-- ${template} --><style>${css}</style>`, check), false);
  assert.equal(matchesStyle(sample(css).replace('{{title}}', '{{other}}'), check), false);
  assert.equal(matchesStyle(sample(css).replace('class="title"', 'class="title {{state}}"'), check), false);
  assert.equal(matchesStyle(`<script setup>const decoy = '${template}';</script><page><text>{{title}}</text></page><style>${css}</style>`, check), false);
  assert.equal(matchesStyle(sample(css).replace('class="title"', 'class="title" style="color: red"'), check), false);
  assert.equal(matchesStyle(sample(css).replace('class="title"', 'class="title extra"').replace('</style>', '.extra { color: red; }</style>'), check), false);
  for (const unsupported of ['text { color: red; }', '@import "other.wxss";', '.title:hover { color: red; }', '.title { color: #000 !important; }', '.title { font: 10px serif; }', '.title { color: var(--green); }']) {
    assert.equal(matchesStyle(sample(css + unsupported), check), false, unsupported);
  }
});

test('style checker requires all repeated class nodes to conform', () => {
  const source = '<page><text class="title">{{title}}</text><text class="title" style="font-size: 10px">{{title}}</text></page><style>.title { color: #000; font-size: 14px; }</style>';
  assert.equal(matchesStyle(source, check), false);
  assert.equal(matchesStyle(sample('.title { color: #000; font-size: 14px; }'), { ...check, minCount: 2 }), false);
});

test('style schema rejects malformed declarations and unsafe paths', async () => {
  const task = await getTask('051-design-canvas');
  for (const invalid of [
    { className: '.title' }, { declarations: [] }, { declarations: {} },
    { declarations: { color: 42 } }, { declarations: { color: '' } },
    { declarations: { 'bad property': 'red' } }, { path: '../escape.ink' }, { tag: 'text>' },
    { minCount: 0 }, { minCount: 1.5 },
  ]) {
    const modified = structuredClone(task);
    Object.assign(modified.grading.required[0], invalid);
    assert.throws(() => validateTask(modified, task.directory), /style check|unsafe check path/);
  }
});
