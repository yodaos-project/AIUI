import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getTask, validateTask } from '../src/schema.js';
import { prepare } from '../src/workspace.js';
import { grade } from '../src/grader.js';

const solution = `<script def>{}</script>
<script setup>
export default {
  data: { title: 'Photos', filename: '', status: 'idle' },
  async load() {
    try {
      const library = navigator.mediaLibrary;
      const status = await library.requestAuthorization('read', 'image');
      if (status !== 'granted' && status !== 'limited') {
        this.setData({ status: 'Denied' }); return;
      }
      const page = await library.list({ mediaType: 'image' });
      this.setData({ filename: page.items[0]?.filename || '', status: 'Ready' });
    } catch (error) { this.setData({ status: 'Error' }); }
  }
};
</script>
<page><view><text>{{title}}</text><text>{{filename}}</text><text>{{status}}</text><button bindtap="load">Load Photos</button></view></page>
<style>.root { display: flex; }</style>`;

test('media library task checks authorization, limited access, failure, and permission', async () => {
  const base = await mkdtemp(path.join(os.tmpdir(), 'aiui-media-library-'));
  const workspace = path.join(base, 'workspace');
  try {
    const task = await getTask('080-media-library');
    await prepare(task, workspace);
    assert.equal((await grade(task, workspace)).resolved, false);
    const page = path.join(workspace, 'pages/index/index.ink');
    await writeFile(path.join(workspace, 'app.json'), JSON.stringify({ pages: ['pages/index/index'], permissions: ['READ_MEDIA_IMAGES'] }));
    await writeFile(page, solution);
    const result = await grade(task, workspace);
    assert.equal(result.resolved, true, JSON.stringify(result));
    for (const broken of [
      solution.replace(" && status !== 'limited'", ''),
      solution.replace("this.setData({ status: 'Denied' }); return;", "this.setData({ status: 'Denied' });"),
      solution.replace("this.setData({ status: 'Error' })", "this.setData({ status: 'Ready' })"),
      solution.replace("page.items[0]?.filename || ''", "'sunrise.jpg'"),
      solution.replace("requestAuthorization('read', 'image')", "requestAuthorization('add', 'image')"),
    ]) {
      await writeFile(page, broken);
      assert.equal((await grade(task, workspace)).resolved, false);
    }
    await writeFile(page, solution);
    await writeFile(path.join(workspace, 'app.json'), JSON.stringify({ pages: ['pages/index/index'] }));
    assert.equal((await grade(task, workspace)).resolved, false);
    const invalid = structuredClone(task);
    invalid.grading.required.find(check => check.id === 'granted').mediaLibrary.status = 'unknown';
    assert.throws(() => validateTask(invalid, task.directory), /media library mock/);
    assert.match(await readFile(path.join(task.directory, 'workspace/pages/index/index.ink'), 'utf8'), /load\(\) \{\}/);
  } finally { await rm(base, { recursive: true, force: true }); }
});

test('all media library permission declarations are accepted', async () => {
  const base = await mkdtemp(path.join(os.tmpdir(), 'aiui-media-permissions-'));
  const workspace = path.join(base, 'workspace');
  try {
    const task = await getTask('080-media-library');
    await prepare(task, workspace);
    await writeFile(path.join(workspace, 'pages/index/index.ink'), solution);
    const permissions = ['READ_MEDIA_IMAGES', 'CREATE_MEDIA_IMAGES', 'READ_MEDIA_AUDIO', 'CREATE_MEDIA_AUDIO'];
    await writeFile(path.join(workspace, 'app.json'), JSON.stringify({ pages: ['pages/index/index'], permissions }));
    const result = await grade(task, workspace);
    assert.equal(result.resolved, true, JSON.stringify(result));
  } finally { await rm(base, { recursive: true, force: true }); }
});
