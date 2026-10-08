# 画布 (Canvas)

AIUI 提供了一套遵循 Web 标准的 Canvas 2D 绘图接口。绘制页面中的 `<canvas>` 时，在组件挂载后通过 `wx.createCanvasContext('myCanvas')` 获取绘图上下文，绘制后调用 `ctx.flush()` 提交。参数是元素 ID，不带 `#` 前缀。

下方页面绘图示例使用以下组件：

```xml
<canvas id="myCanvas" width="400" height="300"></canvas>
```

## 绘制基本图形

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

## 使用渐变

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

## 绘制文本

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

## 图像变换与保存状态

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

## 绘制圆角路径并检查位置

```javascript
const ctx = wx.createCanvasContext('myCanvas');

ctx.beginPath();
ctx.roundRect(20, 20, 180, 80, 12);
ctx.fill();

console.log(ctx.isPointInPath(40, 40));

ctx.flush();
```

需要复用路径时，可以创建 `Path2D`，再传给 `fill()`、`stroke()`、`clip()`、`isPointInPath()` 或 `isPointInStroke()`。

## 导出 Canvas 图像

使用 `new Canvas(width, height)` 创建离屏画布，再通过 `getContext('2d')` 获取上下文。

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

`convertToBlob()` 会捕获 Canvas 当前绘制结果并异步编码。未指定或不支持的
`type` 会回落为 `image/png`；JPEG 会把透明像素合成到黑色背景，PNG 会保留
alpha 通道。

## API Reference

### 页面画布

#### `wx.createCanvasContext(canvasId: string)`

返回已挂载的页面 `<canvas>` 的 `CanvasRenderingContext2D`。`canvasId` 是元素 ID，不带 `#` 前缀。找不到对应画布时返回 `null`。

### 提交页面绘图

#### `ctx.flush()`

提交待处理的绘制操作。通过 `wx.createCanvasContext()` 获取上下文后，在一批绘制操作结束时调用：

```javascript
const ctx = wx.createCanvasContext('myCanvas');
ctx.fillRect(10, 10, 100, 50);
ctx.flush();
```

### 接口说明

#### CanvasRenderingContext2D

这是主要的绘图上下文接口，提供了丰富的属性和方法来绘制 2D 图形。

#### 属性

| 属性 | 类型 | 描述 | 可选值 |
| :--- | :--- | :--- | :--- |
| `fillStyle` | String / Object | 填充颜色、渐变或图案 | 颜色字符串, `CanvasGradient`, `CanvasPattern` |
| `strokeStyle` | String / Object | 描边颜色、渐变或图案 | 颜色字符串, `CanvasGradient`, `CanvasPattern` |
| `lineWidth` | Number | 线条宽度 | |
| `lineCap` | String | 线条末端样式 | `butt`, `round`, `square` |
| `lineJoin` | String | 线条连接样式 | `miter`, `round`, `bevel` |
| `lineDashOffset` | Number | 虚线偏移量 | |
| `shadowBlur` | Number | 阴影模糊级数 | |
| `shadowColor` | String | 阴影颜色 | |
| `shadowOffsetX` | Number | 阴影水平偏移 | |
| `shadowOffsetY` | Number | 阴影垂直偏移 | |
| `globalAlpha` | Number | 全局透明度 (0.0 ~ 1.0) | |
| `globalCompositeOperation` | String | 混合操作模式 | `source-over`, `copy`, `lighter`, `multiply` 等 |
| `font` | String | 当前字体设置 | 例如: `"20px sans-serif"` |
| `textAlign` | String | 文本对齐方式 | `left`, `center`, `right`, `start`, `end` |
| `textBaseline` | String | 文本基线 | `top`, `middle`, `bottom`, `alphabetic` 等 |
| `letterSpacing` / `wordSpacing` | String | 字符和单词间距 | 例如 `"2px"` |
| `direction` | String | 文字方向 | `ltr`, `rtl`, `inherit` |
| `filter` | String | 绘图滤镜 | CSS filter 字符串 |
| `imageSmoothingEnabled` | Boolean | 是否平滑缩放图像 | |
| `imageSmoothingQuality` | String | 图像平滑质量 | `low`, `medium`, `high` |

#### 绘制方法

- **`fillRect(x, y, width, height)`**: 绘制填充矩形。
- **`strokeRect(x, y, width, height)`**: 绘制矩形边框。
- **`clearRect(x, y, width, height)`**: 清除指定矩形区域。
- **`fillText(text, x, y, maxWidth?)`**: 绘制填充文本。
- **`strokeText(text, x, y, maxWidth?)`**: 绘制文本边框。
- **`measureText(text)`**: 返回包含宽度、边界、上升高度、下降高度和基线信息的 `TextMetrics`。

#### 路径方法

- **`beginPath()`**: 开始新路径。
- **`closePath()`**: 关闭当前路径。
- **`moveTo(x, y)`**: 移动路径起点。
- **`lineTo(x, y)`**: 绘制直线到指定点。
- **`arc(x, y, r, sAngle, eAngle, anticlockwise?)`**: 绘制圆弧。
- **`arcTo(x1, y1, x2, y2, r)`**: 绘制切线圆弧。
- **`rect(x, y, width, height)`**: 绘制矩形路径。
- **`roundRect(x, y, width, height, radii?)`**: 绘制圆角矩形路径。
- **`ellipse(x, y, rx, ry, rotation, sAngle, eAngle, anticlockwise?)`**: 绘制椭圆。
- **`bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y)`**: 绘制三次贝塞尔曲线。
- **`quadraticCurveTo(cpx, cpy, x, y)`**: 绘制二次贝塞尔曲线。
- **`fill()`**: 填充当前路径。
- **`stroke()`**: 描边当前路径。
- **`clip()`**: 裁剪当前路径区域。
- **`isPointInPath(path?, x, y, fillRule?)`**: 判断坐标是否位于路径内。
- **`isPointInStroke(path?, x, y)`**: 判断坐标是否位于描边路径上。

#### 状态与变换

- **`save()`**: 保存当前绘图状态。
- **`restore()`**: 恢复之前保存的绘图状态。
- **`translate(dx, dy)`**: 平移坐标系。
- **`rotate(angle)`**: 旋转坐标系（弧度）。
- **`scale(sx, sy)`**: 缩放坐标系。
- **`transform(...)` / `setTransform(...)`**: 叠加或设置变换矩阵。
- **`getTransform()` / `resetTransform()`**: 读取或重置变换矩阵。
- **`reset()`**: 恢复初始状态并清空画布。
- **`getContextAttributes()` / `isContextLost()`**: 查看上下文设置或状态。

#### 图像与像素

- **`drawImage(image, ...args)`**: 绘制图像或另一个 Canvas。支持 3, 5, 或 9 个参数。
- **`createImageData(w, h)`**: 创建新的空白 ImageData。
- **`getImageData(x, y, w, h)`**: 获取指定区域的像素数据。
- **`putImageData(data, x, y)`**: 将像素数据放回画布。

#### Canvas

- **`convertToBlob(options?)`**: 捕获 Canvas 的稳定快照并异步编码为 `Blob`。
  `options.type` 默认为 `image/png`，`image/jpeg` 选择 JPEG；`options.quality`
  仅用于 JPEG，取值为 0 至 1，缺失、非有限或越界值使用编码器默认值。

#### 渐变与模式

- **`createLinearGradient(x0, y0, x1, y1)`**: 创建线性渐变。
- **`createRadialGradient(x0, y0, r0, x1, y1, r1)`**: 创建径向渐变。
- **`createConicGradient(startAngle, x, y)`**: 创建锥形渐变。
- **`createPattern(image, repetition)`**: 创建图案填充。

#### ImageData

用于存储 Canvas 像素数据的对象。

- **`width`**: 图像宽度。
- **`height`**: 图像高度。
- **`data`**: `Uint8ClampedArray` 类型的像素数据（RGBA）。

#### CanvasGradient

表示渐变的对象。

- **`addColorStop(offset, color)`**: 向渐变添加颜色停止点（0.0 ~ 1.0）。

#### CanvasPattern

表示重复图案的对象。

- **`setTransform(matrix)`**: 设置图案的变换矩阵。

#### Path2D

`new Path2D(path?)` 可以创建空路径、复制现有路径或解析 SVG path 字符串。支持常用路径方法和 `addPath(path, transform?)`。
