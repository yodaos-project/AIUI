# Canvas 画布

`canvas` 组件提供了一个 2D 绘图上下文，类似于 HTML5 中的 `<canvas>` 元素。它允许通过脚本动态渲染 2D 形状和位图图像。

## 使用方法

```xml
<canvas id="myCanvas" width="300" height="150"></canvas>
```

在组件挂载后，在 JavaScript 中绘制：

```javascript
// 通过元素 ID 获取 2D 绘图上下文（不带 '#'）
const ctx = wx.createCanvasContext('myCanvas');

ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 150, 75);

ctx.flush();
```

## 属性

| 属性 | 类型 | 描述 | 默认值 |
|-----------|------|-------------|---------|
| `width` | Number | 画布的像素宽度。 | `300` |
| `height` | Number | 画布的像素高度。 | `150` |

## API

使用 `wx.createCanvasContext(canvasId)` 获取页面画布的 2D 绘图上下文。参数是元素 ID，不带 `#` 前缀；找不到对应画布时返回 `null`。通过 Canvas 2D API 绘制后，调用 `ctx.flush()` 提交绘制操作。

详细的 API 列表请参考 [Canvas API 规范](/AIUI/api/canvas)。
