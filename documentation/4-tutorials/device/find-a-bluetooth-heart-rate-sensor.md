# 发现附近的蓝牙心率设备

扫描附近广播蓝牙 Heart Rate 服务的设备。准备一台会广播该服务的 BLE 心率带和支持蓝牙扫描的运行环境。

## 按服务过滤扫描结果

<!-- aiui-tutorial-step -->

将示例保存为项目首页 `pages/index/index.ink`。在点击回调中调用 `scanDevices()`，用 `services: ["heart_rate"]` 指定要发现的设备。收到第一个匹配结果或等待 8 秒后，调用 `stop()`。

```html
<script setup>
export default {
  data: { scanning: false, status: '' },

  async findSensor() {
    if (this.data.scanning) return;
    this.setData({ scanning: true, status: '正在搜索心率设备' });

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
        this.finishScan(`找到设备：${name}`);
      });
      this.timer = setTimeout(() => this.finishScan('未找到心率设备'), 8000);
    } catch {
      await this.finishScan('无法启动蓝牙扫描');
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
    <button bindtap="findSensor" disabled="{{ scanning }}">搜索心率设备</button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

让心率带开始广播，再点击「搜索心率设备」。匹配时，页面应显示设备名，设备名为空时显示 ID。关闭心率带后再次搜索，若附近没有其他匹配设备，应在扫描结束后看到未找到设备的提示。

扫描选项参见[蓝牙](/AIUI/api/device-bluetooth)。
