# 语音识别

语音识别 (ASR) 用于把用户实时说出的内容转换成文本，适合语音输入、语音命令和对话式交互等场景。

在 AIUI 中，语音识别通常是语音交互链路的第一步：先识别用户说了什么，再把文本交给业务逻辑或大语言模型处理。

## 适用场景

- 语音输入框
- 语音问答
- 语音控制命令
- 需要边听边处理的交互流程

## 基本用法

通过 `SpeechRecognition` 创建识别实例：

```javascript
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
  const best = event.results[0][0];
  console.log('识别结果:', best.transcript);
  console.log('置信度:', best.confidence);
};

recognition.onerror = (event) => {
  console.error('识别错误:', event.error, event.message);
};

recognition.start();
```

## 常用方法

- **`start()`**：开始一轮识别。
- **`stop()`**：请求结束识别并产出最终结果。
- **`abort()`**：立即中止识别。

## 使用建议

- 开始识别前，确保界面处于可交互状态。
- 把"正在聆听""识别中""识别完成"等状态明确展示给用户。
- 如果自行录音并通过 `SpeechRecognitionSession` 识别，在录音和识别服务都支持时优先使用 Opus，以减少音频数据量和传输带宽。格式选择和完整示例参见[语音识别 API 参考](/AIUI/api/ai-speech-recognition)。

## 继续阅读

- **[语音播报](/AIUI/guide/basic-ai-tts)**：查看如何把结果播报给用户。
- **[大语言模型](/AIUI/guide/basic-ai-llm)**：查看如何把识别结果交给模型处理。
- **[语音识别 (API 参考)](/AIUI/api/ai-speech-recognition)**：查看完整 API 参考文档。
