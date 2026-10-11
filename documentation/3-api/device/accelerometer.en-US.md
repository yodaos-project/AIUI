# Accelerometer

The accelerometer is used to read acceleration changes along the device's three axes. It is suitable for detecting movement, shaking, gait, and pose change trends.

In AIUI, `Accelerometer` follows a usage pattern close to the Generic Sensor API: create an instance, listen for events, start sampling, and stop sampling.

## Read Acceleration Data

```javascript
const sensor = new Accelerometer({ frequency: 60 });

sensor.addEventListener('activate', (event) => {
  console.log('accelerometer active', event.sessionId);
});

sensor.addEventListener('reading', () => {
  console.log(sensor.x, sensor.y, sensor.z, sensor.timestamp);
});

sensor.addEventListener('error', (event) => {
  console.error(event.error, event.message);
});

sensor.start();
```

## Use Cases

- Motion detection
- Shake interactions
- Device state awareness
- Spatial interaction decisions combined with other sensors

## Recommendations

- If you only need basic motion detection, start with a lower frequency to avoid unnecessary sampling overhead.
- Read `sensor.x`, `sensor.y`, and `sensor.z` inside the `reading` event, and do not assume values are available immediately after instantiation.
- Call `stop()` promptly when the page changes, the feature is turned off, or the sensor is no longer needed.
- More complex pose estimation usually requires combining the accelerometer with an orientation sensor or gyroscope.

## Continue Reading

- **[Absolute Orientation Sensor](/AIUI/api/device-absolute-orientation-sensor)**: Learn how to obtain spatial pose data.
- **[Gyroscope](/AIUI/api/device-gyroscope)**: Learn how to obtain rotational velocity.

Before the first valid reading, readings and `timestamp` are `null`, not `0`. Read them in a `reading` callback and check `hasReading`. `stop()` does not guarantee that previous readings are cleared; use `activated` to check current sampling activity.

## API Reference

### Entry

```javascript
const sensor = new Accelerometer({ frequency: 60 });
```

### Common Properties

#### `x` / `y` / `z`
- **Type**: `number | null`
- **Description**: Acceleration readings on the three axes; the value is `null` until the first valid reading arrives.

#### `timestamp`
- **Type**: `number | null`
- **Description**: The timestamp of the most recent reading.

#### `activated`
- **Type**: `boolean`
- **Description**: Whether the sensor is currently active.

#### `hasReading`
- **Type**: `boolean`
- **Description**: Whether at least one valid reading has been received.

### Common Methods

#### `start()`
- Starts a new sampling session.

#### `stop()`
- Stops the current sampling session; if already stopped, it is a no-op.
