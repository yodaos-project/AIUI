# Draw on Canvas

Give the `<canvas>` a stable ID, then obtain its 2D context with `wx.createCanvasContext('myCanvas')` after the component has mounted. Pass the ID without a `#` prefix and call `ctx.flush()` after drawing.

## Complete the Example

```xml
<canvas id="myCanvas" width="300" height="150"></canvas>
```

<!-- aiui-tutorial-step -->

Give the `<canvas>` a stable ID, then obtain its 2D context with `wx.createCanvasContext('myCanvas')` after the component has mounted. Pass the ID without a `#` prefix and call `ctx.flush()` after drawing.

```javascript
const ctx = wx.createCanvasContext('myCanvas');

ctx.fillStyle = '#07c160';
ctx.fillRect(16, 16, 120, 64);

ctx.fillStyle = '#ffffff';
ctx.fillText('AIUI', 48, 52);

ctx.flush();
```

<!-- /aiui-tutorial-step -->

See [Canvas](/AIUI/api/canvas) for paths, text, and image drawing.

