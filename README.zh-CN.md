# AIUI 开发工具与技能

[English](./README.md)

本仓库提供用于构建 **AIUI**（Artificial Intelligence User Interface）应用的开发工具、CLI 以及 AI Agent 技能。AIUI 是一个面向带显示屏 AI 眼镜的 Agent Runtime。

你还可以通过 [Awesome AIUI](https://github.com/jsar-project/awesome-aiui) 探索更完整的 AIUI 生态资源，包括相关项目、工具与示例。

## 🚀 快速开始

### 创建新的 AIUI Agent

你可以使用官方 CLI 工具快速创建一个新的 AIUI Agent 项目。运行下面的命令并按提示操作：

```bash
npm create @yodaos-pkg/aiui-agent@latest my-agent
```

该命令会生成一个开箱即用的 AIUI 项目模板，其中包括：
- 用于全局配置的 `app.js` 和 `app.json`
- 用于声明 Agent 能力的 `AGENTS.md`
- 一个现代化的单文件组件（SFC）页面 `index.ink`

完整的 Craft 开发、上传 AIUI Studio 与眼镜真机调试流程，请参阅 [`快速入门指南`](./documentation/0-guide/quickstart/quickstart.md)。

## 🧪 示例

[`samples/`](./samples/) 目录包含可运行的示例项目，用于展示 AIUI 的功能特性，并为常见 UI 模式提供参考实现。

当前仓库提供以下示例：

- [`samples/capabilities/`](./samples/capabilities/)：完整的能力演示应用，可集中了解页面结构、静态资源、辅助模块和多个功能演示。
- [`samples/gyroscope-test/`](./samples/gyroscope-test/)：陀螺仪测试真机诊断示例，基于 `AbsoluteOrientationSensor` 验证姿态四元数、采样频率、轴向映射和回中误差。

[`samples/capabilities/`](./samples/capabilities/)  示例的主要目录如下：

- `pages/`：包含多种 AIUI 能力与 UI 模式的页面示例
- `assets/`：示例中使用的静态资源，例如图片、SVG 和音频文件
- `lib/`：供示例页面复用的辅助模块

[`samples/capabilities/pages/`](./samples/capabilities/pages/) 中具有代表性的示例包括：
- `layout`、`grid`、`position`：布局与定位相关示例
- `image`、`list`、`input_textarea`：常见 UI 基础能力示例
- `canvas`、`canvas_api`、`chart`、`lottie`：绘制与视觉内容示例
- `media_query`、`css_vars`、`filter`、`transform`：样式与响应式行为示例

## 📚 文档

[`documentation/`](./documentation/) 目录包含 AIUI 官方文档，提供中英文两套内容，覆盖快速上手、框架概念、内置组件、运行时与类 Web API、设计规范、开发工具以及版本变更说明。

- `0-guide/`：快速开始、运行时基础、配置、调试、性能以及 AIUI 应用结构说明
- `1-framework/`：框架基础，包括项目结构、配置、WXML 和 WXSS
- `2-components/`：内置组件参考，如 `view`、`text`、`image`、`input`、`swiper`、`canvas` 等
- `3-api/`：框架、AI、媒体、设备、网络、存储以及 Web/微信兼容 API 参考
- `4-tutorials/`：按分类组织的基础示例教程及 `tutorials.json` 配置
- `5-cloud/`：第三方 Agent 与 Rokid Glasses 通知的云端集成文档
- `6-design/`：交互与视觉设计规范
- `7-tools/`：CLI、Craft 与调试工具文档
- `8-changelog/`：最新版本说明与变更历史

## 🎨 设计系统

[`design/`](./design/) 目录存放 AIUI 的视觉设计语言规范，按**显示类型**分目录组织：

- [`design/monochrome/`](./design/monochrome/) ——**单色显示**硬件的规范。当前激活的 [`green`](./design/monochrome/design-system-green.md) 变体面向 RokidGlasses1 / RokidGlasses2，硬件只能在纯黑之上再现单一的绿色通道。涵盖颜色（同一种绿色在纯黑之上分四个透明度层级）、排版、间距、圆角、描边宽度、组件外观以及“应做与不应做”清单。
  - [`design-system-green.md`](./design/monochrome/design-system-green.md) ——完整的 token 规范。
  - [`preview-green.html`](./design/monochrome/preview-green.html) ——自包含、可直接在浏览器打开的可视化预览，无需构建。
- `design/fullcolor/` ——**预留**，面向全彩显示硬件，尚未编写。

> 本设计系统**目前仅适用于单绿色单色显示设备**。`design/` 目录的结构在保持当前 green 规范稳定的同时，为规划中的全彩版本预留了位置。

同一份单绿规范也会随下方的 `aiui-dev` 技能一同打包分发，因此 AI 编码助手在生成 AIUI 代码时会自动对齐这些 token。

## 🤖 AI Agent 技能

我们提供了内置说明文档和上下文文件，帮助 LLM（大语言模型）或 AI 编码助手更高效地编写 AIUI 代码。

### 通过 CLI 安装

你可以使用 `npx skills add` 命令轻松将 AIUI 开发技能安装到你的项目中。该命令会拉取所需的上下文文件，并使其可供你的 AI 编码助手使用：

```bash
npx skills add https://github.com/jsar-project/AIUI/tree/main/skills/aiui-dev
```

如果你希望安装某个已发布版本的 skill，而不是最新的 `main` 分支，可以将 `main` 替换为对应的 tag 名称：

```bash
npx skills add https://github.com/jsar-project/AIUI/tree/v0.1.0/skills/aiui-dev
```

- **`aiui-dev` Skill**：位于 [`skills/aiui-dev/SKILL.md`](./skills/aiui-dev/SKILL.md)，该文档包含完整的 API 参考、项目结构指引以及 `.ink` SFC 规范。你可以将该文件提供给 AI 助手，使其具备开发 AIUI 应用的“技能”。
- **`aiui-cloud-integration` Skill**：位于 [`skills/aiui-cloud-integration/SKILL.md`](./skills/aiui-cloud-integration/SKILL.md)，用于指导第三方 Agent 通过 npm 包或直接使用 HTTP/`curl` 集成 Rokid Glasses 云端通知。

## 反馈

如果你想提交功能建议或报告缺陷，请使用 GitHub issue 模板：

- [功能建议](https://github.com/jsar-project/AIUI/issues/new?template=feature_request.zh-CN.yml)
- [缺陷反馈](https://github.com/jsar-project/AIUI/issues/new?template=bug_report.zh-CN.yml)

## 仓库结构

```text
.
├── documentation/                  # AIUI 官方文档（中文 / 英文）
├── design/
│   ├── README.md                       # 设计语言索引（按显示类型）
│   ├── monochrome/                     # 单色显示规范
│   │   ├── README.md                   # 单色变体说明（目前为 green）
│   │   ├── design-system-green.md      # AIUI 单绿色 token 规范
│   │   └── preview-green.html          # 单绿系统的可视化预览
│   └── fullcolor/                      # 预留 —— 全彩显示规范
├── packages/
│   ├── cloud-integration/    # Rokid Glasses 云端通知集成 npm 包
│   └── create-aiui-agent/    # 用于创建 AIUI Agent 项目的 npm CLI
├── samples/
│   ├── capabilities/         # 可运行的 AIUI capabilities 应用与功能演示
│   └── gyroscope-test/       # 陀螺仪测试与绝对方向传感器真机诊断示例
├── skills/
│   ├── aiui-cloud-integration/ # Rokid Glasses 云端通知集成技能
│   └── aiui-dev/               # AI Agent 技能文档（SKILL.md）
└── .github/workflows/        # 自动化每日构建与发布工作流
```

## 📄 许可证

Apache License 2.0
