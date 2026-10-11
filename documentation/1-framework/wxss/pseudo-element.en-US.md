# Pseudo-elements

WXSS supports generated `::before` and `::after` boxes on single-line `<text>` elements for markers and animated decorations. This is a supported subset rather than the full browser pseudo-element model.

## Generate text and decorations

```xml
<text class="label" data-suffix="*">Name</text>
```

```css
.label::after {
  content: attr(data-suffix);
  color: #ff4d4f;
}
```

`content` accepts quoted strings or `attr(name)`; `normal` / `none` generate no content. A missing attribute resolves to an empty string. Typed `attr()` arguments and fallback syntax are unsupported. Use `content: ''` for decorations without text.

`::before` anchors at the text start and `::after` at its end, both on the text midline. Generated boxes belong to the `<text>` element and are not DOM / Entity / layout nodes; `querySelector()` cannot access them.

## Trigger animations from text changes

Use `event-trigger` and `animation-trigger` to replay generated-box animations when text or attribute-generated content changes. Replays animate only `transform` and `opacity`; see [Animations and transforms](/AIUI/framework/wxss-animation) for examples and lifecycle.

## Current limits

Do not assume browser `::placeholder`, `::-webkit-scrollbar`, or generated content on arbitrary containers is supported in WXSS. Style input placeholders using the component's supported properties. Generated-box layout for multiline `<text>` is outside the current supported scope.
