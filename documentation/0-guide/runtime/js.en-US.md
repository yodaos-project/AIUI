# JavaScript Compatibility

AIUI agents use JavaScript for interaction logic. You can use common modern features such as `Promise`, `async/await`, and modules, while taking care not to run synchronous code for too long.

This page introduces useful language features and the execution limit to keep in mind.

## Common JavaScript Features

### Asynchronous Operations

`Promise` and `async/await` help organize operations that need to wait. For example, this function waits one second before returning a message:

```javascript
async function getMessage() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return 'Ready';
}

getMessage().then((message) => console.log(message));
```

In a real project, you can also wait for results such as network responses. Check the API's documentation first: some APIs use callbacks and cannot be used as if they returned a Promise directly.

### Data and Common Syntax

You can use data structures such as `Map`, `Set`, `WeakMap`, and `WeakSet`, as well as optional chaining `?.` and nullish coalescing `??`:

```javascript
const weather = new Map();
weather.set('city', 'Hangzhou');

const user = { profile: { name: 'Alex' } };
const userName = user?.profile?.name ?? 'Guest';
```

### Split and Reuse Code

As a project grows, use `export` to make a function available and `import` to use it in another file.

For example, export a function from `utils/format.js`:

```javascript
export function formatCity(city) {
  return `${city} weather`;
}
```

Then import it in the page logic in `pages/index/index.ink`:

```javascript
import { formatCity } from '../../utils/format.js';

console.log(formatCity('Hangzhou')); // Hangzhou weather
```

### Large Integers

Use `BigInt` when you need an integer outside the safe integer range of ordinary numbers:

```javascript
const largeNumber = 9007199254740993n;
```

Language syntax and API availability are different things. Check the relevant API documentation for network, device, and other capabilities.

## Can I Use TypeScript?

Yes. **TypeScript** builds on JavaScript by adding type annotations. Types help editors and checking tools catch common mistakes, such as passing text to a function that expects a number.

For example, define a function that accepts a number in `utils/format.ts`:

```typescript
export function formatTemperature(value: number): string {
  return `${value}°C`;
}
```

Then import and use it from a page's JavaScript logic:

```javascript
import { formatTemperature } from '../../utils/format.ts';

console.log(formatTemperature(26)); // 26°C
```

This import path is relative to `pages/index/index.ink`. AIUI supports importing `.ts` modules directly and processes TypeScript syntax before execution; **the runtime does not type-check your code**. To check types during development or get editor hints, configure TypeScript and the type definitions in your project. TSX is not currently supported.

For installation, configuration, and more examples, see [Modules: Using TypeScript](/AIUI/framework/open-agent-format-module).

## Accelerate Repeated Computation

When a page repeatedly processes many numbers or draws many graphics, mark a TypeScript function with `offload`. Supported calls can be accelerated; calls that are unsuitable for acceleration run as ordinary JavaScript by default.

For example, define a function in `utils/sum.ts` that adds values above a threshold:

```typescript
import { offload } from 'ink:compiler';

export const sumAbove = offload(function sumAbove(values: Float64Array, threshold: number): number {
  let total = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] > threshold) total += values[i];
  }
  return total;
});
```

For example, `sumAbove(new Float64Array([1, 3, 5]), 2)` returns `8`. Give the runtime the `.ts` file or `<script setup lang="ts">` source; do not compile away the marker into ordinary JavaScript first.

Pass the data as arguments and use local variables and ordinary `for` loops. Do not read `this`, capture outer variables, or call custom helper functions inside the marked function. Supported Canvas 2D drawing can use the same approach, but not every drawing call can be accelerated. Measure the real workload on the target device; small tasks may not be faster.

The default mode is `auto`: the original function runs when acceleration is unavailable. To check whether a call can be accelerated, pass `{ mode: 'require' }` as the second argument to `offload()`; an unsupported body reports a compilation error, and arguments that cannot be accelerated cause `OffloadUnsupportedError`. This does not replace type checking or remove the synchronous execution limit described below.

## Avoid Long-Running Synchronous Code

Starting with AIUI 0.20, an instance has a default limit of **2,000 milliseconds** for continuous synchronous JavaScript execution. Exceeding it interrupts the script and requests instance destruction, so don't rely on cleanup running afterward. A deployment can set a different limit; an application cannot change it while running.

Asynchronous waiting after JavaScript yields control doesn't count toward that time. However, putting a large computation in an `async` function doesn't automatically yield control.

For a large amount of work, split it into small batches and use a timer between batches to give other work a chance to run:

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

Processing costs vary, so adjust the batch size to keep each synchronous batch short. Avoid busy-wait loops; `await Promise.resolve()` is not a reliable way to yield to the event loop either.

## Need to Run WebAssembly?

AIUI also supports running computational modules with `WebAssembly`. Avoid long synchronous blocking when creating modules or calling exports. For supported behavior, resource limits, and usage, see [WebAssembly](/AIUI/api/webassembly).
