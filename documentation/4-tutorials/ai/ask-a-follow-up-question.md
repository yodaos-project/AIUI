# 向语言模型追问

让模型根据上一轮提供的信息回答追问。运行环境需要配置语言模型。

## 在同一个会话里发送两轮消息

<!-- aiui-tutorial-step -->

将完整示例保存为项目中的 `pages/index/index.ink`。等待第一条 `prompt()` 完成后，再用同一个 `session` 发送第二条。会话会把已完成的对话作为后续请求的上下文。

```html
<script setup>
export default {
  data: { busy: false, answer: '' },

  async ask() {
    if (this.data.busy) return;
    this.setData({ busy: true, answer: '' });
    let session;

    try {
      session = await LanguageModel.create();
      if (this.unloaded) return;
      this.session = session;
      await session.prompt('请记住：虚构航班 Demo 100 的登机口是 H42。');
      if (this.unloaded) return;
      const answer = await session.prompt('刚才那班航班在哪个登机口？只回答登机口编号。');
      if (!this.unloaded) this.setData({ answer });
    } catch {
      if (!this.unloaded) this.setData({ answer: '模型请求失败' });
    } finally {
      session?.destroy();
      this.session = null;
      if (!this.unloaded) this.setData({ busy: false });
    }
  },

  onUnload() {
    this.unloaded = true;
    this.session?.destroy();
  }
};
</script>

<page>
  <view>
    <button bindtap="ask" disabled="{{ busy }}">询问登机口</button>
    <text>{{ answer }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「询问登机口」，检查回复中是否包含 `H42`。把第一条提示里的编号换成 `B17`，重载后再次点击，检查回复是否随输入变化。

会话方法参见 [LanguageModel](/AIUI/api/ai-language-model)。
