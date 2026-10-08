# 在 Canvas 上绘图

为 `<canvas>` 设置稳定 ID，然后在组件挂载后通过 `wx.createCanvasContext('myCanvas')` 获取 2D 上下文。参数是 ID，不带 `#` 前缀；绘制后调用 `ctx.flush()` 提交。

## 完成示例

```xml
<canvas id="myCanvas" width="300" height="150"></canvas>
```

<!-- aiui-tutorial-step -->

为 `<canvas>` 设置稳定 ID，然后在组件挂载后通过 `wx.createCanvasContext('myCanvas')` 获取 2D 上下文。参数是 ID，不带 `#` 前缀；绘制后调用 `ctx.flush()` 提交。

```javascript
const ctx = wx.createCanvasContext('myCanvas');

ctx.fillStyle = '#07c160';
ctx.fillRect(16, 16, 120, 64);

ctx.fillStyle = '#ffffff';
ctx.fillText('AIUI', 48, 52);

ctx.flush();
```

<!-- /aiui-tutorial-step -->

路径、文本和图像绘制参见 [Canvas](/AIUI/api/canvas)。

