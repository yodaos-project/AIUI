# Load and Display Remote Data

This tutorial loads remote data with `fetch()` and presents distinct loading, success, and failure states.

## Request the Data

<!-- aiui-tutorial-step -->

Start the request in `onLoad()`. Enter the loading state first, then update the page data once for each response outcome. Replace the example URL with your own HTTPS endpoint.

```html
<script setup>
export default {
  data: {
    loading: true,
    error: '',
    message: ''
  },

  async onLoad() {
    try {
      const response = await fetch('https://api.example.com/message');
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      this.setData({
        loading: false,
        message: result.message || 'Request completed'
      });
    } catch (error) {
      this.setData({
        loading: false,
        error: error instanceof Error ? error.message : 'Request failed'
      });
    }
  }
};
</script>
```

<!-- /aiui-tutorial-step -->

## Present Every State

<!-- aiui-tutorial-step -->

Do not implement only the successful result. Check the loading state first, show an error when present, and otherwise render the returned content.

```html
<page>
  <view class="result">
    <text ink:if="{{ loading }}">Loading...</text>
    <text ink:elif="{{ error }}">{{ error }}</text>
    <text ink:else>{{ message }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

On-device requests may travel through the Bluetooth link between the glasses and phone, so verify the failure state under slow and disconnected network conditions. See [Network APIs](/AIUI/api/network) for other request patterns.
