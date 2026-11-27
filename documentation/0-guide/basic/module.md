# 模块化

AIUI 深度拥抱现代 JavaScript 生态，全面支持 **ES Modules (ESM)** 作为标准的模块化方案。

## 1. ESM 支持情况

AIUI 运行时原生支持 ESM，你可以在智能体（Agent）开发中使用 `import` 和 `export` 关键字。

> [!IMPORTANT]
> `.ink` 文件（单文件组件）可以作为页面或组件入口。要在多个页面或组件中复用代码，可以将它放在独立的 `.js` 或 `.ts` 模块中，通过 `export` 导出，再在入口中通过 `import` 引入。

### 导出模块 (Export)

你可以在任何 `.js` 文件中导出变量、函数或类：

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

### 引入模块 (Import)

使用标准语法引入本地文件或第三方包：

```javascript
// pages/index/index.js
import Calculator, { VERSION, formatTime } from '../../utils.js';

console.log('Current Version:', VERSION);
```

## 2. 动态引入 (Dynamic Import)

AIUI 支持使用 `import()` 进行代码拆分和按需加载，这对于优化大型智能体的启动速度非常有用：

```javascript
async function loadChart() {
  const { Chart } = await import('../../libs/chart.js');
  const chart = new Chart();
  // ...
}
```

## 3. 第三方库使用

在应用根目录安装提供 ESM 入口的 npm 包后，AIUI 会从应用的 `node_modules` 解析包名。假设已安装 [Package 指南](/AIUI/framework/open-agent-format-packages)中的示例包 `@demo/ui`，可以这样导入：

```javascript
import { formatMessage } from '@demo/ui';

console.log(formatMessage('AIUI'));
```

如果包在 `package.json` 的 `exports` 中声明了 `./utils`，也可以通过 `@demo/ui/utils` 导入该子路径。

## 4. 与传统 CommonJS 的区别

与旧的小程序框架不同，AIUI **不支持** `module.exports` 和 `require()`，请统一使用 ESM。

*   **原生性能**：ESM 是由 JS 引擎原生解析的，比 CommonJS 模拟层具有更高的加载性能。
*   **规范统一**：与现代 Web 开发体验完全一致。

## 5. 注意事项

*   **路径后缀**：导入本地 JavaScript 或 TypeScript 模块时，显式写出 `.js` 或 `.ts` 会查找指定文件。省略扩展名时，例如 `import './utils'`，会先查找 `./utils.js`，再查找 `./utils.ts`。
*   **顶级 await**：目前 AIUI **不支持** 顶级 `await` (Top-level await)，请在异步函数中使用 `await`。
