# 逐段显示语言模型回复

在模型生成回复的过程中，将已经收到的文本显示在页面上。

## 将收到的文本追加到回复

<!-- aiui-tutorial-step -->

在已有 AIUI 项目中，将下列示例保存为首页 `pages/index/index.ink`。 在已配置语言模型的运行环境中，`promptStreaming()` 返回可逐次读取的流。每次 `read()` 返回的 `value` 是新增的文本，将它追加到现有回复中。收到 `done: true` 后结束读取。示例在请求结束或页面卸载时销毁会话。

```html
<script setup>
export default {
  data: { generating: false, answer: '', status: '' },

  async generate() {
    if (this.data.generating) return;
    this.setData({ generating: true, answer: '', status: '正在生成' });

    try {
      const availability = await LanguageModel.availability();
      if (this.unloaded) return;
      if (availability !== 'available') {
        this.setData({ status: '语言模型不可用' });
        return;
      }

      const session = await LanguageModel.create();
      if (this.unloaded) {
        session.destroy();
        return;
      }

      this.session = session;
      const stream = session.promptStreaming('用三句话介绍骑行时要带的物品。');
      let answer = '';

      while (!this.unloaded) {
        const { value, done } = await stream.read();
        if (this.unloaded || done) break;
        answer += value ?? '';
        this.setData({ answer });
      }

      if (!this.unloaded) this.setData({ status: '生成完成' });
    } catch {
      if (!this.unloaded) this.setData({ status: '生成失败' });
    } finally {
      this.session?.destroy();
      this.session = null;
      if (!this.unloaded) this.setData({ generating: false });
    }
  },

  onUnload() {
    this.unloaded = true;
    this.session?.destroy();
    this.session = null;
  }
};
</script>

<page>
  <view>
    <button disabled="{{ generating }}" bindtap="generate">生成回复</button>
    <text>{{ status }}</text>
    <text>{{ answer }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「生成回复」。模型分多段返回时，页面应在显示「生成完成」前逐段增加文本。生成结束后再次点击，页面会从空白开始显示新回复。

会话和流的完整接口参见 [LanguageModel](/AIUI/api/ai-language-model)。
