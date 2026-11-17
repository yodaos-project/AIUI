# 在两个页面之间共享状态

让第二个页面修改通知状态，返回首页时显示修改后的值。

## 在 App 中声明共享状态

<!-- aiui-tutorial-step -->

在已有 AIUI 项目的 `app.js` 导出对象中加入 `globalData`，让两个 Page 都能通过 `getApp()` 访问通知状态。

```javascript
export default {
  globalData: {
    notificationsEnabled: false
  }
};
```

<!-- /aiui-tutorial-step -->

## 注册设置页

<!-- aiui-tutorial-step -->

在 `app.json` 的 `pages` 数组中保留首页，并添加设置页。

```json
{
  "pages": ["pages/index/index", "pages/settings/index"]
}
```

<!-- /aiui-tutorial-step -->

## 在设置页写入共享状态

<!-- aiui-tutorial-step -->

创建 `pages/settings/index.ink`。点击按钮后，将新值写入 `globalData`，然后返回首页。

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
  <button bindtap="enableNotifications">开启通知并返回</button>
</page>
```

<!-- /aiui-tutorial-step -->

## 在首页重新读取状态

<!-- aiui-tutorial-step -->

将以下示例保存为 `pages/index/index.ink`。每次首页显示时，`onShow()` 都会把共享值同步到首页的 `data`，供模板显示。

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
    <text>{{ notificationsEnabled ? '通知已开启' : '通知已关闭' }}</text>
    <button bindtap="openSettings">打开设置</button>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

打开首页，确认显示「通知已关闭」。进入设置页，点击「开启通知并返回」，首页应显示「通知已开启」。共享值的生命周期与当前 App 实例相同。

应用实例参见 [App](/AIUI/api/framework-app)。
