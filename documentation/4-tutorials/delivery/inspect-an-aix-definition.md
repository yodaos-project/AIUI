# 查看 AIX 包的智能体定义

安装前先核对手上的 AIX 包对应哪个智能体。准备 AIX CLI 和一个已打包的 `hello-aiui.aix`。

## 输出生效的智能体定义

<!-- aiui-tutorial-step -->

在包所在目录运行 `aix show`。命令使用与安装相同的定义解析逻辑，并把 Agent Definition 以 JSON 输出到终端。

```bash
aix show ./hello-aiui.aix
```

<!-- /aiui-tutorial-step -->

## 验证效果

在输出中找到 `agentName` 和 `agentId`，核对名称是否符合预期，并记下标识以便与安装结果对照。

安装与选项参见[命令行工具](/AIUI/tools/cli)。
