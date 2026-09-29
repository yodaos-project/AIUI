import { lstat, mkdir, readFile, readdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { safePath } from './workspace.js';

const MAX_READ = 100_000;
const MAX_WRITE = 200_000;
const MAX_FILES = 200;

function relativePath(value) {
  if (typeof value !== 'string' || !value || path.isAbsolute(value) || value.split(/[\\/]/).some(part => !part || part === '.' || part === '..')) throw new Error('path must be a project-relative file path');
  return value;
}

async function writablePath(workspace, relative) {
  const base = await realpath(workspace);
  let current = base;
  for (const part of relativePath(relative).split(/[\\/]/)) {
    current = path.join(current, part);
    const stat = await lstat(current).catch(error => error.code === 'ENOENT' ? null : Promise.reject(error));
    if (stat?.isSymbolicLink()) throw new Error('symlinks are not writable');
  }
  return current;
}

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
      if (entry.isDirectory()) await visit(path.join(folder, entry.name), name);
      else if (entry.isFile()) {
        if (files.length === MAX_FILES) { truncated = true; return; }
        files.push(name);
      }
    }
  }
  await visit(absolute, relative);
  return { files, truncated };
}

async function limitedRead(root, relative) {
  const file = await safePath(root, relativePath(relative));
  const stat = await lstat(file);
  if (!stat.isFile() || stat.size > MAX_READ) throw new Error(`file is not a regular text file under ${MAX_READ} bytes`);
  return readFile(file, 'utf8');
}

export const toolDefinitions = [
  { type: 'function', function: { name: 'list_workspace', description: 'List project files in the task workspace.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'read_workspace', description: 'Read a project text file by workspace-relative path.', parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false } } },
  { type: 'function', function: { name: 'write_workspace', description: 'Create or replace a project text file by workspace-relative path.', parameters: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'], additionalProperties: false } } },
  { type: 'function', function: { name: 'list_skill', description: 'List files in the supplied aiui-dev skill.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'read_skill', description: 'Read a file from the supplied aiui-dev skill by skill-relative path.', parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'], additionalProperties: false } } },
];

export async function executeTool(name, args, { workspace, skill }) {
  switch (name) {
    case 'list_workspace': return listFiles(workspace);
    case 'read_workspace': return { path: args.path, content: await limitedRead(workspace, args.path) };
    case 'write_workspace': {
      if (typeof args.content !== 'string' || Buffer.byteLength(args.content) > MAX_WRITE) throw new Error(`content must be text under ${MAX_WRITE} bytes`);
      const file = await writablePath(workspace, args.path);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, args.content, { flag: 'w' });
      return { path: args.path, bytes: Buffer.byteLength(args.content) };
    }
    case 'list_skill': return listFiles(skill);
    case 'read_skill': return { path: args.path, content: await limitedRead(skill, args.path) };
    default: throw new Error(`unknown tool: ${name}`);
  }
}
