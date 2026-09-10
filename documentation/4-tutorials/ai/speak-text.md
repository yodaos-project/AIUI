# 播报一段文本

创建 `SpeechSynthesisUtterance` 设置文本和语言，再交给全局 `speechSynthesis` 播放。开始前检查运行时是否提供该能力。

## 完成示例

<!-- aiui-tutorial-step -->

创建 `SpeechSynthesisUtterance` 设置文本和语言，再交给全局 `speechSynthesis` 播放。开始前检查运行时是否提供该能力。

```javascript
if (
  typeof speechSynthesis !== 'undefined' &&
  typeof SpeechSynthesisUtterance !== 'undefined'
) {
  const utterance = new SpeechSynthesisUtterance('欢迎使用 AIUI');
  utterance.lang = 'zh-CN';
  speechSynthesis.speak(utterance);
}
```

<!-- /aiui-tutorial-step -->

音色、语速和事件参见[语音合成](/AIUI/api/ai-speech-synthesis)。

