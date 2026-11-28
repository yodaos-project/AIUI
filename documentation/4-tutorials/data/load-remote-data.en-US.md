# Load and Display Remote Data

Request a JSON message with `fetch()`. Show a loading message while the request runs, then display the response or an error.

## Request the Data

<!-- aiui-tutorial-step -->

Replace the example URL with an HTTPS endpoint that returns a JSON object with a string `message` field. The page starts the request in `onLoad()`.

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

Show the loading text while `loading` is true. When the request finishes, show the error if there is one or display the message.

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

On-device requests may travel through the Bluetooth link between the glasses and phone, so verify the failure state under slow and disconnected network conditions. See the [HTTPS reference](../../3-api/network/https.en-US.md) for `fetch` parameters, responses, and errors, or [choose a network API](../../3-api/network.en-US.md) for other request patterns.
