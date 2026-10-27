# 模块

AIUI 支持基于 ES Modules 的模块组织方式，可用于拆分业务逻辑、复用工具函数以及管理静态资源导入。

除了普通的 JavaScript 模块外，AIUI 也支持直接导入 `.ts` 文件。运行时会在模块执行前移除 TypeScript 语法，但当前不会进行类型检查，且不支持 TSX。

## 导出与导入

模块可以使用标准 ES Module 语法导出函数、对象或变量：

```javascript
// utils.js
export const formatTime = date => {
  return date.toISOString();
};

export default {
  sayHello: () => console.log('Hello')
};
```

然后在页面或组件中导入并使用：

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

如果使用 TypeScript，也可以直接导入 `.ts` 模块；省略扩展名时会优先尝试 `.js`，再尝试 `.ts`。

## 使用 TypeScript

AIUI 运行时会在模块执行前移除 TypeScript 类型语法，因此可以直接编写和导入 `.ts` 文件。但类型检查、编辑器补全和全局 API 提示仍然需要在项目中自行配置 TypeScript 环境。

首先安装 TypeScript 和 AIUI 的类型定义包：

```bash
npm install -D typescript @yodaos-pkg/ink-env
```

然后在项目根目录创建一个最小的 `tsconfig.json`：

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

其中 `types` 字段用于显式引入 `@yodaos-pkg/ink-env` 提供的基础类型定义，这样编辑器和 `tsc` 才能识别 `PageInstance`、`ComponentInstance`、`wx` 等运行时 API。

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

如果你只希望把这些类型暴露给当前项目，也可以把 `@yodaos-pkg/ink-env` 加到某个单独的 `tsconfig` 配置中，而不是全局安装到编辑器默认环境里。

## 使用 WebAssembly

`.wasm` 文件会被当作资源模块处理，默认导出为 `Blob`。通常可以先用 Rust 等标准 WebAssembly 工具链把源码编译成 `.wasm`，再像导入其他资源一样在 AIUI 模块中导入它。

下面是一个最小的 Rust 示例。先创建一个库工程，并添加 WebAssembly 编译目标：

```bash
cargo new --lib math-wasm
rustup target add wasm32-unknown-unknown
```

然后把 `src/lib.rs` 改成：

```rust
#[unsafe(no_mangle)]
pub extern "C" fn add(left: i32, right: i32) -> i32 {
    left + right
}
```

使用 Rust 编译出 `.wasm` 文件：

```bash
cargo build --target wasm32-unknown-unknown --release
```

编译完成后，可以将产物复制到项目资源目录，例如：

```bash
cp target/wasm32-unknown-unknown/release/math_wasm.wasm ../aiui-app/assets/math.wasm
```

然后在 AIUI 模块中导入并实例化：

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

如果你的 Rust crate 导出了多个函数或内存对象，只要最终产出的是标准 `.wasm` 文件，就可以按相同方式在 AIUI 中导入和实例化。

## 资源模块

AIUI 也支持通过 ESM 方式导入图片、音频和 WebAssembly 等静态资源。默认情况下，这些资源会以 `Blob` 形式作为默认导出。

```javascript
import icon, { mimeType, path } from '../assets/icon.png';

console.log(icon instanceof Blob);
console.log(mimeType);
console.log(path);
```

当前默认支持的资源类型包括：

- 图片：`.png`、`.jpg`、`.jpeg`、`.webp`、`.svg`、`.gif`、`.bmp`
- 音频：`.wav`、`.mp3`、`.ogg`、`.m4a`、`.aac`、`.flac`、`.pcm`
- WebAssembly：`.wasm`

除默认导出外，资源模块还会额外提供 `mimeType` 和 `path` 两个命名导出。

## 类型化资源导入

在需要显式指定资源类型时，可以通过 import attributes 获取更具体的运行时对象：

```javascript
import icon from '../assets/icon.png' with { type: 'image' };
import click from '../assets/click.wav' with { type: 'sound' };

console.log(icon instanceof ImageData);
console.log(click instanceof Sound);
```

其中：

- `type: 'image'` 仅适用于图片资源，默认导出为 `ImageData`
- `type: 'sound'` 仅适用于音频资源，默认导出为 `Sound`
- 不支持的类型或不匹配的资源类型会导致模块加载失败

## 补充说明

- 模块能力适用于页面、组件及其他可复用逻辑文件
- 推荐将通用逻辑拆分到独立模块中，避免页面文件过于臃肿
- 如果需要复用组件能力，请优先使用组件；如果只是复用逻辑或资源，优先使用模块

有关组件 `src`、相对路径、包根路径和网络资源的规则，请查看[资源（Assets）](/AIUI/framework/open-agent-format-assets)。

同步构造、JavaScript 导入、Memory/Table/Global、流式响应入口及资源限制见 [WebAssembly](/AIUI/api/webassembly)。复用已编译 Module 时使用 `instantiate(module)`；`validate()` 和 `compile()` 只接收字节输入。
