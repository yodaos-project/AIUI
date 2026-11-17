# 检查智能体源码

在打包前运行静态检查，找出 `app.json` 中指向不存在文件的页面入口。使用支持 `check` 命令的 AIX CLI，并准备一个已有的 AIUI 项目。

## 运行静态检查

<!-- aiui-tutorial-step -->

从项目的上一级目录执行命令，将 `./hello-aiui` 换成你的项目目录。如果想练习如何读诊断，可以先临时将 `app.json` 中一条已有的 `pages` 路径改为 `pages/missing/index`。

```bash
aix check ./hello-aiui
```

<!-- /aiui-tutorial-step -->

## 验证效果

如果页面入口指向不存在的文件，检查输出会指出该路径。将 `pages` 中的值改回实际页面路径（例如 `pages/index/index`），保留不带扩展名的写法，再运行同一条命令确认该错误消失。存在错误时，命令以非零状态退出。

安装方式参见[命令行工具](/AIUI/tools/cli)。
