import path from 'node:path';
import vm from 'node:vm';
import { readWorkspace } from './workspace.js';

const identifier = /^[A-Za-z_$][\w$]*$/;
const importStatement = /^[ \t]*import[ \t]+(?:(?<clause>[\s\S]*?)\s+from\s+)?(?<quote>['"])(?<specifier>[^'"]+)\k<quote>[ \t]*;?/gm;
const reExportStatement = /^[ \t]*export\s+(?:\{(?<list>[^}]*)\}|(?<star>\*))\s+from\s+(?<quote>['"])(?<specifier>[^'"]+)\k<quote>[ \t]*;?/gm;

function importBindings(clause, index) {
  if (!clause) return '';
  const parts = clause.trim().split(/,(?=\s*\{|\s*\*)/);
  const bindings = [];
  for (const part of parts) {
    const value = part.trim();
    if (identifier.test(value)) bindings.push(`const ${value} = __imports[${index}].default;`);
    else if (/^\*\s+as\s+[A-Za-z_$][\w$]*$/.test(value)) bindings.push(`const ${value.replace(/^\*\s+as\s+/, '')} = __imports[${index}];`);
    else if (/^\{[\s\S]*\}$/.test(value)) bindings.push(`const ${value.replace(/\s+as\s+/g, ': ')} = __imports[${index}];`);
    else throw new Error(`unsupported import clause: ${value}`);
  }
  return bindings.join('\n');
}

function stripExports(source) {
  const names = new Map();
  let transformed = source.replace(/^[ \t]*export\s+(const|let|var|function|async\s+function|class)\s+([A-Za-z_$][\w$]*)/gm, (_, kind, name) => {
    names.set(name, name);
    return `${kind} ${name}`;
  });
  transformed = transformed.replace(/^[ \t]*export\s*\{([^}]*)\}\s*;?/gm, (_, list) => {
    for (const item of list.split(',')) {
      const parts = item.trim().split(/\s+as\s+/);
      if (!identifier.test(parts[0]) || !identifier.test(parts[1] || parts[0])) throw new Error(`unsupported export: ${item}`);
      names.set(parts[1] || parts[0], parts[0]);
    }
    return '';
  });
  transformed = transformed.replace(/\bexport\s+default\s+/, 'const __default = ');
  const entries = [...names].map(([name, local]) => `${JSON.stringify(name)}: ${local}`);
  return { source: transformed, entries: [`default: typeof __default === 'undefined' ? undefined : __default`, ...entries].join(', ') };
}

async function resolveImport(workspace, relative, specifier, globals, context, cache) {
  if (!specifier.startsWith('.')) {
    if (specifier === 'wx') return { default: globals.wx, ...(globals.wx || {}) };
    const module = globals.modules?.[specifier];
    if (module === undefined) throw new Error(`no mock for external module: ${specifier}`);
    return module;
  }
  const base = path.posix.normalize(path.posix.join(path.posix.dirname(relative), specifier));
  const candidates = path.posix.extname(base) ? [base] : [`${base}.js`, `${base}.mjs`, `${base}/index.js`];
  for (const file of candidates) {
    let source;
    try { source = await readWorkspace(workspace, file); }
    catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    if (cache.has(file)) {
      const previous = cache.get(file);
      if (previous === null) throw new Error(`circular module import: ${file}`);
      return previous;
    }
    cache.set(file, null);
    const module = await evaluateModule(workspace, file, source, globals, context, cache);
    cache.set(file, module);
    return module;
  }
  throw new Error(`module not found: ${specifier} from ${relative}`);
}

async function evaluateModule(workspace, relative, source, globals, context, cache) {
  const matches = [...source.matchAll(importStatement)];
  const imports = [];
  const bindings = [];
  for (const match of matches) {
    const index = imports.length;
    imports.push(await resolveImport(workspace, relative, match.groups.specifier, globals, context, cache));
    bindings.push(importBindings(match.groups.clause, index));
  }
  const reexported = {};
  for (const match of source.matchAll(reExportStatement)) {
    const module = await resolveImport(workspace, relative, match.groups.specifier, globals, context, cache);
    if (match.groups.star) {
      for (const [name, value] of Object.entries(module)) if (name !== 'default') reexported[name] = value;
    } else {
      for (const item of match.groups.list.split(',')) {
        const [original, alias] = item.trim().split(/\s+as\s+/);
        if (!identifier.test(original) || !identifier.test(alias || original)) throw new Error(`unsupported re-export: ${item}`);
        reexported[alias || original] = module[original];
      }
    }
  }
  const withoutImports = source.replace(importStatement, '').replace(reExportStatement, '');
  const transformed = stripExports(withoutImports);
  context.__moduleImports = imports;
  // The isolated context is a test aid, not a security boundary for hostile code.
  const exported = vm.runInContext(`(function(__imports) { ${bindings.join('\n')}\n${transformed.source}\nreturn { ${transformed.entries} }; })(__moduleImports)`, context, { timeout: 300 });
  return { ...reexported, ...exported };
}

export async function loadLogic(workspace, relative, globals = {}) {
  const raw = await readWorkspace(workspace, relative);
  const match = relative.endsWith('.ink') ? raw.match(/<script\s+setup[^>]*>([\s\S]*?)<\/script>/i) : [null, raw];
  if (!match) throw new Error('missing script setup');
  const source = match[1].trim();
  if (!/\bexport\s+default\s*\{/.test(source)) throw new Error('missing default object export');
  const context = vm.createContext({ console: { log() {}, error() {} }, Promise, ...globals });
  const definition = (await evaluateModule(workspace, relative, source, globals, context, new Map())).default;
  context.__definition = definition;
  vm.runInContext(`const instance = { ...__definition, data: { ...(__definition.data || {}) }, setData(patch) { Object.assign(this.data, patch); this.__patches.push(patch); }, __patches: [] };`, context, { timeout: 300 });
  return {
    context,
    call(method, argument) {
      context.__argument = argument;
      return vm.runInContext(`instance[${JSON.stringify(method)}](__argument)`, context, { timeout: 300 });
    },
    setData(patch) {
      context.__patch = patch;
      vm.runInContext('instance.setData(__patch)', context, { timeout: 300 });
    },
    snapshot() { return vm.runInContext(`JSON.stringify({data: instance.data, patches: instance.__patches, fields: Object.fromEntries(Object.entries(instance).filter(([key, value]) => key !== 'data' && key !== '__patches' && typeof value !== 'function'))})`, context, { timeout: 300 }); },
  };
}
