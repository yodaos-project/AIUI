# AIUI Studio 快速入门

在 AIUI Studio 创建或导入智能体，然后在浏览器中确认首页能打开。开始前请准备 Rokid 账号。已有项目时，直接选择对应的导入方式。

## 1.什么是 AIUI Studio

AIUI Studio 在浏览器中运行。你可以在工作台编辑智能体，在到眼镜上测试前先预览界面。

## 2.登陆 AIUI Studio

打开 [AIUI Studio](https://aiui.rokid.com/)，登录 Rokid 账号。登录后确认能进入工作台，并在左侧看到当前账号的智能体列表。

## 3.在 AIUI Studio 中创建 AIUI 项目

根据源码的位置选择一种创建方式。

| 手头的项目 | 创建方式 |
| --- | --- |
| 还没有项目 | **对话创建** |
| 电脑上已有项目 | **本地导入** |
| 项目存放在 GitHub | **GitHub 导入** |

## 创建方式一：通过 AI Coding 创建

选择**对话创建**。首次使用 **AIUI CODING** 时，下载并启用内置的 `aiui-dev` 技能。

![AIUI Studio 工作台中的 AIUI CODING 设置](../../image/quickstart/1.png)

## 创建方式二：本地导入 AIUI 项目

已有项目时，找到包含 `app.json` 的文件夹。需要新建项目时，准备 Node.js 20 或更高版本及 npm，在存放项目的目录中运行以下命令。

```bash
npm create @yodaos-pkg/aiui-agent@latest my-agent
```

在 Studio 选择**本地导入**，选中 `my-agent` 文件夹或现有项目的根目录。如果浏览器请求访问文件夹，授予所选文件夹的访问权限。

![AIUI Studio 的本地项目导入入口](../../image/quickstart/4.png)

## 创建方式三：GitHub 导入

选择 **GitHub 导入**，输入仓库地址，选择分支或标签，再指定包含 `app.json` 的目录。也可以从 [AIUI 示例项目](https://github.com/yodaos-project/AIUI/tree/main/samples) 中选择一个项目导入。

![AIUI Studio 的 GitHub 项目导入界面](../../image/quickstart/5.png)

## 4.使用 AIUI CODING 生成与修改项目

在 **AIUI CODING** 中，每次描述一项改动。第一次可以让它显示一个从 0 开始的计数，再加一个按钮，每点击一次就加 1。需要指定修改位置时，可以附上相关文件。

![AIUI CODING 的指令输入区](../../image/quickstart/6.png)

打开**代码**页签，检查 AIUI CODING 改动了哪些文件。

## 5. AIUI 智能体网页端模拟调试

在**真机模拟**中选择**效果预览**，确认能看到首页。如果做了计数器，点击按钮，确认计数从 0 变为 1。

![Studio 浏览器预览中的智能体页面](../../image/quickstart/9.png)

用预览控件测试智能体实际用到的输入，例如语音或镜腿操作。切换光照设置，检查文字是否清晰。如果某一步失败，查看控制台或网络日志。

## 6. AIUI 智能体真机调试

在 Rokid AI App 中连接 Rokid 眼镜，再将刚预览的版本同步到眼镜。

1. 在 Studio 打开**构建与提审**，执行 **AIX 打包**，等待上传完成。保存智能体资料，手机 App 才能下载新版本。
2. 在 Rokid AI App 中进入**设置 → 开发者选项 → AIUI**，点击**更新眼镜资源包**，等待出现**智能体资源包下载成功**。
3. 说出智能体名称并打开它，检查首屏是否包含刚才的改动，再操作一遍主要功能。

![Rokid AI App 中的眼镜资源包更新入口](../../image/quickstart/11.png)

如果打开的还是旧版本，确认 Studio 已上传并保存最新版本，再更新一次眼镜资源包。更多检查项见[真机调试](../debug/real_device_debug.md)。

## 7.查看和编辑 AIUI 智能体代码

打开**代码**页签，在文件树中选择 `app.json`，从 `pages` 找到首页路径。例如，路径为 `pages/index/index` 时，打开 `pages/index/index.ink`。修改一段页面上显示的文字，再打开**效果预览**，确认新文字已经显示。

![Studio 代码页签中的项目文件树](../../image/quickstart/13.png)

包含首页、天气 Widget 和后台任务的项目可以这样组织。

```text
agent-app/
├── AGENTS.md
├── app.json
├── app.js
├── pages/
│   └── index/
│       └── index.ink
├── widgets/
│   └── weather/
│       └── index.ink
├── workers/
│   └── sync.js
└── assets/
```

- `AGENTS.md` 描述智能体的身份、职责和行为边界。
- `app.json` 注册 Page、Widget 和 Agent Worker，也可以设置全局窗口等选项。
- `app.js` 存放应用级逻辑，例如智能体启动时要执行的操作。
- `pages/` 存放页面和交互逻辑。在 `.ink` 文件中，`<page>` 定义界面，`<script setup>` 保存页面数据和处理函数，`<style>` 定义样式。Page 也可以由同名的 `.wxml`、`.wxss`、`.js` 和 `.json` 文件组成。
- `widgets/` 存放天气卡片之类的小型独立界面。每个 Widget 使用一个 `.ink` 文件。
- `workers/` 存放 Agent Worker，也就是在后台执行任务且没有界面的脚本。
- `assets/` 存放图片、音频等资源。可复用的界面组件可以放在 `components/`。

初始项目可能只有首页。需要 Widget、Worker、组件或资源时，再添加对应目录。

## 8.提审与发布上架到 Rokid Ai 智能体商店

在眼镜上验证主要流程后，打开**构建与提审**。填写智能体名称、应用类别、功能介绍和开场白，更换默认图标，勾选用到的权限并写明各自用途。上传 3 至 5 个预览文件，其中至少有 1 张图片和 1 个视频。

保存资料，确认当前版本，再点击**提交审核**。在智能体列表查看审核状态。如果未通过，根据审核原因修改后再次提交。

![构建与提审页签中的资料表单](../../image/quickstart/14.png)

字段长度、素材格式和审核标准见[发布要求](../bundle/publish.md)。
