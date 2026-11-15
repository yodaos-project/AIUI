# Templates and Single-File Region Updates

Custom components use `<template>` to describe their own view. To reuse an interface, create a [custom component](/AIUI/framework/open-agent-format-custom-components). Defining and invoking reusable fragments with `<template name="...">` and `<template is="...">` is not currently supported.

## Reserve a Region in a Single-File Interface

Single-file Source runs a complete page supplied directly as source text. When it is loaded through a method that supports incremental updates, it can show a placeholder and replace a region with a later snippet. For example, show a message until the weather result arrives:

```html
<script setup>
export default { data: { weather: 'Sunny, 22°C' } };
</script>

<page>
  <view>
    <?start name="forecast">
    <text>Loading weather…</text>
    <?end>
  </view>
</page>
```

Then submit the update snippet:

```html
<template for="forecast">
  <?start name="forecast">
  <text>{{weather}}</text>
  <?end>
</template>
```

Provide the page and script first, followed by the `<template for="forecast">` snippet; use the same application `appId` for separate submissions. Once the snippet arrives in full, it replaces the `forecast` region. This example places the markers back inside the new content so the region can be updated again later.

## What Happens During an Update

- The Page instance and its existing data remain in place. `onLoad`, `onShow`, and `onReady` do not run again because of a region update.
- Nodes inside the region are recreated. Query them again when needed; components and state outside the region remain in place.
- New content uses the Page's existing data, methods, and declared components. An update cannot add scripts or declare components.
- This works only with single-file Source input that supports region updates, not ordinary pages in directory projects or `.aix` packages. Continue to use `setData()` for ordinary data changes.

A component's `<template>` describes its own view, and slots receive content from the component's user. Both are distinct from the region updates above.
