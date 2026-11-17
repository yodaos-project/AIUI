# Read the Current Location Once

Show the current latitude, longitude, and accuracy when the user taps a button.

## Declare Location Permission

<!-- aiui-tutorial-step -->

Add `GEOLOCATION` to the `permissions` array in `app.json`, keep the project’s existing settings, and allow location access on the device.

```json
{
  "permissions": ["GEOLOCATION"]
}
```

<!-- /aiui-tutorial-step -->

## Request a Single Location Fix

<!-- aiui-tutorial-step -->

Save the example as the project home page at `pages/index/index.ink`. Call `getCurrentPosition()` and read `coords` in the success callback. The `accuracy` value is in meters. The options request a fresh location fix and wait up to `10000` milliseconds.

```html
<script setup>
export default {
  data: { locating: false, result: '' },

  locate() {
    if (this.data.locating) return;
    this.setData({ locating: true, result: 'Getting location' });

    const finish = (result) => {
      if (!this.unloaded) this.setData({ locating: false, result });
    };

    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude, accuracy } = coords;
          finish(`${latitude.toFixed(5)}, ${longitude.toFixed(5)} (accuracy ${Math.round(accuracy)} m)`);
        },
        (error) => finish(`Location failed: ${error.message}`),
        { timeout: 10000, maximumAge: 0 }
      );
    } catch {
      finish('Location unavailable');
    }
  },

  onUnload() {
    this.unloaded = true;
  }
};
</script>

<page>
  <view>
    <button bindtap="locate" disabled="{{ locating }}">Read location</button>
    <text>{{ result }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Read location” and allow location access. The result should show latitude, longitude, and accuracy in meters. Deny location access to see the error message.

See [Geolocation](/AIUI/api/geo-data-geolocation) for location options and error codes.
