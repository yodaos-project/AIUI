# App

`App` 用于注册一个智能体应用。

## 定义应用生命周期

```javascript
export default {
  onLaunch(options) {
    // 智能体初始化
  },
  onShow(options) {
    // 智能体显示
  },
  onHide() {
    // 智能体隐藏
  },
  globalData: {
    // 全局数据
  }
}
```

## 向宿主发送消息

应用实例可以通过 `postMessage()` 向嵌入 AIUI 的宿主发送结构化数据：

```javascript
export default {
  onLaunch() {
    this.postMessage(
      { type: 'app.ready' },
      { origin: 'aiui-agent', lastEventId: 'launch-1' },
    );
  },
};
```

## API Reference

### `getApp()`

返回当前 `App` 实例，可用于从页面或组件访问应用级状态与方法。

### `app.postMessage(data, options?)`

向宿主发送 JSON 兼容的结构化消息。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `data` | `any` | 是 | 要发送的 JSON 兼容数据。 |
| `options.origin` | `string` | 否 | 发送方标识，默认是 `'ink-js'`。 |
| `options.lastEventId` | `string` | 否 | 随消息透传的关联标识。 |

### 生命周期回调

App 生命周期描述整个智能体应用从初始化、进入前台到离开前台的状态变化。生命周期回调定义在 `app.js` 默认导出的对象上，并以当前 App 实例作为 `this` 执行。

![App 生命周期从初始化进入前台，并在前台和后台之间循环](../../image/framework/app-lifecycle-flow-v2.svg)

`onLaunch()` 只在初始化时调用一次。此后 App 可以通过 `onShow()` 和 `onHide()` 在前台与后台之间多次切换；`onError()` 是独立的错误通道，不属于前后台状态转换。

| 回调函数 | 说明 | 触发时机 |
| :--- | :--- | :--- |
| `onLaunch` | 监听智能体初始化 | 智能体初始化完成时（全局只触发一次） |
| `onShow` | 监听智能体显示 | 智能体启动，或从后台进入前台显示时 |
| `onHide` | 监听智能体隐藏 | 智能体从前台进入后台时 |
| `onError` | 错误监听函数 | 智能体发生脚本错误，或者 API 调用失败时 |

#### `onLaunch(Object options)`

App 初始化完成后调用一次。`options` 包含本次启动的上下文，适合用于初始化 `globalData`、恢复持久化状态或建立应用级资源。不要在这里执行依赖页面首次渲染完成的逻辑。

#### `onShow(Object options)`

App 首次显示以及每次从后台回到前台时调用。`options` 包含本次显示的上下文，适合刷新应用级可见状态、恢复暂停的任务或检查需要重新同步的数据。

#### `onHide()`

App 从前台进入后台时调用。适合暂停仅在前台运行的任务、保存临时状态或释放不需要在后台持有的资源。进入后台不会重新触发 `onLaunch()`。

#### `onError(String msg)`

运行时报告未处理的脚本错误或 API 调用错误时调用。`msg` 是错误信息字符串，可用于记录诊断信息；它不能替代具体异步 API 自身的错误处理。

### 事件回调

宿主输入事件会先派发给当前 Page 或 Widget；如果事件传播未被停止，再继续派发给 App。

| 回调函数 | 说明 | 触发时机 |
| :--- | :--- | :--- |
| `onKeyDown` | 监听应用级按键按下事件 | 当前页面或 Widget 未停止事件传播，并且用户按下按键时触发 |
| `onKeyUp` | 监听应用级按键抬起事件 | 当前页面或 Widget 未停止事件传播，并且用户松开按键时触发 |
| `onVoiceWakeup` | 监听应用级语音唤醒事件 | 当前页面或 Widget 未停止事件传播，并且语音唤醒命中时触发 |

#### `onKeyDown(KeyboardEvent event)`

用户按下按键时调用。`event.code` 表示按键编码。App 在当前 Page 或 Widget 之后接收该事件，因此适合处理没有被当前入口界面截断传播的应用级快捷操作。

#### `onKeyUp(KeyboardEvent event)`

用户松开按键时调用。`event.code` 表示按键编码。部分按键在事件分发结束后带有返回、滚动或激活等默认行为；调用 `event.preventDefault()` 可以阻止该事件的默认行为。

#### `onVoiceWakeup(VoiceWakeupEvent event)`

宿主检测到语音唤醒后调用。`event.keyword` 表示命中的唤醒词。该事件同样先经过当前 Page 或 Widget，适合在 App 中实现跨页面共享的语音唤醒处理。

#### `onNetworkStatus(event)`

连接状态变化时调用。`event.online` 为布尔值，`event.status` 为 `'online'` 或 `'offline'`。详细网络类型与质量从 [navigator.connection](/AIUI/api/weixin-compatible-apis-navigator) 读取；在线状态不是请求成功的保证。
