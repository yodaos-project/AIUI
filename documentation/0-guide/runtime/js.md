# JavaScript 兼容性

AIUI 运行时使用 QuickJS JavaScript 引擎。

QuickJS 是一个轻量级且完全支持 ES2023 规范的 JavaScript 引擎。了解它的特性和限制，有助于编写更健壮的智能体代码。

## 支持的 ECMAScript 特性

QuickJS 提供了非常现代的 JavaScript 语法支持，你可以在智能体开发中安全地使用以下特性：

### 1. 异步编程 (Async / Await)
原生支持 `Promise` 和 `async/await`，无需引入 Polyfill。

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

### 2. 现代数据结构
全面支持 `Map`、`Set`、`WeakMap` 和 `WeakSet`，以及最新的数组/对象方法。

```javascript
const agentState = new Map();
agentState.set('status', 'active');

// 可选链 (Optional Chaining) 与 空值合并 (Nullish Coalescing)
const userName = user?.profile?.name ?? 'Guest';
```

### 3. ES Modules
支持标准的 `import` 和 `export` 模块化语法。

```javascript
import { formatTime } from '../../utils/util.js';
export const config = { timeout: 5000 };
```

### 4. BigInt
原生支持大整数运算，这在处理高精度时间戳或硬件标识符时非常有用。

```javascript
const timestamp = 9007199254740991n;
```

## 同步执行预算

从 AIUI 0.20 起，每个实例默认具有 2,000 ms 的同步 JavaScript 执行预算。超过预算会中断脚本运行环境并请求销毁实例；不要依赖超时后继续执行清理逻辑。异步等待在 JavaScript 交还控制权后不计入预算；单纯把计算放入 `async` 函数不会自动让出控制权。

拆分长计算，在批次之间通过计时器让出事件循环；不要使用忙等循环，也不要把 `await Promise.resolve()` 当作可靠的事件循环让出方式。

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

批次大小应根据单项耗时调整，确保每批同步执行都足够短。部署环境可设置不同预算；应用不能在运行中修改此策略。

## WebAssembly 计算模块

可通过 `WebAssembly` 运行计算模块并绑定 JavaScript 导入。同步构造器和导出函数调用仍应避免长时间阻塞。支持范围、资源配额及 Module 复用方式见 [WebAssembly](/AIUI/api/webassembly)。
