import { access, readdir } from 'node:fs/promises';
import path from 'node:path';
import { readWorkspace, safePath } from './workspace.js';

// Built-in tags checked against ink-builtin-components/src/lib.rs registration.
const tags = new Set('view row column scroll-view swiper swiper-item fragment slot image video canvas calendar chart map map-gpx lottie-view text timed-text p header blockquote list list-item b i snippet formula icon button input textarea switch table streamdown a2ui card error-state'.split(' '));
const permissions = new Set(['GEOLOCATION', 'CAMERA', 'RECORD_AUDIO']);
const pageEvents = new Set(['tap', 'longpress', 'touchstart', 'touchmove', 'touchend', 'input', 'change', 'focus', 'blur', 'submit']);

async function exists(workspace, relative) { try { await access(await safePath(workspace, relative)); return true; } catch { return false; } }
function issue(rule, file, message) { return { rule, file, message }; }
function block(source, name) { const close = name.startsWith('script') ? 'script' : name; return source.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${close}>`, 'i'))?.[1]; }
function hasHandler(logic, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\w$])${escaped}\\s*(?:\\(|:)`).test(logic);
}

export async function validateWorkspace(workspace) {
  const issues = [];
  let app;
  try { app = JSON.parse(await readWorkspace(workspace, 'app.json')); }
  catch (error) { return { manifest: null, issues: [issue('app-json', 'app.json', `missing or invalid app.json: ${error.message}`)] }; }
  if (!app || typeof app !== 'object' || Array.isArray(app)) return { manifest: null, issues: [issue('app-json', 'app.json', 'app.json must contain an object')] };
  if ('workers' in app) issues.push(issue('removed-workers', 'app.json', 'use agentWorkers instead of workers'));
  const pages = Array.isArray(app.pages) ? app.pages : [];
  const widgets = Array.isArray(app.widgets) ? app.widgets : [];
  const declaredPermissions = Array.isArray(app.permissions) ? app.permissions : [];
  if (app.pages !== undefined && !Array.isArray(app.pages)) issues.push(issue('pages', 'app.json', 'pages must be an array'));
  if (app.widgets !== undefined && !Array.isArray(app.widgets)) issues.push(issue('widgets', 'app.json', 'widgets must be an array'));
  if (!pages.length && !widgets.length) issues.push(issue('entry', 'app.json', 'declare at least one Page or Widget'));
  if (app.permissions !== undefined && (!Array.isArray(app.permissions) || app.permissions.some(p => !permissions.has(p)))) issues.push(issue('permission', 'app.json', 'unknown permission'));
  const sources = [];
  for (const route of pages) {
    if (typeof route !== 'string' || !/^pages\/[a-zA-Z0-9_/-]+$/.test(route) || route.includes('..')) { issues.push(issue('page-route', 'app.json', `invalid page route: ${route}`)); continue; }
    const ink = await exists(workspace, `${route}.ink`);
    const multi = (await Promise.all(['json', 'wxml', 'wxss', 'js'].map(ext => exists(workspace, `${route}.${ext}`)))).every(Boolean);
    if (ink === multi) issues.push(issue('page-source', 'app.json', `${route} must have exactly one complete source form`));
    if (ink) sources.push({ file: `${route}.ink`, kind: 'page' });
    if (multi) {
      sources.push({ file: `${route}.wxml`, kind: 'template' }, { file: `${route}.js`, kind: 'logic' }, { file: `${route}.wxss`, kind: 'style' });
      try { JSON.parse(await readWorkspace(workspace, `${route}.json`)); } catch { issues.push(issue('page-json', `${route}.json`, 'invalid JSON')); }
    }
  }
  for (const widget of widgets) {
    const route = widget?.path;
    if (typeof route !== 'string' || !/^widgets\/[a-zA-Z0-9_/-]+$/.test(route) || route.includes('..')) { issues.push(issue('widget-path', 'app.json', 'invalid widget path')); continue; }
    if (!['1x1', '1x2'].includes(widget.family)) issues.push(issue('widget-family', 'app.json', `invalid family for ${route}`));
    if (!await exists(workspace, `${route}.ink`)) issues.push(issue('widget-source', 'app.json', `missing ${route}.ink`));
    else sources.push({ file: `${route}.ink`, kind: 'widget', family: widget.family });
  }
  const workers = app.agentWorkers || [];
  if (workers.length > 1) issues.push(issue('worker-trigger', 'app.json', 'only one open-trigger Worker is supported'));
  for (const worker of workers) {
    if (!worker.name || !/^workers\/[a-zA-Z0-9_/-]+\.[jt]s$/.test(worker.script || '') || worker.script.includes('..') || worker.trigger?.type !== 'open' || !['instant', 'foreground'].includes(worker.lifetime)) issues.push(issue('worker-config', 'app.json', 'invalid Agent Worker declaration'));
    else if (!await exists(workspace, worker.script)) issues.push(issue('worker-source', 'app.json', `missing ${worker.script}`));
    else sources.push({ file: worker.script, kind: 'worker' });
  }
  for (const item of sources) {
    const source = await readWorkspace(workspace, item.file);
    const logic = item.kind === 'logic' || item.kind === 'worker' ? source : block(source, 'script\\s+setup');
    const template = item.file.endsWith('.ink') ? block(source, item.kind === 'widget' ? 'widget' : 'page') : item.kind === 'template' ? source : null;
    const style = item.file.endsWith('.ink') ? block(source, 'style') : item.kind === 'style' ? source : null;
    if (item.file.endsWith('.ink')) {
      const def = block(source, 'script(?:\\s+type="application/json")?\\s+def');
      if (!def) issues.push(issue('ink-def', item.file, 'missing script def'));
      else { try { const config = JSON.parse(def); if (item.kind === 'widget' && config.widget?.family !== item.family) issues.push(issue('widget-family', item.file, 'family differs from app.json')); } catch { issues.push(issue('ink-def', item.file, 'invalid script def JSON')); } }
      if (!template || !logic || Boolean(block(source, 'page')) === Boolean(block(source, 'widget'))) issues.push(issue('ink-blocks', item.file, 'expected one page or widget root and script setup'));
    }
    if (logic) {
      if (!/\bexport\s+default\s*\{/.test(logic)) issues.push(issue('registration', item.file, 'expected export default object'));
      if (/\b(?:App|Page|Widget|Component|AgentWorker)\s*\(/.test(logic)) issues.push(issue('registration', item.file, 'unsupported registration function'));
      if (/\bdocument\s*\.|\bwindow\s*\.document\b/.test(logic)) issues.push(issue('dom', item.file, 'DOM API is unavailable'));
      if (item.kind === 'worker' && /\b(?:window|document|fetch)\s*\./.test(logic)) issues.push(issue('worker-global', item.file, 'Page or Web global unavailable in Worker'));
      if (/navigator\.geolocation\./.test(logic) && !declaredPermissions.includes('GEOLOCATION')) issues.push(issue('geolocation-permission', item.file, 'declare GEOLOCATION'));
      if (item.kind === 'widget' && /\b(?:onLoad|onShow|onHide|onUnload|onReady)\s*\(/.test(logic)) issues.push(issue('widget-lifecycle', item.file, 'Page lifecycle used in Widget'));
      if (item.kind === 'worker' && /\b(?:onLoad|onShow|onHide|onUnload|onReady)\s*\(/.test(logic)) issues.push(issue('worker-lifecycle', item.file, 'Page lifecycle used in Worker'));
    }
    if (template) {
      for (const match of template.matchAll(/<([a-z][\w-]*)(?=[\s/>])/g)) if (!tags.has(match[1]) && !(match[1] in (app.usingComponents || {}))) issues.push(issue('component', item.file, `unknown component ${match[1]}`));
      for (const match of template.matchAll(/\b(?:bind|catch):?([a-z]+)\s*=\s*(["'])([A-Za-z_$][\w$]*)\2/g)) {
        if (!pageEvents.has(match[1])) continue; // Other component-specific events need a typed/runtime checker.
        if (logic && !hasHandler(logic, match[3])) issues.push(issue('event-handler', item.file, `missing handler ${match[3]}`));
      }
      if (/\bon(?:click|tap)\s*=/.test(template)) issues.push(issue('dom-event', item.file, 'use bindtap or catchtap'));
    }
    if (style && /position\s*:\s*sticky\b|\banimation(?:-[\w-]+)?\s*:|\b(?:white-space|word-break|visibility|font-variant)\s*:/.test(style)) issues.push(issue('wxss', item.file, 'unsupported WXSS property'));
    if (item.kind === 'widget' && /(?:width\s*:\s*(?:239|480)px[\s\S]{0,100}height\s*:\s*140px|height\s*:\s*140px[\s\S]{0,100}width\s*:\s*(?:239|480)px)/.test(style || '')) issues.push(issue('widget-size', item.file, 'hardcoded device Widget size'));
  }
  return { manifest: app, issues };
}
