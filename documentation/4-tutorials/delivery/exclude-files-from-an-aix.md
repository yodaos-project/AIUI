# 从 AIX 包中排除本地文件

让项目中的本地笔记留在源码目录，不随 AIX 包交付。准备已安装 AIX CLI 的电脑和一个项目目录 `hello-aiui`，在项目内创建练习文件 `notes/draft.txt`。

## 添加打包忽略规则

<!-- aiui-tutorial-step -->

在项目根目录的 `.aixignore` 中加入这条规则。开头的 `/` 将匹配范围限定在项目根目录，结尾的 `/` 表示目录。

```text
/notes/
```

<!-- /aiui-tutorial-step -->

## 重新打包并列出内容

<!-- aiui-tutorial-step -->

从项目的上一级目录执行以下命令，将新包输出到源码目录外。

```bash
aix pack ./hello-aiui -o hello-aiui-clean.aix
aix list ./hello-aiui-clean.aix
```

<!-- /aiui-tutorial-step -->

## 验证效果

确认 `aix list` 仍列出 `app.json` 和页面文件，包中没有 `notes/draft.txt`。回到项目目录，原来的笔记文件应仍然存在。

安装与选项参见[命令行工具](/AIUI/tools/cli)。
