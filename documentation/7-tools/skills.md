# Skills

AIUI Skills 用于为智能体补充面向特定开发任务的上下文、规范与最佳实践，帮助模型在编写页面、调用 API、处理样式和遵循设计系统时输出更准确的结果。

## 当前可用 Skill

### aiui-dev

- 仓库地址：<https://github.com/jsar-project/AIUI/tree/main/skills/aiui-dev>
- 本地路径：`/skills/aiui-dev`

`aiui-dev` 是面向 AIUI 应用开发的专用 Skill，适用于以下场景：

- 编写 AIUI 页面与交互逻辑
- 查询 AIUI / `wx` 相关 API 用法
- 参考组件、WXSS 与设计系统约束
- 在智能体生成代码时提供更稳定的开发上下文

## 包含内容

`aiui-dev` 当前包含以下能力说明文档：

- `SKILL.md`：Skill 的定位、适用场景与总览说明
- `apis.md`：AIUI 运行时 API 总索引
- `apis-wx.md`：`wx` 相关 API 参考
- `apis-device.md`：设备能力相关 API 参考
- `apis-media.md`：媒体能力相关 API 参考
- `apis-canvas.md`：Canvas 相关 API 参考
- `components.md`：内置组件说明
- `wxss.md`：WXSS 与样式能力说明
- `design-system-green.md`：绿色单色显示设备设计规范

## 使用建议

- 当你希望智能体生成 AIUI 页面代码时，优先引入 `aiui-dev`
- 当你需要确认组件、样式或 API 是否受支持时，以该 Skill 中的说明为准
- 当你开发面向 Rokid 等目标设备的界面时，结合设计系统文档统一视觉与交互约束
