# JavaScript Compatibility

The AIUI runtime uses the QuickJS JavaScript engine.

QuickJS is a lightweight JavaScript engine with full support for the ES2023 specification. Understanding its features and limitations helps you write more robust agent code.

## Supported ECMAScript Features

QuickJS provides support for very modern JavaScript syntax, so you can safely use the following features in agent development:

### 1. Asynchronous Programming (Async / Await)
Native support for `Promise` and `async/await`, with no need for a Polyfill.

```javascript
async function fetchAgentData() {
  try {
    const response = await wx.request({ url: '...' });
    return response.data;
  } catch (error) {
    console.error(error);
  }
}
```

### 2. Modern Data Structures
Full support for `Map`, `Set`, `WeakMap`, and `WeakSet`, as well as the latest array and object methods.

```javascript
const agentState = new Map();
agentState.set('status', 'active');

// 可选链 (Optional Chaining) 与 空值合并 (Nullish Coalescing)
const userName = user?.profile?.name ?? 'Guest';
```

### 3. ES Modules
Supports the standard modular syntax of `import` and `export`.

```javascript
import { formatTime } from '../../utils/util.js';
export const config = { timeout: 5000 };
```

### 4. BigInt
Native support for large integer operations, which is very useful when handling high-precision timestamps or hardware identifiers.

```javascript
const timestamp = 9007199254740991n;
```

## Synchronous Execution Budget

Starting with AIUI 0.20, each instance has a default 2,000 ms synchronous JavaScript budget. Exceeding it interrupts the script realm and requests instance destruction; do not rely on cleanup continuing afterward. Asynchronous waiting is excluded after JavaScript yields control. Putting computation in an `async` function does not automatically yield.

Split long computations and yield the event loop with timers between batches. Avoid busy-wait loops and do not treat `await Promise.resolve()` as a reliable event-loop yield.

```javascript
async function processInBatches(items, processItem) {
  for (let start = 0; start < items.length; start += 100) {
    for (const item of items.slice(start, start + 100)) {
      processItem(item);
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}
```

Adjust batch size to the cost per item so each synchronous batch stays short. Deployment environments may configure a different budget; applications cannot change this policy while running.

## WebAssembly Computational Modules

Use `WebAssembly` to run computational modules with JavaScript imports. Synchronous constructors and exported function calls should still avoid long blocking work. See [WebAssembly](/AIUI/api/webassembly) for the supported subset, resource quotas, and Module reuse.
