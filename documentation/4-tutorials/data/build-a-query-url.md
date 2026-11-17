# 为 URL 添加查询参数

生成一个带搜索词的 URL，让搜索词里的空格和 `&` 保持在同一个参数值中。示例只显示构造好的地址。

## 用 searchParams 写入搜索词

<!-- aiui-tutorial-step -->

将示例保存为项目首页 `pages/index/index.ink`。把原始搜索词交给 `searchParams.set()`，再从 `href` 读取编码后的地址。已有的 `page` 参数会保留。

```html
<script setup>
const term = '茶 & 咖啡';
const url = new URL('https://example.com/search?page=1');
url.searchParams.set('q', term);

export default {
  data: { address: url.href }
};
</script>

<page>
  <text>{{ address }}</text>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

打开预览，确认 URL 仍含有 `page=1`，搜索词中的 `&` 显示为 `%26`。将搜索词改成 `C++` 并重载，确认两个加号都编码为 `%2B`。

完整接口参见 [URL](/AIUI/api/network-url)。
