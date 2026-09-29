/**
 * Task catalog and schema validation. A task ID is globally unique, even
 * though its files live below a category directory. Checks stay in task.json
 * and are never included in the public inspect/prepare handoff.
 * @module schema
 */
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @typedef {'required' | 'regression' | 'constraints'} CheckGroup */
/** @typedef {{id: string, type: string, [key: string]: unknown}} TaskCheck */
/**
 * @typedef {object} Task
 * @property {number} schemaVersion
 * @property {string} id Globally unique, numbered task ID.
 * @property {string} category One of the catalog categories.
 * @property {'easy' | 'medium' | 'hard'} difficulty
 * @property {string} description Prompt handed to the solver.
 * @property {string} aiuiVersion Target AIUI version identifier.
 * @property {string} workspace Always ./workspace in schema version 1.
 * @property {{required: TaskCheck[], regression: TaskCheck[], constraints: TaskCheck[]}} grading Hidden grader specification.
 * @property {string} [directory] Added by loadTasks; never stored in task.json.
 */

/** Absolute path to bench/, derived from this module rather than process.cwd(). */
export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const categories = new Set(['create', 'modify', 'fix', 'migrate', 'constraint']);
const checks = new Set([
  'file', 'route', 'widget', 'worker', 'permission', 'template',
  'behavior', 'workerBehavior', 'locationBehavior', 'watchBehavior',
  'storageBehavior', 'overlayBehavior', 'voiceBehavior',
  'manifestField', 'routeOrder', 'widgetLayout', 'noDom',
]);
// Fields used as workspace-relative paths by a check. Presence is type-specific;
// optional path fields are still validated whenever a task supplies them.
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

/** Reject absolute paths and parent traversal before a check reaches the FS. */
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

/** Validate one check's type, required fields, and every supplied path field. */
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

/**
 * Validate task metadata and all check groups against its catalog directory.
 * @param {Task} task Parsed task.json object.
 * @param {string} directory Directory containing task.json.
 * @returns {Task} The same object, for convenient use while loading.
 */
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

/**
 * Load every category in stable ID order. Missing category directories and
 * non-directory entries are ignored; malformed tasks and duplicate IDs fail
 * the catalog so getTask cannot silently select the wrong task.
 * @param {string} [tasksRoot] Override used by schema tests.
 * @returns {Promise<Task[]>} Validated tasks with their directory attached.
 */
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

/** Load the repository's task catalog. */
export async function tasks() {
  return loadTasks();
}

/** Resolve one public ID or throw instead of returning undefined. */
export async function getTask(id) {
  const task = (await tasks()).find(item => item.id === id);
  if (!task) throw new Error(`unknown task: ${id}`);
  return task;
}
