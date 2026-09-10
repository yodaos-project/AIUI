# 打包 AIX 文件

安装 AIX CLI 后，在智能体源码目录外执行 `aix pack`。通过 `-o` 明确输出文件名，并用 `aix list` 检查包内文件。

## 完成示例

<!-- aiui-tutorial-step -->

安装 AIX CLI 后，在智能体源码目录外执行 `aix pack`。通过 `-o` 明确输出文件名，并用 `aix list` 检查包内文件。

```bash
npm install -g @yodaos-pkg/aix-cli

aix pack ./hello-aiui -o hello-aiui.aix
aix list ./hello-aiui.aix
```

<!-- /aiui-tutorial-step -->

需要排除本地文件时，在源码根目录添加 `.aixignore`。参见 [AIX CLI](/AIUI/guide/bundle/cli)。

