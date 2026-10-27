# WebAssembly

Use the global `WebAssembly` object to load computational modules, call exports, and import JavaScript functions, memory, tables, and globals. Native and Web environments provide the same supported API subset.

## Load and Reuse a Computational Module

This complete binary exports an `add` function, so you can verify instantiation without external assets:

```javascript
const bytes = new Uint8Array([
  0, 97, 115, 109, 1, 0, 0, 0,
  1, 7, 1, 96, 2, 127, 127, 1, 127,
  3, 2, 1, 0,
  7, 7, 1, 3, 97, 100, 100, 0, 0,
  10, 9, 1, 7, 0, 32, 0, 32, 1, 106, 11,
]);
const { module, instance } = await WebAssembly.instantiate(bytes);
console.log(instance.exports.add(13, 29)); // 42

const another = await WebAssembly.instantiate(module);
console.log(another.exports.add(1, 2)); // 3
```

Byte input returns `{ module, instance }`; reusing a Module returns an Instance directly. `i64` parameters and results use BigInt.

## Read Packaged or Remote Modules

If `/assets/math.wasm` is packaged and exports `add`, load it through a Fetch Response:

```javascript
const response = await fetch('/assets/math.wasm');
const { instance } = await WebAssembly.instantiate(await response.arrayBuffer());
console.log(instance.exports.add(13, 29));
```

For a remote endpoint returning a successful response with MIME type `application/wasm`, use the streaming helper:

```javascript
const { instance } = await WebAssembly.instantiateStreaming(
  fetch('https://example.com/math.wasm'),
);
console.log(instance.exports.add(13, 29));
```

Streaming helpers require an unlocked, unused body. The current implementation reads the complete body before compiling; it does not compile incrementally as network chunks arrive.

You can also import `.wasm` as an asset module. Its default export is a `Blob` accepted directly by `instantiate()`. For a build example, see [Modules](/AIUI/framework/open-agent-format-module#using-webassembly).

## Bind Functions and Memory

Organize imports by the module and field names declared in Wasm. This example assumes `module` declares `env.memory` and `env.log`:

```javascript
const memory = new WebAssembly.Memory({ initial: 1, maximum: 4 });
const imports = { env: { memory, log: (value) => console.log(value) } };
const instance = new WebAssembly.Instance(module, imports);
const view = new Uint8Array(memory.buffer);
view[0] = 42;
```

Imported functions execute synchronously. Import values must match the module's declared types. Supplying resources does not automatically add exports.

## Compatibility and Resource Limits

- Input accepts `ArrayBuffer`, TypedArray, DataView, and the `Blob` extension. Views use only their own `byteOffset` and `byteLength`.
- `validate()` and `compile()` accept bytes, not compiled Modules. Reuse modules with `instantiate(module)`.
- Limits are 64 MiB per module, 256 MiB per Memory, and 1,000,000 entries per Table. Frequent JavaScript/Wasm calls involving large memories can incur copying costs.
- Shared memory, threads, SIMD, memory64, and the exception-handling proposal are unsupported. `Tag` / `Exception` are not exposed.
- Use bare `wasm32-unknown-unknown` modules. WASI, Emscripten, libc, filesystems, and services required by generated JS glue are not provided automatically.

## API Reference

### `WebAssembly`

#### `validate(bytes)`

Synchronously returns a `boolean`. Invalid binaries return `false`; incorrect input types, including Module, throw `TypeError`. Exceeding resource quotas throws `RangeError`.

#### `compile(bytes)`

Returns `Promise<Module>` with the same byte-input rules as `validate()`. Module input rejects with `TypeError`; compilation failure rejects with `CompileError`.

#### `instantiate(bytesOrModule, imports?)`

Byte input returns `Promise<{ module, instance }>`; Module input returns `Promise<Instance>`. Optional `imports` contains resources grouped by module name. Linking failures reject with `LinkError`.

#### `compileStreaming(response)`

Accepts a `Response` or its Promise and returns `Promise<Module>`. Requires a successful status, `application/wasm` MIME type without parameters, and a readable body, which it consumes. Invalid status, MIME, or body state rejects with `TypeError`.

#### `instantiateStreaming(response, imports?)`

Accepts the same response as `compileStreaming()` plus optional imports and returns `Promise<{ module, instance }>`.

### `WebAssembly.Module`

#### `new WebAssembly.Module(bytes)`

Synchronously compiles a reusable module. Type, compilation, and quota errors throw synchronously. Construction blocks the current script, so keep module size and synchronous work bounded.

#### `WebAssembly.Module.imports(module)`

Returns `{ module, name, kind }[]` in declaration order to inspect required imports.

#### `WebAssembly.Module.exports(module)`

Returns `{ name, kind }[]` in declaration order to inspect available exports without executing the module.

#### `WebAssembly.Module.customSections(module, name)`

Returns `ArrayBuffer[]` copies of matching custom sections. Modifying a copy does not change the module.

### `WebAssembly.Instance`

#### `new WebAssembly.Instance(module, imports?)`

Synchronously links a module and executes its start function. Incompatible imports throw `LinkError`; Wasm traps throw `RuntimeError`. Values thrown by imported JavaScript functions propagate unchanged.

#### `exports`

Read-only, identity-stable, frozen export object with a `null` prototype. Contains functions, Memory, Table, or Global objects. Duplicate exports and forwarding between instances preserve resource identity.

### `WebAssembly.Memory`

#### `new WebAssembly.Memory(descriptor)`

Creates non-shared memory. `descriptor.initial` is the initial page count and `maximum` is an optional limit. A page is 64 KiB. `shared: true` is unsupported.

#### `buffer`

Read-only current `ArrayBuffer` with stable identity until growth. Reacquire the buffer and any views after growth.

#### `grow(delta)`

Synchronously grows by `delta` pages, returns the previous page count, and detaches the old buffer. Growth failure throws `RangeError`.

### `WebAssembly.Table`

#### `new WebAssembly.Table(descriptor, value?)`

`descriptor.element` is `anyfunc` or `externref`; `initial` is the initial entry count and `maximum` is an optional limit. `value` supplies the initial entry value.

#### `length`

Read-only current entry count, updated after growth.

#### `get(index)`

Returns the specified entry. The index must be within table bounds.

#### `set(index, value?)`

Updates an entry with a value matching the table's element type. Out-of-range indices or incompatible types throw.

#### `grow(delta, value?)`

Adds `delta` entries initialized with the supplied value and returns the previous count. Growth failure throws `RangeError`.

### `WebAssembly.Global`

#### `new WebAssembly.Global(descriptor, initialValue?)`

`descriptor.value` supports `i32`, `i64`, `f32`, `f64`, `anyfunc`, and `externref`. `mutable` defaults to `false`. `i64` uses BigInt.

#### `value`

Reads the current value. Only mutable Globals allow assignment; assigning an immutable Global throws `TypeError`.

#### `valueOf()`

Returns the current Global value, equivalent to reading `value`.

### Error Types

#### `WebAssembly.CompileError`

Compilation failure type extending `Error`, useful for identifying invalid modules.

#### `WebAssembly.LinkError`

Linking failure type extending `Error`, including missing or incompatible imports.

#### `WebAssembly.RuntimeError`

Wasm trap type extending `Error`. Does not wrap values originally thrown by JavaScript imports.
