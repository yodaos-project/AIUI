# AIUI

**为带显示屏的 AI 眼镜构建可交互的智能体。**

这里汇集了 Rokid Glasses AIUI 开发所需的文档、项目模板、设计规范、示例和 AI 编码技能。

[English](./README.md) · [快速开始](./documentation/0-guide/quickstart/quickstart.md) · [Benchmark](./bench/README.zh-CN.md) · [开发文档](./documentation/) · [示例项目](./samples/) · [Awesome AIUI](https://github.com/jsar-project/awesome-aiui)

## 快速开始

```bash
npm create @yodaos-pkg/aiui-agent@latest my-agent
```

模板包含 `app.js`、`app.json`、`AGENTS.md`，以及位于 `pages/index/index.ink` 的 Ink 页面。按照[快速开始指南](./documentation/0-guide/quickstart/quickstart.md)，可继续使用 Craft 开发、上传 AIUI Studio，并在眼镜上调试。

## AIUI 编码基准测试

[AIUI Coding Benchmark](./bench/README.zh-CN.md) 用于衡量 AI 编码智能体**创建、修改、修复和迁移 AIUI 项目**的能力。当前 50 道任务覆盖页面状态与事件、Widget、Worker、地理位置、存储、浮层、语音事件、迁移及平台约束，也可作为 [`aiui-dev` 技能](./skills/aiui-dev/SKILL.md)的回归测试集。

每道任务提供需求描述和初始工作区。评分器检查完成后的源码、清单及部分事件处理行为：只有必需项与回归项全部通过、且没有违反约束时，任务才算**解决**。总分是解决任务数占已评分任务数的比例。基准测试不验证真实眼镜上的渲染和运行效果。

使用 Node.js 20 或更新版本，在仓库根目录无需安装依赖即可查看任务：

```bash
npm run bench:test
npm run --silent bench -- list
npm run --silent bench -- inspect 002-create-counter
```

工作区准备、结果评分、全量运行及模型对比方法详见 [Benchmark 指南](./bench/README.zh-CN.md)。

## 探索平台

| 入口 | 内容 |
| --- | --- |
| [开发文档](./documentation/) | 中英文入门指南、组件、API、教程、工具和版本记录。 |
| [示例项目](./samples/) | 可运行的界面、设备 API、游戏、音频、扫码和蓝牙等项目。 |
| [设计系统](./design/) | 单色显示设备的视觉规范和[绿色显示预览](./design/monochrome/preview-green.html)。 |
| [开发技能](./skills/aiui-dev/SKILL.md) | Ink、组件、API 和项目结构的 AI 编码指引。 |
| [云端集成](./packages/cloud-integration/) | 对接第三方智能体与 Rokid Glasses 通知的 Node.js 包。 |
| [编码基准测试](./bench/README.zh-CN.md) | 50 道任务、评分工具及 AIUI 编码智能体评估流程。 |

可以从[能力展示示例](./samples/capabilities/)开始，再按需查看[陀螺仪诊断](./samples/gyroscope-test/)、[设备信息](./samples/navigator-info/)、[扫码](./samples/scanner/)和[语音合成](./samples/tts/)示例。

## 用 AI 编码助手开发

```bash
npx skills add https://github.com/jsar-project/AIUI/tree/main/skills/aiui-dev
```

[云端集成技能](./skills/aiui-cloud-integration/SKILL.md)介绍通知流程；[云 API 技能](./skills/aiui-cloud-apis/SKILL.md)提供云端 API 使用指引。

## 仓库导航

| 目录 | 用途 |
| --- | --- |
| [`documentation/`](./documentation/) | 产品与开发文档 |
| [`samples/`](./samples/) | 可运行的示例智能体 |
| [`design/`](./design/) | 显示设备设计规范 |
| [`packages/create-aiui-agent/`](./packages/create-aiui-agent/) | 项目脚手架 CLI |
| [`packages/cloud-integration/`](./packages/cloud-integration/) | 服务端云端集成 |
| [`skills/`](./skills/) | AI 编码指引与参考资料 |
| [`bench/`](./bench/) | AIUI 编码基准测试 |

## 参与和反馈

[提交缺陷](https://github.com/jsar-project/AIUI/issues/new?template=bug_report.zh-CN.yml) · [提出功能建议](https://github.com/jsar-project/AIUI/issues/new?template=feature_request.zh-CN.yml) · [探索社区生态](https://github.com/jsar-project/awesome-aiui)

本项目采用 Apache 2.0 许可证。
