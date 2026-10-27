# 代码构成与目录结构

一个 AIUI 智能体可以同时包含完整页面、便于快速查看的 Widget，以及不显示界面的 Agent Worker 后台任务。页面可以使用传统多文件结构，也可以使用更紧凑的 `.ink` 单文件结构；Widget 使用 `.ink` 文件。

## 项目根目录

- `AGENTS.md`：描述智能体的身份、能力、指令和行为边界。
- `app.json`：声明 Page、Widget、Agent Worker 和全局窗口配置。
- `app.js`：处理应用级生命周期和共享逻辑。
- `app.wxss`：定义 Page 和 Widget 可以复用的全局样式。

## Page 目录（`pages/`）

Page 用于承载完整交互流程，并参与页面导航。它可以采用两种结构：

- 单文件：`pages/home/index.ink`
- 多文件：同一路径下的 `.wxml`、`.wxss`、`.js` 和 `.json`

当同一路径同时存在多文件入口和 `.ink` 文件时，会优先加载 `.ink` 文件。

## Widget 目录（`widgets/`）

Widget 是独立的小尺寸界面，适合展示天气、设备状态和快捷操作。每个 Widget 使用一个 `.ink` 文件，并需要在 `app.json.widgets` 中声明路径和尺寸类别：

```json
{
  "widgets": [
    { "path": "widgets/weather/index", "family": "1x2" }
  ]
}
```

`family` 当前支持 `1x1` 和 `1x2`。声明的路径必须存在对应的 `.ink` 文件。

## Agent Worker 目录（`workers/`）

Agent Worker 是不显示界面的后台脚本，适合在多个 Page 或 Widget 打开期间维护一个共享任务，例如同步数据或保持共享连接。入口文件使用 `.js` 或 `.ts`，并在 `app.json.agentWorkers` 中声明：

```json
{
  "agentWorkers": [
    {
      "name": "sync",
      "script": "workers/sync.js",
      "trigger": { "type": "open" },
      "lifetime": "instant"
    }
  ]
}
```

## 典型目录结构

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

目录名不是固定要求，但应与 `app.json` 中填写的相对路径保持一致。Widget 和 Agent Worker 都是可选的，不使用时可以省略对应配置与目录。

## `.ink` 单文件结构

一个 `.ink` 文件通常包含：

- `<script def>`：页面或 Widget 配置。
- `<script setup>`：数据、生命周期和事件处理逻辑。
- `<page>` 或 `<widget>`：界面结构；同一个文件只能选择一种根节点。
- `<style>`：当前入口的样式。

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

## 独立单文件项目

从 AIUI 0.20 起，支持独立源码的预览环境可以直接打开一个 `.ink` 文件作为完整的单页面项目，无需 `app.json` 或 `app.js`。文件包含一个 `<page>`，可选 `<script def>`、`<style>` 和 `<script setup>`；纯静态页面可以省略脚本，TypeScript 使用 `<script setup lang="ts">`。

```html
<style>
view { padding: 24px; }
</style>

<page>
  <view>
    <text>计数：{{count}}</text>
    <button bindtap="increment">加一</button>
  </view>
</page>

<script setup>
export default {
  data: { count: 0 },
  increment() {
    this.setData({ count: this.data.count + 1 });
  },
};
</script>
```

源码也可以逐步到达：先提供样式，再提供页面内容，可以较早显示静态预览。生成期间不执行脚本、自定义组件脚本或事件处理函数；数据绑定暂留空，条件和列表等待激活。生成结束且完整源码校验通过后，Page 只激活一次；不完整或错误源码不会作为可交互页面运行。

该模式使用敏感能力时动态申请权限，查询本身不弹窗，详见[权限状态](/AIUI/api/permissions)。模块仅从已提供的内置模块和预置包解析，不读取设备任意文件；外部资源应使用显式 URL。独立项目没有 Widget 或 Agent Worker 入口；需要这些能力或打包资源时，使用完整项目结构。

## 继续阅读

- [资源（Assets）](/AIUI/framework/open-agent-format-assets)
- [Widget 开发](/AIUI/framework/open-agent-format-widget)
- [Agent Worker 开发](/AIUI/framework/open-agent-format-agent-worker)
- [app.json](/AIUI/framework/open-agent-format-app-json)
