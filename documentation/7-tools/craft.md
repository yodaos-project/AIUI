# Craft 平台

## 1.什么是 Craft 平台
Craft 是面向 AIUI 与 Ink 工程的一体化工作台，帮助开发者在一个界面内完成项目导入、文件浏览、代码编辑与页面预览，模拟调试

Craft 属于 AIUI 开发工具链的一部分，不替代 AIUI 框架本身，

- AIUI 负责页面结构、组件体系与智能体应用开发模型。
- Craft 负责把工程导入、文件编辑、页面发现与运行预览串联起来。

访问地址：[https://js.rokid.com/craft](https://js.rokid.com/craft)

## 2.初始化AIUI项目
1.在设备终端（terminal）输入
```plain
npm create @yodaos-pkg/aiui-agent@latest my-agent
```

```plain
cd my-agent #进入名为 my-agent 的文件夹
ls #列出当前文件夹里的文件和子文件夹
```

![image.png](../image/craft/01.png)

2.文件所在文件位置
![image.png](../image/craft/02.png)

## 3.使用 Craft（AIUI Web IDE）导入 AIUI 项目
1.进入 Craft（AIUI Web IDE）：[https://js.rokid.com/craft?lang=zh-CN](https://js.rokid.com/craft?lang=zh-CN)

![image.png](../image/craft/03.png)

2.使用本地文件夹/本地 .aix 文件/ GitHub 子目录 导入 AIUI

![image.png](../image/craft/04.png)

## 4.Craft Web 端调试
点击运行智能体进行 Web 端调试，
![image.png](../image/craft/05.png)
在 Web IDE 中可模拟从唤醒、语言识别、大语言模型最后到语音播报到全过程，右侧有模拟眼镜的返回、单击、前后滑动的按钮
![image.png](../image/craft/06.png)

## 5.在 Craft 中使用 AIUI Coding Agent 进行开发
1.Craft 中默认免费提供了 LLM（DeepSeek V4 Pro），可以下载 Skill 进行辅助开发，下载完成记得点击启用
![image.png](../image/craft/07.png)

2.也可替换自己的模型进行开发
![image.png](../image/craft/08.png)

3.在 AIUI Code 主页面使用
![image.png](../image/craft/09.png)

## 6.在 AIUI Studio 中新建 AIUI 智能体
登陆 AIUI Studio（中国站）：[https://aiui.rokid.com/space](https://aiui.rokid.com/space)

新建 AIUI 智能体的三种方式：

| 创建方式 | 适用场景 | 结果 |
| :---: | :---: | :---: |
| 对话创建 | 从零开始构建智能体 | 进入 AIUI CODING，通过自然语言生成完整工程 |
| 本地导入 | 本机已有 AIUI 工程 | 授权系统文件夹后导入代码 |
| GitHub 导入 | 代码位于远程仓库 | 按仓库地址、分支或标签导入指定目录 |

**⚠️只需选择一种方式，进行创建AIUI项目，新手推荐使用“对话创建” AIUI 项目**

**【方式一】通过 AI Coding 创建（通过AI创建项目）**
AIUI CODING 是主要开发界面，初次使用需要下载并启用 AIUI Studio 内置的aiui-dev Skill

![image.png](../image/craft/10.png)

你可以持续用自然语言补充功能、调整界面或排查问题，AI 会读取工程上下文并直接修改项目文件。

**【方式二】本地导入 AIUI 项目（通过npm 创建AIUI脚手架）**
（1）在设备终端（terminal）/命令提示符（cmd）输入

```plain
npm create @yodaos-pkg/aiui-agent@latest my-agent
```

```plain
cd my-agent  #进入名为 my-agent 的文件夹
ls           #列出当前文件夹里的文件和子文件夹
```

![image.png](../image/craft/01.png)

（2）找到文件所在文件位置

![image.png](../image/craft/02.png)

（3）点击“本地导入”，选择本地对应的文件夹

![image.png](../image/craft/13.png)

**【方式三】GitHub 导入**
AIUI Sample项目：[https://github.com/jsar-project/AIUI/tree/main/samples](https://github.com/jsar-project/AIUI/tree/main/samples)

![image.png](../image/craft/14.png)

## 7.将 Craft 中的 AIUI 项目绑定到 AIUI 智能体上
1.Craft 编辑器设置——本地管理——绑定对应 AIUI 智能体
![image.png](../image/craft/15.png)

![image.png](../image/craft/16.png)

2.将 AIUI 项目打包上传到 AIUI Studio 中
![image.png](../image/craft/17.png)

3.依据 AIUI 项目情况设置对应的权限，右侧可以填写对 AIUI 的描述
![image.png](../image/craft/18.png)

## 8.眼镜真机调试
⚠️  AIUI 项目需要绑定 AIUI Agent 并进行打包上传才可以进行真机调试

Rokid Ai APP 中设置——开发者——更新眼镜资源包

![image.png](../image/craft/19.png)

看到“智能体资源包下载成功”提示后，通过语义命中智能体，完整体验真实交互链路

例如：乐奇，打开xxx智能体

![image.png](../image/craft/20.png)

## 9.发布提审上架到 Rokid Ai 智能体商店中
在 [AIUI Studio](https://aiui.rokid.com/) 的“构建与提审”栏中填写基本信息、权限依赖和预览素材，然后保存资料并提交审核

![image.png](../image/craft/21.png)

| 字段 | 填写要求 | 内容要求 |
| --- | --- | --- |
| 智能体名称 | 必填 | 不超过 20 个字符；应准确表达功能，不得与其他智能体重名 |
| 图标 | 必填 | 必须更换图标图标，不可使用默认图标 |
| 版本号 | 系统自动生成和递增 | 开发者无法编辑 |
| Agent ID | 系统生成 | 请妥善保留 |
| 应用类别 | 必选 | 应与智能体实际功能一致 |
| 功能介绍 | 必填 | 不超过 500 个字符；简洁说明真实能力和适用场景 |
| 开场白 | 必填 | 建议控制在 300 字以内；用于首次进入时引导用户，不与功能介绍重复 |
| 智能体图标 | 必填 | 内容清晰、方向正确，并与名称和功能相关 |
| 权限申请 | 依据实际情况勾选 | 如实勾选网络、摄像头、麦克风、扬声器并说明具体用途 |
| Rokid 账号信息等权限 | 依据实际情况勾选 | 使用 Rokid 账号信息等个人信息时必须提供 |
| 预览素材 | 必填 | 上传3～5个文件，且至少包含 1 张图片和 1 个视频 |


确认资料和当前版本无误后，点击“提交审核”

审核状态：

- 审核中：等待平台审核，期间可在智能体列表查看状态。
- 审核拒绝：根据拒绝原因修改代码或资料，重新打包、保存并提交。
- 审核通过：智能体进入可发布状态，并可在 Rokid AI App 的智能体商店中展示和使用。

提交前建议再次确认，真机核心流程已通过、权限声明与代码一致、资料无夸大内容、图片与视频数量和格式符合要求。
