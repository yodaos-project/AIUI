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

`scaleToFill` stretches the image to fill its container, so the image ratio may change. Use `aspectFit` or `aspectFill` when preserving the original ratio matters.

See [Assets](/AIUI/framework/open-agent-format-assets) for local path and network URL support.

## Bind attributes in slots

When content is projected through custom-component slots or templates, bound attributes such as `src` use the current resolved values. Updating resource addresses or display settings with `setData()` updates projected content without recreating the entire component.
