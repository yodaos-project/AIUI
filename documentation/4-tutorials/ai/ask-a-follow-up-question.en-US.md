# Ask a Language Model a Follow-Up Question

Ask a follow-up that depends on information from the previous turn. This example requires a configured language model.

## Send Both Turns to the Same Session

<!-- aiui-tutorial-step -->

Save the complete example as `pages/index/index.ink` in your project. Wait for the first `prompt()` to finish, then send the follow-up through the same `session`. The session includes completed turns in the context for subsequent requests.

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
      await session.prompt('Remember this: fictional flight Demo 100 boards at gate H42.');
      if (this.unloaded) return;
      const answer = await session.prompt('What was the gate for that flight? Reply with the gate number only.');
      if (!this.unloaded) this.setData({ answer });
    } catch {
      if (!this.unloaded) this.setData({ answer: 'Model request failed' });
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
    <button bindtap="ask" disabled="{{ busy }}">Ask for the gate</button>
    <text>{{ answer }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Ask for the gate” and check whether the response contains `H42`. Change the gate in the first prompt to `B17`, reload, and check that the response follows the new input.

See [LanguageModel](/AIUI/api/ai-language-model) for session methods.
