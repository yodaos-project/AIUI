# 将一段录音转成文字

把已有录音转写成文字。准备一段几秒钟、有清晰人声的 WAV，保存为 `assets/recording.wav`。语音识别服务需要支持该文件的音频格式。

## 把录音写入识别会话

<!-- aiui-tutorial-step -->

将完整示例保存为项目中的 `pages/index/index.ink`。导入录音后，把它作为 `Blob` 写入 `session.audio`。用 `close()` 通知会话音频已写完。在 `result` 事件中，从累计结果读取已确认的句子并显示。

```html
<script setup>
import recording from '../../assets/recording.wav';

export default {
  data: { busy: false, transcript: '', status: '' },

  async transcribe() {
    if (this.data.busy) return;
    this.setData({ busy: true, transcript: '', status: '正在转写' });
    let writer;

    try {
      const session = new SpeechRecognitionSession({
        lang: 'zh-CN',
        audio: { mimeType: 'audio/wav' }
      });
      writer = session.audio.getWriter();
      this.writer = writer;

      session.onresult = (event) => {
        if (this.writer !== writer) return;
        const sentences = [];
        for (let index = 0; index < event.results.length; index++) {
          const result = event.results[index];
          if (result.isFinal && result[0]) {
            sentences.push(result[0].transcript);
          }
        }
        this.setData({ transcript: sentences.join(' ') });
      };
      session.onerror = (event) => {
        if (this.writer === writer) {
          this.setData({ status: `转写失败：${event.error}` });
        }
      };

      await writer.write(recording);
      await writer.close();

      if (this.writer === writer && this.data.status === '正在转写') {
        this.setData({ status: this.data.transcript ? '转写完成' : '未识别到文字' });
      }
    } catch (error) {
      await writer?.abort(error).catch(() => {});
      if (!this.unloaded) this.setData({ status: '转写失败，请检查音频和服务配置' });
    } finally {
      this.writer = null;
      if (!this.unloaded) this.setData({ busy: false });
    }
  },

  onUnload() {
    this.unloaded = true;
    const writer = this.writer;
    this.writer = null;
    writer?.abort().catch(() => {});
  }
};
</script>

<page>
  <view>
    <button bindtap="transcribe" disabled="{{ busy }}">转写录音</button>
    <text>{{ status }}</text>
    <text>{{ transcript }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「转写录音」，确认页面上的文字与录音内容相符。这个示例直接读取文件，运行时无需打开麦克风。

事件和返回值参见[语音识别](/AIUI/api/ai-speech-recognition)。
