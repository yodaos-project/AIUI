# AgentWorker

`AgentWorker` is a background-task instance created by the runtime. Fields and methods from the entry module's default-exported object are copied onto this instance, which becomes `this` when `onOpen(event)` runs.

## Keep Shared State for the Current Task

Place reusable data and methods directly on the default-exported object:

```javascript
export default {
  openCount: 0,
  status: null,

  onOpen(event) {
    this.openCount += 1;
    event.waitUntil(this.loadStatus());
  },

  async loadStatus() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.status = 'ready';
  },
};
```

These fields remain available while the current Agent Worker is running. A new instance is created after the task stops and starts again, so this is not permanent storage.

## Wait for Asynchronous Work

The return value from `onOpen()` is ignored. To track asynchronous work, call `event.waitUntil()` before `onOpen()` returns:

```javascript
export default {
  onOpen(event) {
    event.waitUntil(this.synchronize());
  },
  async synchronize() {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },
};
```

`waitUntil()` accepts a Promise, but the call itself must happen during the synchronous execution of `onOpen()`. Calling it later throws `InvalidStateError`.

## Stop the Background Task

Call `this.close()` to request that the current Agent Worker stop:

```javascript
export default {
  openCount: 0,
  onOpen() {
    this.openCount += 1;
    if (this.openCount >= 3) {
      this.close();
      return;
    }
  },
};
```

The stop request does not interrupt the current function immediately. Return after calling it instead of starting more work.

## Use the Global Event Style

Instead of the default export's `onOpen()`, you can listen for `open` on the global object:

```javascript
self.addEventListener('open', (event) => {
  event.waitUntil(new Promise((resolve) => setTimeout(resolve, 100)));
});
```

The `AgentWorker` instance is not an `EventTarget`; use `self` when you need `addEventListener()`. The default export's `onOpen()` is usually more convenient when state is stored on `this`.

## Current Behavior

- `AgentWorker` is created by the runtime and cannot be constructed with `new AgentWorker()`.
- `name`, `navigator`, and `close` are reserved. Fields with those names in the default export do not replace them.
- `this.navigator` and the global `navigator` are the same object.
- Global `self` and `globalThis` refer to the Agent Worker global object, not the `this` value used by `onOpen()`.
- Every `open` trigger calls `onOpen()`; overlapping asynchronous work is not merged automatically.
- Agent Workers do not provide `fetch`; start network requests from a Page or Widget.

For declarations and lifetime configuration, see [Agent Worker Development](/AIUI/framework/open-agent-format-agent-worker).

## API Reference

### `AgentWorker`

| Member | Type | Description |
| :--- | :--- | :--- |
| `name` | `string` | Agent Worker name declared in `app.json` |
| `navigator` | `WorkerNavigator` | Environment information and extra features available to the task |
| `close()` | `function` | Requests that the current Agent Worker stop |
| Custom fields and methods | `any` | Members copied from the entry module's default-exported object |

### `onOpen(event)`

Runs once each time the agent opens successfully. If the entry module is still loading, events are queued and delivered in order after loading completes.

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `event` | `ExtendableEvent` | The current `open` event; use `waitUntil()` to register a Promise that must finish |

The return value is ignored.

### `ExtendableEvent`

`ExtendableEvent` extends the standard `Event` with this method:

| Method | Description |
| :--- | :--- |
| `waitUntil(value)` | Waits for `Promise.resolve(value)`; must be called during synchronous event delivery |

The event's `type` is `'open'`. Its `target` and `currentTarget` refer to the Agent Worker global object.

### `WorkerNavigator`

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Content identifier for the current agent |
| `renderingEnabled` | `boolean` | Whether the entry that started this task can display an interface |
| `versions` | `NavigatorVersions` | AIUI runtime version information |
| `userAgent` | `string` | Current runtime identification string |
| `language` | `string` | Preferred language |
| `languages` | `string[]` | Language preferences in priority order |
| `region` | `string` | Current region information |

### `AgentWorkerGlobalScope`

Global `self`, `globalThis`, and `name` live on `AgentWorkerGlobalScope`. It extends `EventTarget` and supports:

```javascript
self.addEventListener('open', listener);
self.removeEventListener('open', listener);
close();
```
