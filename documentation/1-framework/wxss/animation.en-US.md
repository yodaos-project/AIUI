# Animations and transforms

Use `transition` to smooth state changes, and `animation` with `@keyframes` for continuous effects. Multiple animations can run together, and animation events can drive later interface updates.

## Play multiple animations together

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

Comma-separated animations have independent timing. Shorter duration, delay, and related lists repeat their values; values beyond the animation-name count are ignored. Later contributing animations win for a shared property. Active transitions override keyframe values, and ordinary `!important` declarations can override keyframes.

Unrelated `setData()` or style updates do not restart animations. Removing and re-adding an animation starts a new playback. Completed `forwards` / `both` animations retain their final effect without continuing to request frames.

## Listen for animation events

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

Events bubble through ancestors to the Page / Widget. Use `bind`, `catch`, `addEventListener()`, or the matching `onanimation...` property. `stopPropagation()` stops bubbling; animation events are not cancelable. `elapsedTime` is in seconds, excluding delay; `pseudoElement` is `''`, `'::before'`, or `'::after'`. `detail` also contains these three animation fields.

Removing an animation or node, or setting `display: none`, cancels active playback and fires `animationcancel` once. Closing a Page / Widget fires cancellation before `onUnload` / `onDestroy`. Offscreen pauses and temporarily hidden pages preserve progress.

## Replay decorations when text changes

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

`event-trigger: --name textchange` fires when the final bound text changes; `attributechange` observes changes to attribute-generated content. Initial mounting does not trigger playback. Multiple updates before one layout coalesce into one replay.

`animation-trigger: --name replay` restarts playback on the owning `<text>` element's generated pseudo-element. One instance is retained by default. The extension `-ink-animation-trigger-instance-limit` accepts integers from `1` to `32`, discarding the oldest instance at the limit. Each replay captures its anchor after layout, so later text changes do not move older effects.

This feature targets single-line `<text>`. Generated boxes animate only `transform` and `opacity` and are not queryable Entity nodes. See [Pseudo-elements](/AIUI/framework/wxss-pseudo-element) for details. To vary sizes or endpoints for each replay, use [`random()` on the functions page](/AIUI/framework/wxss-function), keeping literal fallbacks.

## Animatable properties and 2D transforms

Supports sizes and insets, margin / padding, border widths, font-size / line-height, colors, radii, background-position, visibility, opacity, and 2D transform / transform-origin. Size and typography changes require layout; prefer transform and opacity for frequent movement.

`transform` supports `matrix()`, `translate()` / X / Y, `rotate()`, `scale()` / X / Y, and `skew()` / X / Y. Independent `translate`, `rotate`, and `scale` compose in that order before `transform`:

```css
.badge {
  translate: 8px 25%;
  rotate: 0.125turn;
  scale: 120% 0.9;
  transform-origin: left center;
}
```

Keep endpoint transform types and ordering consistent. Compatible values interpolate continuously; incompatible values switch at the interval midpoint. 3D transforms, perspective, a third transform-origin component, and `animation-play-state` are unsupported. Min/max sizes, flex / grid controls, gap, shadow, filter, clip, and outline do not interpolate.

## Timing and fill

- `animation-duration` / `animation-delay` use `ms` or `s`. Negative delays are supported; durations cannot be negative.
- `animation-iteration-count` accepts counts or `infinite`; `animation-direction` accepts `normal`, `reverse`, `alternate`, or `alternate-reverse`.
- `animation-fill-mode` accepts `none`, `forwards`, `backwards`, or `both`.
- Timing functions include `linear`, the `ease` family, `cubic-bezier()`, `step-start`, `step-end`, and `steps()`. `steps(n, jump-none)` requires `n >= 2`; other steps require a positive integer.
- Zero duration or iteration count completes after the delay without continuous playback.
