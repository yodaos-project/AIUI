# @规则 (At-rules)

@规则（At-rules）是以 at 符号（`@`）开头的 CSS 语句，用于向样式表传达特殊的指令。

在 WXSS 中，常用的 @规则 及其代码示例包括：

## 1. `@import` (导入)
用于导入外联的 WXSS 样式表。必须位于样式表的最顶部。

```css
/** common.wxss **/
.flex-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

/** index.wxss **/
@import "./common.wxss";

.container {
  height: 100vh;
}
```

## 2. `@media` (媒体查询)
用于根据设备特性（如视口宽度）应用不同的样式。

```css
.sidebar { display: none; }
@media (min-width: 1200px) {
  .sidebar { display: block; }
}
```

## 3. `@keyframes` (动画关键帧)
用于定义 CSS 动画序列。

```css
/* 定义渐显动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-item {
  animation: fadeIn 0.5s ease-out forwards;
}
```

## 4. `@font-face` (自定义字体)
用于加载自定义网络字体。

```css
@font-face {
  font-family: 'Bitstream Vera Serif Bold';
  src: url('https://mdn.github.io/css-examples/web-fonts/VeraSeBd.ttf');
}

.custom-text {
  font-family: 'Bitstream Vera Serif Bold', serif;
}
```

---

*更多 @规则 的使用详情，请参考 [MDN CSS At-rules](https://developer.mozilla.org/zh-CN/docs/Web/CSS/At-rule)。*

`@import` 导入后，在 WXML 中使用 `class="container flex-center"` 组合类；不支持示例框架中的 `composes`。`@keyframes` 的并发、事件与重播说明见[动画与变换](/AIUI/framework/wxss-animation)。
