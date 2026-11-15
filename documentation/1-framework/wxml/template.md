# 模板与单文件区域更新

自定义组件使用 `<template>` 描述组件内部显示的内容。需要复用界面时，请创建[自定义组件](/AIUI/framework/open-agent-format-custom-components)；当前不支持用 `<template name="...">` 和 `<template is="...">` 定义并调用可复用片段。

## 在单文件界面中预留更新区域

单文件 Source 是直接提供整个页面源码的运行方式。当它通过支持增量更新的入口加载时，可以先显示占位内容，再用后续片段替换其中一个区域。例如，天气结果还没有到达时先显示等待提示：

```html
<script setup>
export default { data: { weather: '晴，22°C' } };
</script>

<page>
  <view>
    <?start name="forecast">
    <text>正在获取天气…</text>
    <?end>
  </view>
</page>
```

接着提交下面的更新片段：

```html
<template for="forecast">
  <?start name="forecast">
  <text>{{weather}}</text>
  <?end>
</template>
```

先提供页面和脚本，再提供 `<template for="forecast">` 片段；分次提交时使用相同的应用标识 `appId`。片段完整到达时，`forecast` 区域会替换成新内容；示例在新内容里重新放置标记，因此之后可以再次更新该区域。

## 更新时注意什么

- 页面实例和已有数据保持不变，`onLoad`、`onShow` 和 `onReady` 不会因区域更新而重复调用。
- 区域内的节点会重新创建；需要操作新节点时重新查询。区域外的组件和状态继续保留。
- 新内容使用页面已有的数据、方法和已声明的组件，不能通过更新片段添加脚本或声明组件。
- 这项功能只适用于支持区域更新的单文件 Source 输入，不适用于目录工程或 `.aix` 包中的普通页面。普通数据变化仍使用 `setData()`。

组件里的 `<template>` 用于描述组件自身的界面；插槽用于接收组件使用者提供的内容。它们与这里的区域更新是不同用法。
