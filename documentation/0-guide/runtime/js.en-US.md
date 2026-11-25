# JavaScript

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

Offload can speed up eligible TypeScript loops when an agent repeatedly processes batches of samples or draws many shapes each frame. Use the `@offload` decorator on a class method or wrap a standalone function with `offload(function …)`. Import `offload` from `ink:compiler` for either form. Calls remain synchronous.

Give the AIUI runtime the original `.ts` file or `<script setup lang="ts">` source so it can recognize the marker while processing TypeScript.

### Sum Samples Above a Threshold with `@offload`

Add `@offload` to a public class method in `utils/sample-stats.ts`. For example, if you record the number of bytes received each second, pass the samples and a threshold to a static method to total the bytes received during high-traffic periods.

```typescript
import { offload } from 'ink:compiler';

export class SampleStats {
  @offload
  static sumAbove(values: Float64Array, threshold: number): number {
    let total = 0;
    for (let i = 0; i < values.length; i++) {
      if (values[i] > threshold) total += values[i];
    }
    return total;
  }
}

console.log(SampleStats.sumAbove(new Float64Array([1, 3, 5]), 2)); // 8
```

Use `@offload` on a public instance or static method with a non-computed name. It must be the method's only decorator.

### Find the First Sample Above a Limit with `offload()`

If a reading above a limit should trigger an alert, scan the batch and return as soon as you find one. Write the `function` expression directly inside `offload()`, then call the returned function as usual.

```typescript
import { offload } from 'ink:compiler';

export const findFirstAbove = offload(function (values: Float32Array, limit: number): number {
  for (let i = 0; i < values.length; i++) {
    if (values[i] > limit) return i;
  }
  return -1;
});

console.log(findFirstAbove(new Float32Array([12, 15, 24, 18]), 20)); // 2
```

The index starts at `0`, and `-1` means no reading exceeded the limit. `offload()` requires an inline `function` expression. Passing an existing function or an arrow function causes a compilation error.

### Scale a Batch of Waveform Samples

Before drawing an audio waveform, multiply a batch of floating-point samples by the display scale and write the results into a reusable output array. The caller supplies an output array long enough to hold every result.

```typescript
import { offload } from 'ink:compiler';

export const scaleSamples = offload(function (input: Float32Array, output: Float32Array, scale: number): void {
  for (let i = 0; i < input.length; i++) {
    output[i] = input[i] * scale;
  }
});

const input = new Float32Array([-0.5, 0, 0.75]);
const output = new Float32Array(input.length);
scaleSamples(input, output, 40);
console.log(Array.from(output)); // [-20, 0, 30]
```

### Draw a Canvas Bar Chart in a Batch

On each chart refresh, pass the drawing context and bar heights to a decorated instance method. This example draws three bars on an offscreen canvas, all with a baseline of `y = 80`.

```typescript
import { offload } from 'ink:compiler';

class BarPainter {
  @offload
  draw(ctx: InkCanvasRenderingContext2D, heights: Float32Array, baseline: number): void {
    for (let i = 0; i < heights.length; i++) {
      const height = heights[i];
      ctx.fillRect(i * 8, baseline - height, 6, height);
    }
  }
}

const canvas = new Canvas(120, 80);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#33aa66';
new BarPainter().draw(ctx, new Float32Array([24, 48, 36]), 80);
```

To draw on a page `<canvas>`, obtain its 2D context after the component mounts, pass it to `draw()`, and call `ctx.flush()` when finished. Canvas acceleration depends on the operations and their arguments. This example batches `fillRect()` calls. See [Canvas](/AIUI/api/canvas) for page and offscreen canvas usage.

### Verify That a Call Can Be Accelerated

The default `auto` mode runs the original function when acceleration is unavailable. To check whether a call can be accelerated with actual inputs, use `@offload({ mode: 'require' })` or pass `{ mode: 'require' }` as the second argument to `offload()`. In `require` mode, an unsupported function body causes a compilation error, and a call that cannot be accelerated throws `OffloadUnsupportedError`.

Pass data and drawing contexts as arguments, and use local variables and ordinary `for` loops in the function. Reading `this`, capturing outer variables, or calling custom helpers makes the body ineligible. Numeric loops can use ordinary `Float32Array` and `Float64Array` inputs, and numeric offload is also available in Agent Workers. Measure with representative data volumes on the target device, since short tasks may run faster directly in JavaScript. Keep checking types during development and follow the synchronous execution limit below.

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
