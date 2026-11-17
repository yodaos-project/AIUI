# Share State Between Two Pages

Change the notification setting on a second page and show the updated value when the user returns home.

## Declare Shared State in App

<!-- aiui-tutorial-step -->

Add `globalData` to the object exported from `app.js` in an existing AIUI project. Both pages can access the notification setting through `getApp()`.

```javascript
export default {
  globalData: {
    notificationsEnabled: false
  }
};
```

<!-- /aiui-tutorial-step -->

## Register the Settings Page

<!-- aiui-tutorial-step -->

Keep the home page in the `pages` array in `app.json` and add the settings page.

```json
{
  "pages": ["pages/index/index", "pages/settings/index"]
}
```

<!-- /aiui-tutorial-step -->

## Write Shared State on the Settings Page

<!-- aiui-tutorial-step -->

Create `pages/settings/index.ink`. When the user taps the button, write the new value to `globalData` and return to the home page.

```html
<script setup>
export default {
  enableNotifications() {
    getApp().globalData.notificationsEnabled = true;
    wx.navigateBack();
  }
};
</script>

<page>
  <button bindtap="enableNotifications">Enable notifications and go back</button>
</page>
```

<!-- /aiui-tutorial-step -->

## Read the State When the Home Page Reappears

<!-- aiui-tutorial-step -->

Save this example as `pages/index/index.ink`. Each time the home page appears, `onShow()` copies the shared value to the page’s `data` so the template can display it.

```html
<script setup>
export default {
  data: { notificationsEnabled: false },

  onShow() {
    this.setData({
      notificationsEnabled: getApp().globalData.notificationsEnabled
    });
  },

  openSettings() {
    wx.navigateTo({ url: '/pages/settings/index' });
  }
};
</script>

<page>
  <view>
    <text>{{ notificationsEnabled ? 'Notifications on' : 'Notifications off' }}</text>
    <button bindtap="openSettings">Open Settings</button>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Open the home page and check that it shows “Notifications off.” Open Settings, then tap “Enable notifications and go back.” The home page should show “Notifications on.” The shared value lasts for the lifetime of the current App instance.

See [App](/AIUI/api/framework-app) for the application instance.
