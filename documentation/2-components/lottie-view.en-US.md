# LottieView Lottie Animation

The `lottie-view` component is used to render Lottie animations, a JSON-based animation format exported from After Effects.

## Usage

```xml
<lottie-view
  src="/assets/animation.json"
  auto-play="true"
  loop="true"
  speed="1.0"
  width="200"
  height="200"
></lottie-view>
```

## Properties

| Property | Type | Description | Default |
|-----------|------|-------------|---------|
| `src` | String | Path or URL of a Lottie JSON file or `.lottie` archive. | `""` |
| `auto-play` | Boolean | Whether to automatically start playback after loading is complete. | `true` |
| `loop` | Boolean | Whether to loop the animation after it reaches the end. | `true` |
| `speed` | Number | The animation playback speed multiplier (for example, `1.0` is normal speed). | `1.0` |
| `progress` | Number | The value used to manually control animation progress (from `0.0` to `1.0`). | `None` |

## Events

Currently, the `lottie-view` component does not expose public events to WXML/JS and mainly handles loading-related events internally.

See [Assets](/AIUI/framework/open-agent-format-assets) for local paths, network URLs, external images, and `.lottie` archives.

## Bind attributes in slots

When content is projected through custom-component slots or templates, bound attributes such as `src` use the current resolved values. Updating resource addresses or display settings with `setData()` updates projected content without recreating the entire component.
