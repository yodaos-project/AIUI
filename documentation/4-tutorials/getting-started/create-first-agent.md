# 创建第一个 AIUI 智能体

这个教程会创建一个最小 AIUI 项目，并用 `.ink` 单文件页面显示一条欢迎消息。

## 创建项目

<!-- aiui-tutorial-step -->

运行脚手架并进入项目目录。脚手架会生成 `app.json`、`app.js`、`AGENTS.md` 和页面目录。

```bash
npm create @yodaos-pkg/aiui-agent@latest hello-aiui
cd hello-aiui
```

<!-- /aiui-tutorial-step -->

## 注册首页

<!-- aiui-tutorial-step -->

`app.json` 声明智能体包含哪些 Page。这里仅注册一个首页，路径不包含文件扩展名。

```json
{
  "pages": [
    "pages/index/index"
  ]
}
```

<!-- /aiui-tutorial-step -->

## 编写页面

<!-- aiui-tutorial-step -->

创建 `pages/index/index.ink`。一个 `.ink` 文件可以同时包含页面逻辑、结构和样式，适合快速完成第一个可运行界面。

```html
<script setup>
export default {
  data: {
    message: 'Hello, AIUI!'
  }
};
</script>

<page>
  <view class="page">
    <text class="title">{{ message }}</text>
  </view>
</page>

<style>
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.title {
  font-size: 28px;
  font-weight: 600;
}
</style>
```

<!-- /aiui-tutorial-step -->

现在可以将项目导入 AIUI Studio，通过效果预览检查页面。继续阅读[项目结构](/AIUI/guide/structure)，了解 Page、Widget 和 Agent Worker 的组织方式。
