# Cancel an In-Flight Request

Give users a Cancel button so they can stop waiting for a slow read request.

## Pass the Cancellation Signal to fetch

<!-- aiui-tutorial-step -->

In an existing AIUI project, save the example as the home page at `pages/index/index.ink`. Replace the example URL with an HTTPS GET endpoint that takes a few seconds to respond. Create a fresh `AbortController` for each request and pass its `signal` to `fetch()`. When the user taps Cancel, call `abort()` on that same controller.

```html
<script setup>
export default {
  data: { pending: false, status: 'Ready to send' },

  async startRequest() {
    if (this.requestController) return;

    const controller = new AbortController();
    this.requestController = controller;
    this.setData({ pending: true, status: 'Waiting for response' });

    try {
      const response = await fetch('https://api.example.com/slow', {
        signal: controller.signal
      });
      if (this.requestController !== controller) return;
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      this.setData({ status: 'Response received' });
    } catch {
      if (this.requestController === controller) {
        this.setData({
          status: controller.signal.aborted ? 'Request canceled' : 'Request failed'
        });
      }
    } finally {
      if (this.requestController === controller) {
        this.requestController = null;
        this.setData({ pending: false });
      }
    }
  },

  cancelRequest() {
    this.requestController?.abort();
  },

  onUnload() {
    const controller = this.requestController;
    this.requestController = null;
    controller?.abort();
  }
};
</script>

<page>
  <view>
    <button bindtap="startRequest" disabled="{{ pending }}">Send request</button>
    <button bindtap="cancelRequest" disabled="{{ !pending }}">Cancel</button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

In the preview, tap “Send request,” then tap “Cancel” before the endpoint responds. The page should show “Request canceled.” Send again and let the request finish. This time it should show “Response received.”

See [HTTPS requests](/AIUI/api/network-https) for other fetch options.
