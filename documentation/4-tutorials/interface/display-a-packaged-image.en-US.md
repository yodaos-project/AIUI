# Display an Image Bundled with the Project

Add a PNG to your agent project and display it on a page.

## Reference the Bundled Image

<!-- aiui-tutorial-step -->

Create `assets/` at the root of your AIUI project and save any PNG as `assets/logo.png`. Save the example as the home page at `pages/index/index.ink`. The leading `/` in `src` refers to the package root. With `aspectFit`, the entire image fits within the specified area and keeps its proportions.

```html
<script setup>
export default {};
</script>

<page>
  <image class="logo" src="/assets/logo.png" mode="aspectFit"></image>
</page>

<style>
.logo {
  width: 160px;
  height: 96px;
}
</style>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Open the preview and check that the whole image is visible. Replace it with a taller PNG and reload. The new image should keep its original proportions.

See [Assets](/AIUI/framework/open-agent-format-assets) for path rules for other resource types.
