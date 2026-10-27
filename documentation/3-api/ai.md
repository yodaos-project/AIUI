# AI

AIUI 面向 AI 应用开发，常见能力可以分成三类：听懂用户说的话、把结果播报出来，以及直接调用大语言模型完成理解、推理和生成。

如果你要构建一个完整的语音智能体，通常会把这三类能力组合起来使用：

- **语音识别**：把用户说的话转成文本。
- **大语言模型**：理解上下文并生成回复。
- **语音播报**：把生成结果再读给用户听。

## 与当前 Agent 会话协作

通过 [Agent 会话](/AIUI/api/ai-agent-session) 发布背景上下文、发送用户消息和卡片，以及调用远端工具和读取资源。

这些会话能力与直接创建 `LanguageModelSession` 分开；应用状态和卡片不会自动成为模型输入。

## 如何选择

- 想让应用“听懂”用户输入：使用 `语音识别`
- 想让应用把文本“说出来”：使用 `语音播报`
- 想让应用完成问答、总结、生成、推理：使用 `大语言模型`

## 简单示例

例如，先判断模型能力是否可用，再发起一次提问：

```javascript
const status = await LanguageModel.availability();

if (status === 'available') {
  const session = await LanguageModel.create();

  const result = await session.prompt('请用一句话介绍 AIUI');
  console.log(result);
}
```

## 继续阅读

- **[语音识别](/AIUI/api/ai-speech-recognition)**：查看如何采集用户语音并接收识别结果。
- **[语音播报](/AIUI/api/ai-speech-synthesis)**：查看如何把文本合成为播报语音。
- **[大语言模型](/AIUI/api/ai-language-model)**：查看如何创建模型会话、请求回复和读取流式输出。
- **[微信小程序兼容 API](/AIUI/api/weixin-compatible-apis)**：查看微信小程序兼容语音接口。
