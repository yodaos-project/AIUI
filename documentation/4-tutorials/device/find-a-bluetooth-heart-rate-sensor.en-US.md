# Find a Nearby Bluetooth Heart-Rate Sensor

Scan for a nearby device that advertises the Bluetooth Heart Rate service. You need a BLE heart-rate strap that advertises the service and a runtime with Bluetooth scanning support.

## Filter Scan Results by Service

<!-- aiui-tutorial-step -->

Save the example as the project home page at `pages/index/index.ink`. Call `scanDevices()` from the tap handler with `services: ["heart_rate"]`. Call `stop()` after the first match or after eight seconds.

```html
<script setup>
export default {
  data: { scanning: false, status: '' },

  async findSensor() {
    if (this.data.scanning) return;
    this.setData({ scanning: true, status: 'Looking for a heart-rate sensor' });

    try {
      const scan = await navigator.bluetooth.scanDevices({
        filters: [{ services: ['heart_rate'] }]
      });
      this.scan = scan;
      if (this.unloaded) {
        await this.finishScan();
        return;
      }

      scan.onDeviceFound(({ device }) => {
        if (this.scan !== scan) return;
        const name = device.name || device.id;
        this.finishScan(`Found: ${name}`);
      });
      this.timer = setTimeout(() => this.finishScan('No heart-rate sensor found'), 8000);
    } catch {
      await this.finishScan('Could not start Bluetooth scanning');
    }
  },

  async finishScan(status) {
    const scan = this.scan;
    this.scan = null;
    clearTimeout(this.timer);

    try {
      await scan?.stop();
    } catch (error) {
      console.warn(error);
    }

    if (!this.unloaded) this.setData({ scanning: false, status });
  },

  onUnload() {
    this.unloaded = true;
    if (this.scan) this.finishScan();
  }
};
</script>

<page>
  <view>
    <button bindtap="findSensor" disabled="{{ scanning }}">Find heart-rate sensor</button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Start advertising on the heart-rate strap, then tap “Find heart-rate sensor.” The page should display the matched device’s name, or its ID if it has no name. Turn off the strap and repeat. If no other matching device is nearby, the page should report that no device was found when the scan ends.

See [Bluetooth](/AIUI/api/device-bluetooth) for scan options.
