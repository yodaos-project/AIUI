import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./check.js', import.meta.url));

function check(t, files) {
  const cwd = mkdtempSync(join(tmpdir(), 'aiui-markdown-links-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));

  for (const [name, content] of Object.entries(files)) {
    const path = join(cwd, name);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
  }

  execFileSync('git', ['init', '--quiet'], { cwd });
  execFileSync('git', ['add', '.'], { cwd });
  const result = spawnSync(process.execPath, [script], { cwd, encoding: 'utf8' });
  assert.ifError(result.error);
  return result;
}

test('reports each missing extension with its source line and suggested destination', t => {
  const { status, stderr } = check(t, {
    'README.md': '[Guide](docs/intro)',
    'design/README.md': '',
    'docs/intro.md': '',
    'docs/intro.en-US.md': '',
    'docs/快速 入门.md': '',
    'docs/index.en-US.md': [
      '# Index',
      '',
      '[Introduction](./intro.en-US?lang=en#rpx)',
      '[Design](../design/README)',
      '[快速入门](./快速%20入门)',
      '',
      '[See the introduction][intro]',
      '[See it again][intro]',
      '',
      '[intro]: ./intro.en-US#overview',
    ].join('\n'),
  });

  assert.equal(status, 1);
  assert.equal(stderr.trim(), [
    'README.md:1: "docs/intro" should be "docs/intro.md"',
    'docs/index.en-US.md:3: "./intro.en-US?lang=en#rpx" should be "./intro.en-US.md?lang=en#rpx"',
    'docs/index.en-US.md:4: "../design/README" should be "../design/README.md"',
    'docs/index.en-US.md:5: "./快速%20入门" should be "./快速%20入门.md"',
    'docs/index.en-US.md:10: "./intro.en-US#overview" should be "./intro.en-US.md#overview"',
  ].join('\n'));
});

test('allows valid Markdown links, other destinations, and Markdown examples in code', t => {
  const { status, stderr } = check(t, {
    'aiui/intro.md': '',
    'docs/intro.md': '',
    'docs/intro.en-US.md': '',
    'docs/assets.md': '',
    'docs/assets/logo.svg': '<svg/>',
    'docs/assets/logo.svg.md': '',
    'docs/index.md': [
      '[中文](./intro.md#rpx)',
      '[English](./intro.en-US.md?lang=en)',
      '[Lowercase site route](/aiui/intro)',
      '[Uppercase site route](/AIUI/intro)',
      '[Fragment](#intro)',
      '[External](https://example.com/intro)',
      '[Protocol-relative](//example.com/intro)',
      '[Email](mailto:hello@example.com)',
      '[Asset](./assets/logo.svg)',
      '[Directory](./assets)',
      '[Directory with slash](./assets/)',
      '[Repository root](../)',
      '![Image](./intro)',
      '',
      '[unused]: ./intro',
      '',
      '`[Inline example](./intro)`',
      '',
      '~~~md',
      '[Fenced example](./intro)',
      '~~~',
      '',
      '    [Indented example](./intro)',
    ].join('\n'),
  });

  assert.equal(status, 0, stderr);
  assert.equal(stderr, '');
});

test('reports broken relative destinations, including missing assets and reference links', t => {
  const { status, stderr } = check(t, {
    'README.md': '',
    'docs/index.md': [
      '[Missing Markdown file](./missing.md#section)',
      '[Missing asset](./assets/logo.svg?version=1)',
      '[Missing directory](../examples/)',
      '[File used as directory](../README.md/)',
      '[Incorrect casing](../readme.md)',
      '[Missing reference][gone]',
      '',
      '[gone]: ./gone',
    ].join('\n'),
  });

  assert.equal(status, 1);
  assert.equal(stderr.trim(), [
    'docs/index.md:1: "./missing.md#section" does not point to a tracked file or directory',
    'docs/index.md:2: "./assets/logo.svg?version=1" does not point to a tracked file or directory',
    'docs/index.md:3: "../examples/" does not point to a tracked file or directory',
    'docs/index.md:4: "../README.md/" does not point to a tracked file or directory',
    'docs/index.md:5: "../readme.md" does not point to a tracked file or directory',
    'docs/index.md:8: "./gone" does not point to a tracked file or directory',
  ].join('\n'));
});
