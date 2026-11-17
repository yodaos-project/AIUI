# Display the Device’s Rotation Rate

Use a gyroscope to see how fast the device is rotating around each axis. This example requires a device with `Gyroscope` support.

## Update the Page When a Reading Arrives

<!-- aiui-tutorial-step -->

Save the example as the project home page at `pages/index/index.ink`. In the `reading` handler, check `hasReading` before reading `x`, `y`, and `z`. Start sampling when the page appears and stop when it is hidden or unloaded.

```html
<script setup>
export default {
  data: { status: '', axes: '' },

  onShow() {
    if (this.sensor) return;
    this.setData({ status: 'Waiting for gyroscope readings', axes: '' });

    try {
      const sensor = new Gyroscope({ frequency: 10 });
      this.sensor = sensor;
      sensor.addEventListener('reading', () => {
        if (this.sensor !== sensor || !sensor.hasReading) return;
        const { x, y, z } = sensor;
        this.setData({
          status: 'Sampling',
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
    this.setData({ status: 'Gyroscope readings unavailable', axes: '' });
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

## Verify the Result

Open the page on the device. Hold it still, then rotate it slowly. At least one axis reading should change during the turn and return close to zero when the device is still.

See [Gyroscope](/AIUI/api/device-gyroscope) for readings and sampling methods.
