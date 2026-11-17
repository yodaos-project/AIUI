# 为语音播报显示同步字幕

让页面字幕随语音播报移动。使用支持流式语音生成和字幕的运行环境。

## 在字幕变化时更新页面

<!-- aiui-tutorial-step -->

将完整示例保存为项目中的 `pages/index/index.ink`。用 `synthesize()` 请求句子级字幕，并创建 `SpeechAudioPlayer`。在播放前注册 `cuechange` 监听器。每次字幕变化时读取 `activeCue.text`，没有当前字幕时清空文字。

```html
<script setup>
export default {
  data: { loading: false, caption: '', error: '' },

  async speakWithCaptions() {
    if (this.data.loading) return;
    this.releasePlayback();
    this.setData({ loading: true, caption: '', error: '' });

    const controller = new AbortController();
    this.playbackController = controller;

    try {
      const utterance = new SpeechSynthesisUtterance('欢迎来到车站。下一班列车即将进站。');
      utterance.voice = 'female-tianmei';
      const task = await speechSynthesis.synthesize(utterance, {
        subtitles: 'sentence',
        signal: controller.signal
      });
      // 语音生成错误可能在播放期间到达。
      const finished = task.finished.then(() => true, () => false);
      if (controller.signal.aborted) return;

      const player = new SpeechAudioPlayer(task, { trackMode: 'hidden' });
      this.player = player;
      player.textTrack.addEventListener('cuechange', () => {
        if (this.player === player) {
          this.setData({ caption: player.activeCue?.text ?? '' });
        }
      });
      player.play();

      if (!(await finished)) {
        throw new Error('Speech synthesis failed');
      }
    } catch {
      if (!controller.signal.aborted) {
        this.releasePlayback();
        this.setData({ error: '无法播放带字幕的语音' });
      }
    } finally {
      if (!this.unloaded) this.setData({ loading: false });
    }
  },

  releasePlayback() {
    const player = this.player;
    this.player = null;
    player?.destroy();
    this.playbackController?.abort();
    this.playbackController = null;
  },

  onUnload() {
    this.unloaded = true;
    this.releasePlayback();
  }
};
</script>

<page>
  <view>
    <button bindtap="speakWithCaptions" disabled="{{ loading }}">播放并显示字幕</button>
    <text>{{ caption }}</text>
    <text>{{ error }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「播放并显示字幕」，确认播报第一句时出现第一句字幕，开始播报下一句时字幕也随之更新。页面上的文字应跟随实际播放进度。

接口和当前能力参见[语音播报](/AIUI/api/ai-speech-synthesis)。
