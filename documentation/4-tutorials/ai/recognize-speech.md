# 识别一次语音输入

简单交互可以使用 `SpeechRecognition`。注册结果和错误事件后开始识别，并在页面生命周期结束时停止。

## 完成示例

<!-- aiui-tutorial-step -->

简单交互可以使用 `SpeechRecognition`。注册结果和错误事件后开始识别，并在页面生命周期结束时停止。

```javascript
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
  const best = event.results[0][0];
  console.log(best.transcript, best.confidence);
};

recognition.onerror = (event) => {
  console.error(event.error, event.message);
};

recognition.start();
```

<!-- /aiui-tutorial-step -->

流式音频和能力协商参见[语音识别](/AIUI/api/ai-speech-recognition)。
