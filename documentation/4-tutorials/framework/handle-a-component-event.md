# 在页面中接收组件事件

让自定义组件在用户确认时发送一条消息，由使用它的 Page 显示这条消息。

## 在组件中派发事件

<!-- aiui-tutorial-step -->

在已有 AIUI 项目中创建 `components/confirm-button.ink`。点击组件里的按钮时，`triggerEvent()` 会派发名为 `confirm` 的自定义事件，并附上消息。

```html
<script def>
{
  "component": true
}
</script>

<script setup>
export default {
  methods: {
    confirm() {
      this.triggerEvent('confirm', { message: '已确认' });
    }
  }
};
</script>

<template>
  <button bindtap="confirm">确认</button>
</template>
```

<!-- /aiui-tutorial-step -->

## 在 Page 中读取消息

<!-- aiui-tutorial-step -->

在已有 AIUI 项目中，将下列示例保存为首页 `pages/index/index.ink`。 `usingComponents` 注册组件，`bindconfirm` 将事件绑定到 `handleConfirm`。组件发送的消息位于 `event.detail.message`。

```html
<script def>
{
  "usingComponents": {
    "confirm-button": "components/confirm-button"
  }
}
</script>

<script setup>
export default {
  data: { status: '等待确认' },

  handleConfirm(event) {
    this.setData({ status: event.detail.message });
  }
};
</script>

<page>
  <view>
    <confirm-button bindconfirm="handleConfirm"></confirm-button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

打开效果预览，点击「确认」。页面文字应从「等待确认」变为「已确认」。

组件事件的选项参见 [Component](/AIUI/api/framework-component)。
