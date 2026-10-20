# 实时语音智能

演示 **Audio → VAD → Streaming ASR → Prompt → LLM → UI** 统一实时处理链路的多页示例：麦克风持续采集 PCM，`SpeechRecognitionSession` 按 VAD 静音断句出轮次，每轮转录自动拼上用户选中的提示词送入 `LanguageModel` 流式生成回复。界面文案跟随 `navigator.languages` 自动切换简体中文 / 繁體中文 / English（`lib/i18n.js`，与 navigator-info 示例同一套 BCP 47 / RFC 4647 解析）。

## 页面

- **主页（`pages/prompt-list`，入口）**：「开始会话 / 新建提示词 / 编辑提示词」菜单与当前提示词卡片，标签行以纯文本显示当前提示词的会话设置：「忽略无关对话：开 | 收音：模式 | 当前提示词：」。上下键移动光标，Enter 确认（页面自管理光标，不依赖宿主 Navigation 模式）。
- **选择提示词页（`pages/prompt-select`）**：按使用顺序列出提示词，最近使用的排最前并带「使用中」标签；列表右侧留页边距，条目文本最多两行、超出以「…」截断（JS 按像素预算预截断）；上下键选择，Enter 进入该条的编辑页。
- **提示词编辑页（`pages/prompt-edit`）**：按句编辑——点击/Enter 开始说话，中间结果实时显示，「说完了」提交为一句；之后「删除上句 / 删除提示词 / 保存并返回 / 选择使用」，点击输入框可继续追加。新建模式下「删除提示词」= 放弃草稿返回。听写固定 wearer 拾音；底部设置行改的都是**本条提示词**的会话设置（保存时生效）：左「收音模式」进选择页，右「忽略无关对话」开关（新建默认开）。
- **收音模式页（`pages/mic-mode`）**：四个选项 + 描述——正前方（far-field，仅佩戴者正前方）、360°（omnidirectional，全方向）、佩戴者（wearer，仅佩戴者自己）、蓝牙音频（system-audio，仅手机媒体音）。点击/Enter 选中并返回编辑页，随提示词一起保存，实时对话页按所选提示词的模式收音，默认正前方。
- **实时对话页（`pages/realtime`）**：极简文本舞台。底部单行滚动字幕（跨轮累积、不换行，最新字贴屏幕右缘），上方展示最近 2 轮 AI 回答（新一轮在下、旧一轮上移淡出）；按当前提示词的收音模式持续聆听，VAD 断句即一轮送入 LLM 流式生成；当前提示词的「忽略无关对话」开启时系统提示词注入过滤规则——与提示词无关的轮次模型只回 `⎋`，解析到该符号的回复整轮不上屏；Enter 结束返回。

## 代码结构

- `lib/asr.js` — 语音识别管线，两种模式共用一条管线：
  - **单次听写**（提示词编辑页，默认）：wearer 拾音，无断句；`stop()` 排空音频队列并关闭 writer，触发最终结果。
  - **VAD 连续**（实时页，`{ captureMode, vad: true }`）：`segmentation` 按能力协商（优先 `{ mode: 'vad', silenceDurationMs: 800 }`），writer 保持打开，每条 `isFinal` 即一轮。
  - 采集路线：`getUserMedia`（约束不支持时逐级降级）→ `AudioContext`（请求 16k，高于 16k 时低通 + 整数倍抽取降采样）→ `AnalyserNode` 定窗轮询抽取 s16 PCM → `session.audio.getWriter()` 串行写入。设备 ASR 仅接受 `audio/pcm` 输入，故不走 MediaRecorder。
- `lib/mic-mode.js` — 收音模式（每提示词一个属性）：`promptMicMode()` 读取提示词记录的模式（缺省 far-field）；编辑页与选择页之间经本地存储草稿（`rvi.editMicMode`）回传选择，保存提示词时一并持久化。麦克风三模式经 `microphoneMode` 约束请求（wearer / far-field / omnidirectional）；`system-audio` 经 `captureSource` 请求手机媒体音（不与 echoCancellation 组合，宿主不支持时降级麦克风）；提示词听写不受此设置影响，固定 wearer。
- `lib/ignore-store.js` — 「忽略无关对话」（每提示词一个标志）：`promptIgnoreIrrelevant()` 读取提示词记录的 `ignoreIrrelevant`（仅显式 false 关闭，缺省/新建/预置默认开）；编辑页开关走本地存储草稿（`rvi.editIgnoreIrrelevant`），保存提示词时一并持久化。开启后实时页在系统提示词尾部注入过滤规则（无关轮次只输出 `⎋`），并在流式输出中解析该符号——命中的回复整轮丢弃不上屏（`dropAiRound`）。
- `lib/llm.js` — `LanguageModel` 封装（capabilities/chat 样例模式）：`availability()` 预检 → `create({ initialPrompts })` → `promptStreaming()` + `read()` 轮询；无流式取消 API，轮次串行排队。
- `lib/i18n.js` — 界面多语言（zh-CN / zh-TW / en-US）：`resolveUiLocale()` 从 `navigator.languages` 按 BCP 47 / RFC 4647 解析（中文按 Hans/Hant 推断简繁），`interpolate()` 填充 `{key}` 模板。库层错误以稳定 key 上报（如 `startTimeout`、`llmUnavailable`），页面查文案表映射成当前语言。
- `lib/prompts-store.js` — 提示词本地持久化（`wx.setStorageSync`），首次运行播种预置（两个场景预置，各带 far-field 收音模式 + 忽略无关对话开；旧版本预置在升级播种时清除，用户改过文本的副本保留）。
- `lib/action-feedback.js` — 点击动作锁 + 超过 200ms 才显示的 loading 反馈。
- `app.wxss` — 全局设计变量与共享 loading 样式。

## 真机部署与调试

```bash
# 一次性：眼镜开启开发者模式
adb shell settings put global development_settings_enabled 1

# 打包 + 推送 + 应用（重复执行即覆盖更新）
aix install ./samples/realtime-voice-intelligence

# 打开设备上已安装的入口页（也可对眼镜说「乐奇，打开实时语音智能」）
aix launch-page ./samples/realtime-voice-intelligence
```

调试：`adb logcat -v time | grep -a -i aiui` 观察页面加载与识别会话；`adb shell screencap -p` 截屏核对渲染。

## 项目边界

- ASR 与 LLM 仅使用 AIUI 自身接口（`SpeechRecognitionSession` / `LanguageModel`），不接入外部服务。
- 提示词仅存于本地 `wx.setStorageSync`，不提供导入导出。
- 多语言只覆盖界面文案（跟随 `navigator.languages`）；语音链路——ASR 语言、系统提示词、预置提示词内容——保持 zh-CN。
- 不含 TTS 播报与说话人识别；LLM 上下文在单次实时会话内连续，退出即销毁。
