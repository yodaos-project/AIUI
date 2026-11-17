# Display a Language Model Response as It Streams

Show each piece of text as soon as it arrives from the language model.

## Append Each Text Delta to the Response

<!-- aiui-tutorial-step -->

In an existing AIUI project, save the example as the home page at `pages/index/index.ink`. In a runtime configured for language models, `promptStreaming()` returns a stream you can read one chunk at a time. Append the new text from each `read()` to the response so far. Stop reading when `done` is `true`. The example destroys the session when the request finishes or the page unloads.

```html
<script setup>
export default {
  data: { generating: false, answer: '', status: '' },

  async generate() {
    if (this.data.generating) return;
    this.setData({ generating: true, answer: '', status: 'Generating' });

    try {
      const availability = await LanguageModel.availability();
      if (this.unloaded) return;
      if (availability !== 'available') {
        this.setData({ status: 'Language model unavailable' });
        return;
      }

      const session = await LanguageModel.create();
      if (this.unloaded) {
        session.destroy();
        return;
      }

      this.session = session;
      const stream = session.promptStreaming('Write three sentences about what to bring on a bike ride.');
      let answer = '';

      while (!this.unloaded) {
        const { value, done } = await stream.read();
        if (this.unloaded || done) break;
        answer += value ?? '';
        this.setData({ answer });
      }

      if (!this.unloaded) this.setData({ status: 'Generation complete' });
    } catch {
      if (!this.unloaded) this.setData({ status: 'Generation failed' });
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
    <button disabled="{{ generating }}" bindtap="generate">Generate response</button>
    <text>{{ status }}</text>
    <text>{{ answer }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Generate response.” When the model returns multiple chunks, the text should grow before the status changes to “Generation complete.” Tap again after it finishes to start a new response with an empty display.

See [LanguageModel](/AIUI/api/ai-language-model) for the session and stream APIs.
