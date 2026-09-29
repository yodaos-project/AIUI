import { access, readdir } from 'node:fs/promises';
import path from 'node:path';
import { readWorkspace, safePath } from './workspace.js';
import { loadLogic } from './behavior.js';
import { validateWorkspace } from './validator.js';

function boundButtonHandler(source, label) {
  const normalize = value => value.replace(/\s+/g, ' ').trim().toLowerCase();
  const wanted = normalize(label);
  const escaped = wanted.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const wordMatch = /^[a-z0-9 ]+$/.test(wanted) ? new RegExp(`(?:^|[^a-z0-9])${escaped}(?=$|[^a-z0-9])`) : null;

  const matchesLabel = text => {
    const actual = normalize(text);
    return actual === wanted || (wordMatch ? wordMatch.test(actual) : actual.includes(wanted));
  };

  const stack = [];
  const tags = /<(?:"[^"]*"|'[^']*'|[^'">])*>/g;
  let previous = 0;

  for (const match of source.matchAll(tags)) {
    const text = source.slice(previous, match.index);
    for (const node of stack) {
      if (node.tag === 'button') node.text += text;
    }

    const token = match[0];
    const close = token.match(/^<\/([A-Za-z][\w-]*)\s*>/);
    if (close) {
      while (stack.length) {
        const node = stack.pop();
        if (node.tag === 'button' && matchesLabel(node.text) && node.handler) {
          return node.handler;
        }
        if (node.tag === close[1].toLowerCase()) break;
      }
      previous = match.index + token.length;
      continue;
    }

    const open = token.match(/^<([A-Za-z][\w-]*)\b/);
    if (open && !/\/\s*>$/.test(token)) {
      const ownHandler = token.match(/\b(?:bind|catch)tap\s*=\s*(["'])([A-Za-z_$][\w$]*)\1/i)?.[2];
      const ancestorHandler = [...stack].reverse().find(node => node.handler)?.handler;
      stack.push({ tag: open[1].toLowerCase(), text: '', handler: ownHandler || ancestorHandler });
    }
    previous = match.index + token.length;
  }
  return null;
}

function sameDisplayValue(actual, expected) {
  const displayTypes = ['number', 'string'];
  if (displayTypes.includes(typeof actual) && displayTypes.includes(typeof expected)) {
    return String(actual) === String(expected);
  }
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function sameJsonValue(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function matchesExpectedData(data, expected = {}, compare = sameJsonValue) {
  return Object.entries(expected).every(([key, value]) => compare(data[key], value));
}

async function hasDomSource(workspace, directory = '') {
  for (const entry of await readdir(path.join(workspace, directory), { withFileTypes: true })) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (await hasDomSource(workspace, relative)) return true;
      continue;
    }
    if (!entry.isFile() || !/\.(?:ink|[cm]?[jt]sx?|wxml)$/i.test(entry.name)) continue;

    const source = await readWorkspace(workspace, relative);
    if (/\b(?:document\s*\.|window\s*\.\s*document\b|querySelector(?:All)?\s*\(|getElementById\s*\(|on(?:click|tap)\s*=)/i.test(source)) return true;
  }
  return false;
}

async function evaluate(check, workspace, manifest) {
  const read = relative => readWorkspace(workspace, relative);
  switch (check.type) {
    case 'file':
      await access(await safePath(workspace, check.path));
      return true;
    case 'route':
      return (manifest?.pages || []).includes(check.value);
    case 'widget':
      return (manifest?.widgets || []).some(widget => {
        const description = value => value.replace(/[.!。！\s]+$/g, '');
        return widget.path === check.path
          && widget.family === check.family
          && (!check.displayName || widget.displayName === check.displayName)
          && (!check.description || description(widget.description || '') === description(check.description));
      });
    case 'worker':
      return (manifest?.agentWorkers || []).some(worker =>
        worker.script === check.path
        && worker.trigger?.type === 'open'
        && (!check.lifetime || worker.lifetime === check.lifetime)
        && ['instant', 'foreground'].includes(worker.lifetime));
    case 'permission':
      return (manifest?.permissions || []).includes(check.value);
    case 'manifestField':
      return check.absent ? !(check.value in (manifest || {})) : check.value in (manifest || {});
    case 'routeOrder': {
      const pages = manifest?.pages || [];
      const before = pages.indexOf(check.before);
      const after = pages.indexOf(check.after);
      return before >= 0 && before < after;
    }
    case 'noDom':
      return !await hasDomSource(workspace);
    case 'widgetLayout': {
      const source = await read(check.path);
      const style = source.match(/<style[^>]*>([\s\S]*?)<\/style>/)?.[1] || '';
      return /width\s*:\s*100%/.test(style) && /height\s*:\s*100%/.test(style);
    }
    case 'template': {
      const source = await read(check.path);
      if (check.tag && !new RegExp(`<${check.tag}(?=[\\s/>])`).test(source)) return false;
      if (check.text && !source.includes(check.text)) return false;
      if (check.binding) {
        const bindings = [...source.matchAll(/\{\{([^}]*)\}\}/g)];
        if (!bindings.some(match => new RegExp(`\\b${check.binding}\\b`).test(match[1]))) return false;
      }
      if (check.event && !new RegExp(`(?:bind|catch)tap=["']${check.event}["']`).test(source)) return false;
      return !check.eventLabel || Boolean(boundButtonHandler(source, check.eventLabel));
    }
    case 'behavior': {
      const logic = await loadLogic(workspace, check.path);
      const calls = check.calls || [];
      const source = calls.some(call => call.button) ? await read(check.templatePath || check.path) : '';

      for (const call of calls) {
        const method = call.button ? boundButtonHandler(source, call.button) : call.method;
        if (!method) throw new Error(`missing bound button handler for ${call.button}`);
        await logic.call(method, call.arg);
      }

      const state = JSON.parse(logic.snapshot());
      if (check.minPatches !== undefined && state.patches.length < check.minPatches) return false;
      return matchesExpectedData(state.data, check.expect);
    }
    case 'workerBehavior': {
      const logic = await loadLogic(workspace, check.path);
      let promise;
      const event = {
        waitUntil(value) {
          promise = Promise.resolve(value);
        },
      };
      logic.call('onOpen', event);
      if (!promise) return false;

      let timer;
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('worker timeout')), 500);
      });
      try {
        await Promise.race([promise, timeout]);
      } finally {
        clearTimeout(timer);
      }

      const state = JSON.parse(logic.snapshot());
      return Object.entries(check.expect || {}).every(([key, value]) =>
        JSON.stringify(state.fields[key] ?? state.data[key]) === JSON.stringify(value));
    }
    case 'locationBehavior': {
      let success;
      let failure;
      const navigator = {
        geolocation: {
          getCurrentPosition(ok, bad) {
            success = ok;
            failure = bad;
          },
        },
      };
      const logic = await loadLogic(workspace, check.path, { navigator });
      const method = check.buttonLabel
        ? boundButtonHandler(await read(check.templatePath || check.path), check.buttonLabel)
        : check.method;
      if (!method) throw new Error(`missing bound button handler for ${check.buttonLabel}`);
      await logic.call(method);
      if (typeof success !== 'function' || typeof failure !== 'function') return false;

      if (check.outcome === 'error') await failure({ code: 1, message: 'denied' });
      else await success({ coords: { latitude: 30, longitude: 120 } });

      const state = JSON.parse(logic.snapshot());
      return state.patches.length > 0 && matchesExpectedData(state.data, check.expect, sameDisplayValue);
    }
    case 'watchBehavior': {
      let success;
      let failure;
      const cleared = [];
      const navigator = {
        geolocation: {
          watchPosition(ok, bad) {
            success = ok;
            failure = bad;
            return 37;
          },
          clearWatch(id) {
            cleared.push(id);
          },
        },
      };
      const logic = await loadLogic(workspace, check.path, { navigator });
      const start = check.buttonLabel
        ? boundButtonHandler(await read(check.templatePath || check.path), check.buttonLabel)
        : check.startMethod;
      if (!start) return false;
      await logic.call(start);
      if (typeof success !== 'function' || typeof failure !== 'function') return false;

      await success({ coords: check.position || { latitude: 30, longitude: 120 } });
      if (check.stopMethod) await logic.call(check.stopMethod);

      const state = JSON.parse(logic.snapshot());
      return (!check.stopMethod || cleared.includes(37)) && matchesExpectedData(state.data, check.expect);
    }
    case 'storageBehavior': {
      const values = new Map();
      const writes = [];
      const wx = {
        setStorageSync(key, value) {
          values.set(key, value);
          writes.push(key);
        },
        getStorageSync(key) {
          return values.get(key);
        },
      };
      const logic = await loadLogic(workspace, check.path, { wx });
      if (check.seed) logic.setData(check.seed);

      const source = await read(check.templatePath || check.path);
      for (const label of check.buttons || []) {
        const method = boundButtonHandler(source, label);
        if (!method) return false;
        await logic.call(method);
      }

      const state = JSON.parse(logic.snapshot());
      return writes.includes(check.key)
        && JSON.stringify(values.get(check.key)) === JSON.stringify(check.stored)
        && Object.entries(check.expect || {}).every(([key, value]) =>
          state.data[key] != null && String(state.data[key]) === String(value));
    }
    case 'overlayBehavior': {
      const opens = [];
      const window = {
        open(...args) {
          opens.push(args);
        },
      };
      const logic = await loadLogic(workspace, check.path, { window });
      const method = boundButtonHandler(await read(check.templatePath || check.path), check.buttonLabel);
      if (!method) return false;
      await logic.call(method);

      const openedWidget = opens.some(([url, target]) => url === check.url && target === '_widget');
      const declaredWidget = (manifest?.widgets || []).some(widget =>
        widget.path === check.widgetPath && widget.placement === 'overlay');
      return openedWidget && declaredWidget;
    }
    case 'voiceBehavior': {
      const logic = await loadLogic(workspace, check.path);
      for (const event of check.events || []) await logic.call('onVoiceWakeup', event);
      const state = JSON.parse(logic.snapshot());
      return matchesExpectedData(state.data, check.expect);
    }
    default: {
      const error = new Error(`unsupported check type: ${check.type}`);
      error.code = 'UNSUPPORTED_CHECK_TYPE';
      throw error;
    }
  }
}

async function runChecks(checks, workspace, manifest) {
  return Promise.all(checks.map(async check => {
    try {
      const passed = await evaluate(check, workspace, manifest);
      return { id: check.id, passed: Boolean(passed), ...(passed ? {} : { message: 'condition not met' }) };
    } catch (error) {
      if (error.code === 'UNSUPPORTED_CHECK_TYPE') throw error;
      return { id: check.id, passed: false, message: error.message };
    }
  }));
}

function checkSummary(checks) {
  return {
    passed: checks.filter(check => check.passed).length,
    total: checks.length,
    checks,
  };
}

export async function grade(task, workspace) {
  const { manifest, issues } = await validateWorkspace(workspace);
  const [requiredChecks, regressionChecks, constraintChecks] = await Promise.all([
    runChecks(task.grading.required, workspace, manifest),
    runChecks(task.grading.regression, workspace, manifest),
    runChecks(task.grading.constraints, workspace, manifest),
  ]);

  const required = checkSummary(requiredChecks);
  const regression = checkSummary(regressionChecks);
  const details = [
    ...issues,
    ...constraintChecks.filter(check => !check.passed).map(check => ({
      rule: check.id,
      file: '',
      message: check.message,
    })),
  ];
  const constraints = { violations: details.length, checks: constraintChecks, details };

  return {
    schemaVersion: 1,
    task: task.id,
    category: task.category,
    resolved: required.passed === required.total
      && regression.passed === regression.total
      && constraints.violations === 0,
    required,
    regression,
    constraints,
  };
}
