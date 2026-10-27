# Image

Use `image` to display a local or network image. The `mode` property controls how the image is resized inside its container.

## Display an Image

Set the image location with `src`:

```xml
<image class="logo" src="/assets/logo.png"></image>
```

Network images can use an `http://` or `https://` URL directly:

```xml
<image
  class="cover"
  src="https://example.com/images/cover.jpg"
  mode="aspectFill"
></image>
```

```css
.cover {
  width: 320px;
  height: 180px;
}
```

## Preserve the Image Ratio

Choose one of these modes when the image should not be stretched:

- `aspectFit`: Shows the complete image. Empty space may remain in the container.
- `aspectFill`: Fills the container. Parts outside the container may be cropped.
- `widthFix`: Keeps the width and calculates the height from the image ratio.
- `heightFix`: Keeps the height and calculates the width from the image ratio.

For example, keep a fixed width and calculate the height automatically:

```xml
<image class="article-image" src="/assets/article.png" mode="widthFix"></image>
```

```css
.article-image {
  width: 300px;
}
```

## Properties

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| `src` | String | `""` | Local image path or network image URL. |
| `mode` | String | `scaleToFill` | Resizing mode: `scaleToFill`, `aspectFit`, `aspectFill`, `widthFix`, or `heightFix`. |
| `tint-color` | String | No explicit tint | CSS color replacing RGB with source alpha as a mask; valid SVG theme tint takes precedence. |

`scaleToFill` stretches the image to fill its container, so the image ratio may change. Use `aspectFit` or `aspectFill` when preserving the original ratio matters.

See [Assets](/AIUI/framework/open-agent-format-assets) for local path and network URL support.

## Bind attributes in slots

When content is projected through custom-component slots or templates, bound attributes such as `src` use the current resolved values. Updating resource addresses or display settings with `setData()` updates projected content without recreating the entire component.

## Tint Images and Preserve Animation

Use `tint-color` to replace RGB while retaining source transparency:

```xml
<image src="/assets/plane.svg" tint-color="#adadad" mode="aspectFit" />
```

This affects SVG and raster images, including multicolor images, without preserving their original shading. Output alpha is `source alpha × tint alpha`. Changing or clearing a tint uses original pixels, so repeated updates do not multiply alpha again.

A valid `--image-svg-tint` CSS color overrides explicit tint on SVG images. Raster images ignore that token. Set the token to `none` to disable forced SVG tint; remove explicit tint as well to restore original colors.

```css
.original-vector {
  --image-svg-tint: none;
}
```

GIFs decode sequentially with bounded pixel buffers. Recomposing a view preserves playback position and loop count, and finite-loop animations retain their final frame.

For A2UI image props and fit mapping, see [A2UI](/AIUI/components/a2ui).
