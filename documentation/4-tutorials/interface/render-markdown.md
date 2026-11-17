# 在页面中显示 Markdown

用一段包含加粗文字和列表的 Markdown 检查页面排版。

## 绑定 Markdown 字符串

<!-- aiui-tutorial-step -->

在已有 AIUI 项目中，将下列示例保存为首页 `pages/index/index.ink`。 把字符串传给 `streamdown` 的 `content` 属性。空行用于分隔段落与列表。

```html
<script setup>
export default {
  data: {
    markdown: '**出门清单**\n\n- 钥匙\n- 水杯'
  }
};
</script>

<page>
  <streamdown content="{{ markdown }}"></streamdown>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

打开效果预览，确认「出门清单」显示为粗体，下方有「钥匙」和「水杯」两个列表项。

更多属性参见 [Streamdown](/AIUI/components/streamdown)。
