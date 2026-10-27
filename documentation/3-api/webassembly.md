# WebAssembly

使用全局 `WebAssembly` 对象加载计算模块、调用导出函数，并把 JavaScript 函数、内存、表和全局变量作为导入资源。原生与 Web 环境提供相同的受支持 API 子集。

## 加载并复用计算模块

下面的完整二进制导出一个 `add` 函数，无需外部资源即可验证实例化：

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

输入字节时返回 `{ module, instance }`；复用 Module 时直接返回 Instance。`i64` 参数和结果使用 BigInt。

## 读取包内或远端模块

假设 `/assets/math.wasm` 已打包且导出 `add`，可以通过 Fetch Response 加载：

```javascript
const response = await fetch('/assets/math.wasm');
const { instance } = await WebAssembly.instantiate(await response.arrayBuffer());
console.log(instance.exports.add(13, 29));
```

远端服务返回成功且 MIME 为 `application/wasm` 的响应时，可使用流式入口：

```javascript
const { instance } = await WebAssembly.instantiateStreaming(
  fetch('https://example.com/math.wasm'),
);
console.log(instance.exports.add(13, 29));
```

流式入口要求 body 未被锁定或消费。当前实现读取完整 body 后编译，不在网络分片到达时增量编译。

`.wasm` 也可作为资源模块导入，默认导出是 `Blob`，可直接传给 `instantiate()`。构建示例见[模块](/AIUI/framework/open-agent-format-module#使用-webassembly)。

## 绑定函数和内存

导入对象按 Wasm 声明的模块名和字段名组织。下面假定 `module` 声明了 `env.memory` 和 `env.log`：

```javascript
const memory = new WebAssembly.Memory({ initial: 1, maximum: 4 });
const imports = { env: { memory, log: (value) => console.log(value) } };
const instance = new WebAssembly.Instance(module, imports);
const view = new Uint8Array(memory.buffer);
view[0] = 42;
```

导入函数同步执行。导入值需与模块声明类型匹配；模块不需要的资源不会自动形成新的导出。

## 兼容性与资源限制

- 输入支持 `ArrayBuffer`、TypedArray、DataView 和扩展的 `Blob`。视图仅使用自身的 `byteOffset` 与 `byteLength`。
- `validate()` 和 `compile()` 只接受字节，不接受已编译 Module；复用请使用 `instantiate(module)`。
- 模块最大 64 MiB；每个 Memory 最大 256 MiB；每个 Table 最大 1,000,000 项。频繁读写大内存并跨 JavaScript/Wasm 调用可能有复制开销。
- 不支持共享内存、线程、SIMD、memory64 和异常处理 proposal，不提供 `Tag` / `Exception`。
- 使用 bare `wasm32-unknown-unknown` 模块；不自动提供 WASI、Emscripten、libc、文件系统或生成的 JS glue 所需服务。

## API Reference

### `WebAssembly`

#### `validate(bytes)`

同步返回 `boolean`。无效二进制返回 `false`；输入类型错误（包括 Module）抛出 `TypeError`，资源超限抛出 `RangeError`。

#### `compile(bytes)`

返回 `Promise<Module>`。字节输入规则与 `validate()` 一致。传入 Module 以 `TypeError` 拒绝，编译失败以 `CompileError` 拒绝。

#### `instantiate(bytesOrModule, imports?)`

输入字节时返回 `Promise<{ module, instance }>`，输入 Module 时返回 `Promise<Instance>`。可选 `imports` 为按模块名分组的资源对象；链接错误以 `LinkError` 拒绝。

#### `compileStreaming(response)`

接收 `Response` 或其 Promise，返回 `Promise<Module>`。要求成功状态、`application/wasm` MIME 和可读取的 body；MIME 不接受附加参数。会消费响应体；状态、MIME 或 body 状态不符合要求时以 `TypeError` 拒绝。

#### `instantiateStreaming(response, imports?)`

接收与 `compileStreaming()` 相同的响应及可选导入对象，返回 `Promise<{ module, instance }>`。

### `WebAssembly.Module`

#### `new WebAssembly.Module(bytes)`

同步编译可复用模块。输入类型、编译及配额错误同步抛出；构造器会阻塞当前脚本，应控制模块大小和每次同步工作的耗时。

#### `WebAssembly.Module.imports(module)`

按声明顺序返回 `{ module, name, kind }[]`，用于检查所需的导入资源。

#### `WebAssembly.Module.exports(module)`

按声明顺序返回 `{ name, kind }[]`，用于检查可用导出，不执行模块。

#### `WebAssembly.Module.customSections(module, name)`

返回同名自定义 section 的 `ArrayBuffer[]` 副本；修改副本不会改变模块。

### `WebAssembly.Instance`

#### `new WebAssembly.Instance(module, imports?)`

同步链接模块并执行 start 函数。链接不匹配抛出 `LinkError`，Wasm trap 抛出 `RuntimeError`；导入的 JavaScript 函数抛出的值原样传播。

#### `exports`

只读、身份稳定、冻结且原型为 `null` 的导出对象，包含函数、Memory、Table 或 Global。重复导出和跨实例转发保留资源身份。

### `WebAssembly.Memory`

#### `new WebAssembly.Memory(descriptor)`

创建非共享内存。`descriptor.initial` 为初始页数，`maximum` 为可选上限，一页是 64 KiB；不支持 `shared: true`。

#### `buffer`

只读的当前 `ArrayBuffer`，增长前重复读取身份稳定。增长后必须重新获取 buffer 和基于它的视图。

#### `grow(delta)`

同步增长 `delta` 页，返回增长前页数，并分离旧 buffer。增长失败抛出 `RangeError`。

### `WebAssembly.Table`

#### `new WebAssembly.Table(descriptor, value?)`

`descriptor.element` 为 `anyfunc` 或 `externref`；`initial` 为初始项数，`maximum` 为可选上限。`value` 指定初始项值。

#### `length`

只读的当前项数，增长后会改变。

#### `get(index)`

返回指定项；索引必须在表范围内。

#### `set(index, value?)`

更新指定项，值必须符合表元素类型；索引越界或类型不匹配会抛错。

#### `grow(delta, value?)`

增加 `delta` 项并返回原项数，新增项使用给定值。增长失败抛出 `RangeError`。

### `WebAssembly.Global`

#### `new WebAssembly.Global(descriptor, initialValue?)`

`descriptor.value` 支持 `i32`、`i64`、`f32`、`f64`、`anyfunc`、`externref`；`mutable` 默认为 `false`。`i64` 使用 BigInt。

#### `value`

读取当前值；只有可变 Global 才允许赋值。修改不可变 Global 抛出 `TypeError`。

#### `valueOf()`

返回当前 Global 值，语义与读取 `value` 一致。

### 错误类型

#### `WebAssembly.CompileError`

编译失败的错误类型，继承 `Error`，可用于区分无效模块。

#### `WebAssembly.LinkError`

导入缺失或类型不匹配等链接失败的错误类型，继承 `Error`。

#### `WebAssembly.RuntimeError`

Wasm trap 的错误类型，继承 `Error`；不会包装 JavaScript 导入函数原本抛出的值。
