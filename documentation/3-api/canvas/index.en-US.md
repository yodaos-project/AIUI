# Canvas

AIUI provides Canvas 2D drawing interfaces that follow Web standards. For a page `<canvas>`, obtain the drawing context with `wx.createCanvasContext('myCanvas')` after the component has mounted, then call `ctx.flush()` after drawing. Pass the element ID without a `#` prefix.

The page drawing examples below use this component:

```xml
<canvas id="myCanvas" width="400" height="300"></canvas>
```

## Draw Basic Shapes

```javascript
const ctx = wx.createCanvasContext('myCanvas');

// 绘制红色矩形
ctx.fillStyle = 'red';
ctx.fillRect(10, 10, 100, 100);

// 绘制蓝色描边圆形
ctx.beginPath();
ctx.arc(200, 60, 50, 0, Math.PI * 2);
ctx.strokeStyle = 'blue';
ctx.lineWidth = 5;
ctx.stroke();

// 绘制绿色半透明椭圆
ctx.beginPath();
ctx.ellipse(350, 60, 50, 30, Math.PI / 4, 0, Math.PI * 2);
ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
ctx.fill();

ctx.flush();
```

## Use Gradients

```javascript
const ctx = wx.createCanvasContext('myCanvas');

// 创建线性渐变
const gradient = ctx.createLinearGradient(0, 0, 300, 0);
gradient.addColorStop(0, 'red');
gradient.addColorStop(0.5, 'yellow');
gradient.addColorStop(1, 'green');

ctx.fillStyle = gradient;
ctx.fillRect(10, 150, 300, 50);

ctx.flush();
```

## Draw Text

```javascript
const ctx = wx.createCanvasContext('myCanvas');

ctx.font = '30px sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';

ctx.fillStyle = '#333';
ctx.fillText('Hello AIUI Canvas', 200, 250);

ctx.strokeStyle = '#40FF5E';
ctx.strokeText('Hello AIUI Canvas', 200, 250);

ctx.flush();
```

## Image Transformations and Saved State

```javascript
const ctx = wx.createCanvasContext('myCanvas');

ctx.save(); // 保存当前状态

ctx.translate(100, 100); // 平移
ctx.rotate(Math.PI / 4); // 旋转 45 度
ctx.scale(1.5, 1.5);    // 缩放

ctx.fillStyle = 'orange';
ctx.fillRect(-25, -25, 50, 50);

ctx.restore(); // 恢复到平移/旋转/缩放之前的状态

ctx.flush();
```

## Draw a Rounded Path and Test a Point

```javascript
const ctx = wx.createCanvasContext('myCanvas');

ctx.beginPath();
ctx.roundRect(20, 20, 180, 80, 12);
ctx.fill();

console.log(ctx.isPointInPath(40, 40));

ctx.flush();
```

To reuse a path, create a `Path2D` and pass it to `fill()`, `stroke()`, `clip()`, `isPointInPath()`, or `isPointInStroke()`.

## Export a Canvas Image

Use `new Canvas(width, height)` to create an offscreen canvas and obtain its context with `getContext('2d')`.

```javascript
const canvas = new Canvas(320, 200);
const ctx = canvas.getContext('2d');
ctx.fillStyle = '#40FF5E';
ctx.fillRect(0, 0, canvas.width, canvas.height);

const blob = await canvas.convertToBlob({
  type: 'image/jpeg',
  quality: 0.9,
});
console.log(blob.type, blob.size);
```

`convertToBlob()` captures the current Canvas output and encodes it asynchronously.
An omitted or unsupported `type` falls back to `image/png`; JPEG composites
transparent pixels over black, while PNG preserves the alpha channel.

## API Reference

### Page Canvas

#### `wx.createCanvasContext(canvasId: string)`

Returns the `CanvasRenderingContext2D` of a mounted page `<canvas>`. `canvasId` is the element ID without a `#` prefix. Returns `null` if no matching canvas is available.

### Submit Page Drawing

#### `ctx.flush()`

Submits pending drawing operations. Call it after a batch of drawing operations on a context obtained through `wx.createCanvasContext()`:

```javascript
const ctx = wx.createCanvasContext('myCanvas');
ctx.fillRect(10, 10, 100, 50);
ctx.flush();
```

### Interface Description

#### CanvasRenderingContext2D

This is the primary drawing context interface, providing a rich set of properties and methods for drawing 2D graphics.

#### Properties

| Property | Type | Description | Optional Values |
| :--- | :--- | :--- | :--- |
| `fillStyle` | String / Object | Fill color, gradient, or pattern | Color string, `CanvasGradient`, `CanvasPattern` |
| `strokeStyle` | String / Object | Stroke color, gradient, or pattern | Color string, `CanvasGradient`, `CanvasPattern` |
| `lineWidth` | Number | Line width | |
| `lineCap` | String | Line ending style | `butt`, `round`, `square` |
| `lineJoin` | String | Line join style | `miter`, `round`, `bevel` |
| `lineDashOffset` | Number | Dash offset | |
| `shadowBlur` | Number | Shadow blur level | |
| `shadowColor` | String | Shadow color | |
| `shadowOffsetX` | Number | Horizontal shadow offset | |
| `shadowOffsetY` | Number | Vertical shadow offset | |
| `globalAlpha` | Number | Global opacity (`0.0 ~ 1.0`) | |
| `globalCompositeOperation` | String | Composite operation mode | `source-over`, `copy`, `lighter`, `multiply` etc. |
| `font` | String | Current font setting | For example: `"20px sans-serif"` |
| `textAlign` | String | Text alignment | `left`, `center`, `right`, `start`, `end` |
| `textBaseline` | String | Text baseline | `top`, `middle`, `bottom`, `alphabetic` etc. |
| `letterSpacing` / `wordSpacing` | String | Character and word spacing | For example, `"2px"` |
| `direction` | String | Text direction | `ltr`, `rtl`, `inherit` |
| `filter` | String | Drawing filter | A CSS filter string |
| `imageSmoothingEnabled` | Boolean | Whether scaled images are smoothed | |
| `imageSmoothingQuality` | String | Image smoothing quality | `low`, `medium`, `high` |

#### Drawing Methods

- **`fillRect(x, y, width, height)`**: Draws a filled rectangle.
- **`strokeRect(x, y, width, height)`**: Draws a rectangle outline.
- **`clearRect(x, y, width, height)`**: Clears the specified rectangular area.
- **`fillText(text, x, y, maxWidth?)`**: Draws filled text.
- **`strokeText(text, x, y, maxWidth?)`**: Draws a text outline.
- **`measureText(text)`**: Returns `TextMetrics` containing width, bounds, ascent, descent, and baseline information.

#### Path Methods

- **`beginPath()`**: Starts a new path.
- **`closePath()`**: Closes the current path.
- **`moveTo(x, y)`**: Moves the starting point of the path.
- **`lineTo(x, y)`**: Draws a straight line to the specified point.
- **`arc(x, y, r, sAngle, eAngle, anticlockwise?)`**: Draws an arc.
- **`arcTo(x1, y1, x2, y2, r)`**: Draws a tangent arc.
- **`rect(x, y, width, height)`**: Draws a rectangular path.
- **`roundRect(x, y, width, height, radii?)`**: Draws a rounded rectangular path.
- **`ellipse(x, y, rx, ry, rotation, sAngle, eAngle, anticlockwise?)`**: Draws an ellipse.
- **`bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)`**: Draws a cubic Bezier curve.
- **`quadraticCurveTo(cpx, cpy, x, y)`**: Draws a quadratic Bezier curve.
- **`fill()`**: Fills the current path.
- **`stroke()`**: Strokes the current path.
- **`clip()`**: Clips to the current path area.
- **`isPointInPath(path?, x, y, fillRule?)`**: Tests whether a point is inside a path.
- **`isPointInStroke(path?, x, y)`**: Tests whether a point is on a stroked path.

#### State and Transformations

- **`save()`**: Saves the current drawing state.
- **`restore()`**: Restores a previously saved drawing state.
- **`translate(dx, dy)`**: Translates the coordinate system.
- **`rotate(angle)`**: Rotates the coordinate system in radians.
- **`scale(sx, sy)`**: Scales the coordinate system.
- **`transform(...)` / `setTransform(...)`**: Multiplies or sets the transformation matrix.
- **`getTransform()` / `resetTransform()`**: Reads or resets the transformation matrix.
- **`reset()`**: Restores the initial state and clears the canvas.
- **`getContextAttributes()` / `isContextLost()`**: Inspects context settings or status.

#### Images and Pixels

- **`drawImage(image, ...args)`**: Draws an image or another canvas. Supports 3, 5, or 9 parameters.
- **`createImageData(w, h)`**: Creates a new blank `ImageData`.
- **`getImageData(x, y, w, h)`**: Gets pixel data for the specified area.
- **`putImageData(data, x, y)`**: Puts pixel data back onto the canvas.

#### Canvas

- **`convertToBlob(options?)`**: Captures a stable Canvas snapshot and asynchronously
  encodes it as a `Blob`. `options.type` defaults to `image/png`; `image/jpeg` selects
  JPEG. `options.quality` applies only to JPEG and accepts 0 through 1; missing,
  non-finite, or out-of-range values use the encoder default.

#### Gradients and Patterns

- **`createLinearGradient(x0, y0, x1, y1)`**: Creates a linear gradient.
- **`createRadialGradient(x0, y0, r0, x1, y1, r1)`**: Creates a radial gradient.
- **`createConicGradient(startAngle, x, y)`**: Creates a conic gradient.
- **`createPattern(image, repetition)`**: Creates a pattern fill.

#### ImageData

An object used to store canvas pixel data.

- **`width`**: Image width.
- **`height`**: Image height.
- **`data`**: Pixel data of type `Uint8ClampedArray` (RGBA).

#### CanvasGradient

An object representing a gradient.

- **`addColorStop(offset, color)`**: Adds a color stop to the gradient (`0.0 ~ 1.0`).

#### CanvasPattern

An object representing a repeating pattern.

- **`setTransform(matrix)`**: Sets the transformation matrix for the pattern.

#### Path2D

`new Path2D(path?)` creates an empty path, copies an existing path, or parses an SVG path string. It supports the common path methods and `addPath(path, transform?)`.
