# Display an HTTP Text Response as It Arrives

Show received text on the page before the response ends. Use an AIUI runtime with `response.textStream()` and an HTTPS GET endpoint that sends UTF-8 plain text in several chunks with a noticeable pause between them.

## Append Each Piece of Text

<!-- aiui-tutorial-step -->

Save the example as the project home page at `pages/index/index.ink`. Replace the example URL with your streaming endpoint. Iterate over `response.textStream()` and append each piece to the display. The stream handles UTF-8 characters split across chunks. Update the status when the loop ends.

```html
<script setup>
export default {
  data: { loading: false, status: '', text: '' },

  async readResponse() {
    if (this.controller) return;

    const controller = new AbortController();
    this.controller = controller;
    this.setData({ loading: true, status: 'Reading', text: '' });

    try {
      const response = await fetch('https://api.example.com/stream', {
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      let text = '';
      for await (const chunk of response.textStream()) {
        if (controller.signal.aborted) return;
        text += chunk;
        this.setData({ text });
      }
      if (!controller.signal.aborted) this.setData({ status: 'Reading complete' });
    } catch {
      if (!controller.signal.aborted) this.setData({ status: 'Could not read the response' });
    } finally {
      this.controller = null;
      if (!controller.signal.aborted) this.setData({ loading: false });
    }
  },

  onUnload() {
    this.controller?.abort();
  }
};
</script>

<page>
  <view>
    <button bindtap="readResponse" disabled="{{ loading }}">Read text</button>
    <text>{{ status }}</text>
    <text>{{ text }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Read text.” The first piece should appear before the status changes to “Reading complete.” When the endpoint finishes, check that the page displays the full response.

See [Streams](/AIUI/api/network-streams) for stream APIs.
