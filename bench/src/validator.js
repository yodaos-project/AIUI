/**
 * Shared AIUI source validator used by every task. It checks manifest/source
 * relationships and a documented subset of platform rules, returning issues
 * instead of stopping at the first problem. It is a static check, not a
 * package build or a substitute for device/runtime testing.
 * @module validator
 */
import { access } from 'node:fs/promises';
import { readWorkspace, safePath } from './workspace.js';

// Built-in tags checked against ink-builtin-components/src/lib.rs registration.
const tags = new Set(`
  view row column scroll-view swiper swiper-item fragment slot image video canvas
  calendar chart map map-gpx lottie-view text timed-text p header blockquote
  list list-item b i snippet formula icon button input textarea switch table
  streamdown a2ui card error-state
`.trim().split(/\s+/));
// Keep these allowlists aligned with the supported AIUI runtime surface. An
// unknown event/property is not automatically rejected unless a rule below
// can verify that the platform does not support it.
const permissions = new Set(['GEOLOCATION', 'CAMERA', 'RECORD_AUDIO']);
const pageEvents = new Set([
  'tap', 'longpress', 'touchstart', 'touchmove', 'touchend',
  'input', 'change', 'focus', 'blur', 'submit',
]);
const unsupportedStyle = /position\s*:\s*sticky\b|\banimation(?:-[\w-]+)?\s*:|\b(?:white-space|word-break|visibility|font-variant)\s*:/;
const fixedWidgetSize = /(?:width\s*:\s*(?:239|480)px[\s\S]{0,100}height\s*:\s*140px|height\s*:\s*140px[\s\S]{0,100}width\s*:\s*(?:239|480)px)/;

/** Return false for a missing or unsafe source reference. */
async function exists(workspace, relative) {
  try {
    await access(await safePath(workspace, relative));
    return true;
  } catch {
    return false;
  }
}

/** Construct the stable issue shape consumed by the grader. */
function issue(rule, file, message) {
  return { rule, file, message };
}

/** Extract an .ink block by tag pattern; only the small supported syntax is parsed. */
function block(source, name) {
  const close = name.startsWith('script') ? 'script' : name;
  return source.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${close}>`, 'i'))?.[1];
}

/** Recognize method shorthand and function-valued object properties. */
function hasHandler(logic, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?<![\\w$])${escaped}\\s*(?:\\(|:)`).test(logic);
}

/**
 * Validate a prepared AIUI project and collect all supported diagnostics.
 * Invalid/missing app.json returns manifest:null with an app-json issue;
 * otherwise the parsed manifest is returned even when it has other errors.
 * Grading counts every returned issue as a constraint violation.
 *
 * @param {string} workspace Prepared project root.
 * @returns {Promise<{manifest: object | null, issues: Array<{rule: string, file: string, message: string}>}>}
 */
export async function validateWorkspace(workspace) {
  const issues = [];
  let app;
  try {
    app = JSON.parse(await readWorkspace(workspace, 'app.json'));
  } catch (error) {
    return { manifest: null, issues: [issue('app-json', 'app.json', `missing or invalid app.json: ${error.message}`)] };
  }
  if (!app || typeof app !== 'object' || Array.isArray(app)) {
    return { manifest: null, issues: [issue('app-json', 'app.json', 'app.json must contain an object')] };
  }

  if ('workers' in app) {
    issues.push(issue('removed-workers', 'app.json', 'use agentWorkers instead of workers'));
  }
  const pages = Array.isArray(app.pages) ? app.pages : [];
  const widgets = Array.isArray(app.widgets) ? app.widgets : [];
  const declaredPermissions = Array.isArray(app.permissions) ? app.permissions : [];

  if (app.pages !== undefined && !Array.isArray(app.pages)) {
    issues.push(issue('pages', 'app.json', 'pages must be an array'));
  }
  if (app.widgets !== undefined && !Array.isArray(app.widgets)) {
    issues.push(issue('widgets', 'app.json', 'widgets must be an array'));
  }
  if (!pages.length && !widgets.length) {
    issues.push(issue('entry', 'app.json', 'declare at least one Page or Widget'));
  }
  if (app.permissions !== undefined
    && (!Array.isArray(app.permissions) || app.permissions.some(permission => !permissions.has(permission)))) {
    issues.push(issue('permission', 'app.json', 'unknown permission'));
  }

  const sources = [];
  for (const route of pages) {
    if (typeof route !== 'string' || !/^pages\/[a-zA-Z0-9_/-]+$/.test(route) || route.includes('..')) {
      issues.push(issue('page-route', 'app.json', `invalid page route: ${route}`));
      continue;
    }
    const ink = await exists(workspace, `${route}.ink`);
    // A Page must use exactly one source form: .ink or the complete
    // .json/.wxml/.wxss/.js set. Partial multi-file Pages remain invalid.
    const multi = (await Promise.all(['json', 'wxml', 'wxss', 'js'].map(ext => exists(workspace, `${route}.${ext}`)))).every(Boolean);
    if (ink === multi) {
      issues.push(issue('page-source', 'app.json', `${route} must have exactly one complete source form`));
    }
    if (ink) sources.push({ file: `${route}.ink`, kind: 'page' });
    if (multi) {
      sources.push(
        { file: `${route}.wxml`, kind: 'template' },
        { file: `${route}.js`, kind: 'logic' },
        { file: `${route}.wxss`, kind: 'style' },
      );
      try {
        JSON.parse(await readWorkspace(workspace, `${route}.json`));
      } catch {
        issues.push(issue('page-json', `${route}.json`, 'invalid JSON'));
      }
    }
  }

  for (const widget of widgets) {
    const route = widget?.path;
    if (typeof route !== 'string' || !/^widgets\/[a-zA-Z0-9_/-]+$/.test(route) || route.includes('..')) {
      issues.push(issue('widget-path', 'app.json', 'invalid widget path'));
      continue;
    }
    if (!['1x1', '1x2'].includes(widget.family)) {
      issues.push(issue('widget-family', 'app.json', `invalid family for ${route}`));
    }
    if (!await exists(workspace, `${route}.ink`)) {
      issues.push(issue('widget-source', 'app.json', `missing ${route}.ink`));
    } else {
      sources.push({ file: `${route}.ink`, kind: 'widget', family: widget.family });
    }
  }

  const workers = app.agentWorkers || [];
  if (workers.length > 1) {
    issues.push(issue('worker-trigger', 'app.json', 'only one open-trigger Worker is supported'));
  }
  for (const worker of workers) {
    const valid = worker.name
      && /^workers\/[a-zA-Z0-9_/-]+\.[jt]s$/.test(worker.script || '')
      && !worker.script.includes('..')
      && worker.trigger?.type === 'open'
      && ['instant', 'foreground'].includes(worker.lifetime);

    if (!valid) {
      issues.push(issue('worker-config', 'app.json', 'invalid Agent Worker declaration'));
    } else if (!await exists(workspace, worker.script)) {
      issues.push(issue('worker-source', 'app.json', `missing ${worker.script}`));
    } else {
      sources.push({ file: worker.script, kind: 'worker' });
    }
  }
  for (const item of sources) {
    const source = await readWorkspace(workspace, item.file);
    const logic = item.kind === 'logic' || item.kind === 'worker' ? source : block(source, 'script\\s+setup');
    const template = item.file.endsWith('.ink')
      ? block(source, item.kind === 'widget' ? 'widget' : 'page')
      : item.kind === 'template' ? source : null;
    const style = item.file.endsWith('.ink')
      ? block(source, 'style')
      : item.kind === 'style' ? source : null;

    if (item.file.endsWith('.ink')) {
      const def = block(source, 'script(?:\\s+type="application/json")?\\s+def');
      if (!def) {
        issues.push(issue('ink-def', item.file, 'missing script def'));
      } else {
        try {
          const config = JSON.parse(def);
          if (item.kind === 'widget' && config.widget?.family !== item.family) {
            issues.push(issue('widget-family', item.file, 'family differs from app.json'));
          }
        } catch {
          issues.push(issue('ink-def', item.file, 'invalid script def JSON'));
        }
      }
      if (!template || !logic || Boolean(block(source, 'page')) === Boolean(block(source, 'widget'))) {
        issues.push(issue('ink-blocks', item.file, 'expected one page or widget root and script setup'));
      }
    }

    if (logic) {
      if (!/\bexport\s+default\s*\{/.test(logic)) {
        issues.push(issue('registration', item.file, 'expected export default object'));
      }
      if (/\b(?:App|Page|Widget|Component|AgentWorker)\s*\(/.test(logic)) {
        issues.push(issue('registration', item.file, 'unsupported registration function'));
      }
      if (/\bdocument\s*\.|\bwindow\s*\.document\b/.test(logic)) {
        issues.push(issue('dom', item.file, 'DOM API is unavailable'));
      }
      if (item.kind === 'worker' && /\b(?:window|document|fetch)\s*\./.test(logic)) {
        issues.push(issue('worker-global', item.file, 'Page or Web global unavailable in Worker'));
      }
      if (/navigator\.geolocation\./.test(logic) && !declaredPermissions.includes('GEOLOCATION')) {
        issues.push(issue('geolocation-permission', item.file, 'declare GEOLOCATION'));
      }
      if (item.kind === 'widget' && /\b(?:onLoad|onShow|onHide|onUnload|onReady)\s*\(/.test(logic)) {
        issues.push(issue('widget-lifecycle', item.file, 'Page lifecycle used in Widget'));
      }
      if (item.kind === 'worker' && /\b(?:onLoad|onShow|onHide|onUnload|onReady)\s*\(/.test(logic)) {
        issues.push(issue('worker-lifecycle', item.file, 'Page lifecycle used in Worker'));
      }
    }

    if (template) {
      // Only known Page events are checked for matching handlers. Component
      // specific event contracts need a typed/runtime checker.
      for (const match of template.matchAll(/<([a-z][\w-]*)(?=[\s/>])/g)) {
        if (!tags.has(match[1]) && !(match[1] in (app.usingComponents || {}))) {
          issues.push(issue('component', item.file, `unknown component ${match[1]}`));
        }
      }
      for (const match of template.matchAll(/\b(?:bind|catch):?([a-z]+)\s*=\s*(["'])([A-Za-z_$][\w$]*)\2/g)) {
        if (!pageEvents.has(match[1])) continue; // Other component-specific events need a typed/runtime checker.
        if (logic && !hasHandler(logic, match[3])) {
          issues.push(issue('event-handler', item.file, `missing handler ${match[3]}`));
        }
      }
      if (/\bon(?:click|tap)\s*=/.test(template)) {
        issues.push(issue('dom-event', item.file, 'use bindtap or catchtap'));
      }
    }

    if (style && unsupportedStyle.test(style)) {
      issues.push(issue('wxss', item.file, 'unsupported WXSS property'));
    }
    if (item.kind === 'widget' && fixedWidgetSize.test(style || '')) {
      issues.push(issue('widget-size', item.file, 'hardcoded device Widget size'));
    }
  }
  return { manifest: app, issues };
}
