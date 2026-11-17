# 实时显示语音识别文字

说话时就在页面上显示当前句子的识别文字。需要可用的麦克风、录音授权和支持中间结果的语音识别服务。

## 声明录音权限

<!-- aiui-tutorial-step -->

在 `app.json` 的 `permissions` 数组中加入 `RECORD_AUDIO`，保留项目原有配置。打开页面后，按平台提示允许使用麦克风。

```json
{
  "permissions": ["RECORD_AUDIO"]
}
```

<!-- /aiui-tutorial-step -->

## 用最新结果更新文字

<!-- aiui-tutorial-step -->

将完整示例保存为项目中的 `pages/index/index.ink`。在点击回调中调用 `recognition.start()`。启用 `interimResults` 后，服务可以多次修订同一句。每次取累计列表中的最后一项并替换显示，用 `isFinal` 标记这句是否已经定稿。

```html
<script setup>
export default {
  data: { listening: false, transcript: '', status: '' },

  startListening() {
    if (this.recognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = true;
    this.recognition = recognition;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (!result?.[0]) return;

      this.setData({
        transcript: result[0].transcript,
        status: result.isFinal ? '已确认' : '识别中'
      });
    };

    recognition.onerror = (event) => {
      this.setData({ status: `识别失败：${event.error}` });
    };

    recognition.onend = () => {
      this.recognition = null;
      this.setData({ listening: false });
    };

    this.setData({ listening: true, transcript: '', status: '请说话' });
    try {
      recognition.start();
    } catch {
      this.recognition = null;
      this.setData({ listening: false, status: '无法开始识别' });
    }
  },

  onUnload() {
    const recognition = this.recognition;
    if (!recognition) return;

    this.recognition = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
  }
};
</script>

<page>
  <view>
    <button bindtap="startListening" disabled="{{ listening }}">开始识别</button>
    <text>{{ transcript }}</text>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「开始识别」，慢慢说一句较长的话。说完前应能看到带有「识别中」标记的文字，结果修订时原来的文字会被替换。服务确认句子后，标记变为「已确认」。

事件和返回值参见[语音识别](/AIUI/api/ai-speech-recognition)。
