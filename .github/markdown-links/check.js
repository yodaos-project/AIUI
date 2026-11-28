import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
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

function suggestFilename(source, url, markdownFiles) {
  const [pathname] = url.split(/[?#]/, 1);
  if (!pathname || /^(?:\/|[a-z][a-z\d+.-]*:)/i.test(pathname)) return;

  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return;
  }

  if (decodedPath.endsWith('/') || decodedPath.endsWith('.md')) return;

  const directory = posix.dirname(source);
  if (markdownFiles.has(posix.join(directory, decodedPath + '.md')) &&
      !existsSync(posix.join(directory, decodedPath))) {
    return pathname + '.md' + url.slice(pathname.length);
  }
}

const trackedMarkdown = execFileSync('git', ['ls-files', '-z', '--', '*.md'], { encoding: 'utf8' });
const markdownFiles = new Set(trackedMarkdown.split('\0').filter(Boolean));

for (const file of markdownFiles) {
  for (const { url, position } of linkDestinations(readFileSync(file, 'utf8'))) {
    const replacement = suggestFilename(file, url, markdownFiles);
    if (replacement) {
      console.error(`${file}:${position.start.line}: ${JSON.stringify(url)} should be ${JSON.stringify(replacement)}`);
      process.exitCode = 1;
    }
  }
}
