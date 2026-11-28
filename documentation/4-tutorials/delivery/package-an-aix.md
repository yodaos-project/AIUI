# 打包 AIX 文件

生成 `hello-aiui.aix`，并检查包内是否包含应用配置和页面文件。沿用[创建第一个 AIUI 智能体](../getting-started/create-first-agent.md)中的项目，使用 Node.js 20 或更高版本。

## 完成示例

<!-- aiui-tutorial-step -->

在 `hello-aiui` 的上一级目录运行以下命令。`-o` 将包写到当前目录。

```bash
npm install -g @yodaos-pkg/aix-cli

aix pack ./hello-aiui -o hello-aiui.aix
aix list ./hello-aiui.aix
```

<!-- /aiui-tutorial-step -->

检查列表中是否包含 `app.json` 和 `pages/index/index.ink`。

需要排除本地文件时，在源码根目录添加 `.aixignore`。参见 [AIX CLI](../../7-tools/cli.md)。

接下来可以[预览打包后的智能体](./preview-a-packaged-agent.md)，或[把它安装到眼镜上](./install-an-aix-on-glasses.md)。
