# Send a JSON Payload with POST

Tap a button to submit a practice note to an HTTPS endpoint. Use a test endpoint that accepts `POST` with `application/json` and returns a 2xx status on success.

## Encode the Object as the Request Body

<!-- aiui-tutorial-step -->

Save the example as the project home page at `pages/index/index.ink`. Replace the example URL with your test endpoint. `JSON.stringify()` creates the request body and `Content-Type` tells the server how to read it. Use `response.ok` to check for a 2xx response.

```html
<script setup>
export default {
  data: { sending: false, status: '' },

  async sendNote() {
    if (this.data.sending) return;
    this.setData({ sending: true, status: 'Sending' });

    try {
      const response = await fetch('https://api.example.com/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: 'Bring a water bottle' })
      });
      const status = response.ok
        ? `Endpoint accepted the note (HTTP ${response.status})`
        : `Endpoint rejected the request (HTTP ${response.status})`;
      if (!this.unloaded) this.setData({ status });
    } catch {
      if (!this.unloaded) this.setData({ status: 'No response received. Check the connection.' });
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
    <button bindtap="sendNote" disabled="{{ sending }}">Send note</button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Send note” and check the 2xx status on the page. Then look for the JSON `note` field in your test endpoint’s request log.

See [HTTPS](/AIUI/api/network-https) for other request body types.
