# Modularization

AIUI fully embraces the modern JavaScript ecosystem and provides comprehensive support for **ES Modules (ESM)** as the standard modularization solution.

## 1. ESM Support

The AIUI runtime supports ESM natively, so you can use `import` and `export` when developing agents.

> [!IMPORTANT]
> Single-file components (`.ink` files) can serve as page or component entry points. To share code across pages or components, export it from a standalone `.js` or `.ts` module and import it from each entry point.

### Export Modules

You can export variables, functions, or classes from any `.js` file:

```javascript
// utils.js
export const VERSION = '1.0.0';

export function formatTime(date) {
  return date.toLocaleTimeString();
}

export default class Calculator {
  add(a, b) {
    return a + b;
  }
}
```

### Import Modules

Use standard syntax to import local files or third-party packages:

```javascript
// pages/index/index.js
import Calculator, { VERSION, formatTime } from '../../utils.js';

console.log('Current Version:', VERSION);
```

## 2. Dynamic Import

AIUI supports `import()` for code splitting and on-demand loading, which is very useful for optimizing startup speed in large agents:

```javascript
async function loadChart() {
  const { Chart } = await import('../../libs/chart.js');
  const chart = new Chart();
  // ...
}
```

## 3. Using Third-Party Libraries

Install an npm package with an ESM entry point from the app root. AIUI resolves package names from the app's `node_modules`. With the `@demo/ui` example from the [Packages guide](/AIUI/framework/open-agent-format-packages) installed, you can import it by name.

```javascript
import { formatMessage } from '@demo/ui';

console.log(formatMessage('AIUI'));
```

If the package declares `./utils` in its `package.json` `exports` field, you can import that subpath as `@demo/ui/utils`.

## 4. Differences From Traditional CommonJS

Unlike older mini-program frameworks, AIUI does **not support** `module.exports` or `require()`. Please use ESM consistently.

*   **Native performance**: ESM is parsed natively by the JS engine and offers better loading performance than a CommonJS compatibility layer.
*   **Unified standard**: It aligns completely with the modern Web development experience.

## 5. Notes

*   **File extensions**. An explicit `.js` or `.ts` extension selects that file. When you omit the extension, as in `import './utils'`, AIUI looks for `./utils.js` first, then `./utils.ts`.
*   **Top-level await**: AIUI currently does **not support** top-level `await`. Use `await` inside async functions instead.
