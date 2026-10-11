# 动画与变换

使用 `transition` 平滑响应状态变化，使用 `animation` 与 `@keyframes` 定义连续效果。多个动画可以同时运行，动画事件可以驱动后续界面更新。

## 同时播放多个动画

```css
.status {
  animation: fade-in 300ms ease-out, pulse 900ms ease-in-out infinite;
  transition: background-color 200ms ease;
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes pulse {
  from { transform: scale(1); }
  50% { transform: scale(1.05); }
  to { transform: scale(1); }
}
```

逗号分隔的动画分别计时。duration、delay 等列表不足时循环使用已有值，超出动画名称数量的值忽略。同一属性被多个动画影响时，后面的动画优先；该属性正在进行的 transition 优先于 keyframe 动画。普通声明中的 `!important` 可以覆盖 keyframe 值。

无关的 `setData()` 或样式更新不会重启动画。移除动画再重新添加会开始新播放；已结束的 `forwards` / `both` 保留最终效果，但不会持续请求动画帧。

## 监听动画事件

```xml
<view class="status" bindanimationstart="onAnimation"
  bindanimationiteration="onAnimation" bindanimationend="onAnimation"
  bindanimationcancel="onAnimation" />
```

```javascript
export default {
  onAnimation(event) {
    console.log(event.type, event.animationName, event.elapsedTime, event.pseudoElement);
    if (event.type === 'animationend') {
      this.setData({ completed: true });
    }
  },
};
```

事件会冒泡到祖先节点及 Page / Widget，支持 `bind`、`catch`、`addEventListener()` 和对应的 `onanimation...` 属性。`stopPropagation()` 可阻止冒泡；动画事件不可取消。`elapsedTime` 以秒计，不包含 delay；`pseudoElement` 为 `''`、`'::before'` 或 `'::after'`。`detail` 也提供这三个动画字段。

移除动画、节点或设置 `display: none` 会取消仍在播放的动画，派发一次 `animationcancel`。关闭 Page / Widget 时取消事件在 `onUnload` / `onDestroy` 之前触发。视口外暂停或页面暂时隐藏会保留进度。

## 文字更新时重播装饰效果

```xml
<text class="streaming-text">{{answer}}</text>
```

```css
.streaming-text {
  position: relative;
  event-trigger: --text-update textchange;
}
.streaming-text::after {
  content: '';
  position: absolute;
  left: 100%;
  top: 50%;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #74f7c5;
  animation: spark 900ms ease-out;
  animation-trigger: --text-update replay;
  -ink-animation-trigger-instance-limit: 5;
}
@keyframes spark {
  from { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  to { opacity: 0; transform: translate(-50%, -28px) scale(0.35); }
}
```

`event-trigger: --name textchange` 在最终绑定文字发生变化时触发；`attributechange` 用于属性生成内容的变化。首次挂载不会触发；同一次布局前的多次更新合并为一次 replay。

`animation-trigger: --name replay` 在所属 `<text>` 的生成伪元素上从头播放。默认保留一个实例；扩展属性 `-ink-animation-trigger-instance-limit` 接受 `1` 到 `32` 的整数，达到上限后丢弃最老实例。每次播放在布局后固定起始锚点，后续文字变化不会移动旧效果。

此功能面向单行 `<text>`，生成盒子仅支持 `transform` 与 `opacity` 动画，不会成为可查询的 Entity 节点。详细边界见[伪元素](/AIUI/framework/wxss-pseudo-element)。需要让每次重播的尺寸或端点变化时，使用[函数页的 `random()`](/AIUI/framework/wxss-function)，并保留字面量回退。

## 可动画属性与 2D 变换

支持尺寸与定位、margin / padding、边框宽度、font-size / line-height、颜色、圆角、background-position、visibility、opacity，以及 2D transform / transform-origin。尺寸与排版变化会重新布局；频繁运动优先使用 transform 和 opacity。

`transform` 支持 `matrix()`、`translate()` / X / Y、`rotate()`、`scale()` / X / Y、`skew()` / X / Y。独立 `translate`、`rotate`、`scale` 按此顺序先于 `transform` 合成：

```css
.badge {
  translate: 8px 25%;
  rotate: 0.125turn;
  scale: 120% 0.9;
  transform-origin: left center;
}
```

尽量保持动画两端的变换类型与顺序相同。相容值连续插值，不相容值在区间中点切换。当前不支持 3D 变换、透视、transform-origin 的第三个分量及 `animation-play-state`。min/max 尺寸、flex / grid 控制属性、gap、shadow、filter、clip、outline 不产生插值动画。

## 时间与填充

- `animation-duration` / `animation-delay` 使用 `ms` 或 `s`，支持负 delay；duration 不能为负。
- `animation-iteration-count` 支持次数和 `infinite`；`animation-direction` 支持 `normal`、`reverse`、`alternate`、`alternate-reverse`。
- `animation-fill-mode` 支持 `none`、`forwards`、`backwards`、`both`。
- timing function 支持 `linear`、`ease` 系列、`cubic-bezier()`、`step-start`、`step-end` 和 `steps()`。`steps(n, jump-none)` 要求 `n >= 2`，其他 steps 要求正整数。
- duration 或次数为零时，在 delay 之后完成，不会持续播放。
