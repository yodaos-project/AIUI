# A2UI AI 界面

`a2ui` 用于把 AI 生成的结构化指令转换成可见的界面。适合在界面内容由智能体动态决定时使用，例如根据用户问题生成结果卡片、列表或图表。

如果界面结构是固定的，直接使用 `view`、`text` 等普通组件会更简单。

## 显示初始界面

先给组件设置一个唯一的 `id`，再通过 `commands` 传入 A2UI 指令。`commands` 只会在组件首次渲染时处理一次。

```xml
<a2ui id="answer" commands="{{initialCommands}}"></a2ui>
```

```javascript
export default {
  data: {
    initialCommands: JSON.stringify([
      {
        version: 'v0.9',
        createSurface: { surfaceId: 'main' }
      },
      {
        version: 'v0.9',
        updateComponents: {
          surfaceId: 'main',
          components: [
            { id: 'title', component: 'Text', text: '今日天气：晴' }
          ]
        }
      }
    ])
  }
};
```

`commands` 接收字符串，因此需要使用 `JSON.stringify()` 把指令数组转换成 JSON 字符串。

## 更新已经显示的界面

当新的 AI 结果到达时，通过组件的 `id` 创建上下文，再调用 `write()`：

```javascript
const context = a2ui.createA2UIContext('answer');

if (context) {
  context.write(JSON.stringify([
    {
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'main',
        components: [
          { id: 'title', component: 'Text', text: '今日天气：多云' }
        ]
      }
    }
  ]));
}
```

找不到对应 `id` 时，`createA2UIContext()` 返回 `null`，因此调用前应先检查结果。

## 分段接收 AI 输出

如果 AI 的响应是逐步返回的，可以创建写入器，将收到的字符串片段依次写入。最后必须调用 `close()`，让组件处理剩余内容。

```javascript
const context = a2ui.createA2UIContext('answer');

if (context) {
  const writer = context.startStream();
  writer.writeChunk('{"version":"v0.9","createSurface":');
  writer.writeChunk('{"surfaceId":"stream-result"}}');
  writer.close();
}
```

需要移除当前生成的界面时，调用 `context.clear()`。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `id` | String | - | 组件标识，供 `a2ui.createA2UIContext()` 查找组件。动态更新时必须设置。 |
| `commands` | String | - | 首次渲染时处理的 A2UI JSON 指令，只处理一次。 |
| `default-chart-animate` | Boolean | `true` | A2UI 创建图表且指令没有明确设置动画时，是否默认启用动画。也可写成 `defaultChartAnimate`。 |

## JavaScript 方法

| 方法 | 说明 |
| --- | --- |
| `a2ui.createA2UIContext(id)` | 根据组件 `id` 返回操作上下文；找不到组件时返回 `null`。 |
| `context.write(data)` | 使用完整的 JSON 字符串更新界面。 |
| `context.startStream()` | 开始一次分段写入并返回写入器。 |
| `writer.writeChunk(chunk)` | 写入一段字符串。 |
| `writer.close()` | 结束本次分段写入。 |
| `context.clear()` | 清除当前生成的界面内容。 |

`a2ui` 不提供 `agent-id`、`session-id` 或 `bindmessage` 属性。智能体会话和消息接收应由页面或 Agent Worker 管理，再把最终的 A2UI 指令交给组件显示。

## 为生成的图片着色和适配

A2UI `Image` / `image` 的属性映射到原生图片属性：

| A2UI 属性 | 原生属性 | 行为 |
| --- | --- | --- |
| `tintColor` | `tint-color` | 颜色字符串或数据绑定；同时提供两种拼写时，显式 `tint-color` 优先。 |
| `fit: 'contain'` | `mode="aspectFit"` | 保持比例，完整显示图片。 |
| `fit: 'cover'` | `mode="aspectFill"` | 保持比例并裁剪以填满区域。 |
| `fit: 'fill'` | `mode="scaleToFill"` | 拉伸以填满区域。 |
| `mode` | `mode` | 显式 `mode` 优先于 `fit`。 |

透明度相乘和 SVG 主题着色规则见 [Image](/AIUI/components/image)。更新保留相同类型的图片组件，并按位置复用模板项，减少重复加载并保留播放状态；组件类型改变时会重新创建。
