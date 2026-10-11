# Absolute Orientation Sensor

The absolute orientation sensor is used to obtain the device's current spatial heading and pose. It is suitable for scenarios such as head direction awareness, pose-driven interaction, and spatial UI alignment.

In AIUI, `AbsoluteOrientationSensor` follows a usage pattern close to the Generic Sensor API, while keeping sensor access behind the host IPC boundary. It outputs quaternion-based pose data, which is suitable for further direction calculations in 3D or spatial scenes.

## Read Device Orientation

```javascript
const sensor = new AbsoluteOrientationSensor({ frequency: 60 });

sensor.addEventListener('activate', (event) => {
  console.log('absolute orientation active', event.sessionId);
});

sensor.addEventListener('reading', () => {
  console.log(sensor.quaternion, sensor.timestamp);
});

sensor.addEventListener('error', (event) => {
  console.error(event.error, event.message);
});

sensor.start();
```

## Use Cases

- Head direction awareness
- Spatial pose synchronization
- 3D viewpoint alignment
- Direction control for immersive interfaces

## Platform Scope And Stability

Current first-release stability scope:

- Android provides a real backend based on `SensorManager.TYPE_ROTATION_VECTOR`
- On Android, hosts must explicitly enable the capability per `InkView`, for example by registering `InkView.AbsoluteOrientationCapability` or calling `inkView.addDefaultAbsoluteOrientationCapability()`
- Readings, `activate` events, `error` events, and explicit `stop()` cleanup are routed through IPC
- Unsupported native hosts return a stable error instead of hanging silently

Current limits:

- No standalone `Sensor` base constructor
- No Permissions API integration
- No guarantee of exact sampling frequency
- No background sampling guarantee
- No browser / WASM direct backend

## Recommendations

- If your feature needs spatial pose data rather than simple motion changes, prefer `AbsoluteOrientationSensor`.
- When using quaternions for follow-up calculations, do not assume you can directly derive Euler angles or true north heading.
- Consume `quaternion` in the `reading` event and perform pose conversion based on your business logic.
- When binding sensor data to UI, control update frequency and jitter first to avoid view shaking.

## Continue Reading

- **[Accelerometer](/AIUI/api/device-accelerometer)**: Learn about linear motion readings.
- **[Gyroscope](/AIUI/api/device-gyroscope)**: Learn about rotational velocity readings.

Before the first valid reading, readings and `timestamp` are `null`, not `0`. Read them in a `reading` callback and check `hasReading`. `stop()` does not guarantee that previous readings are cleared; use `activated` to check current sampling activity.

## API Reference

### Entry

```javascript
const sensor = new AbsoluteOrientationSensor({ frequency: 60 });
```

`AbsoluteOrientationSensor` is registered globally on both `globalThis` and `window`.

### Constructor

```javascript
new AbsoluteOrientationSensor()
```

Supported options:

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `frequency` | `number` | No | A preferred sampling frequency hint. The value is forwarded to the host, but the host may clamp, approximate, or ignore the exact cadence without failing construction. |

### Common Properties

#### `quaternion`
- **Type**: `[number, number, number, number] | null`
- **Description**: The current pose quaternion, in the order `[x, y, z, w]`.

#### `timestamp`
- **Type**: `number | null`
- **Description**: The timestamp of the most recent pose reading.

#### `activated`
- **Type**: `boolean`
- **Description**: Whether the sensor is currently activated.

#### `hasReading`
- **Type**: `boolean`
- **Description**: Whether valid pose data has been received.

#### `stable`
- **Type**: `boolean`
- **Description**: Whether the current pose is considered stable. It can be used together with the `orientationstabilitychange` event to observe stability transitions.

### State Behavior

In the current implementation, `AbsoluteOrientationSensor` behaves as follows:

- A fresh instance starts with `activated === false`
- A fresh instance starts with `hasReading === false`
- `quaternion` and `timestamp` remain `null` until the first successful reading arrives
- The first successful reading flips both `activated` and `hasReading` to `true`
- `stop()` sets `activated` back to `false` but keeps the last successful reading cached

Quaternion order:

- `quaternion[0] === x`
- `quaternion[1] === y`
- `quaternion[2] === z`
- `quaternion[3] === w`

### Common Methods

#### `start()`
- Starts a new pose sampling session. The runtime sends a new absolute-orientation IPC request carrying the instance `target_id`, a fresh `session_id`, and the optional preferred frequency.

#### `stop()`
- Stops the current sampling session and sends the matching stop request for the active session. If the instance is already idle, `stop()` is a no-op.

### Events

Absolute orientation events are routed through the DOM-style event bridge and targeted by instance `target_id`, so multiple sensor instances on the same page remain isolated from one another.

Supported event names:

- `activate`
- `reading`
- `error`
- `orientationstabilitychange`

Event payload behavior:

- `activate` exposes `sessionId`
- `reading` exposes `sessionId`, `x`, `y`, `z`, `w`, `quaternion`, and `timestamp`
- `error` exposes `sessionId`, `error`, and `message`
- `orientationstabilitychange` exposes `stable`

You can listen for orientation stability changes like this:

```javascript
sensor.addEventListener('orientationstabilitychange', (event) => {
  console.log('stable?', event.stable, sensor.stable);
});
```
