# 快速开始

为 Rokid 眼镜创建一个页面，先在浏览器中查看效果。在本地开发需要 Node.js 20 或更高版本及 npm。

## 创建并预览第一个智能体

在存放项目的目录打开终端。创建项目、安装 AIX 命令行工具，再启动预览。

```bash
npm create @yodaos-pkg/aiui-agent@latest my-agent
cd my-agent
npm install -g @yodaos-pkg/aix-cli
aix preview .
```

打开终端打印的地址。首页应显示 `Hello AIUI!`。点击**点击我**，页面会短暂显示另一条问候语。如果打开了其他页面，检查命令是否在 `my-agent` 目录运行，以及 `app.json` 的 `pages` 是否包含 `pages/index/index`。按 `Ctrl+C` 停止预览。

要修改问候语，编辑 `pages/index/index.ink` 中 `data` 下的 `greeting`。重新启动预览，确认新文字已显示。

也可以[直接在浏览器中用 AIUI Studio 创建项目](./quickstart.md)。

## 下一步

- [构建交互计数器](../../4-tutorials/interface/build-interactive-counter.md)，练习更新页面数据。
- [使用 AIUI Studio 在眼镜上调试](../debug/real_device_debug.md)，或[通过命令行安装 AIX 包](../../4-tutorials/delivery/install-an-aix-on-glasses.md)。
- [打包并发布智能体](../bundle/index.md)。
- 选择交互方式。从[对话中的卡片](./first-chat.md)或[沉浸式页面](./first-immersive.md)入手。
- 了解 [AIUI 能做什么](./intro.md)以及 [AIUI 项目的组织方式](../structure.md)。
