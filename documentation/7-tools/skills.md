# Skills

AIUI Skills 为编码助手提供开发指引、API 参考和示例，帮助你开发 AIUI 智能体、排查问题、优化 AIX 包体，以及接入 Rokid 云服务。

## 按任务选择 Skill

| Skill | 适用任务 |
| --- | --- |
| [`aiui-dev`](https://github.com/yodaos-project/AIUI/blob/main/skills/aiui-dev/SKILL.md) | 创建或修改 AIUI 工程，编写 Page、Widget 或 Agent Worker，查阅组件、WXSS、运行时 API 及单色和全彩眼镜的设计规范。 |
| [`aiui-debug`](https://github.com/yodaos-project/AIUI/blob/main/skills/aiui-debug/SKILL.md) | 结合日志、工程源码、运行时版本和设备信息，排查页面、交互、存储、网络或媒体问题。 |
| [`aiui-optimize`](https://github.com/yodaos-project/AIUI/blob/main/skills/aiui-optimize/SKILL.md) | 检查 `.aix` 包的实际体积和文件构成，优化发布内容及图片、音频资源，并验证重新打包后的大小。 |
| [`aiui-cloud-apis`](https://github.com/yodaos-project/AIUI/blob/main/skills/aiui-cloud-apis/SKILL.md) | 在 AIUI 应用内通过内置 `open` 模块的 `createOpenAPI()` 调用云 API，例如读取账号资料、调用灵珠智能体或读取缓存消息。 |
| [`aiui-cloud-integration`](https://github.com/yodaos-project/AIUI/blob/main/skills/aiui-cloud-integration/SKILL.md) | 在服务端通过 `@yodaos-pkg/cloud-integration` 或 HTTP 缓存一次性消息、发送 Rokid 眼镜通知，或配置点击通知后打开的 AIUI 页面。 |

## 安装和使用

如果你的编码助手支持 Skills，可以在工程根目录运行 `npx skills`。下面的命令会安装面向日常开发的 `aiui-dev`。

```bash
npx skills add https://github.com/yodaos-project/AIUI --skill aiui-dev
```

将 `aiui-dev` 替换为表中的其他 Skill 名称，并按提示选择你使用的编码助手。工具版本要求和安装选项见 [Skills CLI 文档](https://github.com/vercel-labs/skills#install-a-skill)。

如果你在 AIUI Studio 中使用 AIUI Coding，可以在编辑器中下载并启用内置的 `aiui-dev`。操作步骤见 [AIUI Editor](/AIUI/tools/editor)。

开始任务时，在提示词里写明 Skill 名称，附上相关材料，并说明你希望助手确认什么。

> 使用 `aiui-debug` 排查为什么这个页面在眼镜上打开后没有响应。根据附件里的日志和页面代码还原事件顺序，并说明还需要在设备上验证什么。
