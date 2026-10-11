# 值类型 (Value Types)

在 WXSS 中为属性赋值时，你可以使用多种 CSS 数据类型。掌握这些值类型有助于更灵活地控制样式。

以下是 WXSS 中常用的数据类型及其代码示例：

## 1. 长度 (Length)

除了标准的 Web 长度单位外，WXSS 特别提供了响应式长度单位：

- **`rpx` (responsive pixel)**：根据屏幕宽度自适应。规定屏幕宽为 `480rpx`。
- **`px`**：像素，固定长度。
- **`vh` / `vw`**：视口高度/宽度的百分比。

```css
.box {
  width: 240rpx; /* 屏幕宽度的一半 */
  height: 50vh;  /* 视口高度的一半 */
  margin-top: 10px; /* 固定像素 */
}
```

## 2. 颜色 (Color)

支持所有标准的 CSS 颜色定义方式。

```css
.text {
  color: #40FF5E;             /* 十六进制 */
  background: rgba(0, 0, 0, 0.5); /* RGBA 半透明 */
  border-color: hsl(120, 100%, 50%); /* HSL */
  outline-color: currentcolor; /* 继承当前文字颜色 */
}
```

## 3. 字符串 (String)

由单引号或双引号包裹，主要用于 `content` 属性。

```css
.badge::before {
  content: "★";
  color: gold;
}

.user-name::after {
  content: ' (Admin)';
}
```

## 4. 关键字 (Keyword)

属性预定义的特殊词汇。

```css
.container {
  display: flex;
  width: auto;
  overflow: hidden;
  pointer-events: none;
}
```

## 5. 数字 (Number)

不带单位的纯数字，用于比例或透明度。

```css
.item {
  flex: 1;          /* 比例 */
  line-height: 1.6; /* 行高倍数 */
  opacity: 0.85;    /* 透明度 */
  z-index: 999;     /* 层级 */
}
```

## 6. 函数调用 (Functional)

通过函数动态生成的值。

```css
.dynamic-box {
  width: calc(100vw - 40rpx); /* 计算 */
  background: linear-gradient(to right, red, blue); /* 渐变 */
}
```

---

*更多关于值类型的详细说明，请参考 [MDN CSS 数据类型](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Types)。*

随机数字、长度、时间和百分比的支持范围见[函数 `random()`](/AIUI/framework/wxss-function)。`calc()` 的两个操作数应为可相加减的长度，或两个百分比；不要在普通尺寸与间距中混用百分比和长度。
