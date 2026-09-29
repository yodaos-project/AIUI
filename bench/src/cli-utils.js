import { realpath } from 'node:fs/promises';
import path from 'node:path';

export function optionValue(args, name) {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

export function parseMaxSteps(value) {
  if (value === undefined) return 30;
  if (!/^[1-9]\d*$/.test(value) || Number(value) > 100) {
    throw new Error('maxSteps must be between 1 and 100');
  }
  return Number(value);
}

export function resolvedRate(resolved, total) {
  return total ? resolved / total : 0;
}

export async function canonicalDestination(destination) {
  let current = path.resolve(destination);
  const missing = [];

  for (;;) {
    try {
      return path.join(await realpath(current), ...missing.reverse());
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }

    const parent = path.dirname(current);
    if (parent === current) throw new Error(`cannot resolve workspace path: ${destination}`);
    missing.push(path.basename(current));
    current = parent;
  }
}

export async function assertOutsideRepository(repositoryReal, destination) {
  const actual = await canonicalDestination(destination);
  if (actual === repositoryReal || actual.startsWith(repositoryReal + path.sep)) {
    throw new Error('infer workspace must be outside the AIUI repository');
  }
}
