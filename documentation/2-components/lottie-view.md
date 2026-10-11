# LottieView Lottie 动画

`lottie-view` 组件用于渲染 Lottie 动画，这是一种从 After Effects 导出的基于 JSON 的动画格式。

## 使用方法

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

## 属性

| 属性 | 类型 | 描述 | 默认值 |
|-----------|------|-------------|---------|
| `src` | String | Lottie JSON 或 `.lottie` 归档的路径或 URL。 | `""` |
| `auto-play` | Boolean | 是否在加载完成后自动开始播放。 | `true` |
| `loop` | Boolean | 动画播放到结尾后是否循环播放。 | `true` |
| `speed` | Number | 动画播放速度倍数（例如，1.0 为正常速度）。 | `1.0` |
| `progress` | Number | 手动控制动画进度的值（从 0.0 到 1.0）。 | `None` |

## 事件

目前，`lottie-view` 组件暂未向 WXML/JS 抛出公共事件，主要在内部处理加载相关的事件。

本地路径、网络 URL、外部图片和 `.lottie` 归档的支持规则请查看[资源（Assets）](/AIUI/framework/open-agent-format-assets)。

## 在插槽中绑定属性

通过自定义组件插槽或模板投影内容时，`src` 等绑定属性使用当前已解析的数据值。`setData()` 更新资源地址或显示参数后，投影内容同步更新，无需重新创建整个组件。
