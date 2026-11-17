# Fill a Named Component Slot

Have a page insert a note between a route card’s title and its estimated duration.

## Reserve a Place for the Note

<!-- aiui-tutorial-step -->

Create `components/route-card.ink` in your AIUI project. The `<slot name="note" />` element marks where the supplied note will appear.

```html
<script def>
{
  "component": true
}
</script>

<script setup>
export default {};
</script>

<template>
  <view>
    <text>Today’s route</text>
    <view>
      <slot name="note" />
    </view>
    <text>Estimated time 20 min</text>
  </view>
</template>
```

<!-- /aiui-tutorial-step -->

## Put Page Text into the Slot

<!-- aiui-tutorial-step -->

Save the example as the project home page at `pages/index/index.ink`. Wrap the note in `<template slot="note">`. The value matches the slot’s `name="note"`.

```html
<script def>
{
  "usingComponents": {
    "route-card": "components/route-card"
  }
}
</script>

<script setup>
export default {};
</script>

<page>
  <route-card>
    <template slot="note">
      <text>Start at the north gate</text>
    </template>
  </route-card>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

In the preview, check that “Start at the north gate” appears between “Today’s route” and “Estimated time 20 min.” Change the note in the page and reload. The middle line should show the new note.

See [Custom Components](/AIUI/framework/open-agent-format-custom-components) for default and named slots.
