# At-rules

At-rules are CSS statements that start with an at sign (`@`) and are used to convey special instructions to a stylesheet.

In WXSS, common at-rules and their code examples include:

## 1. `@import`
Used to import an external WXSS stylesheet. It must appear at the very top of the stylesheet.

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

## 2. `@media`
Used to apply different styles based on device characteristics such as screen width, resolution, or theme.

```css
.sidebar { display: none; }
@media (min-width: 1200px) {
  .sidebar { display: block; }
}
```

## 3. `@keyframes`
Used to define a CSS animation sequence.

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

## 4. `@font-face`
Used to load custom web fonts.

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

*For more details about at-rules, see [MDN CSS At-rules](https://developer.mozilla.org/en-US/docs/Web/CSS/At-rule).*

After `@import`, combine classes in WXML with `class="container flex-center"`; framework-specific `composes` is unsupported. See [Animations and transforms](/AIUI/framework/wxss-animation) for concurrent keyframes, events, and replay.
