# Components

Components encapsulate reusable state, view structure, and event logic. They are useful for splitting complex pages into smaller modules with better reuse and maintainability.

AIUI currently supports component-local `data`, `properties`, `setData()`, `triggerEvent()`, lifecycle hooks, nested components, and scoped component styles.

## Registration And Usage

Pages or components can reference components through `usingComponents`. A common pattern is declaring them in `<script def>` inside an AIUI `.ink` file:

```html
<script def>
{
  "usingComponents": {
    "demo-card": "components/demo-card"
  }
}
</script>
```

If the current file is itself a component, declare `"component": true` as well:

```html
<script def>
{
  "component": true,
  "usingComponents": {
    "demo-badge": "components/demo-badge"
  }
}
</script>
```

After registration, the component can be used like a built-in tag:

```xml
<demo-card title="{{title}}" bindchange="onCardChange" />
```

## Recommended Form

AIUI recommends using `.ink` single-file components so that metadata, template, styles, and logic stay in one file:

```html
<script def>
{
  "component": true
}
</script>

<template>
  <view class="card">
    <text>{{title}}</text>
  </view>
</template>

<style>
.card {
  display: flex;
  padding: 12px;
}
</style>

<script setup>
export default {
  properties: {
    title: {
      type: String,
      value: 'Untitled'
    }
  }
}
</script>
```

In this form:

- `<script def>` declares component metadata such as `"component": true` and `usingComponents`
- `<template>` defines the component structure
- `<style>` defines component-local styles
- `<script setup>` exports the component logic

## Component Instance API

Component instances currently support these core capabilities:

- `properties`: read-only inputs passed from the parent
- `data`: component-local state
- `methods`: component methods, called directly as `this.xxx()`
- `this.setData(patch)`: updates local state
- `this.triggerEvent(name, detail)`: dispatches a custom event to the parent

Example:

```javascript
export default {
  data: {
    count: 0
  },
  properties: {
    title: {
      type: String,
      value: 'Untitled'
    }
  },
  methods: {
    emitChange() {
      const nextCount = this.data.count + 1;
      this.setData({ count: nextCount });
      this.triggerEvent('change', {
        value: `${this.properties.title}:${nextCount}`
      });
    }
  }
}
```

## Accept Content from the Parent

Use `<slot>` when part of a component should be provided by its parent. This card has a default content area and a named `actions` area:

```xml
<template>
  <view class="card">
    <slot></slot>
    <view class="actions">
      <slot name="actions"></slot>
    </view>
  </view>
</template>
```

When the component is used, content without a `slot` property goes to the default area. Content with `slot="actions"` goes to the matching named area:

```xml
<demo-card>
  <text>The device is running normally</text>
  <button slot="actions" bindtap="openDetails">View details</button>
</demo-card>
```

Component logic can call `this.hasSlot('actions')` to check whether the parent provided action content, or read the snapshot from `this.$slots.actions`. See [`Component`](/AIUI/api/framework/component) for the named-slot instance API.

## Lifecycle

The currently supported component lifecycle hooks are:

- `created`
- `attached`
- `ready`
- `moved`
- `detached`

Declare them under `lifetimes`:

```javascript
export default {
  lifetimes: {
    created() {},
    attached() {},
    ready() {},
    moved() {},
    detached() {}
  }
}
```

## Notes

- Components can reference other components to build nested component trees
- Component styles are scoped to the component subtree and do not leak to the page
- Child component events can be forwarded outward through parent components when needed
- Use `<slot>` as a content insertion point inside a custom component template; regular pages do not need to use it directly

## Paths and the first visible frame

`usingComponents` identifies a concrete file path. `/components/card/card` can resolve to `card.ink`, but directory path `/components/card` does not automatically search for `index.ink`; specify `/components/card/index`. Missing or incorrect paths fail loading; check entry, script, and configuration files.

`lifetimes.ready()` runs once per instance after a frame containing that component is actually presented. Dynamically mounted components wait for their own content to be presented. Later `setData()` updates do not repeat it. See [Component API](/AIUI/api/framework-component).
