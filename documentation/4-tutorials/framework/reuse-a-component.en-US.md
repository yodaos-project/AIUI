# Reuse a Custom Component

Register a component through `usingComponents` in the Page's `<script def>`, then use it in the template like a built-in component.

## Complete the Example

<!-- aiui-tutorial-step -->

Register a component through `usingComponents` in the Page's `<script def>`, then use it in the template like a built-in component.

```html
<script def>
{
  "usingComponents": {
    "status-card": "components/status-card"
  }
}
</script>

<page>
  <status-card title="Runtime status" value="Healthy"></status-card>
</page>
```

<!-- /aiui-tutorial-step -->

See [Custom Components](/AIUI/framework/open-agent-format-custom-components) for properties, events, and component lifecycle.

