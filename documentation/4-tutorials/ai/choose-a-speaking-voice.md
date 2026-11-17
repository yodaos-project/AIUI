# 为同一句播报选择音色

为同一句播报提供两个可选音色。运行环境需要支持示例中使用的两个音色 ID。

## 为播报请求指定音色 ID

<!-- aiui-tutorial-step -->

将完整示例保存为项目中的 `pages/index/index.ink`。每次点击都创建一条新的 `SpeechSynthesisUtterance`。将按钮上的音色 ID 赋给 `utterance.voice`，然后调用 `speak()`。

```html
<script setup>
export default {
  previewVoice(event) {
    const utterance = new SpeechSynthesisUtterance('欢迎使用语音预览。');
    utterance.voice = event.currentTarget.dataset.voice;
    speechSynthesis.speak(utterance);
  }
};
</script>

<page>
  <view>
    <button data-voice="female-tianmei" bindtap="previewVoice">试听甜美女声</button>
    <button data-voice="male-qn-jingying" bindtap="previewVoice">试听成熟男声</button>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击第一个按钮，等播报结束后点击第二个按钮。两次应听到相同的句子，并能辨别音色变化。

接口和当前能力参见[语音播报](/AIUI/api/ai-speech-synthesis)。
