# 加速度计

加速度计用于读取设备在三个轴向上的加速度变化，适合检测移动、晃动、步态、姿态变化趋势等场景。

在 AIUI 中，`Accelerometer` 采用接近 Generic Sensor 的使用方式：创建实例、监听事件、开始采样、停止采样。

## 读取加速度数据

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

## 适用场景

- 运动检测
- 晃动交互
- 设备状态感知
- 结合其他传感器做空间交互判断

## 使用建议

- 如果只是做基础动作检测，优先从较低频率开始，避免不必要的采样开销。
- 在 `reading` 事件里读取 `sensor.x`、`sensor.y`、`sensor.z`，不要假设创建实例后立即有值。
- 页面切换、功能关闭或不再需要传感器时及时 `stop()`。
- 如果要做更复杂的姿态判断，通常需要和方向传感器或陀螺仪配合使用。

## 继续阅读

- **[绝对方向传感器](/AIUI/api/device-absolute-orientation-sensor)**：查看如何获取空间姿态。
- **[陀螺仪](/AIUI/api/device-gyroscope)**：查看如何获取旋转速度。

首次有效读数到来前，读数与 `timestamp` 为 `null`，不能当作 `0`。在 `reading` 回调中读取，并检查 `hasReading`；`stop()` 不保证清空已有读数，判断当前是否采样应使用 `activated`。

## API Reference

### 入口

```javascript
const sensor = new Accelerometer({ frequency: 60 });
```

### 常用属性

#### `x` / `y` / `z`
- **类型**：`number | null`
- **说明**：三个轴向的加速度读数；首个有效读数到来前为 `null`。

#### `timestamp`
- **类型**：`number | null`
- **说明**：最近一次读数的时间戳。

#### `activated`
- **类型**：`boolean`
- **说明**：当前传感器是否处于激活状态。

#### `hasReading`
- **类型**：`boolean`
- **说明**：是否已经收到过至少一次有效读数。

### 常用方法

#### `start()`
- 开始一轮新的采样会话。

#### `stop()`
- 停止当前采样；如果当前已经停止，则为 no-op。
