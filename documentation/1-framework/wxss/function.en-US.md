# Functions

CSS functions are used as the values of CSS properties. They let you perform simple calculations, process colors, or reference external resources in stylesheets. WXSS supports the subset described below; use this page for the supported syntax.

The following are the functions most commonly used in WXSS development and their code examples:

## 1. Calculation and Variables

### `calc()`
Calculates sizes and spacing. Currently supports two operands joined by `+` or `-`, with spaces on both sides of the operator. Multiplication, division, and nested expressions are unsupported.

```css
.container {
  /* Viewport width minus both side margins */
  width: calc(100vw - 60rpx);
  margin: 0 auto;
}
```

Operands can be compatible lengths or two percentages. Ordinary sizes and spacing do not support mixed percentages and lengths such as `width: calc(100% - 20px)`. Use viewport lengths such as `calc(100vw - 20px)` or layout spacing instead.

### `var()`
Used to reference the value of a custom property, also known as a CSS variable.

```css
:root {
  --primary-color: #40FF5E;
}

.button {
  /* Use a variable with a fallback */
  background-color: var(--primary-color, #444);
}
```

## Random values with `random()`

`random()` generates values for supported numeric properties, such as decorative offsets, opacity, and animation duration. Use [Crypto](/AIUI/api/crypto) when you need secure random bytes.

```css
.spark {
  opacity: 0.8;
  opacity: random(0.4, 1);
  margin-left: random(-20px, 20px, 5px);
  animation-duration: random(400ms, 1s, 100ms);
}
```

### Syntax and ranges

```css
random(min, max)
random(min, max, step)
random(auto, min, max)
random(--key, min, max, step)
```

- `min` and `max` must be compatible literals: numbers, lengths, times, or percentages. Length units can be mixed, as can `ms` and `s`. Percentages cannot be mixed with lengths or unitless numbers.
- Optional `step` must be positive and compatible with the range. Discrete results are `min + n × step`; the upper bound is possible only when a step lands exactly on `max`. If `max < min`, the result is `min`.
- The receiving property determines the accepted type: numbers for `opacity`, lengths for `margin-left`, and times for `animation-duration`. Integer properties round the result, and each property's own limits still apply.
- Nested `calc()` / `random()` arguments and random angles, frequencies, and resolutions are unsupported. Invalid expressions invalidate the declaration; provide an ordinary value first as a fallback.

### Stable values and shared randomness

Random values are scoped to an element or generated pseudo-element. Recomputing styles does not resample them on every update. Omitting the first argument or using `auto` gives each function occurrence within a property its own sample.

A `--key` shares the random base within one element. Equal ranges and steps produce equal results; different ranges map the same base into their own ranges. Values are not shared across elements:

```css
.spark {
  width: random(--size, 4px, 10px, 2px);
  height: random(--size, 4px, 10px, 2px);
}
```

Random animation endpoints are resolved before interpolation and stay stable during that playback. Each event-triggered replay gets its own random context without changing retained older instances. Expressions in custom properties are resolved at the consuming property.

Cross-element sharing, `element-shared`, fixed random sources, and full browser random-cache semantics are not supported. See [Animations and transforms](/AIUI/framework/wxss-animation) for replay examples.

## 2. Visual Effects

### `linear-gradient()`
Creates a linear gradient background.

```css
.header {
  background: linear-gradient(180deg, #40FF5E 0%, #06a954 100%);
}
```

### `rgba()`
Defines a color with transparency.

```css
.mask {
  background-color: rgba(0, 0, 0, 0.6);
}
```

## 3. Resource Inclusion

### `url()`
Used to include external resources. In WXSS, using a network path or base64 is recommended.

```css
.icon {
  background-image: url('https://res.rokid.com/static/icon.png');
  background-size: cover;
}
```

## 4. Geometric Transforms

### `translate()`, `rotate()`, `scale()`
Used together with the `transform` property to move, rotate, and scale elements.

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

*For the complete list of functions and detailed syntax, see [MDN CSS Functions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Functions).*
