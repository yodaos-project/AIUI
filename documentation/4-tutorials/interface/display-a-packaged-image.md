# 显示项目内的图片

把一张 PNG 放进智能体项目，然后在页面上显示这张图片。

## 引用包内图片

<!-- aiui-tutorial-step -->

在项目根目录新建 `assets/`，把任意 PNG 保存为 `assets/logo.png`。将下列示例保存为首页 `pages/index/index.ink`。 `src` 开头的 `/` 表示应用包根目录。`aspectFit` 会在指定大小的区域内完整显示图片并保持比例。

```html
<script setup>
export default {};
</script>

<page>
  <image class="logo" src="/assets/logo.png" mode="aspectFit"></image>
</page>

<style>
.logo {
  width: 160px;
  height: 96px;
}
</style>
```

<!-- /aiui-tutorial-step -->

## 验证效果

打开效果预览，确认图片完整显示。换成一张较高的 PNG 并重载预览，图像仍应保持原有比例。

不同资源的路径规则参见[资源](/AIUI/framework/open-agent-format-assets)。
