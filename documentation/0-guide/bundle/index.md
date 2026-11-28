# 打包与分发

将项目打包成 `.aix` 文件后，先检查包内文件，再预览、安装到眼镜或提交审核。

准备 Node.js 20 或更高版本及 npm，在 `my-agent` 项目的上一级目录打开终端。如果项目名称不同，将命令中的 `my-agent` 换成实际名称。

```bash
npm install -g @yodaos-pkg/aix-cli
aix pack ./my-agent -o my-agent.aix
aix list ./my-agent.aix
aix preview ./my-agent.aix
```

检查列表中是否包含 `app.json` 和已注册的页面文件。打开预览命令打印的地址，确认包里的智能体能显示预期的首页。按 `Ctrl+C` 停止预览。

要验证真机表现，可以[把包安装到眼镜上](../../4-tutorials/delivery/install-an-aix-on-glasses.md)。准备上架后，再[通过 AIUI Studio 提交审核](./publish.md)。

要了解包格式，参阅[什么是 AIX](./aix.md)。要查询命令选项，参阅[命令行参考](../../7-tools/cli.md)。
