# JavaScript

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

## 加速重复计算

当智能体需要反复处理一批采样数据或每帧绘制大量图形时，可以用 Offload 加速符合条件的 TypeScript 循环。类方法可以加 `@offload` 注解，独立函数可以用 `offload(function …)` 包装。两种写法都从 `ink:compiler` 导入 `offload`，标记后的函数仍是同步调用。

将 `.ts` 文件或 `<script setup lang="ts">` 源码直接交给 AIUI 运行时，让它在处理 TypeScript 时识别标记。

### 用 `@offload` 汇总超过阈值的采样值

在 `utils/sample-stats.ts` 中给公开类方法加 `@offload`。例如，如果每秒记录一次接收的字节数，可以把采样数组和阈值传给静态方法，汇总高流量时段的字节数。

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

`@offload` 可以标记公开的实例方法或静态方法。使用固定的方法名，并将 `@offload` 作为该方法唯一的装饰器。

### 用 `offload()` 查找第一个越界采样

如果采样超过上限就要提示用户，可以扫描一批读数，找到第一个越界位置后立即返回。把 `function` 表达式直接写在 `offload()` 内，返回值就是可直接调用的函数。

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

下标从 `0` 开始，没有越界值时返回 `-1`。`offload()` 要求内联的 `function` 表达式，传入已有函数或箭头函数会导致编译错误。

### 批量缩放波形采样

在绘制音频波形前，可以将一批浮点采样乘以显示比例，把结果写入可复用的输出数组。调用方负责提供长度足够的数组。

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

### 批量绘制 Canvas 柱状图

每次刷新柱状图时，可以把绘图上下文和柱高数组一起传给带注解的实例方法。下例在离屏画布上绘制三根柱子，每根柱子的底边都位于 `y = 80`。

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

画到页面的 `<canvas>` 时，在组件挂载后获取 2D 上下文，将它传给 `draw()`，绘制完再调用 `ctx.flush()`。Canvas 加速取决于具体操作及其参数，示例使用 `fillRect()` 批量画矩形。页面画布和离屏画布的用法见 [Canvas](/AIUI/api/canvas)。

### 验证调用能否加速

默认模式 `auto` 会在无法加速时执行原函数。需要验证实际输入能否加速时，使用 `@offload({ mode: 'require' })`，或将 `{ mode: 'require' }` 作为 `offload()` 的第二个参数。`require` 模式下，函数体不受支持会报编译错误，具体调用无法加速会抛出 `OffloadUnsupportedError`。

将数据和绘图上下文作为参数传入，在函数内使用局部变量和普通 `for` 循环。读取 `this`、引用外层变量或调用自定义辅助函数都会使函数体无法加速。数值循环可以使用普通的 `Float32Array` 和 `Float64Array`，数值计算也可以在 Agent Worker 中使用。请在目标设备上用实际数据量测量耗时，短小的任务可能直接用 JavaScript 更快。仍需在开发时进行类型检查，并留意下方的同步执行限制。

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
