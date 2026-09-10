# 读取文本输入

通过 `bindinput` 接收输入事件，并把 `event.detail.value` 写回页面数据。模板会随 `setData()` 自动更新。

## 完成示例

<!-- aiui-tutorial-step -->

通过 `bindinput` 接收输入事件，并把 `event.detail.value` 写回页面数据。模板会随 `setData()` 自动更新。

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
  <input placeholder="输入名字" bindinput="handleInput" />
  <text>你好，{{ name || '开发者' }}</text>
</page>
```

<!-- /aiui-tutorial-step -->

输入事件处理应保持轻量，耗时工作放在确认操作中执行。

