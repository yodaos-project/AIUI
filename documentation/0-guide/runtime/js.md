# JavaScript 兼容性

AIUI 智能体使用 JavaScript 编写交互逻辑。你可以使用 `Promise`、`async/await`、模块等常见的现代 JavaScript 特性；同时，要注意不要让一段同步代码运行太久。

这篇文章先介绍开发时常会用到的语法，再说明需要注意的运行时间限制。

## 常用的 JavaScript 特性

### 异步操作

`Promise` 和 `async/await` 可以帮助你组织需要等待的操作。例如，下面的函数等待一秒后返回提示文字：

```javascript
async function getMessage() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return '准备好了';
}

getMessage().then((message) => console.log(message));
```

实际开发中，你也可以用异步操作等待网络请求等结果。调用具体 API 时，请先查看它的文档：有些 API 使用回调，不能直接当作返回 Promise 的函数使用。

### 数据和常用语法

你可以使用 `Map`、`Set`、`WeakMap`、`WeakSet` 等数据结构，也可以使用可选链 `?.` 和空值合并 `??`：

```javascript
const weather = new Map();
weather.set('city', '杭州');

const user = { profile: { name: '小明' } };
const userName = user?.profile?.name ?? '访客';
```

### 拆分和复用代码

当项目代码变多时，可以通过 `export` 导出功能，再用 `import` 在其他文件中使用。

例如，在 `utils/format.js` 中导出一个函数：

```javascript
export function formatCity(city) {
  return `${city}天气`;
}
```

然后在 `pages/index/index.ink` 的页面逻辑中导入：

```javascript
import { formatCity } from '../../utils/format.js';

console.log(formatCity('杭州')); // 杭州天气
```

### 大整数

需要处理超出普通数字安全整数范围的整数时，可以使用 `BigInt`：

```javascript
const largeNumber = 9007199254740993n;
```

语法支持和 API 支持是两回事：要了解网络、设备等能力是否可用，请查看相应的 API 文档。

## 可以使用 TypeScript 吗？

可以。**TypeScript** 是在 JavaScript 基础上增加类型标注的语言。类型可以帮助编辑器和检查工具发现一些常见错误，比如把文字误传给需要数字的函数。

例如，可以在 `utils/format.ts` 中定义一个接收数字的函数：

```typescript
export function formatTemperature(value: number): string {
  return `${value}°C`;
}
```

然后在页面的 JavaScript 逻辑中导入并使用它：

```javascript
import { formatTemperature } from '../../utils/format.ts';

console.log(formatTemperature(26)); // 26°C
```

这里的导入路径以 `pages/index/index.ink` 为例。AIUI 支持直接导入 `.ts` 模块，会在执行前处理 TypeScript 语法；**运行时不会替你进行类型检查**。如果希望在开发时检查类型或获得编辑器提示，需要在项目中配置 TypeScript 和类型定义。当前不支持 TSX。

安装、配置和更多示例请参阅[模块：使用 TypeScript](/AIUI/framework/open-agent-format-module)。

## 避免长时间执行同步代码

从 AIUI 0.20 起，每个实例默认允许一段同步 JavaScript 连续执行 **2,000 毫秒**。超过限制会中断脚本并请求销毁实例，因此不要依赖超时后继续执行清理逻辑。实际部署环境可以设置不同的限制，应用不能在运行中修改它。

异步等待在 JavaScript 交还控制权后不计入这段时间。但仅仅把大量计算放进 `async` 函数，并不会自动让出控制权。

如果需要处理大量数据，可以拆成小批次，在批次之间用定时器让其他工作有机会运行：

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

每个项目的处理耗时不同，请根据实际情况调整每批数量，保持单批执行时间短。避免使用忙等循环；`await Promise.resolve()` 也不能可靠地让出事件循环。

## 需要运行 WebAssembly？

AIUI 也支持使用 `WebAssembly` 运行计算模块。创建模块和调用导出函数时，同样应避免长时间同步阻塞。支持范围、资源限制和使用方式请参阅 [WebAssembly](/AIUI/api/webassembly)。
