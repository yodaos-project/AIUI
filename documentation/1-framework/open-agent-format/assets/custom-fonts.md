# 自定义字体

把字体随应用一起打包，就可以给卡片标题、数字或正文换字体。下面用一个 `.woff2` 文件给页面上的一行文字换字体，再预览效果。

## 1. 把字体文件放进项目

在项目根目录下创建 `assets/fonts/`，将字体文件放进去。下面用 `DemoFont-Regular.woff2` 作为示例文件名。使用自己的字体时，在下一步填写实际文件名。

AIUI 0.21 起支持 WOFF2。使用 AIUI 0.20 时，可以改用 `.ttf` 文件，并在下一步填写对应的路径。

```text
agent-app/
├── app.json
├── assets/
│   └── fonts/
│       └── DemoFont-Regular.woff2
└── pages/
    └── index/
        └── index.ink
```

## 2. 在 `app.json` 中登记字体

在项目根目录的 `app.json` 中添加 `fonts`。如果正在修改已有项目，保留原来的 `pages` 和其他配置，把下面的字体条目加入 `fonts` 数组。

```json
{
  "pages": ["pages/index/index"],
  "fonts": [
    {
      "family": "Demo Font",
      "src": "assets/fonts/DemoFont-Regular.woff2"
    }
  ]
}
```

- `family` 是给这个字体起的名字。下一步在 `font-family` 中使用同一个名字。
- `src` 是从项目根目录开始的文件路径。名称和大小写需要与字体文件一致。

## 3. 在页面中使用字体

将下面的内容放进 `pages/index/index.ink`，或把对应的文本和样式加到现有页面。

```html
<script setup>
export default {};
</script>

<page>
  <text class="custom-font">Hello AIUI 123</text>
</page>

<style>
.custom-font {
  display: block;
  padding: 12px;
  font-family: 'Demo Font', sans-serif;
  font-size: 24px;
}
</style>
```

`font-family` 中的 `sans-serif` 是备用字体。如果自定义字体无法加载，或缺少某个字符，文字仍可以用其他字体显示。

## 4. 预览并检查效果

保存文件后，在 AIUI Studio 打开整个项目并预览 `Hello AIUI 123`。如果项目已经打开，重新打开后再检查。想对比默认字体的效果，可以暂时移除刚添加的 `fonts` 条目，重新打开项目，再恢复条目。发布前，在目标设备上用实际文案检查中文、数字等字符是否符合预期。

如果文字仍显示默认字体，检查 `app.json` 中的 `family` 是否与 `font-family` 一致、`src` 是否写对，以及打包时是否包含了字体文件。只有部分字符回退时，检查字体是否包含这些字符。
