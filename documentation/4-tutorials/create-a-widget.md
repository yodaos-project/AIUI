# 创建一个 Widget

Widget 是由智能体提供的小尺寸独立界面。在 `app.json` 中声明路径和尺寸族，入口使用 `.ink` 单文件。

## 完成示例

<!-- aiui-tutorial-step -->

Widget 是由智能体提供的小尺寸独立界面。在 `app.json` 中声明路径和尺寸族，入口使用 `.ink` 单文件。

```json
{
  "pages": ["pages/index/index"],
  "widgets": [
    { "path": "widgets/quick-status/index", "family": "1x1" }
  ]
}
```

<!-- /aiui-tutorial-step -->

Widget 内部布局仍应使用 `width: 100%` 和 `height: 100%`。参见 [Widget](/AIUI/framework/open-agent-format-widget)。
