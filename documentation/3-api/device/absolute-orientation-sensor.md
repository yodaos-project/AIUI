# 绝对方向传感器

绝对方向传感器用于获取设备当前的空间朝向与姿态，适合头部朝向感知、姿态驱动交互、空间 UI 对齐等场景。

在 AIUI 中，`AbsoluteOrientationSensor` 采用接近 Generic Sensor 的使用方式，但传感器访问始终通过宿主 IPC 边界进行。它会输出四元数形式的姿态数据，适合在 3D 或空间场景中继续做方向计算。

## 读取设备方向

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

## 适用场景

- 头部朝向感知
- 空间姿态同步
- 3D 视角对齐
- 沉浸式界面方向控制

## 平台范围与稳定性

当前首发版本的稳定性范围如下：

- Android 已提供真实后端实现，基于 `SensorManager.TYPE_ROTATION_VECTOR`
- 在 Android 上，宿主需要为每个 `InkView` 显式启用该能力，例如注册 `InkView.AbsoluteOrientationCapability` 或调用 `inkView.addDefaultAbsoluteOrientationCapability()`
- 读数、`activate` 事件、`error` 事件以及显式 `stop()` 清理都通过 IPC 路由
- 不支持该能力的原生宿主会返回稳定错误，而不是无响应挂起

当前版本的限制包括：

- 暂无独立的 `Sensor` 基类构造函数
- 暂无 Permissions API 集成
- 不保证精确采样频率
- 不保证后台持续采样
- 暂无浏览器 / WASM 直连后端

## 使用建议

- 如果你的业务需要空间姿态而不是简单运动变化，优先使用 `AbsoluteOrientationSensor`。
- 使用四元数做后续计算时，不要直接假设可得到欧拉角或真北朝向。
- 在 `reading` 事件里消费 `quaternion`，并根据业务自行做姿态转换。
- 和 UI 绑定时，先做好更新频率和抖动控制，避免视图抖动。

## 继续阅读

- **[加速度计](/AIUI/api/device-accelerometer)**：查看线性运动读数。
- **[陀螺仪](/AIUI/api/device-gyroscope)**：查看旋转速度读数。

首次有效读数到来前，读数与 `timestamp` 为 `null`，不能当作 `0`。在 `reading` 回调中读取，并检查 `hasReading`；`stop()` 不保证清空已有读数，判断当前是否采样应使用 `activated`。

## API Reference

### 入口

```javascript
const sensor = new AbsoluteOrientationSensor({ frequency: 60 });
```

`AbsoluteOrientationSensor` 会注册到 `globalThis` 和 `window` 上，可直接通过全局构造函数创建实例。

### 构造函数

```javascript
new AbsoluteOrientationSensor()
```

支持的参数如下：

| 参数 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `frequency` | `number` | 否 | 期望的采样频率提示。该值会传给宿主，但宿主可能会对频率进行限制、近似处理或直接忽略，且不会因为无法精确满足而导致构造失败。 |

### 常用属性

#### `quaternion`
- **类型**：`[number, number, number, number] | null`
- **说明**：当前姿态四元数，顺序为 `[x, y, z, w]`。

#### `timestamp`
- **类型**：`number | null`
- **说明**：最近一次姿态读数的时间戳。

#### `activated`
- **类型**：`boolean`
- **说明**：当前传感器是否已激活。

#### `hasReading`
- **类型**：`boolean`
- **说明**：是否已经收到过有效姿态数据。

#### `stable`
- **类型**：`boolean`
- **说明**：当前姿态是否处于稳定状态。可结合 `orientationstabilitychange` 事件监听稳定性变化。

### 状态行为

当前实现下，`AbsoluteOrientationSensor` 的状态行为如下：

- 新建实例时，`activated === false`
- 新建实例时，`hasReading === false`
- 在首个有效读数到来前，`quaternion` 和 `timestamp` 都是 `null`
- 收到首个有效读数后，`activated` 和 `hasReading` 都会变为 `true`
- 调用 `stop()` 后，`activated` 会回到 `false`，但最近一次成功读数会被保留

四元数顺序固定为：

- `quaternion[0] === x`
- `quaternion[1] === y`
- `quaternion[2] === z`
- `quaternion[3] === w`

### 常用方法

#### `start()`
- 开始一轮新的姿态采样会话。运行时会为当前实例发送新的绝对方向 IPC 请求，并附带实例 `target_id`、新的 `session_id` 以及可选的采样频率提示。

#### `stop()`
- 停止当前采样会话，并向宿主发送与当前会话匹配的停止请求；如果当前实例本来就是空闲状态，则 `stop()` 为 no-op。

### 事件

绝对方向传感器事件通过 DOM 风格的事件桥接分发，并按实例 `target_id` 进行路由，因此同一页面中的多个传感器实例彼此隔离。

支持的事件名称：

- `activate`
- `reading`
- `error`
- `orientationstabilitychange`

事件负载行为：

- `activate` 事件包含 `sessionId`
- `reading` 事件包含 `sessionId`、`x`、`y`、`z`、`w`、`quaternion` 和 `timestamp`
- `error` 事件包含 `sessionId`、`error` 和 `message`
- `orientationstabilitychange` 事件包含 `stable`

你可以通过下面的方式监听姿态稳定性变化：

```javascript
sensor.addEventListener('orientationstabilitychange', (event) => {
  console.log('stable?', event.stable, sensor.stable);
});
```
