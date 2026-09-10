# 根据状态显示内容

使用 `ink:if`、`ink:elif` 和 `ink:else` 为页面提供加载、空数据和完成状态。三个分支需要相邻书写。

## 完成示例

<!-- aiui-tutorial-step -->

使用 `ink:if`、`ink:elif` 和 `ink:else` 为页面提供加载、空数据和完成状态。三个分支需要相邻书写。

```html
<page>
  <text ink:if="{{ loading }}">正在加载...</text>
  <text ink:elif="{{ items.length === 0 }}">暂无数据</text>
  <view ink:else>已加载 {{ items.length }} 项</view>
</page>
```

<!-- /aiui-tutorial-step -->

继续阅读[条件渲染](/AIUI/framework/wxml/conditional-rendering)。

