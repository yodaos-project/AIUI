# 代码构成与目录结构

创建 AIUI 智能体后，你会得到一个包含配置、界面和代码的项目。这篇文章带你认识常见的文件和目录，方便你在需要修改智能体时知道从哪里开始。

不需要一开始就记住所有名称。先看看一个基础项目是什么样子，再按需要了解其他部分。

## 先看一个基础项目

使用脚手架创建的项目包含类似下面的文件：

```text
my-agent/
├── AGENTS.md
├── app.json
├── app.js
├── package.json
└── pages/
    └── index/
        └── index.ink
```

这些文件各有分工：

- **`AGENTS.md`**：说明智能体是谁、能做什么，以及它的指令和行为边界。
- **`app.json`**：声明项目有哪些页面，以及窗口等全局配置。
- **`app.js`**：处理智能体启动等应用级逻辑。
- **`package.json`**：保存项目及依赖的信息。
- **`pages/index/index.ink`**：定义用户看到的页面和页面交互。

例如，要调整天气助手的职责，可以先查看 `AGENTS.md`；要修改显示在页面上的内容，可以从 `pages/` 中对应的页面开始。

## 页面放在哪里？

**Page（页面）**承载用户看到的界面和操作流程。项目通常把页面放在 `pages/` 目录，并在 `app.json` 中声明页面路径。

页面可以使用一个 `.ink` 文件，也可以使用同一路径下的 `.wxml`、`.wxss`、`.js` 和 `.json` 多个文件。如果同一路径同时存在这两种页面，AIUI 会优先加载 `.ink` 文件。

对于刚开始学习的读者，`.ink` 文件比较容易阅读：页面的逻辑、内容和样式可以放在同一个文件里。

### 认识 `.ink` 文件

一个 `.ink` 文件可以包含以下部分：

- `<script def>`：页面或 Widget 的配置。
- `<script setup>`：数据和交互逻辑，例如用户操作后要做什么。
- `<page>` 或 `<widget>`：用户看到的界面结构。一个文件只能选择其中一种根节点。
- `<style>`：界面的样式，例如文字大小。

下面是一个简单页面：它显示一段文字，点击文字后，内容会变成“已更新”。

```html
<script setup>
export default {
  data: { message: 'Hello AIUI' },
  handleTap() {
    this.setData({ message: '已更新' });
  },
};
</script>

<page>
  <text bindtap="handleTap">{{message}}</text>
</page>

<style>
text {
  font-size: 32rpx;
}
</style>
```

这个例子没有单独配置 `<script def>`：你可以先关注页面显示什么，以及点击后发生了什么。

## 还有哪些常见目录和文件？

随着功能增加，项目也可以包含下面这些部分：

- **`widgets/`**：存放 Widget（小尺寸独立界面），例如快速查看天气或设备状态的界面。Widget 使用 `.ink` 文件，需要在 `app.json` 中声明；具体配置见 [Widget 开发](/AIUI/framework/open-agent-format-widget)。
- **`workers/`**：存放 Agent Worker（不显示界面的后台脚本）。它可以处理一次任务，或在页面、Widget 打开期间维护共享任务；具体用法见 [Agent Worker 开发](/AIUI/framework/open-agent-format-agent-worker)。
- **`components/`**：存放可以在界面中复用的组件，例如状态卡片。
- **`assets/`**：存放图片、音频等资源。
- **`app.wxss`**：定义页面和 Widget 可以共用的样式。

下面是包含这些部分的项目示例：

```text
agent-app/
├── AGENTS.md
├── app.json
├── app.js
├── app.wxss
├── pages/
│   └── home/
│       └── index.ink
├── widgets/
│   └── weather/
│       └── index.ink
├── workers/
│   └── sync.js
├── components/
│   └── status-card/
│       └── index.ink
└── assets/
    └── weather.png
```

Widget 和 Agent Worker 是可选的，不需要时可以不创建对应目录或配置。目录名称也可以根据项目调整，但 `app.json` 中声明的路径要与实际文件位置一致。

## 接下来做什么？

- 想动手创建项目？从 [AIUI Studio 快速入门](./quickstart/quickstart.md)开始。
- 想了解项目配置？阅读 [app.json](/AIUI/framework/open-agent-format-app-json)。
- 想了解图片和音频等文件？阅读[资源（Assets）](/AIUI/framework/open-agent-format-assets)。
- 想添加小尺寸界面或后台任务？分别阅读 [Widget 开发](/AIUI/framework/open-agent-format-widget)和 [Agent Worker 开发](/AIUI/framework/open-agent-format-agent-worker)。
