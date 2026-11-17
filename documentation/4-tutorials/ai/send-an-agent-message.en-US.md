# Send a Message to the Current Agent Conversation

Let the user tap a page button to send a preset question to the current Agent conversation. Open the page in a connected conversation that supports sending text messages.

## Submit the User’s Text Message

<!-- aiui-tutorial-step -->

Save the complete example as `pages/index/index.ink` in your project. Get the current session with `getApp().getAgent()`. Check for the `conversation.sendMessage` operation and `text` content support, then send a message with `role: "user"`. When the promise resolves, the conversation has acknowledged the message. A reply can arrive later.

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
      if (!this.unloaded) this.setData({ status: 'Text messages are unavailable in this conversation' });
      return;
    }

    this.setData({ sending: true, status: '' });
    try {
      await agent.conversation.sendMessage({
        role: 'user',
        content: [{ type: 'text', text: 'Suggest a route for a weekend walk.' }]
      });
      if (!this.unloaded) this.setData({ status: 'Conversation acknowledged the message' });
    } catch {
      if (!this.unloaded) this.setData({ status: 'Send failed' });
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
    <button bindtap="sendQuestion" disabled="{{ sending }}">Send walking question</button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Send walking question.” The page should show “Conversation acknowledged the message.” Check that the question appears as a user message in the conversation.

See [Agent Session](/AIUI/api/ai-agent-session) for capabilities and message types.
