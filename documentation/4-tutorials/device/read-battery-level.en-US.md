# Display the Current Battery Percentage

Read the current battery level when the user taps a button and display it as a percentage.

## Convert the Battery Level to a Percentage

<!-- aiui-tutorial-step -->

In an existing AIUI project, save the example as the home page at `pages/index/index.ink`. The call to `navigator.getBattery()` returns a battery manager. Its `level` is between `0` and `1`. Multiply it by `100` to get a percentage. The page shows a message if battery information is unavailable.

```html
<script setup>
export default {
  data: { result: 'Battery level unread' },

  async readBattery() {
    try {
      const battery = await navigator.getBattery();
      this.setData({ result: `${Math.round(battery.level * 100)}%` });
    } catch {
      this.setData({ result: 'Battery information unavailable' });
    }
  }
};
</script>

<page>
  <view>
    <button bindtap="readBattery">Read battery level</button>
    <text>{{ result }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Read battery level” on a device or in a preview environment that provides battery information. The page should show a value between `0%` and `100%`.

See [BatteryManager](/AIUI/api/device-battery-manager) for other battery properties and events.
