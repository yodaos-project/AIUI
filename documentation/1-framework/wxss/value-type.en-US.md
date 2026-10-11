# Value Types

When assigning values to properties in WXSS, you can use multiple CSS data types. Understanding these value types helps you control styles more flexibly.

The following are common data types in WXSS and their code examples:

## 1. Length

In addition to standard web length units, WXSS also provides a responsive length unit:

- **`rpx` (responsive pixel)**: Adapts automatically based on screen width. The screen width is defined as `480rpx`.
- **`px`**: Pixels, a fixed length.
- **`vh` / `vw`**: A percentage of the viewport height or width.

```css
.box {
  width: 240rpx; /* 屏幕宽度的一半 */
  height: 50vh;  /* 视口高度的一半 */
  margin-top: 10px; /* 固定像素 */
}
```

## 2. Color

All standard CSS color definition formats are supported.

```css
.text {
  color: #40FF5E;             /* 十六进制 */
  background: rgba(0, 0, 0, 0.5); /* RGBA 半透明 */
  border-color: hsl(120, 100%, 50%); /* HSL */
  outline-color: currentcolor; /* 继承当前文字颜色 */
}
```

## 3. String

Wrapped in single or double quotes, primarily used for the `content` property.

```css
.badge::before {
  content: "★";
  color: gold;
}

.user-name::after {
  content: ' (Admin)';
}
```

## 4. Keyword

Special predefined words for properties.

```css
.container {
  display: flex;
  width: auto;
  overflow: hidden;
  pointer-events: none;
}
```

## 5. Number

A pure number without a unit, used for ratios or opacity.

```css
.item {
  flex: 1;          /* 比例 */
  line-height: 1.6; /* 行高倍数 */
  opacity: 0.85;    /* 透明度 */
  z-index: 999;     /* 层级 */
}
```

## 6. Functional

A value generated dynamically through a function.

```css
.dynamic-box {
  width: calc(100vw - 40rpx); /* 计算 */
  background: linear-gradient(to right, red, blue); /* 渐变 */
}
```

---

*For more details about value types, see [MDN CSS data types](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Types).*

See [`random()` functions](/AIUI/framework/wxss-function) for supported random numbers, lengths, times, and percentages. `calc()` operands should be compatible lengths or two percentages; do not mix percentages and lengths in ordinary size or spacing declarations.
