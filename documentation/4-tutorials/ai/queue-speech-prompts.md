# 按顺序播报多条提示

点击一次按钮，依次播报两条提示。运行环境需要提供语音播报。

## 将两条提示加入播报队列

<!-- aiui-tutorial-step -->

将完整示例保存为项目中的 `pages/index/index.ink`。用 `speak(utterance, "enqueue")` 将每条提示按调用顺序添加到共享队列。`speak()` 返回后就可以添加下一条，队列会安排播放顺序。

```html
<script setup>
export default {
  speakInstructions() {
    const first = new SpeechSynthesisUtterance('第一步，将水倒进杯子。');
    const second = new SpeechSynthesisUtterance('第二步，盖好杯盖。');
    first.voice = 'female-tianmei';
    second.voice = 'female-tianmei';

    speechSynthesis.speak(first, 'enqueue');
    speechSynthesis.speak(second, 'enqueue');
  }
};
</script>

<page>
  <button bindtap="speakInstructions">播放两条提示</button>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「播放两条提示」，先听到「第一步」，等这条播完再听到「第二步」。交换两个 `speak()` 调用的位置，重载后确认播报顺序也随之交换。

接口和当前能力参见[语音播报](/AIUI/api/ai-speech-synthesis)。
