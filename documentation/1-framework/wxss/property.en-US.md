# Properties

WXSS supports the common properties below; its scope differs from browser CSS.

## 1. Layout and Positioning

### Flexbox Layout (Recommended)
Flex is the preferred layout method for agent interface development.

```css
.container {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  height: 400rpx;
}

.item {
  flex: 1; /* 自动撑满剩余空间 */
}
```

### Position
Used to precisely control where an element appears on the screen.

```css
.sticky-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}

.absolute-icon {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
}
```

## 2. Box Model

### Size and Spacing
Controls the space occupied by an element.

```css
.box {
  width: 200rpx;
  height: 200rpx;
  margin: 20rpx auto; /* 上下20rpx，左右自动居中 */
  padding: 30rpx;
  box-sizing: border-box; /* 宽度包含 padding 和 border */
}
```

### Borders and Rounded Corners
Controls the border appearance of an element.

```css
.card {
  border: 1px solid #eee;
  border-radius: 12rpx; /* 圆角 */
  background-color: #fff;
}
```

## 3. Typography and Text

### Basic Text Styles

```css
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}
```

### Text Overflow Handling
Used to handle truncation of long text.

```css
.single-line-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 单行超出显示省略号 */
}
```

## 4. Visuals and Decoration

### Shadows and Opacity

```css
.button {
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  opacity: 0.9;
}
```

## 5. Animation and Interaction

### Transition

```css
.btn-hover {
  transition: all 0.3s ease;
}

.btn-hover:active {
  transform: scale(0.95);
}
```

---

*For the complete CSS property dictionary and detailed descriptions, see [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference#properties).*

## Single-line ellipsis and independent borders

```css
.title {
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card {
  border-top: 1px solid #444;
  border-right: 2px dashed #40ff5e;
  padding: calc(12px + 4rpx);
  color: #fff !important;
}
```

`text-overflow: ellipsis` applies to width-constrained single-line text; it does not implement multiline clamping. Each border side supports its own width, style, color, and shorthand. `!important` participates in cascade priority and can prevent keyframe overrides.

Sizes, margin / padding / gap, and insets accept supported `calc()` values. See [Functions](/AIUI/framework/wxss-function) for syntax limits and random values, and [Animations and transforms](/AIUI/framework/wxss-animation) for concurrent animations and events.
