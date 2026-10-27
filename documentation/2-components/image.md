# Image 图片

`image` 用于在页面中显示本地图片或网络图片。通过 `mode` 可以决定图片在容器中如何缩放。

## 显示图片

使用 `src` 指定图片地址：

```xml
<image class="logo" src="/assets/logo.png"></image>
```

网络图片可以直接使用 `http://` 或 `https://` 地址：

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

## 保持图片比例

如果不希望图片被拉伸，可以根据界面需要选择以下模式：

- `aspectFit`：完整显示图片，容器中可能留有空白。
- `aspectFill`：填满容器，超出容器的部分可能被裁剪。
- `widthFix`：宽度固定，高度根据图片比例自动计算。
- `heightFix`：高度固定，宽度根据图片比例自动计算。

例如，固定图片宽度并自动计算高度：

```xml
<image class="article-image" src="/assets/article.png" mode="widthFix"></image>
```

```css
.article-image {
  width: 300px;
}
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `src` | String | `""` | 本地图片路径或网络图片 URL。 |
| `mode` | String | `scaleToFill` | 图片缩放方式，可选值为 `scaleToFill`、`aspectFit`、`aspectFill`、`widthFix` 或 `heightFix`。 |
| `tint-color` | String | 无显式着色 | 使用源 alpha 作为遮罩的 CSS 颜色；有效的 SVG 主题着色优先。 |

`scaleToFill` 会让图片填满容器，因此图片比例可能发生变化。需要保持原始比例时，通常优先使用 `aspectFit` 或 `aspectFill`。

本地路径和网络 URL 的支持规则请查看[资源（Assets）](/AIUI/framework/open-agent-format-assets)。

## 在插槽中绑定属性

通过自定义组件插槽或模板投影内容时，`src` 等绑定属性使用当前已解析的数据值。`setData()` 更新资源地址或显示参数后，投影内容同步更新，无需重新创建整个组件。

## 图片着色与动画保留

使用 `tint-color` 替换 RGB 并保留原图透明度：

```xml
<image src="/assets/plane.svg" tint-color="#adadad" mode="aspectFit" />
```

SVG 和栅格图片都支持，包括多彩图像；着色不会保留原有明暗层次。输出透明度为 `源 alpha × 着色 alpha`。修改或清除着色使用原始像素，不会因重复更新而累乘透明度。

有效的 `--image-svg-tint` CSS 颜色优先于 SVG 的显式着色；栅格图片忽略此 token。设为 `none` 可关闭强制 SVG 着色；要恢复原图颜色，还需移除显式着色。

```css
.original-vector {
  --image-svg-tint: none;
}
```

GIF 按顺序解码并限制像素缓冲，视图重组时保留播放位置和循环次数，有限循环结束后保留最后一帧。

A2UI 图片属性与适配映射见 [A2UI](/AIUI/components/a2ui)。
