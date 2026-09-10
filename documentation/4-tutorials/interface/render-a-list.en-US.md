# Render a Dynamic List

Store an array in Page `data`, then render each item with `ink:for`. Choose an `ink:key` field that identifies each item consistently.

## Complete the Example

<!-- aiui-tutorial-step -->

Store an array in Page `data`, then render each item with `ink:for`. Choose an `ink:key` field that identifies each item consistently.

```html
<script setup>
export default {
  data: {
    tasks: [
      { id: 'prepare', title: 'Prepare project' },
      { id: 'preview', title: 'Run preview' }
    ]
  }
};
</script>

<page>
  <view ink:for="{{ tasks }}" ink:key="id">
    <text>{{ index + 1 }}. {{ item.title }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

Continue with [List Rendering](/AIUI/framework/wxml/list-rendering).

