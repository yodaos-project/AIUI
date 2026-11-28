# 创建第一个 AIUI 智能体

创建一个在浏览器中显示 `Hello, AIUI!` 的页面。开始前请准备 Node.js 20 或更高版本和 npm。

## 创建项目

<!-- aiui-tutorial-step -->

在存放项目的目录中运行以下命令。第一条命令会创建 `hello-aiui`，其中已包含应用配置和首页。

```bash
npm create @yodaos-pkg/aiui-agent@latest hello-aiui
cd hello-aiui
```

<!-- /aiui-tutorial-step -->

## 注册首页

<!-- aiui-tutorial-step -->

确认 `app.json` 的 `pages` 列表中包含 `pages/index/index`，路径不带文件扩展名。保留脚手架生成的其他字段。

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

将 `pages/index/index.ink` 的内容替换为以下代码。`<script setup>` 定义消息，`<page>` 显示消息，`<style>` 将消息放在页面中央。

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

## 预览页面

<!-- aiui-tutorial-step -->

在 `hello-aiui` 目录中安装 AIX CLI 并启动预览。保持预览运行，在浏览器中打开终端打印的地址。

```bash
npm install -g @yodaos-pkg/aix-cli
aix preview .
```

<!-- /aiui-tutorial-step -->

确认页面中央显示 `Hello, AIUI!`。如果显示了其他页面，检查当前目录和 `app.json` 中的 `pages` 配置。预览结束后，在终端按 `Ctrl+C` 停止服务。

## 添加交互

接着[构建交互计数器](../interface/build-interactive-counter.md)，让页面上的数值随按钮点击更新。
