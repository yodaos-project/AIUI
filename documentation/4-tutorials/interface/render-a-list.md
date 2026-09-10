# 渲染动态列表

将数组保存在 Page 的 `data` 中，然后使用 `ink:for` 逐项渲染。`ink:key` 应选择能稳定标识数据项的字段。

## 完成示例

<!-- aiui-tutorial-step -->

将数组保存在 Page 的 `data` 中，然后使用 `ink:for` 逐项渲染。`ink:key` 应选择能稳定标识数据项的字段。

```html
<script setup>
export default {
  data: {
    tasks: [
      { id: 'prepare', title: '准备项目' },
      { id: 'preview', title: '运行预览' }
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

继续阅读[列表渲染](/AIUI/framework/wxml/list-rendering)。

