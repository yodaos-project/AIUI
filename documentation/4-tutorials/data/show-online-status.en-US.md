# Show Whether the Page Is Online

Update a page indicator when the network status changes so users can see what the runtime reports.

## Read the Initial Status and Observe Changes

<!-- aiui-tutorial-step -->

Save the example as the project home page at `pages/index/index.ink`. Read the current status from `navigator.onLine` when the page appears, then update the same field from `event.online` in `onNetworkStatus()`. This indicator reports network connectivity. Handle individual request failures separately.

```html
<script setup>
export default {
  data: { online: false },

  onShow() {
    this.setData({ online: navigator.onLine });
  },

  onNetworkStatus(event) {
    this.setData({ online: event.online });
  }
};
</script>

<page>
  <text>{{ online ? 'Online' : 'Offline' }}</text>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Open the page in an environment that provides network status events. Disconnect its available network connections and check that the indicator changes to “Offline.” Restore connectivity and check for “Online.”

See the [Page API](/AIUI/api/framework-page) for event fields.
