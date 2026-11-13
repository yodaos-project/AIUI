# 用户界面（UI）开发

界面是用户看到和操作的部分。以天气助手为例，城市、温度、状态提示和按钮都可以放在界面中，让用户一眼看到结果，并继续查看详情。

AIUI 使用 WXML 描述界面结构，使用 WXSS 定义样式。它们可以分别写在文件中，也可以与页面逻辑一起放在 `.ink` 文件里。

## 先看一个天气页面

下面的例子展示城市和温度。点击按钮后，页面更新提示文字，演示数据和界面如何配合；例子使用固定数据，不会查询实时天气。

```html
<script setup>
export default {
  data: {
    city: '杭州',
    temperature: 26,
    hint: '点击按钮查看提示'
  },

  showHint() {
    this.setData({ hint: '出门前请留意天气变化' });
  }
};
</script>

<page>
  <view class="card">
    <text class="title">{{ city }}天气</text>
    <text>{{ temperature }}°C</text>
    <text>{{ hint }}</text>
    <button bindtap="showHint">查看提示</button>
  </view>
</page>

<style>
.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
}
</style>
```

`<page>` 里的内容描述界面：`view` 组织内容，`text` 显示文字，`button` 接收操作。`{{ city }}` 等写法将页面数据绑定到界面；按钮通过 `bindtap` 调用逻辑中的 `showHint()`，再由 `setData()` 更新提示。

`<style>` 中的 WXSS 控制布局和文字样式。例如，`.card` 定义排列方式和内边距，`.title` 定义标题的文字样式。

## WXML 能做什么？

除了展示和绑定数据，WXML 还可以根据状态显示内容、展示列表，以及绑定用户事件：

- 用 `{{ }}` 显示数据或设置组件属性。
- 用 `ink:if`、`ink:elif` 和 `ink:else` 根据条件选择显示内容。
- 用 `ink:for` 展示列表，并通过 `item` 和 `index` 访问当前项。
- 用 `bindtap` 等属性关联事件处理函数。

例如，天气请求期间可以显示“加载中”，成功后再显示结果。详细写法见 [WXML 介绍](/AIUI/framework/wxml-intro)。

## WXSS 能做什么？

WXSS 用于设置颜色、文字、间距和布局，写法与 CSS 类似。你可以使用类选择器、`class` 和 `style`，也可以用 `@import` 引入样式文件。

WXSS 支持响应式单位 `rpx`：它根据屏幕宽度适配，屏幕宽度定义为 `480rpx`。请结合实际容器和设备验证显示效果。更多用法见 [WXSS 介绍](/AIUI/framework/wxss-intro)。

## Page 和 Widget 怎么选择？

Page 适合完整的页面交互；Widget 是适合快速查看或操作的小尺寸独立界面。它们都可以使用数据绑定、组件、事件和样式，但有各自的入口和生命周期。

在 `.ink` 文件中，Page 使用 `<page>` 根节点，Widget 使用 `<widget>`；同一个文件不能同时包含两者。Widget 的完整示例见 [Widget 开发](/AIUI/framework/open-agent-format-widget)。

界面需要支持不同显示设备时，可继续阅读[全彩眼镜适配](./full-color.md)，并在目标设备上检查文字、颜色和操作体验。
