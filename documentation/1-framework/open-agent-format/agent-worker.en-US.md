# Agent Worker

An Agent Worker is a background script that runs with an agent. Use it to manage one temporary task state while several Pages or Widgets are open, or for work that should start only once.

An Agent Worker has no interface and is not a browser Web Worker. It has an independent JavaScript environment and does not expose Page or Widget interface objects.

## Declare a Background Task

Declare the entry in the `agentWorkers` array in `app.json`:

```json
{
  "pages": ["pages/index/index"],
  "agentWorkers": [
    {
      "name": "sync",
      "script": "workers/sync.js",
      "trigger": { "type": "open" },
      "lifetime": "foreground"
    }
  ]
}
```

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | A non-empty task name that is unique within the agent |
| `script` | `string` | Yes | A `.js` or `.ts` path relative to the project root |
| `trigger` | `object` | Yes | When to start the task; currently only `{ "type": "open" }` is supported |
| `lifetime` | `string` | Yes | How long the task stays active: `instant` or `foreground` |

`script` cannot use an absolute path, URL, backslash, or `..`. An agent can currently declare only one Agent Worker with the `open` trigger.

## Write the Entry Script

The entry file must default-export an object. The runtime calls `onOpen(event)` each time a Page or Widget opens successfully.

```javascript
export default {
  openCount: 0,

  onOpen(event) {
    this.openCount += 1;
    event.waitUntil(this.refresh());
  },

  async refresh() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.latestStatus = 'ready';
  },
};
```

The same running Agent Worker keeps values stored on `this`. Opening another Page or Widget triggers the same task and continues with its existing state. Those values are reset after the task stops and starts again; use storage for data that must persist.

When `onOpen()` starts asynchronous work, call `event.waitUntil(promise)` before the callback returns. Declaring `onOpen()` as `async` does not automatically track its returned Promise.

## Avoid Starting the Same Work Twice

When several entries open close together, an earlier asynchronous setup may still be running. Store the active Promise so they can share the same setup:

```javascript
export default {
  service: null,
  startPromise: null,

  onOpen(event) {
    event.waitUntil(this.ensureService());
  },

  ensureService() {
    if (this.service) return Promise.resolve(this.service);

    if (!this.startPromise) {
      this.startPromise = this.createService()
        .then((service) => {
          this.service = service;
          return service;
        })
        .finally(() => {
          this.startPromise = null;
        });
    }
    return this.startPromise;
  },

  async createService() {
    return { startedAt: Date.now() };
  },
};
```

## Send a Network Request in the Background

For example, fetch configuration when the agent opens:

```javascript
export default {
  onOpen(event) {
    const work = fetch('https://api.example.com/config')
      .then((response) => {
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return response.json();
      })
      .then((config) => console.log('Configuration:', config))
      .catch((error) => console.error('Configuration request failed:', error.message));
    event.waitUntil(work);
  },
};
```

Call `waitUntil()` synchronously before `onOpen()` returns so a short-lived task can wait for the request. Use `WebSocket` when a long-lived connection is needed; close it according to the task lifetime and handle network interruptions.

## Choose How Long It Runs

| `lifetime` | Behavior | Typical use |
| :--- | :--- | :--- |
| `instant` | Stops after the entry script, `onOpen()`, and work registered with `waitUntil()` finish | Synchronize data or complete one short task |
| `foreground` | Keeps running while the current agent has an open Page or Widget | Shared connections and continuous listeners |

`background` is reserved and is not supported in the current release; using it fails `app.json` validation.

## Available Features and Limits

An Agent Worker can use:

- timers, Promises, `console`, `performance`, `fetch`, and `WebSocket`
- URL, text encoding, Web Crypto, and WebAssembly
- ES Modules from the project

An Agent Worker can send network requests directly, but does not provide Page, Widget, `window`, `document`, interface rendering, routing, or media capture. Let a Page or Widget handle visible interface updates.

## Continue Reading

- [AgentWorker API](/AIUI/api/framework-agent-worker): inspect `onOpen()`, `waitUntil()`, `close()`, and available properties
- [app.json](/AIUI/framework/open-agent-format-app-json): configure application entries
