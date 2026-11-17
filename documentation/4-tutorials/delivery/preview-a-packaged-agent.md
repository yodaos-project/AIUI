# 在浏览器里预览 AIX 包

在浏览器中打开已打包的智能体，确认交付的 AIX 能进入预期首页。准备 AIX CLI 和 `hello-aiui.aix`。

## 启动产物预览

<!-- aiui-tutorial-step -->

在包所在目录执行命令。CLI 启动本地预览服务并打印访问地址。保持终端运行，把地址复制到浏览器中打开。

```bash
aix preview ./hello-aiui.aix
```

<!-- /aiui-tutorial-step -->

## 验证效果

检查浏览器是否显示该包中的首页。如果首页有按钮或输入框，试一次已知的操作。预览完成后，在运行 CLI 的终端按 `Ctrl+C` 停止服务。

安装与选项参见[命令行工具](/AIUI/tools/cli)。
