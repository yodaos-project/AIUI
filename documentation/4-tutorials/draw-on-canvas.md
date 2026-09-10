# 在 Canvas 上绘图

为 `<canvas>` 设置稳定 ID，然后从 Page 获取组件和 2D 上下文。绘制操作应在组件已经挂载后执行。

## 完成示例

<!-- aiui-tutorial-step -->

为 `<canvas>` 设置稳定 ID，然后从 Page 获取组件和 2D 上下文。绘制操作应在组件已经挂载后执行。

```javascript
const canvas = this.selectComponent('#myCanvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#07c160';
ctx.fillRect(16, 16, 120, 64);

ctx.fillStyle = '#ffffff';
ctx.fillText('AIUI', 48, 52);
```

<!-- /aiui-tutorial-step -->

路径、文本和图像绘制参见 [Canvas](/AIUI/api/canvas)。

