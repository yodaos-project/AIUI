# 为组件填充一个具名插槽

让页面在路线卡片的标题和预计用时之间插入一条备注。

## 在组件中留出备注位置

<!-- aiui-tutorial-step -->

在已有 AIUI 项目中创建 `components/route-card.ink`。`<slot name="note" />` 是页面传入备注后实际渲染的位置。

```html
<script def>
{
  "component": true
}
</script>

<script setup>
export default {};
</script>

<template>
  <view>
    <text>今日路线</text>
    <view>
      <slot name="note" />
    </view>
    <text>预计用时 20 分钟</text>
  </view>
</template>
```

<!-- /aiui-tutorial-step -->

## 将页面文字放进插槽

<!-- aiui-tutorial-step -->

将示例保存为项目首页 `pages/index/index.ink`。用 `<template slot="note">` 包住备注，名称与组件内的 `name="note"` 对应。

```html
<script def>
{
  "usingComponents": {
    "route-card": "components/route-card"
  }
}
</script>

<script setup>
export default {};
</script>

<page>
  <route-card>
    <template slot="note">
      <text>从北门出发</text>
    </template>
  </route-card>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

在效果预览中确认「从北门出发」显示在「今日路线」和「预计用时 20 分钟」之间。修改页面中的备注并重载，卡片中间的文字应随之变化。

默认插槽与具名插槽参见[自定义组件](/AIUI/framework/open-agent-format-custom-components)。
