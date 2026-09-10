# Render Content from State

Use `ink:if`, `ink:elif`, and `ink:else` to present loading, empty, and complete states. Keep the three branches adjacent.

## Complete the Example

<!-- aiui-tutorial-step -->

Use `ink:if`, `ink:elif`, and `ink:else` to present loading, empty, and complete states. Keep the three branches adjacent.

```html
<page>
  <text ink:if="{{ loading }}">Loading...</text>
  <text ink:elif="{{ items.length === 0 }}">No data</text>
  <view ink:else>Loaded {{ items.length }} items</view>
</page>
```

<!-- /aiui-tutorial-step -->

Continue with [Conditional Rendering](/AIUI/framework/wxml/conditional-rendering).

