# Read Accelerometer Data

Register `reading` and `error` events before calling `start()`. Call `stop()` when leaving the page so sampling does not continue in the background.

## Complete the Example

<!-- aiui-tutorial-step -->

Register `reading` and `error` events before calling `start()`. Call `stop()` when leaving the page so sampling does not continue in the background.

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

See [Accelerometer](/AIUI/api/device-accelerometer) for on-device availability and sampling limits.

