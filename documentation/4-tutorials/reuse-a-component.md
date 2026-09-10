# 复用自定义组件

在 Page 的 `<script def>` 中通过 `usingComponents` 注册组件，然后像内置组件一样在模板中使用。

## 完成示例

<!-- aiui-tutorial-step -->

在 Page 的 `<script def>` 中通过 `usingComponents` 注册组件，然后像内置组件一样在模板中使用。

```html
<script def>
{
  "usingComponents": {
    "status-card": "components/status-card"
  }
}
</script>

<page>
  <status-card title="运行状态" value="正常"></status-card>
</page>
```

<!-- /aiui-tutorial-step -->

属性、事件和组件生命周期参见[自定义组件](/AIUI/framework/open-agent-format-custom-components)。

