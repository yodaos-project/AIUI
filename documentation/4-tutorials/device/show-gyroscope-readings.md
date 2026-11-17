# 显示设备的旋转速度

用陀螺仪查看设备绕三个轴旋转的速度。需要支持 `Gyroscope` 的设备。

## 在收到读数时更新页面

<!-- aiui-tutorial-step -->

将示例保存为项目首页 `pages/index/index.ink`。在 `reading` 事件中检查 `hasReading`，再读取 `x`、`y`、`z`。页面显示时开始采样，隐藏或卸载时停止。

```html
<script setup>
export default {
  data: { status: '', axes: '' },

  onShow() {
    if (this.sensor) return;
    this.setData({ status: '等待陀螺仪读数', axes: '' });

    try {
      const sensor = new Gyroscope({ frequency: 10 });
      this.sensor = sensor;
      sensor.addEventListener('reading', () => {
        if (this.sensor !== sensor || !sensor.hasReading) return;
        const { x, y, z } = sensor;
        this.setData({
          status: '正在采样',
          axes: `X: ${x.toFixed(2)}  Y: ${y.toFixed(2)}  Z: ${z.toFixed(2)}`
        });
      });
      sensor.addEventListener('error', () => {
        if (this.sensor === sensor) this.showSensorError();
      });
      sensor.start();
    } catch {
      this.showSensorError();
    }
  },

  stopSampling() {
    const sensor = this.sensor;
    this.sensor = null;
    sensor?.stop();
  },

  showSensorError() {
    this.stopSampling();
    this.setData({ status: '当前无法读取陀螺仪', axes: '' });
  },

  onHide() {
    this.stopSampling();
  },

  onUnload() {
    this.stopSampling();
  }
};
</script>

<page>
  <view>
    <text>{{ status }}</text>
    <text>{{ axes }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

在设备上打开页面，先保持静止，再缓慢转动设备。转动时至少一个轴的读数应变化，停稳后应接近零。

读数和采样方法参见[陀螺仪](/AIUI/api/device-gyroscope)。
