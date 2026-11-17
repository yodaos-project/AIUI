# 向当前 Agent 会话发送一条消息

让用户点击页面上的按钮，把一条预设问题发到当前 Agent 会话。请在已连接且支持发送文本消息的会话中打开这个页面。

## 提交用户的文本消息

<!-- aiui-tutorial-step -->

将完整示例保存为项目中的 `pages/index/index.ink`。通过 `getApp().getAgent()` 取得当前会话。检查会话支持 `conversation.sendMessage` 和 `text` 后，发送一条 `role: "user"` 的消息。Promise 完成表示会话确认接收，回复可能随后到达。

```html
<script setup>
export default {
  data: { sending: false, status: '' },

  async sendQuestion() {
    if (this.data.sending) return;

    const agent = getApp().getAgent();
    const capabilities = agent?.capabilities;
    if (!capabilities?.operations.includes('conversation.sendMessage') ||
        !capabilities.contentTypes.includes('text')) {
      if (!this.unloaded) this.setData({ status: '当前会话无法发送文本' });
      return;
    }

    this.setData({ sending: true, status: '' });
    try {
      await agent.conversation.sendMessage({
        role: 'user',
        content: [{ type: 'text', text: '请推荐一条适合周末的散步路线。' }]
      });
      if (!this.unloaded) this.setData({ status: '会话已接收消息' });
    } catch {
      if (!this.unloaded) this.setData({ status: '发送失败' });
    } finally {
      if (!this.unloaded) this.setData({ sending: false });
    }
  },

  onUnload() {
    this.unloaded = true;
  }
};
</script>

<page>
  <view>
    <button bindtap="sendQuestion" disabled="{{ sending }}">发送散步问题</button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「发送散步问题」，页面应显示「会话已接收消息」。在会话中核对这条消息以用户身份出现。

会话能力和消息类型参见 [Agent 会话](/AIUI/api/ai-agent-session)。
