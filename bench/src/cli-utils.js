/** Small CLI parsers and the repository boundary used by infer. @module cli-utils */
import { realpath } from 'node:fs/promises';
import path from 'node:path';

/**
 * Read a named option without treating the next option as its value.
 * Returns undefined when the option is absent; the command decides whether
 * that option is required.
 * @param {string[]} args Arguments after the command and optional task ID.
 * @param {string} name Option name including its -- prefix.
 * @returns {string | undefined}
 */
export function optionValue(args, name) {
  const index = args.indexOf(name);
  if (index < 0) return undefined;
  const value = args[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`${name} requires a value`);
  return value;
}

/** Parse the bounded agent turn limit; omission means the CLI default of 30. */
export function parseMaxSteps(value) {
  if (value === undefined) return 30;
  if (!/^[1-9]\d*$/.test(value) || Number(value) > 100) {
    throw new Error('maxSteps must be between 1 and 100');
  }
  return Number(value);
}

/** Return zero for an empty result set rather than NaN. */
export function resolvedRate(resolved, total) {
  return total ? resolved / total : 0;
}

/**
 * Canonicalize the longest existing parent of a destination. infer checks the
 * workspace before it is created, so realpath(destination) alone cannot guard
 * a new path reached through a symlinked parent.
 * @param {string} destination Existing or future workspace path.
 * @returns {Promise<string>}
 */
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

/** Reject a workspace at or below the canonical AIUI repository root. */
export async function assertOutsideRepository(repositoryReal, destination) {
  const actual = await canonicalDestination(destination);
  if (actual === repositoryReal || actual.startsWith(repositoryReal + path.sep)) {
    throw new Error('infer workspace must be outside the AIUI repository');
  }
}
