# 让长内容可以纵向滚动

把长内容放进可滚动的区域，让区域上方的标题保持可见。

## 为滚动区域设置高度

<!-- aiui-tutorial-step -->

在已有 AIUI 项目中，将下列示例保存为首页 `pages/index/index.ink`。 `scroll-y="true"` 启用纵向滚动，`height: 120px` 限定可见高度。四行内容每行高 `48px`，总高度会超过可见区域。

```html
<script setup>
export default {};
</script>

<page>
  <view class="page">
    <text>停靠站</text>
    <scroll-view class="stops" scroll-y="true">
      <view class="row"><text>第一站</text></view>
      <view class="row"><text>第二站</text></view>
      <view class="row"><text>第三站</text></view>
      <view class="row"><text>第四站</text></view>
    </scroll-view>
  </view>
</page>

<style>
.page {
  display: flex;
  flex-direction: column;
}

.stops {
  height: 120px;
  flex-shrink: 0;
  overflow: hidden;
}

.row {
  height: 48px;
  flex-shrink: 0;
}
</style>
```

<!-- /aiui-tutorial-step -->

## 验证效果

在效果预览中把鼠标放在站点列表上并向下滚动，应能看到「第四站」，标题「停靠站」仍在原位。

更多属性参见 [ScrollView](/AIUI/components/scroll-view)。
