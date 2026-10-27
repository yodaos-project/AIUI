# 权限状态

使用 `navigator.permissions.query()` 读取定位、摄像头和麦克风的当前权限状态，并监听后续变化。查询只读本地状态，不弹出授权界面，也不会开始采集。

## 在使用麦克风前检查状态

完整应用先在 `app.json.permissions` 中声明 `RECORD_AUDIO`，再在用户操作中查询并使用麦克风：

```javascript
async function openMicrophone() {
  const status = await navigator.permissions.query({ name: 'microphone' });
  if (status.state === 'denied') {
    console.log('麦克风权限已拒绝');
    return null;
  }
  return navigator.mediaDevices.getUserMedia({ audio: true });
}
```

`prompt` 表示尚未决定，只有调用 `getUserMedia()` 等敏感 API 才可能进入授权流程。即使状态为 `granted`，设备不可用或系统权限被拒绝时，采集仍会失败；调用方应处理 Promise 拒绝。使用完毕后停止返回流的所有轨道。

## 跟随权限变化更新界面

保留返回的状态对象，读取最新的 `state`。页面卸载时可以通过 signal 一起注销监听器：

```javascript
export default {
  data: { microphonePermission: 'prompt' },
  async onLoad() {
    const lifetime = new AbortController();
    this.permissionLifetime = lifetime;
    const status = await navigator.permissions.query({ name: 'microphone' });
    if (lifetime.signal.aborted) return;
    const update = () => this.setData({ microphonePermission: status.state });
    status.addEventListener('change', update, { signal: lifetime.signal });
    update();
  },
  onUnload() {
    this.permissionLifetime?.abort();
  },
};
```

## 声明与授权

| 能力 | `app.json.permissions` 声明 | 查询名称 |
| --- | --- | --- |
| 定位 | `GEOLOCATION` | `geolocation` |
| 摄像头 | `CAMERA` | `camera` |
| 麦克风 | `RECORD_AUDIO` | `microphone` |

清单声明不等于系统授权。应用应声明实际需要的权限。权限状态按应用会话保存，重新打开应用会建立新会话；运行中修改 `app.json` 不会更新当前权限。

同一次采集同时需要相机和麦克风时，两项都获准才能继续。当前没有通用的 `navigator.permissions.request()` 方法；权限查询也不支持媒体库或蓝牙等其他名称。

## API Reference

### `Permissions`

#### `navigator.permissions`

只读权限查询对象，通过现有 `navigator` 获取；不能通过 `new Permissions()` 创建。

#### `query(descriptor)`

返回 `Promise<PermissionStatus>`。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `descriptor.name` | `'geolocation' \| 'camera' \| 'microphone'` | 是 | 权限查询名称，区分大小写。 |
| `descriptor.panTiltZoom` | `false` | 否 | 仅适用于相机；当前不支持 `true`。 |

缺少或无效的描述对象、未知名称，以及相机 `panTiltZoom: true` 都以 `TypeError` 拒绝。查询不触发授权请求，也不代表对应设备一定可用。

### `PermissionStatus`

#### `name`

只读权限名称，与查询的 `descriptor.name` 一致。

#### `state`

实时只读状态：`granted` 表示当前会话允许，`denied` 表示拒绝，`prompt` 表示尚未决定。状态来自当前会话的权限记录，不是操作系统权限的独立探测结果。

#### `change`

该权限状态变化时触发的 `Event`。在回调中读取 `status.state` 获取新值，使用标准事件方法添加和移除监听器。

#### `onchange`

可赋值的事件处理函数，默认 `null`；设为 `null` 可清除此处理函数。不能通过 `new PermissionStatus()` 创建状态对象。
