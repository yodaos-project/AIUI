# 读取加速度计数据

创建传感器后先注册 `reading` 和 `error` 事件，再调用 `start()`。页面离开时调用 `stop()`，避免后台持续采样。

## 完成示例

<!-- aiui-tutorial-step -->

创建传感器后先注册 `reading` 和 `error` 事件，再调用 `start()`。页面离开时调用 `stop()`，避免后台持续采样。

```javascript
const sensor = new Accelerometer({ frequency: 60 });

sensor.addEventListener('reading', () => {
  console.log(sensor.x, sensor.y, sensor.z);
});

sensor.addEventListener('error', (event) => {
  console.error('Sensor error', event.error);
});

sensor.start();
```

<!-- /aiui-tutorial-step -->

真机可用性和采样限制参见[加速度计](/AIUI/api/device-accelerometer)。

