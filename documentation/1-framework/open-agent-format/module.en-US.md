# Modules

AIUI supports ES Modules for organizing code, reusing utilities, and managing static asset imports.

AIUI can also import `.ts` files directly when they use erasable type syntax.

## Exporting And Importing

Modules can export functions, objects, or variables using standard ES Module syntax:

```javascript
// utils.js
export const formatTime = date => {
  return date.toISOString();
};

export default {
  sayHello: () => console.log('Hello')
};
```

Then import and use them in a page or component:

```javascript
import { formatTime } from '../../utils.js';
import myLib from '../../lib.js';

export default {
  onLoad() {
    console.log(formatTime(new Date()));
    myLib.sayHello();
  }
};
```

When the extension is omitted, the runtime tries `.js` first and then `.ts`.

## Using TypeScript

Before executing a module, the AIUI runtime strips supported type syntax and runs the remaining JavaScript. Supported forms include `interface` declarations, `type` aliases, type annotations, generic type parameters and arguments, `as` assertions, `satisfies` expressions, and standalone `import type` declarations. The runtime does not type-check modules or support TSX.

The runtime rejects `enum` and `namespace`/`module` declarations. Type erasure cannot generate the JavaScript needed to provide runtime values for these declarations. For enum-like values, use a plain object with a union type.

```typescript
export const Mode = { A: 1, B: 2 } as const;
export type Mode = (typeof Mode)[keyof typeof Mode];
```

If a statically imported dependency of a page contains an unsupported declaration, the module fails to compile and the page script cannot execute. If you see `Failed to execute page`, look for `Unsupported TypeScript feature` in the logs to find the module path, position, and unsupported syntax.

Set up TypeScript in your project for type checking, editor completion, and global API hints.

First install TypeScript and the AIUI type package:

```bash
npm install -D typescript @yodaos-pkg/ink-env
```

Then create a minimal `tsconfig.json` in the project root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noEmit": true,
    "types": ["@yodaos-pkg/ink-env"]
  },
  "include": ["**/*.ts"]
}
```

The `types` field explicitly pulls in the base declarations from `@yodaos-pkg/ink-env`, so your editor and `tsc` can recognize runtime APIs such as `PageInstance`, `ComponentInstance`, and `wx`.

```typescript
// helpers.ts
export function formatCount(count: number): string {
  return `Count: ${count}`;
}
```

```typescript
// pages/index/index.ts
import { formatCount } from './helpers';

const page: PageInstance = {
  data: {
    title: formatCount(1)
  },
  onLoad() {
    wx.showToast({ title: this.data.title });
  }
};

export default page;
```

If you only want these declarations for one project, you can keep `@yodaos-pkg/ink-env` in that project's own `tsconfig` rather than exposing it through a broader editor-wide setup.

## Using WebAssembly

`.wasm` files are treated as asset modules, so the default export is a `Blob`. In practice, you compile source code to `.wasm` with Rust or another standard WebAssembly toolchain, then import it the same way as other assets in AIUI modules.

Here is a minimal Rust example. Start by creating a library crate and adding the WebAssembly target:

```bash
cargo new --lib math-wasm
rustup target add wasm32-unknown-unknown
```

Then change `src/lib.rs` to:

```rust
#[unsafe(no_mangle)]
pub extern "C" fn add(left: i32, right: i32) -> i32 {
    left + right
}
```

Compile the `.wasm` file with Rust:

```bash
cargo build --target wasm32-unknown-unknown --release
```

Once the build finishes, copy the artifact into your project assets, for example:

```bash
cp target/wasm32-unknown-unknown/release/math_wasm.wasm ../aiui-app/assets/math.wasm
```

Then import and instantiate it in an AIUI module:

```javascript
import wasmBlob, { mimeType, path } from '../assets/math.wasm';

export default {
  async onLoad() {
    const buffer = await wasmBlob.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(buffer);

    console.log(mimeType); // application/wasm
    console.log(path);
    console.log(instance.exports.add(1, 2)); // 3
  }
};
```

The same import flow works for larger Rust crates too, as long as the final artifact is a standard `.wasm` file.

## Asset Modules

AIUI also supports importing images, audio files, and WebAssembly assets through ESM. By default, these assets are exported as `Blob`.

```javascript
import icon, { mimeType, path } from '../assets/icon.png';

console.log(icon instanceof Blob);
console.log(mimeType);
console.log(path);
```

The currently supported default asset types include:

- Images: `.png`, `.jpg`, `.jpeg`, `.webp`, `.svg`, `.gif`, `.bmp`
- Audio: `.wav`, `.mp3`, `.ogg`, `.m4a`, `.aac`, `.flac`, `.pcm`
- WebAssembly: `.wasm`

In addition to the default export, asset modules also expose `mimeType` and `path` as named exports.

## Typed Asset Imports

When you need explicit runtime materialization, import attributes can be used to get more specific objects:

```javascript
import icon from '../assets/icon.png' with { type: 'image' };
import click from '../assets/click.wav' with { type: 'sound' };

console.log(icon instanceof ImageData);
console.log(click instanceof Sound);
```

In this mode:

- `type: 'image'` only works with image assets and returns `ImageData`
- `type: 'sound'` only works with audio assets and returns `Sound`
- Unsupported types or mismatched asset types cause module loading to fail

## Notes

- Module support can be used in pages, components, and other reusable logic files
- Shared logic is best extracted into standalone modules to keep page files focused
- Prefer components for reusable UI structure, and modules for reusable logic or assets

See [Assets](/AIUI/framework/open-agent-format-assets) for component `src`, relative-path, application-root, and network-asset rules.

For synchronous construction, JavaScript imports, Memory/Table/Global, streaming response helpers, and resource limits, see [WebAssembly](/AIUI/api/webassembly). Reuse a compiled Module with `instantiate(module)`; `validate()` and `compile()` accept bytes only.
