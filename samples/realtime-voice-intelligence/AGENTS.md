# Agent: 实时语音智能

- **Version**: 1.6.0
- **Description**: 多页示例，演示 Audio → VAD → Streaming ASR → Prompt → LLM → UI 的统一实时链路：麦克风 PCM 采集，SpeechRecognitionSession VAD 断句，选中提示词组装，LanguageModel 流式回复。

## Pages

- `pages/prompt-list`（入口）：菜单「开始会话 / 新建提示词 / 编辑提示词」+ 当前提示词卡（标签右侧收音模式标签）；上下键移动光标、Enter 确认。
- `pages/prompt-select`：按使用顺序列出提示词（「使用中」标签），Enter 进编辑。
- `pages/prompt-edit`：语音听写按句编辑（中间结果实时显示，固定 wearer 拾音），保存 / 删除 / 选择使用；底部设置行 = 收音模式入口 + 忽略无关对话开关。
- `pages/mic-mode`：收音模式选择页——正前方（far-field）/ 360°（omnidirectional）/ 佩戴者（wearer）/ 蓝牙音频（system-audio）四选项 + 描述，点击/Enter 选中返回。
- `pages/realtime`：按所选收音模式持续聆听（默认 far-field），VAD 断句即一轮送 LLM 流式生成；「忽略无关对话」开启时注入 `⎋` 过滤规则并丢弃命中回复；底部单行滚动字幕 + 最近两轮回答；Enter 结束。

## Capabilities

- Permissions: `RECORD_AUDIO`
- 语音识别：`SpeechRecognitionSession`（`getUserMedia` PCM 直采 `audio/pcm`；`getCapabilities()` 协商 segmentation）
- 收音模式：`lib/mic-mode.js` 持久化选择——`microphoneMode`（wearer / far-field / omnidirectional）或 `captureSource: 'system-audio'`（手机媒体音，不与 echoCancellation 组合，不支持时降级）
- 大模型：`LanguageModel`（`initialPrompts` 固化系统提示词，`promptStreaming()` 流式读取）
- 持久化：`wx.setStorageSync`（提示词列表与选中项）
- 多语言：`lib/i18n.js` 按 `navigator.languages` 解析界面语言（zh-CN / zh-TW / en-US）；库层错误以稳定 key 上报，页面映射文案
- 按键：页面级 `onKeyUp`（方向键移动光标、Enter 确认，接管处 `preventDefault()`）

## Privacy

- 提示词仅保存在设备本地存储，不上传。
- 麦克风音频仅送入设备端 ASR 会话完成识别，不做其他存储。
