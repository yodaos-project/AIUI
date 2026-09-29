/**
 * Prepare isolated task workspaces and resolve paths used by graders and tools.
 * Task fixtures must not contain symlinks: copying a link could let a prepared
 * workspace read files outside the fixture or retain a dangling target.
 * @module workspace
 */
import { cp, lstat, mkdir, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';

/** Walk the fixture before copying so a bad link fails without a partial copy. */
async function rejectSourceSymlinks(source, relative = '.') {
  const stat = await lstat(source);
  if (stat.isSymbolicLink()) throw new Error(`task workspace contains a symlink: ${relative}`);
  if (!stat.isDirectory()) return;

  for (const entry of await readdir(source)) {
    await rejectSourceSymlinks(path.join(source, entry), path.join(relative, entry));
  }
}

/**
 * Copy a task's starting project into a new directory.
 *
 * @param {{directory: string}} task Loaded task with an on-disk fixture.
 * @param {string} destination Directory that must not already exist.
 * @returns {Promise<void>}
 * @throws {Error} If the destination exists or the fixture has any symlink.
 */
export async function prepare(task, destination) {
  if (!destination || destination === '/') throw new Error('prepare requires a destination directory');
  try {
    await lstat(destination);
    throw new Error(`destination already exists: ${destination}`);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  const source = path.join(task.directory, 'workspace');
  await rejectSourceSymlinks(source);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination, {
    recursive: true,
    errorOnExist: true,
    force: false,
    filter: async file => {
      if ((await lstat(file)).isSymbolicLink()) {
        throw new Error(`task workspace contains a symlink: ${path.relative(source, file) || '.'}`);
      }
      return true;
    },
  });
}

/**
 * Resolve a workspace-relative path while rejecting traversal and existing
 * targets or immediate parents that resolve outside the workspace. Missing
 * files are allowed; write tools additionally inspect every path segment
 * before creating one.
 *
 * @param {string} workspace Workspace root.
 * @param {string} relative Path supplied by a check or tool.
 * @returns {Promise<string>} Absolute path beneath the canonical workspace.
 */
export async function safePath(workspace, relative) {
  if (!relative || path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..')) {
    throw new Error(`unsafe path: ${relative}`);
  }

  const base = await realpath(workspace);
  const absolute = path.resolve(base, relative);
  if (!absolute.startsWith(base + path.sep)) throw new Error(`outside workspace: ${relative}`);

  const target = await realpath(absolute).catch(() => null);
  if (target && target !== base && !target.startsWith(base + path.sep)) {
    throw new Error(`symlink outside workspace: ${relative}`);
  }
  const parent = await realpath(path.dirname(absolute)).catch(() => null);
  if (parent && parent !== base && !parent.startsWith(base + path.sep)) {
    throw new Error(`symlink outside workspace: ${relative}`);
  }
  return absolute;
}

/** Read UTF-8 workspace content through the shared path guard. */
export async function readWorkspace(workspace, relative) {
  return readFile(await safePath(workspace, relative), 'utf8');
}
