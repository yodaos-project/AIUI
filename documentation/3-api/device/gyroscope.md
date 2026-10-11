# 陀螺仪

陀螺仪用于获取设备在三个轴向上的旋转速度，适合头动交互、转向检测、旋转控制和姿态变化补偿等场景。

如果你的业务重点是“旋转得多快、往哪个方向转”，通常应该优先看陀螺仪，而不是加速度计。

## 读取旋转速率

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

## 适用场景

- 头动交互
- 旋转检测
- 转向速度判断
- 与其他传感器组合做姿态估计

## 使用建议

- 如果需要旋转速度而不是位置位移，优先使用 `Gyroscope`。
- 读取角速度后，通常还需要结合时间差做后续计算。
- 长时间持续采样前，先确认界面是否真的需要实时旋转数据。
- 做空间交互时，通常会把陀螺仪和方向传感器结合使用。

## 继续阅读

- **[绝对方向传感器](/AIUI/api/device-absolute-orientation-sensor)**：查看空间朝向与姿态能力。
- **[加速度计](/AIUI/api/device-accelerometer)**：查看运动和加速度能力。

首次有效读数到来前，读数与 `timestamp` 为 `null`，不能当作 `0`。在 `reading` 回调中读取，并检查 `hasReading`；`stop()` 不保证清空已有读数，判断当前是否采样应使用 `activated`。

## API Reference

### 入口

```javascript
const sensor = new Gyroscope({ frequency: 60 });
```

### 常用属性

#### `x` / `y` / `z`
- **类型**：`number | null`
- **说明**：三个轴向上的角速度读数。

#### `timestamp`
- **类型**：`number | null`
- **说明**：最近一次旋转读数时间戳。

#### `activated`
- **类型**：`boolean`
- **说明**：当前实例是否已经激活。

#### `hasReading`
- **类型**：`boolean`
- **说明**：是否已经拿到过有效读数。

### 常用方法

#### `start()`
- 开始陀螺仪采样。

#### `stop()`
- 停止当前采样。
