# Make Long Content Scroll Vertically

Put long content in a scrollable area while keeping the title above it visible.

## Set the Height of the Scroll Area

<!-- aiui-tutorial-step -->

In an existing AIUI project, save the example as the home page at `pages/index/index.ink`. Enable vertical scrolling with `scroll-y="true"` and set the visible height to `120px`. The four `48px` rows together are taller than the viewport.

```html
<script setup>
export default {};
</script>

<page>
  <view class="page">
    <text>Stops</text>
    <scroll-view class="stops" scroll-y="true">
      <view class="row"><text>Stop 1</text></view>
      <view class="row"><text>Stop 2</text></view>
      <view class="row"><text>Stop 3</text></view>
      <view class="row"><text>Stop 4</text></view>
    </scroll-view>
  </view>
</page>

<style>
.page {
  display: flex;
  flex-direction: column;
}

.stops {
  height: 120px;
  flex-shrink: 0;
  overflow: hidden;
}

.row {
  height: 48px;
  flex-shrink: 0;
}
</style>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

In the preview, scroll down over the list until “Stop 4” appears. The “Stops” title should stay in place.

See [ScrollView](/AIUI/components/scroll-view) for the other scrolling attributes.
