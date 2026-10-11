# Gyroscope

The gyroscope is used to obtain the device's rotational velocity along three axes. It is suitable for scenarios such as head-motion interaction, turning detection, rotation control, and pose change compensation.

If your primary concern is how fast the device rotates and in which direction, you should usually prefer the gyroscope over the accelerometer.

## Read Rotation Rate

```javascript
const sensor = new Gyroscope({ frequency: 60 });

sensor.addEventListener('activate', (event) => {
  console.log('gyroscope active', event.sessionId);
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

- Head-motion interaction
- Rotation detection
- Turning speed estimation
- Pose estimation combined with other sensors

## Recommendations

- If you need rotational velocity rather than positional displacement, prefer `Gyroscope`.
- After reading angular velocity, you usually still need to combine it with time deltas for follow-up calculations.
- Before enabling long-running continuous sampling, confirm that the interface really needs real-time rotation data.
- In spatial interaction scenarios, the gyroscope is commonly used together with orientation sensors.

## Continue Reading

- **[Absolute Orientation Sensor](/AIUI/api/device-absolute-orientation-sensor)**: Learn about spatial heading and pose capabilities.
- **[Accelerometer](/AIUI/api/device-accelerometer)**: Learn about motion and acceleration capabilities.

Before the first valid reading, readings and `timestamp` are `null`, not `0`. Read them in a `reading` callback and check `hasReading`. `stop()` does not guarantee that previous readings are cleared; use `activated` to check current sampling activity.

## API Reference

### Entry

```javascript
const sensor = new Gyroscope({ frequency: 60 });
```

### Common Properties

#### `x` / `y` / `z`
- **Type**: `number | null`
- **Description**: Angular velocity readings on the three axes.

#### `timestamp`
- **Type**: `number | null`
- **Description**: The timestamp of the most recent rotation reading.

#### `activated`
- **Type**: `boolean`
- **Description**: Whether the current instance has been activated.

#### `hasReading`
- **Type**: `boolean`
- **Description**: Whether a valid reading has been obtained.

### Common Methods

#### `start()`
- Starts gyroscope sampling.

#### `stop()`
- Stops the current sampling session.
