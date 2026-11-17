# 在页面上显示在线状态

让页面在网络状态变化时更新提示，方便用户看到当前运行环境报告的在线状态。

## 读取初始状态并监听变化

<!-- aiui-tutorial-step -->

将示例保存为项目首页 `pages/index/index.ink`。显示页面时，从 `navigator.onLine` 读取当前状态。之后用 `onNetworkStatus()` 提供的 `event.online` 更新同一个字段。在线状态仅反映网络连接，接口请求仍要独立处理失败。

```html
<script setup>
export default {
  data: { online: false },

  onShow() {
    this.setData({ online: navigator.onLine });
  },

  onNetworkStatus(event) {
    this.setData({ online: event.online });
  }
};
</script>

<page>
  <text>{{ online ? '在线' : '离线' }}</text>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

在支持网络状态事件的环境中打开页面，断开该环境可用的网络连接，确认提示变为「离线」。恢复连接后，应显示「在线」。

事件字段参见 [Page API](/AIUI/api/framework-page)。
