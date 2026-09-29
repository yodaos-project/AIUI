#!/usr/bin/env node
import { access, lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getTask, root, tasks } from './schema.js';
import { infer } from './infer.js';
import { prepare } from './workspace.js';
import { grade } from './grader.js';
import { assertOutsideRepository, optionValue, parseMaxSteps, resolvedRate } from './cli-utils.js';

const [command, ...args] = process.argv.slice(2);
const id = args[0];
const rest = ['list', 'prepare-all', 'grade-all'].includes(command) ? args : args.slice(1);
function option(name) { return optionValue(rest, name); }
function publicTask(task) { return { id: task.id, category: task.category, difficulty: task.difficulty, description: task.description, aiuiVersion: task.aiuiVersion }; }
function output(value) { process.stdout.write(JSON.stringify(value, null, 2) + '\n'); }
try {
  if (command === 'list') output((await tasks()).map(publicTask));
  else if (command === 'inspect') output(publicTask(await getTask(id)));
  else if (command === 'prepare') {
    const task = await getTask(id); const destination = option('--workspace');
    if (!destination) throw new Error('prepare requires --workspace PATH');
    await prepare(task, path.resolve(destination)); output({ task: id, workspace: path.resolve(destination), description: task.description });
  } else if (command === 'prepare-all') {
    const base = option('--workspaces'); if (!base) throw new Error('prepare-all requires --workspaces PATH');
    const list = await tasks();
    for (const task of list) { try { await access(path.resolve(base, task.id)); throw new Error(`destination already exists: ${task.id}`); } catch (error) { if (error.code !== 'ENOENT') throw error; } }
    for (const task of list) await prepare(task, path.resolve(base, task.id));
    output(list.map(task => ({ ...publicTask(task), workspace: path.resolve(base, task.id) })));
  } else if (command === 'grade-all') {
    const base = option('--workspaces'); if (!base) throw new Error('grade-all requires --workspaces PATH');
    const list = await tasks();
    const results = [];
    for (const task of list) {
      const workspace = path.resolve(base, task.id); await access(workspace);
      const result = await grade(task, workspace); results.push(result);
      if (option('--output-dir')) { const file = path.resolve(option('--output-dir'), `${task.id}.json`); await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, JSON.stringify(result, null, 2) + '\n'); }
    }
    const resolved = results.filter(r => r.resolved).length;
    output({ resolved, total: results.length, resolvedRate: resolvedRate(resolved, results.length), results });
    if (resolved !== results.length) process.exitCode = 1;
  } else if (command === 'infer') {
    const task = await getTask(id);
    const target = option('--workspace'); if (!target) throw new Error('infer requires --workspace PATH');
    const workspace = path.resolve(target);
    const maxSteps = parseMaxSteps(option('--max-steps'));
    const model = option('--model') || 'deepseek-flash';
    const skill = path.resolve(option('--skill') || path.join(root, '../skills/aiui-dev'));
    const outputFile = option('--output');
    const repositoryReal = await realpath(path.resolve(root, '..'));
    await assertOutsideRepository(repositoryReal, workspace);
    const keyFile = option('--api-key-file');
    const apiKey = keyFile ? (await readFile(path.resolve(keyFile), 'utf8')).trim() : process.env.DEEPSEEK_API_KEY;
    if (!apiKey) throw new Error(keyFile ? `API key file is empty: ${path.resolve(keyFile)}` : 'set DEEPSEEK_API_KEY or pass --api-key-file PATH for infer');
    try { await lstat(workspace); } catch (error) { if (error.code !== 'ENOENT') throw error; await prepare(task, workspace); }
    const actualWorkspace = await realpath(workspace);
    await assertOutsideRepository(repositoryReal, actualWorkspace);
    const result = await infer(task, workspace, { apiKey, model, skill, maxSteps });
    const outputPath = path.resolve(outputFile || path.join(root, 'results', `${task.id}-${Date.now()}.json`));
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, JSON.stringify(result, null, 2) + '\n');
    output({ task: id, model: result.model, status: result.status, resolved: result.grading?.resolved ?? false, required: result.grading ? { passed: result.grading.required.passed, total: result.grading.required.total } : null, regression: result.grading ? { passed: result.grading.regression.passed, total: result.grading.regression.total } : null, constraintViolations: result.grading?.constraints.violations ?? null, output: outputPath });
    if (result.status === 'error') process.exitCode = 2; else if (result.status !== 'completed' || !result.grading?.resolved) process.exitCode = 1;
  } else if (command === 'grade') {
    const task = await getTask(id);
    const workspace = path.resolve(option('--workspace') || path.join(task.directory, task.workspace));
    const result = await grade(task, workspace);
    if (option('--output')) { await mkdir(path.dirname(path.resolve(option('--output'))), { recursive: true }); await writeFile(path.resolve(option('--output')), JSON.stringify(result, null, 2) + '\n'); }
    output(result);
    if (!result.resolved) process.exitCode = 1;
  } else if (command === 'summary') {
    const files = [id, ...rest].filter(Boolean);
    if (!files.length) throw new Error('summary requires result JSON files');
    const results = await Promise.all(files.map(async file => JSON.parse(await readFile(file, 'utf8'))));
    const resolved = results.filter(r => r.resolved).length;
    output({ resolved, total: results.length, resolvedRate: resolvedRate(resolved, results.length), display: `Resolved: ${resolved} / ${results.length}\nResolved Rate: ${Math.round(resolvedRate(resolved, results.length) * 100)}%` });
  } else throw new Error('usage: bench list | inspect ID | prepare ID --workspace PATH | infer ID --workspace PATH [--model MODEL] [--api-key-file PATH] [--skill PATH] [--max-steps N] [--output FILE] | prepare-all --workspaces PATH | grade ID [--workspace PATH] [--output FILE] | grade-all --workspaces PATH [--output-dir PATH] | summary RESULT.json...');
} catch (error) { process.stderr.write(error.message + '\n'); process.exitCode = 2; }
