# 函数 (Functions)

CSS 函数被用作 CSS 属性的值，允许你在样式表中执行简单的计算、处理颜色或引用外部资源。WXSS 支持以下 CSS 函数子集，具体语法以本页为准。

以下是在 WXSS 开发中最常用的函数及其代码示例：

## 1. 计算与变量

### `calc()`
用于计算尺寸与间距。当前支持两个操作数之间的 `+` 或 `-`，运算符两侧必须留空格；不支持乘除或嵌套表达式。

```css
.container {
  /* 宽度为视口宽度减去两侧的边距 */
  width: calc(100vw - 60rpx);
  margin: 0 auto;
}
```

两个操作数可为兼容的长度或两个百分比。普通尺寸与间距不支持百分比和长度混合计算，例如 `width: calc(100% - 20px)`；使用视口长度 `calc(100vw - 20px)` 或布局间距替代。

### `var()`
用于引用自定义属性（CSS 变量）的值。

```css
:root {
  --primary-color: #40FF5E;
}

.button {
  /* 引用变量，并提供回退值 */
  background-color: var(--primary-color, #444);
}
```

## 随机值 `random()`

`random()` 为支持的数值属性生成随机值，适合装饰位置、透明度和动画时长。它不是安全随机数接口；需要安全随机字节时使用 [Crypto](/AIUI/api/crypto)。

```css
.spark {
  opacity: 0.8;
  opacity: random(0.4, 1);
  margin-left: random(-20px, 20px, 5px);
  animation-duration: random(400ms, 1s, 100ms);
}
```

### 语法与取值

```css
random(min, max)
random(min, max, step)
random(auto, min, max)
random(--key, min, max, step)
```

- `min`、`max` 必须是兼容类型的字面量：数字、长度、时间或百分比。不同长度单位可以混用；`ms` 与 `s` 可以混用；百分比不能与长度或无单位数字混用。
- `step` 可选，必须为正值且与区间类型兼容。离散结果为 `min + n × step`；仅当步长恰好落到 `max` 时才可能取到上界。`max < min` 时返回 `min`。
- 属性决定可接受的类型，例如 `opacity` 接受数字，`margin-left` 接受长度，`animation-duration` 接受时间。整数属性会将结果舍入，属性自身的范围限制仍然生效。
- 不支持嵌套 `calc()` / `random()` 参数，也不支持随机角度、频率和分辨率。无效表达式会使对应声明失效，建议先写普通值作为回退。

### 稳定性与共享随机值

随机值以元素或生成的伪元素为作用域，重新计算样式不会每次重新抽样。省略首个参数或使用 `auto` 时，每个属性中的每次函数调用独立取样。

同一元素上的 `--key` 共享随机基值。使用相同区间与步长可得到相同结果；区间不同则将同一基值映射到各自范围。它不在不同元素之间共享：

```css
.spark {
  width: random(--size, 4px, 10px, 2px);
  height: random(--size, 4px, 10px, 2px);
}
```

动画中的随机端点在插值前确定，并在该次播放期间保持稳定。每次事件触发的重播会获得独立的随机上下文，保留下来的旧实例不会改变。自定义属性中的表达式会在使用它的属性处解析。

当前支持范围不包含跨元素共享、`element-shared`、固定随机源或完整的浏览器随机缓存语义。动画重播示例见[动画与变换](/AIUI/framework/wxss-animation)。

## 2. 视觉效果

### `linear-gradient()`
创建线性渐变背景。

```css
.header {
  background: linear-gradient(180deg, #40FF5E 0%, #06a954 100%);
}
```

### `rgba()`
定义带透明度的颜色。

```css
.mask {
  background-color: rgba(0, 0, 0, 0.6);
}
```

## 3. 资源引入

### `url()`
用于引入外部资源。在 WXSS 中建议使用网络路径或 base64。

```css
.icon {
  background-image: url('https://res.rokid.com/static/icon.png');
  background-size: cover;
}
```

## 4. 几何变换

### `translate()`, `rotate()`, `scale()`
配合 `transform` 属性实现元素的位移、旋转和缩放。

```css
.active-item {
  transform: translateX(20rpx) scale(1.1);
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

*完整的函数列表及其详细语法，请参考 [MDN CSS 函数](https://developer.mozilla.org/zh-CN/docs/Web/CSS/CSS_Functions)。*
