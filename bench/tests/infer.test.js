import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getTask, root } from '../src/schema.js';
import { prepare } from '../src/workspace.js';
import { executeTool } from '../src/agent-tools.js';
import { infer } from '../src/infer.js';

async function withWorkspace(callback) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'aiui-infer-test-'));
  const workspace = path.join(directory, 'workspace');
  const task = await getTask('001-create-page');
  try { await prepare(task, workspace); return await callback(task, workspace, directory); }
  finally { await rm(directory, { recursive: true, force: true }); }
}

const solution = `<script def>{"navigationBarTitleText":"Hello"}</script>
<script setup>export default { data: { message: 'Hello AIUI' } };</script>
<page><view><text>{{message}}</text></view></page>
<style>.root { display: flex; }</style>`;

test('DeepSeek infer writes workspace through tools then grades it', async () => withWorkspace(async (task, workspace) => {
  const requests = [];
  const replies = [
    { choices: [{ finish_reason: 'tool_calls', message: { role: 'assistant', content: '', tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'write_workspace', arguments: JSON.stringify({ path: 'pages/index/index.ink', content: solution }) } }] } }], usage: { prompt_tokens: 100, prompt_cache_hit_tokens: 20, prompt_cache_miss_tokens: 80, completion_tokens: 20 } },
    { choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: 'Done.' } }], usage: { prompt_tokens: 120, prompt_cache_hit_tokens: 40, prompt_cache_miss_tokens: 80, completion_tokens: 5 } },
  ];
  const fetchImpl = async (url, options) => {
    requests.push({ url, options });
    return { ok: true, json: async () => replies.shift() };
  };
  const result = await infer(task, workspace, { apiKey: 'test-key', model: 'deepseek-v4-pro', skill: path.resolve(root, '../skills/aiui-dev'), fetchImpl });
  assert.equal(result.status, 'completed');
  assert.equal(result.grading.resolved, true);
  assert.equal(result.model, 'deepseek-v4-pro');
  assert.equal(JSON.parse(requests[0].options.body).model, 'deepseek-v4-pro');
  assert.equal(result.usage.promptTokens, 220);
  assert.equal(result.usage.promptCacheHitTokens, 60);
  assert.equal(result.usage.promptCacheMissTokens, 160);
  assert.equal(result.cost.currency, 'USD');
  assert.equal(result.cost.complete, true);
  assert.equal(result.cost.pricedRequests, 2);
  assert.ok(result.cost.estimatedUsd > 0);
  assert.equal(result.cost.estimatedUsd, result.trace.filter(entry => entry.cost).reduce((total, entry) => total + entry.cost.estimatedUsd, 0));
  assert.equal(requests.length, 2);
  assert.equal(JSON.parse(requests[1].options.body).messages.at(-1).role, 'tool');
  assert.ok(!JSON.stringify(result).includes('test-key'));
  assert.equal(await readFile(path.join(workspace, 'pages/index/index.ink'), 'utf8'), solution);
}));

test('agent tools reject traversal and symlink writes', async () => withWorkspace(async (_, workspace, directory) => {
  const options = { workspace, skill: path.resolve(root, '../skills/aiui-dev') };
  await assert.rejects(executeTool('write_workspace', { path: '../escape', content: 'x' }, options), /project-relative/);
  await symlink(directory, path.join(workspace, 'outside'));
  await assert.rejects(executeTool('write_workspace', { path: 'outside/escape', content: 'x' }, options), /symlinks/);
  await assert.rejects(executeTool('read_workspace', { path: 'outside/escape' }, options), /symlink outside/);
}));

test('workspace listing marks truncation only after a 201st file', async () => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), 'aiui-list-test-'));
  const options = { workspace, skill: workspace };
  try {
    await mkdir(path.join(workspace, 'empty'));
    await symlink(workspace, path.join(workspace, 'linked'));
    for (let index = 0; index < 201; index++) {
      await writeFile(path.join(workspace, `file-${String(index).padStart(3, '0')}.txt`), 'x');
      if (index === 198 || index === 199 || index === 200) {
        const listing = await executeTool('list_workspace', {}, options);
        assert.equal(listing.files.length, Math.min(index + 1, 200));
        assert.equal(listing.truncated, index === 200);
      }
    }
  } finally { await rm(workspace, { recursive: true, force: true }); }
});

test('provider failure is recorded without pretending the task completed', async () => withWorkspace(async (task, workspace) => {
  let request;
  const result = await infer(task, workspace, { apiKey: 'test-key', skill: path.resolve(root, '../skills/aiui-dev'), fetchImpl: async (_, options) => { request = JSON.parse(options.body); return { ok: false, status: 401 }; } });
  assert.equal(result.status, 'error');
  assert.equal(result.error, 'DeepSeek API returned HTTP 401');
  assert.equal(result.grading.resolved, false);
  assert.equal(result.cost.complete, false);
  assert.equal(result.cost.estimatedUsd, null);
  assert.equal(request.model, 'deepseek-flash');
  assert.deepEqual(request.thinking, { type: 'disabled' });
}));

test('non-Error provider throws retain a diagnostic', async () => withWorkspace(async (task, workspace) => {
  const result = await infer(task, workspace, { apiKey: 'test-key', skill: path.resolve(root, '../skills/aiui-dev'), fetchImpl: async () => { throw 'transport reset'; } });
  assert.equal(result.status, 'error');
  assert.equal(result.error, 'transport reset');
  assert.equal(result.grading.resolved, false);
}));

test('grader failures become recorded errors with absent grading', async () => withWorkspace(async (task, workspace) => {
  const malformed = { ...task, grading: { required: [{ id: 'bad', type: 'unknown' }], regression: [], constraints: [] } };
  const fetchImpl = async () => ({ ok: true, json: async () => ({ choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: 'Done.' } }] }) });
  const result = await infer(malformed, workspace, { apiKey: 'test-key', skill: path.resolve(root, '../skills/aiui-dev'), fetchImpl });
  assert.equal(result.status, 'error');
  assert.match(result.error, /grading failed: unsupported check type: unknown/);
  assert.equal(result.grading, null);
}));

test('skill fingerprint failures become recorded errors', async () => withWorkspace(async (task, workspace, directory) => {
  const skill = path.join(directory, 'skill');
  await mkdir(skill);
  await writeFile(path.join(skill, 'SKILL.md'), '# Skill');
  const fetchImpl = async () => { await rm(skill, { recursive: true }); return { ok: true, json: async () => ({ choices: [{ finish_reason: 'stop', message: { role: 'assistant', content: 'Done.' } }] }) }; };
  const result = await infer(task, workspace, { apiKey: 'test-key', skill, fetchImpl });
  assert.equal(result.status, 'error');
  assert.match(result.error, /skill fingerprint failed:/);
  assert.equal(result.skillFingerprint, null);
  assert.equal(result.grading.resolved, false);
}));

test('skill tool reads the selected skill revision without workspace access', async () => withWorkspace(async (_, workspace) => {
  const options = { workspace, skill: path.resolve(root, '../skills/aiui-dev') };
  const entry = await executeTool('read_skill', { path: 'SKILL.md' }, options);
  assert.match(entry.content, /AIUI Development/);
  await assert.rejects(executeTool('read_skill', { path: '../tasks/create/001-create-page/task.json' }, options), /project-relative/);
}));

test('step limit records an incomplete run and grades current files', async () => withWorkspace(async (task, workspace) => {
  const fetchImpl = async () => ({ ok: true, json: async () => ({ choices: [{ finish_reason: 'tool_calls', message: { role: 'assistant', content: '', tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'list_workspace', arguments: '{}' } }] } }] }) });
  const result = await infer(task, workspace, { apiKey: 'test-key', skill: path.resolve(root, '../skills/aiui-dev'), fetchImpl, maxSteps: 1 });
  assert.equal(result.status, 'max_steps');
  assert.equal(result.steps, 1);
  assert.equal(result.grading.resolved, false);
}));
