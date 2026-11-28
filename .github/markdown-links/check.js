import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { posix } from 'node:path';
import { fromMarkdown } from 'mdast-util-from-markdown';

function* walk(node) {
  yield node;
  for (const child of node.children ?? []) {
    yield* walk(child);
  }
}

function* linkDestinations(markdown) {
  const nodes = [...walk(fromMarkdown(markdown))];
  const references = new Set(nodes.filter(node => node.type === 'linkReference').map(node => node.identifier));

  for (const node of nodes) {
    if (node.type === 'link') {
      yield node;
    } else if (node.type === 'definition' && references.delete(node.identifier)) {
      // Report the destination at its definition, including when several links share it.
      yield node;
    }
  }
}

function checkDestination(source, url, files, directories) {
  const [pathname] = url.split(/[?#]/, 1);
  if (!pathname || /^(?:\/|[a-z][a-z\d+.-]*:)/i.test(pathname)) return;

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return;
  }

  const sourceDirectory = posix.dirname(source);
  const target = posix.join(sourceDirectory, decodedPath);
  if (files.has(target) || directories.has(target.replace(/\/$/, ''))) return;

  if (!decodedPath.endsWith('/') && !decodedPath.endsWith('.md') &&
      files.has(posix.join(sourceDirectory, decodedPath + '.md'))) {
    const replacement = pathname + '.md' + url.slice(pathname.length);
    return `should be ${JSON.stringify(replacement)}`;
  }

  return 'does not point to a tracked file or directory';
}

const trackedPaths = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' });
const files = new Set(trackedPaths.split('\0').filter(Boolean));
const directories = new Set(['.']);
for (const file of files) {
  let directory = posix.dirname(file);
  while (!directories.has(directory)) {
    directories.add(directory);
    directory = posix.dirname(directory);
  }
}

for (const file of files) {
  if (!file.endsWith('.md')) continue;
  for (const { url, position } of linkDestinations(readFileSync(file, 'utf8'))) {
    const problem = checkDestination(file, url, files, directories);
    if (problem) {
      console.error(`${file}:${position.start.line}: ${JSON.stringify(url)} ${problem}`);
      process.exitCode = 1;
    }
  }
}
