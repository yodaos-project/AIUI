# Modules

AIUI supports ES Modules for organizing code, reusing utilities, and managing static asset imports.

In addition to standard JavaScript modules, AIUI also supports importing `.ts` files directly. TypeScript syntax is removed before runtime evaluation, but there is currently no type checking, and TSX is not supported.

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

If you use TypeScript, `.ts` modules can also be imported directly. When the extension is omitted, resolution tries `.js` first and then `.ts`.

## Using TypeScript

AIUI removes TypeScript type syntax before runtime evaluation, so `.ts` files can be authored and imported directly. However, type checking, editor completion, and global API hints still need a local TypeScript setup in your project.

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
