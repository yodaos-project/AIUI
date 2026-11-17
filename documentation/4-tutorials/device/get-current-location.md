# 读取一次当前位置

在用户点击按钮后，显示一次当前位置的经纬度和精度。

## 声明定位权限

<!-- aiui-tutorial-step -->

在 `app.json` 的 `permissions` 数组中加入 `GEOLOCATION`，保留项目原有配置，并在设备上允许定位。

```json
{
  "permissions": ["GEOLOCATION"]
}
```

<!-- /aiui-tutorial-step -->

## 请求一次定位结果

<!-- aiui-tutorial-step -->

将示例保存为项目首页 `pages/index/index.ink`。调用 `getCurrentPosition()`，在成功回调里读取 `coords`。`accuracy` 以米为单位。`maximumAge: 0` 请求新的定位结果，并最多等待 `10000` 毫秒。

```html
<script setup>
export default {
  data: { locating: false, result: '' },

  locate() {
    if (this.data.locating) return;
    this.setData({ locating: true, result: '正在定位' });

    const finish = (result) => {
      if (!this.unloaded) this.setData({ locating: false, result });
    };

    try {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          const { latitude, longitude, accuracy } = coords;
          finish(`${latitude.toFixed(5)}, ${longitude.toFixed(5)} (精度 ${Math.round(accuracy)} m)`);
        },
        (error) => finish(`定位失败：${error.message}`),
        { timeout: 10000, maximumAge: 0 }
      );
    } catch {
      finish('当前无法使用定位');
    }
  },

  onUnload() {
    this.unloaded = true;
  }
};
</script>

<page>
  <view>
    <button bindtap="locate" disabled="{{ locating }}">读取位置</button>
    <text>{{ result }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「读取位置」并允许定位，结果应显示纬度、经度和以米为单位的精度。拒绝定位权限时，页面会显示失败信息。

定位选项与错误码参见 [Geolocation](/AIUI/api/geo-data-geolocation)。
