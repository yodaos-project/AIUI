# 伪元素

WXSS 支持在单行 `<text>` 上使用生成的 `::before` 与 `::after` 盒子，用于文字前后的标记及动画装饰。当前只实现这一子集，不等同于浏览器的完整伪元素能力。

## 生成文字与装饰

```xml
<text class="label" data-suffix="*">名称</text>
```

```css
.label::after {
  content: attr(data-suffix);
  color: #ff4d4f;
}
```

`content` 接受带引号的字符串或 `attr(name)`；`normal` / `none` 不生成内容。属性缺失时 `attr(name)` 得到空字符串，不支持其类型参数和回退语法。`content: ''` 可用于没有文字的背景或形状装饰。

`::before` 锚定在文字起点，`::after` 锚定在末端，均位于文字中线。生成盒子归 `<text>` 所有，不成为 DOM / Entity / 布局节点，不能通过 `querySelector()` 访问。

## 由文字变化触发动画

通过 `event-trigger` 和 `animation-trigger` 在文字或属性内容变化时重播生成盒子的动画。重播仅对 `transform` 与 `opacity` 生效，示例与生命周期见[动画与变换](/AIUI/framework/wxss-animation)。

## 当前边界

不应将浏览器的 `::placeholder`、`::-webkit-scrollbar` 或任意容器的生成内容用法直接套用到 WXSS。输入占位符样式应使用组件支持的属性；多行 `<text>` 的生成盒子布局不在当前支持范围内。
