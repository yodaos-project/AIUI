/**
 * The deliberately small tool surface exposed to the coding model. Workspace
 * tools can read/write only the prepared project; skill tools are read-only.
 * There is no shell tool and no tool for reading task.json or grader files.
 * @module agent-tools
 */
import { lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { safePath } from './workspace.js';

// Keep listings and file payloads bounded before adding them to API messages.
const MAX_READ = 100_000;
const MAX_WRITE = 200_000;
const MAX_FILES = 200;

/**
 * Require a plain project-relative file path, without empty or dot segments.
 * This is stricter than safePath because model tools should not accept aliases
 * such as ./file even when they would remain inside the workspace.
 */
function relativePath(value) {
  if (typeof value !== 'string'
    || !value
    || path.isAbsolute(value)
    || value.split(/[\\/]/).some(part => !part || part === '.' || part === '..')) {
    throw new Error('path must be a project-relative file path');
  }
  return value;
}

/**
 * Check every existing segment before a write. relativePath rejects traversal
 * and this walk rejects links even when they point back inside the workspace,
 * so writes never follow a symlink planted by a solver.
 */
async function writablePath(workspace, relative) {
  const base = await realpath(workspace);
  let current = base;
  for (const part of relativePath(relative).split(/[\\/]/)) {
    current = path.join(current, part);
    const stat = await lstat(current).catch(error => {
      if (error.code === 'ENOENT') return null;
      throw error;
    });
    if (stat?.isSymbolicLink()) throw new Error('symlinks are not writable');
  }
  return current;
}

/**
 * Recursively list regular files, omitting links and stopping after the first
 * file beyond MAX_FILES. Exactly MAX_FILES files is not a truncated listing.
 * @returns {Promise<{files: string[], truncated: boolean}>}
 */
async function listFiles(root, directory = '') {
  const relative = directory ? relativePath(directory) : '';
  const absolute = relative ? await safePath(root, relative) : await realpath(root);
  const files = [];
  let truncated = false;

  async function visit(folder, prefix) {
    for (const entry of await readdir(folder, { withFileTypes: true })) {
      if (truncated) return;
      if (entry.isSymbolicLink()) continue;

      const name = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await visit(path.join(folder, entry.name), name);
      } else if (entry.isFile()) {
        if (files.length === MAX_FILES) {
          truncated = true;
          return;
        }
        files.push(name);
      }
    }
  }
  await visit(absolute, relative);
  return { files, truncated };
}

/** Read a regular UTF-8 file, rejecting symlinks and oversized payloads. */
async function limitedRead(root, relative) {
  const file = await safePath(root, relativePath(relative));
  const stat = await lstat(file);
  if (!stat.isFile() || stat.size > MAX_READ) throw new Error(`file is not a regular text file under ${MAX_READ} bytes`);
  return readFile(file, 'utf8');
}

/** Build one DeepSeek function schema; every declared property is required. */
function functionTool(name, description, properties = {}) {
  return {
    type: 'function',
    function: {
      name,
      description,
      parameters: {
        type: 'object',
        properties,
        ...(Object.keys(properties).length ? { required: Object.keys(properties) } : {}),
        additionalProperties: false,
      },
    },
  };
}

/** Tool declarations sent with every Chat Completions request. */
export const toolDefinitions = [
  functionTool('list_workspace', 'List project files in the task workspace.'),
  functionTool('read_workspace', 'Read a project text file by workspace-relative path.', { path: { type: 'string' } }),
  functionTool('write_workspace', 'Create or replace a project text file by workspace-relative path.', {
    path: { type: 'string' },
    content: { type: 'string' },
  }),
  functionTool('list_skill', 'List files in the supplied aiui-dev skill.'),
  functionTool('read_skill', 'Read a file from the supplied aiui-dev skill by skill-relative path.', { path: { type: 'string' } }),
];

/**
 * Dispatch a model tool call. The caller catches errors and sends a structured
 * tool error to the model, allowing it to repair a bad path or argument.
 * @param {string} name Declared tool name.
 * @param {{path?: string, content?: string}} args Parsed tool arguments.
 * @param {{workspace: string, skill: string}} roots Canonical access roots.
 * @returns {Promise<unknown>} JSON-serializable tool result.
 */
export async function executeTool(name, args, { workspace, skill }) {
  switch (name) {
    case 'list_workspace':
      return listFiles(workspace);
    case 'read_workspace':
      return { path: args.path, content: await limitedRead(workspace, args.path) };
    case 'write_workspace': {
      if (typeof args.content !== 'string' || Buffer.byteLength(args.content) > MAX_WRITE) {
        throw new Error(`content must be text under ${MAX_WRITE} bytes`);
      }
      const file = await writablePath(workspace, args.path);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, args.content, { flag: 'w' });
      return { path: args.path, bytes: Buffer.byteLength(args.content) };
    }
    case 'list_skill':
      return listFiles(skill);
    case 'read_skill':
      return { path: args.path, content: await limitedRead(skill, args.path) };
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}
