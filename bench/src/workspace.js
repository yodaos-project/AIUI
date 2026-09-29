import { cp, lstat, mkdir, readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';

async function rejectSourceSymlinks(source, relative = '.') {
  const stat = await lstat(source);
  if (stat.isSymbolicLink()) throw new Error(`task workspace contains a symlink: ${relative}`);
  if (!stat.isDirectory()) return;

  for (const entry of await readdir(source)) {
    await rejectSourceSymlinks(path.join(source, entry), path.join(relative, entry));
  }
}

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

export async function readWorkspace(workspace, relative) {
  return readFile(await safePath(workspace, relative), 'utf8');
}
