/** Deterministic multi-stage interactions, isolated from real I/O and time. */
import { loadLogic } from './behavior.js';
import { readWorkspace } from './workspace.js';
import vm from 'node:vm';

const actions = new Set(['call', 'seed', 'expect', 'respond', 'advance', 'location', 'storageFailure', 'reload']);
const object = value => value && typeof value === 'object' && !Array.isArray(value);
const identifier = value => typeof value === 'string' && /^[A-Za-z_$][\w$]*$/.test(value);

/** Validate the scenario DSL, including nested workspace paths. */
export function validateScenario(check, validatePath) {
  if (!Array.isArray(check.steps) || !check.steps.length || !check.steps.some(step => step.action === 'expect')) throw new Error('scenario needs steps and an expectation');
  const instances = check.instances || {};
  if (!object(instances)) throw new Error('invalid scenario instances');
  for (const [name, instance] of Object.entries(instances)) {
    if (!identifier(name) || name === 'main' || !object(instance) || !instance.path) throw new Error('invalid scenario instance');
    for (const field of ['path', 'templatePath']) validatePath(instance, field);
  }
  for (const step of check.steps) {
    if (!object(step) || !actions.has(step.action)) throw new Error('unknown scenario action');
    if (step.instance !== undefined && step.instance !== 'main' && !Object.hasOwn(instances, step.instance)) throw new Error('unknown scenario instance');
    if (step.action === 'call') {
      if ([step.method, step.button, step.event].filter(value => value !== undefined).length !== 1
        || (step.method !== undefined && !identifier(step.method))
        || (step.button !== undefined && (typeof step.button !== 'string' || !step.button))
        || (step.event !== undefined && (!object(step.event) || !/^[a-z][\w-]*$/.test(step.event.tag || '') || !/^[a-z]+$/.test(step.event.name || '')))) throw new Error('invalid scenario call');
    }
    if (step.action === 'seed' && !object(step.data)) throw new Error('invalid scenario seed');
    if (step.action === 'expect' && (!(object(step.data) || object(step.effects))
      || (step.data !== undefined && !object(step.data)) || (step.effects !== undefined && !object(step.effects)))) throw new Error('invalid scenario expectation');
    if (['respond', 'location'].includes(step.action) && (!Number.isInteger(step.request) || step.request < 0)) throw new Error('invalid scenario request');
    if (step.action === 'location' && step.late !== undefined && typeof step.late !== 'boolean') throw new Error('invalid late location flag');
    if (step.action === 'advance' && (!Number.isInteger(step.ms) || step.ms < 0 || step.ms > 60000)) throw new Error('invalid scenario clock advance');
    if (step.action === 'storageFailure' && typeof step.enabled !== 'boolean') throw new Error('invalid storage failure');
  }
}

/** Find an event on a real template element rather than invoking a fixed handler. */
function eventHandler(source, event) {
  const template = source.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  for (const match of template.matchAll(/<([a-z][\w-]*)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/g)) {
    if (match[1] !== event.tag) continue;
    const attributes = Object.fromEntries([...match[2].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map(attr => [attr[1], attr[3]]));
    if (event.attribute && attributes[event.attribute] !== event.value) continue;
    const method = attributes[`bind${event.name}`] || attributes[`bind:${event.name}`] || attributes[`catch${event.name}`] || attributes[`catch:${event.name}`];
    if (method) return method;
  }
  return null;
}

const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const matches = (actual, expected) => Object.entries(expected || {}).every(([key, value]) => JSON.stringify(actual[key]) === JSON.stringify(value));
// Drain a bounded number of Promise continuations, without sleeping or real time.
async function flush() { for (let index = 0; index < 12; index++) await Promise.resolve(); }

/** Execute a scenario with shared mocked services and separate Page/Widget instances. */
export async function runScenario(check, workspace, buttonHandler) {
  const instances = { main: { path: check.path, templatePath: check.templatePath }, ...check.instances };
  const loaded = new Map(), storage = new Map(), requests = [], locations = [], timers = new Map();
  const effects = { navigation: [], opens: [], closes: 0, prevented: 0, storageWrites: [], clearedWatches: [] };
  let now = 0, timerId = 0, storageFailure = false;
  const errors = [];
  const track = result => { if (result?.then) result.catch(error => errors.push(error)); };
  // Callback code still executes under a VM timeout, like direct handler calls.
  const invoke = (callback, args = []) => vm.runInNewContext('callback(...args)', { callback, args }, { timeout: 300 });
  const timer = (callback, delay, interval, ...args) => {
    const id = ++timerId;
    timers.set(id, { callback, due: now + Math.max(1, Number(delay) || 0), interval, delay: Math.max(1, Number(delay) || 0), args });
    return id;
  };
  const wx = {
    navigateTo(options) { effects.navigation.push({ type: 'to', url: options.url }); options.success?.(); options.complete?.(); },
    redirectTo(options) { effects.navigation.push({ type: 'redirect', url: options.url }); options.success?.(); options.complete?.(); },
    navigateBack(options = {}) { effects.navigation.push({ type: 'back', delta: options.delta ?? 1 }); options.success?.(); options.complete?.(); },
    setStorageSync(key, value) { if (storageFailure) throw new Error('storage unavailable'); storage.set(key, clone(value)); effects.storageWrites.push(key); },
    getStorageSync(key) { if (storageFailure) throw new Error('storage unavailable'); return clone(storage.get(key)); },
    removeStorageSync(key) { if (storageFailure) throw new Error('storage unavailable'); storage.delete(key); },
  };
  for (const operation of ['set', 'get', 'remove']) {
    wx[`${operation}Storage`] = options => {
      try {
        const value = wx[`${operation}StorageSync`](options.key, options.data);
        if (operation === 'get' && value === undefined) throw new Error('Key not found');
        options.success?.(operation === 'get' ? { data: value } : {});
      } catch (error) { options.fail?.({ errMsg: error.message }); }
      options.complete?.();
    };
  }
  wx.request = options => {
    const request = { url: String(options.url), options, settled: false, callback: true };
    requests.push(request);
    return { abort() { request.settled = true; request.aborted = true; } };
  };
  const globals = {
    wx,
    window: { open(url, target = '_widget') { effects.opens.push({ url, target }); }, close() { effects.closes++; } },
    navigator: { geolocation: {
      getCurrentPosition(success, error) { locations.push({ success, error, watch: false }); },
      watchPosition(success, error) { locations.push({ success, error, watch: true, active: true }); return locations.length; },
      clearWatch(id) { if (locations[id - 1]) locations[id - 1].active = false; effects.clearedWatches.push(id); },
    } },
    setTimeout: (callback, delay, ...args) => timer(callback, delay, false, ...args),
    setInterval: (callback, delay, ...args) => timer(callback, delay, true, ...args),
    clearTimeout: id => timers.delete(id), clearInterval: id => timers.delete(id),
    fetch: (url, options = {}) => new Promise((resolve, reject) => {
      const request = { url: String(url), options, resolve, reject, settled: false };
      requests.push(request);
      const abort = () => { if (!request.settled) { request.settled = true; request.aborted = true; reject(new Error('Aborted')); } };
      if (options.signal?.aborted) abort(); else options.signal?.addEventListener('abort', abort, { once: true });
    }),
    URL, URLSearchParams, encodeURIComponent, decodeURIComponent, AbortController,
  };
  const get = async name => {
    if (!loaded.has(name)) loaded.set(name, await loadLogic(workspace, instances[name].path, globals));
    return loaded.get(name);
  };
  for (const step of check.steps) {
    const name = step.instance || 'main';
    if (step.action === 'reload') { loaded.delete(name); await get(name); }
    else if (step.action === 'storageFailure') storageFailure = step.enabled;
    else if (step.action === 'advance') {
      const end = now + step.ms;
      let ticks = 0;
      while (true) {
        const next = [...timers].filter(([, item]) => item.due <= end).sort((a, b) => a[1].due - b[1].due || a[0] - b[0])[0];
        if (!next) break;
        if (++ticks > 1000) throw new Error('scenario timer limit');
        const [id, item] = next; now = item.due;
        if (item.interval) item.due += item.delay; else timers.delete(id);
        track(invoke(item.callback, item.args)); await flush();
      }
      now = end;
    } else if (step.action === 'respond') {
      const request = requests[step.request];
      if (!request || (request.settled && !request.aborted)) throw new Error('missing or already settled request');
      if (request.aborted) continue;
      request.settled = true;
      if (request.callback) {
        const response = { statusCode: step.status ?? 200, data: clone(step.body) };
        if (step.error && request.options.fail) track(invoke(request.options.fail, [{ errMsg: step.error }]));
        else if (!step.error && request.options.success) track(invoke(request.options.success, [response]));
        if (request.options.complete) track(invoke(request.options.complete));
      } else if (step.error) request.reject(new Error(step.error));
      else request.resolve({ ok: (step.status ?? 200) < 400, status: step.status ?? 200, json: async () => clone(step.body) });
    } else if (step.action === 'location') {
      const request = locations[step.request];
      if (!request) throw new Error('missing location request');
      // A queued watch callback may arrive after clearWatch. Deliver it only
      // when the scenario explicitly tests that race.
      if (!request.watch || request.active || step.late) {
        if (step.error) { if (!request.error) throw new Error('missing location error handler'); track(invoke(request.error, [step.error])); }
        else track(invoke(request.success, [{ coords: step.coords, timestamp: now }]));
      }
    } else {
      const logic = await get(name);
      if (step.action === 'seed') logic.setData(clone(step.data));
      else if (step.action === 'call') {
        const source = step.method ? '' : await readWorkspace(workspace, instances[name].templatePath || instances[name].path);
        const method = step.method || (step.button ? buttonHandler(source, step.button) : eventHandler(source, step.event));
        if (!method) throw new Error('missing scenario event handler');
        const argument = clone(step.arg);
        if (step.preventDefault && argument) argument.preventDefault = () => effects.prevented++;
        if (step.waitUntil) {
          let promise;
          track(logic.call(method, { waitUntil(value) { promise = Promise.resolve(value); } }));
          if (!promise) throw new Error('waitUntil must be registered synchronously');
          track(promise);
        } else track(logic.call(method, argument));
      } else if (step.action === 'expect') {
        const state = JSON.parse(logic.snapshot());
        const observed = { ...effects, storage: Object.fromEntries(storage), requestUrls: requests.map(request => request.url),
          pendingRequests: requests.filter(request => !request.settled).length, activeTimers: timers.size,
          activeWatches: locations.filter(request => request.watch && request.active).length, locationRequests: locations.length };
        if (!matches(state.data, step.data) || !matches(observed, step.effects)) return false;
      }
    }
    await flush();
    if (errors.length) throw errors[0];
  }
  return true;
}
