# Create a Widget

A Widget is a compact, independent interface supplied by an agent. Declare its path and size family in `app.json`, using an `.ink` file as the entry.

## Complete the Example

<!-- aiui-tutorial-step -->

A Widget is a compact, independent interface supplied by an agent. Declare its path and size family in `app.json`, using an `.ink` file as the entry.

```json
{
  "pages": ["pages/index/index"],
  "widgets": [
    { "path": "widgets/quick-status/index", "family": "1x1" }
  ]
}
```

<!-- /aiui-tutorial-step -->

Keep the Widget layout relative with `width: 100%` and `height: 100%`. See [Widget](/AIUI/framework/open-agent-format-widget).
