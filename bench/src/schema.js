import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const categories = new Set(['create', 'modify', 'fix', 'migrate', 'constraint']);
const checks = new Set([
  'file', 'route', 'widget', 'worker', 'permission', 'template',
  'behavior', 'workerBehavior', 'locationBehavior', 'watchBehavior',
  'storageBehavior', 'overlayBehavior', 'voiceBehavior',
  'manifestField', 'routeOrder', 'widgetLayout', 'noDom',
]);
const pathFields = {
  file: ['path'],
  route: ['value'],
  widget: ['path'],
  worker: ['path'],
  routeOrder: ['before', 'after'],
  widgetLayout: ['path'],
  template: ['path'],
  behavior: ['path'],
  workerBehavior: ['path'],
  locationBehavior: ['path'],
  watchBehavior: ['path'],
  storageBehavior: ['path'],
  overlayBehavior: ['path', 'widgetPath'],
  voiceBehavior: ['path'],
};
const optionalPaths = ['path', 'templatePath', 'widgetPath', 'before', 'after'];

function validateCheckPath(taskId, check, field) {
  if (!Object.hasOwn(check, field)) return;
  const value = check[field];
  const unsafe = typeof value !== 'string'
    || !value
    || path.isAbsolute(value)
    || path.win32.isAbsolute(value)
    || value.split(/[\\/]/).includes('..');
  if (unsafe) throw new Error(`unsafe check path in ${taskId}: ${field}`);
}

function validateCheck(taskId, check) {
  if (!check || typeof check.id !== 'string' || !check.id || !checks.has(check.type)) {
    throw new Error(`unknown check in ${taskId}`);
  }

  for (const field of pathFields[check.type] || []) {
    if (!Object.hasOwn(check, field)) {
      throw new Error(`missing ${field} in ${taskId} check ${check.id}`);
    }
  }
  for (const field of new Set([...(pathFields[check.type] || []), ...optionalPaths])) {
    validateCheckPath(taskId, check, field);
  }
}

export function validateTask(task, directory) {
  if (task.schemaVersion !== 1 || !/^[a-z0-9-]+$/.test(task.id) || !categories.has(task.category)) {
    throw new Error(`invalid task identity in ${directory}`);
  }
  if (task.category !== path.basename(path.dirname(directory)) || task.id !== path.basename(directory)) {
    throw new Error(`task path mismatch: ${directory}`);
  }
  if (!['easy', 'medium', 'hard'].includes(task.difficulty) || !task.description || !task.aiuiVersion) {
    throw new Error(`invalid task metadata: ${task.id}`);
  }
  if (task.workspace !== './workspace') throw new Error(`invalid workspace: ${task.id}`);

  for (const group of ['required', 'regression', 'constraints']) {
    if (!Array.isArray(task.grading?.[group])) throw new Error(`missing ${group}: ${task.id}`);
    for (const check of task.grading[group]) validateCheck(task.id, check);
  }
  return task;
}

export async function loadTasks(tasksRoot = path.join(root, 'tasks')) {
  const found = [];
  const ids = new Set();
  for (const category of categories) {
    const parent = path.join(tasksRoot, category);
    let entries;
    try {
      entries = await readdir(parent, { withFileTypes: true });
    } catch (error) {
      if (error.code === 'ENOENT') continue;
      throw error;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const directory = path.join(parent, entry.name);
      const task = JSON.parse(await readFile(path.join(directory, 'task.json'), 'utf8'));
      const validated = validateTask(task, directory);
      if (ids.has(validated.id)) throw new Error(`duplicate task id: ${validated.id}`);
      ids.add(validated.id);
      found.push({ ...validated, directory });
    }
  }
  return found.sort((a, b) => a.id.localeCompare(b.id));
}

export async function tasks() {
  return loadTasks();
}

export async function getTask(id) {
  const task = (await tasks()).find(item => item.id === id);
  if (!task) throw new Error(`unknown task: ${id}`);
  return task;
}
