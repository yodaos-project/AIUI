# 用开关切换设置

点击开关后，让页面立即显示提醒是开启还是关闭。

## 绑定开关状态

<!-- aiui-tutorial-step -->

在已有 AIUI 项目中，将下列示例保存为首页 `pages/index/index.ink`。 用 `checked` 绑定当前状态，并通过 `bindchange` 读取 `event.detail.value`。这个值是切换后的布尔值。

```html
<script setup>
export default {
  data: { remindersEnabled: false },

  updateReminders(event) {
    this.setData({ remindersEnabled: event.detail.value });
  }
};
</script>

<page>
  <view>
    <text>{{ remindersEnabled ? '提醒已开启' : '提醒已关闭' }}</text>
    <switch checked="{{ remindersEnabled }}" bindchange="updateReminders" />
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

打开效果预览，初始显示「提醒已关闭」。点击一次开关，文字变为「提醒已开启」。再次点击，恢复为「提醒已关闭」。

更多开关属性参见 [Switch](/AIUI/components/switch)。
