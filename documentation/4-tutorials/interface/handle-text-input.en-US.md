# Read Text Input

Receive input events with `bindinput` and write `event.detail.value` back to page data. The template updates after `setData()`.

## Complete the Example

<!-- aiui-tutorial-step -->

Receive input events with `bindinput` and write `event.detail.value` back to page data. The template updates after `setData()`.

```html
<script setup>
export default {
  data: { name: '' },
  handleInput(event) {
    this.setData({ name: event.detail.value });
  }
};
</script>

<page>
  <input placeholder="Enter a name" bindinput="handleInput" />
  <text>Hello, {{ name || 'developer' }}</text>
</page>
```

<!-- /aiui-tutorial-step -->

Keep input handlers lightweight and run expensive work from an explicit confirmation action.

