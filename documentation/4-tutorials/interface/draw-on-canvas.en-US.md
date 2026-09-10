# Draw on Canvas

Give the `<canvas>` a stable ID, then obtain the component and its 2D context from the Page. Draw only after the component has mounted.

## Complete the Example

<!-- aiui-tutorial-step -->

Give the `<canvas>` a stable ID, then obtain the component and its 2D context from the Page. Draw only after the component has mounted.

```javascript
const canvas = this.selectComponent('#myCanvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#07c160';
ctx.fillRect(16, 16, 120, 64);

ctx.fillStyle = '#ffffff';
ctx.fillText('AIUI', 48, 52);
```

<!-- /aiui-tutorial-step -->

See [Canvas](/AIUI/api/canvas) for paths, text, and image drawing.

