# Page

`Page` 用于注册智能体中的一个页面。每个页面的逻辑通过 `export default` 导出一个配置对象。

运行时会把默认导出对象上的可枚举属性挂到页面实例上，同时补充页面内建能力，例如 `data`、`setData()`、`postMessage()`、`querySelector()` 和环境感知相关 API。

此外，`Page` 继承事件目标能力，因此也可以使用标准事件方法，例如 `addEventListener()`、`removeEventListener()` 和 `dispatchEvent()`。

## 定义页面并更新状态

```javascript
export default {
  data: {
    text: "This is page data.",
    user: {
      name: 'Rokid'
    }
  },
  onLoad(options) {
    // 页面加载
    const title = this.querySelector('.title');
    console.log(title?.tagName);
  },
  handleUpdate() {
    // 更新数据
    this.setData({
      text: 'Updated Text',
      'user.name': 'New Name' // 支持路径式更新
    }, () => {
      console.log('Data updated');
    });
  },
  handleNotifyHost() {
    this.postMessage({
      type: 'page.ready',
      payload: {
        text: this.data.text
      }
    });
  },
  handleComplete() {
    // 完成当前页面任务
    this.finish();
  },
}
```

## API Reference

### 实例属性与方法

在页面逻辑中，可以通过 `this` 访问页面实例，并使用以下属性和方法。

#### `this.data`

`data` 表示当前页面的状态对象。

- 如果默认导出里提供了 `data`，运行时会把它作为当前页面状态
- 如果没有提供 `data`，运行时会自动初始化成空对象 `{}`
- 直接给 `this.data` 赋一个新对象时，会替换当前保存的状态对象

#### `this.setData(Object data, Function? callback)`

用于将数据从逻辑层发送到视图层（异步），同时改变对应的 `this.data` 的值。

- **参数**:
  - `data`: 包含需要更新的数据键值对。支持以数据路径的形式给出，例如 `'a.b.c': 1`
  - `callback`: 可选。数据更新完成后的回调函数

当前运行时行为：

- 第一个参数必须是对象，否则会抛错
- 普通顶层 key 会直接写入 `this.data`
- 点路径 key 会在需要时自动创建中间对象
- 如果传入 `callback`，会在数据更新并完成同步后执行

#### `this.postMessage(any data, Object? options)`

向承载当前页面的外部宿主发送一条 JSON 兼容消息。

- **参数**:
  - `data`: 要发送的 JSON 兼容数据
  - `options`: 可选的消息元信息对象
    - `origin?: string`: 消息来源标识，默认值为 `"ink-js"`
    - `lastEventId?: string`: 可选事件 id，会原样透传

```javascript
this.postMessage(
  {
    type: 'summary.refresh',
    payload: { force: true }
  },
  {
    origin: 'ink-js',
    lastEventId: 'page-msg-1'
  }
);
```

#### `this.querySelector(String selector)`

用于在当前页面实体树中查找第一个匹配的实体。

- 返回首个命中的 `Entity`
- 如果没有命中，则返回 `null`
- 非法 selector 会直接抛错

#### `this.querySelectorAll(String selector)`

用于在当前页面实体树中查询所有匹配的实体。

- 返回 `EntityList`
- 查询范围仅限当前页面
- 非法 selector 会直接抛错

### 环境感知

`World Awareness` 是页面级的环境感知能力，用来让当前页面直接接入空间朝向、稳定性变化和头部手势等环境感知信息。

启用后，运行时会把感知能力限制在当前页面内部。这意味着：

- 页面可以拥有私有的 `orientationSensor`
- 页面可以接收 `headgesture` 事件
- 页面可以接收 `orientationstabilitychange` 事件
- 页面卸载时，运行时会自动关闭这一组能力

当前运行时行为：

- `enableWorldAwareness()` 会创建或复用页面私有的 `orientationSensor`
- 原生页面逻辑会启动页面级 `AbsoluteOrientationSensor`
- `disableWorldAwareness()` 会停止当前页面级传感器会话并关闭相关回调
- 运行时会在 `onUnload()` 完成前自动调用 `disableWorldAwareness()`

如果你需要页面感知空间姿态或环境变化，通常应先启用 world awareness，再通过页面回调或 `this.orientationSensor` 读取相关信息。

#### `this.enableWorldAwareness(Object? options)`

将当前页面切换到页面级环境感知模式，用于启用环境感知相关能力。

- 当前运行时会创建或复用页面私有的 `orientationSensor`
- 运行时会从原生页面逻辑中启动页面级 `AbsoluteOrientationSensor`
- 启用后，页面可接收 `headgesture` 和 `orientationstabilitychange` 的回调投递
- 传感器实例保持为当前页面私有，而不是挂载到 `navigator` 上

- **参数**:
  - `options`: 可选配置对象
    - `mode?: "normal" | "micro"`: 头部手势模式。默认是 `"normal"`；传入 `"micro"` 时，会降低手势阈值，更适合轻微头部动作；其他值当前按 `"normal"` 处理

#### `this.disableWorldAwareness()`

停止当前页面级传感器会话，并关闭相关页面回调。

- 运行时会在 `onUnload()` 完成前自动调用它，因此页面通常不需要在卸载清理里手动关闭 world awareness

#### `this.orientationSensor`

当 world awareness 启用后，页面实例会通过 `this.orientationSensor` 暴露当前页面私有的 `AbsoluteOrientationSensor` 实例。

- 在 `enableWorldAwareness()` 执行前，它的值是 `undefined`
- 可用于读取 `quaternion`、`timestamp`、`stable` 和 `stabilityThreshold`
- 页面通常通过 `onOrientationStabilityChange(event)` 接收稳定性变化；如果需要，也可以直接给该传感器实例注册事件监听器

#### `this.finish()`

通知系统当前页面任务已完成。

- 对于 **Cut (快切)** 智能体，调用此方法将主动交回焦点并退出当前展示状态
- 对于 **Scene (场景)** 智能体，通常用于结束当前特定交互流程

### 生命周期回调

Page 生命周期描述单个页面从创建、显示、首次渲染到隐藏和卸载的过程。回调定义在页面默认导出的对象上，并以当前 Page 实例作为 `this` 执行。

![Page 从创建和首次渲染进入可见状态，可在显示与隐藏之间循环，最终卸载](../../image/framework/page-lifecycle-flow.svg)

`onLoad()` 和 `onReady()` 对同一个页面实例只调用一次。页面保留在页面栈中时，可以在 `onShow()` 与 `onHide()` 之间多次切换；只有移出页面栈时才调用 `onUnload()`。

| 回调函数 | 说明 | 触发时机 |
| :--- | :--- | :--- |
| `onLoad` | 监听页面加载 | 页面加载时触发（每个页面实例只触发一次） |
| `onShow` | 监听页面显示 | 页面显示/切入前台时触发 |
| `onReady` | 监听页面初次渲染完成 | 页面初次渲染完成时触发（每个页面实例只触发一次） |
| `onHide` | 监听页面隐藏 | 页面隐藏/切入后台时触发 |
| `onUnload` | 监听页面卸载 | 页面卸载时触发。运行时会在该阶段结束前自动关闭 world awareness。 |

#### `onLoad(Object query)`

页面创建时调用一次。`query` 包含打开当前页面时传入的路由参数，适合初始化页面数据、解析参数和启动只属于当前页面实例的任务。

#### `onShow()`

页面首次显示以及每次重新进入前台时调用。页面从其他页面返回时会再次触发 `onShow()`，但不会再次触发 `onLoad()`。适合刷新可见状态或恢复此前暂停的任务。

#### `onReady()`

包含初始视图的首帧实际呈现后调用一次；仅完成模板解析或布局还不会触发。返回已存在的页面和后续 `setData()` 不会再次触发。首帧前卸载的实例不会收到迟到回调。

#### `onHide()`

页面被其他页面覆盖或进入后台时调用，但页面实例仍可能保留在页面栈中。适合暂停计时器、动画、轮询和其他仅在页面可见时需要运行的任务。

#### `onUnload()`

页面从页面栈移除并准备释放资源时调用。适合取消请求、注销监听器并清理页面私有资源。运行时会在此阶段结束前自动关闭 world awareness。

### 事件回调

以下回调用于接收页面级输入、环境感知和宿主消息事件。它们不属于 Page 生命周期；同一种事件可以在页面存续期间触发多次。

| 回调函数 | 说明 | 触发时机 |
| :--- | :--- | :--- |
| `onKeyDown` | 监听页面级按键按下事件 | 用户按下按键时触发；可通过 `event.code` 获取按键编码 |
| `onKeyUp` | 监听页面级按键抬起事件 | 用户松开按键时触发；可通过 `event.code` 获取按键编码，并可调用 `event.preventDefault()` 阻止默认行为 |
| `onVoiceWakeup` | 监听页面级语音唤醒事件 | 语音唤醒命中时触发；可通过 `event.keyword` 获取唤醒词 |
| `onHeadGesture` | 监听页面级头部手势 | 启用 `enableWorldAwareness()` 后，在页面收到 `headgesture` 时触发 |
| `onHeadGestureStateChange` | 监听头部手势状态 | 启用 `enableWorldAwareness()` 后，在手势进入 `start`、`update`、`end` 或 `cancel` 状态时触发 |
| `onOrientationStabilityChange` | 监听页面级方向稳定性变化 | 启用 `enableWorldAwareness()` 后，在页面收到 `orientationstabilitychange` 时触发 |
| `onMessage` | 接收宿主消息 | 宿主向当前页面发送一次性数据或流式消息时触发；数据位于 `event.data` |

#### `onKeyDown(KeyboardEvent event)`

用户按下按键时调用。`event.code` 表示按键编码，适合处理方向键、确认键或设备按键的即时反馈。该回调通常用于监听输入本身；默认行为一般发生在对应的 `keyup` 阶段。

#### `onKeyUp(KeyboardEvent event)`

用户松开按键时调用。`event.code` 表示按键编码。`Backspace`、`ArrowUp`、`ArrowDown` 和 `Enter` 等按键可能分别触发返回、滚动或激活默认行为；页面需要接管操作时，可以调用 `event.preventDefault()`。

#### `onVoiceWakeup(VoiceWakeupEvent event)`

宿主检测到语音唤醒后调用。`event.keyword` 表示命中的唤醒词。该回调只处理当前活动页面的唤醒事件；跨页面共享的处理可以放在 App 的同名回调中。

#### `onHeadGesture(HeadGestureEvent event)`

启用 `enableWorldAwareness()` 后，在运行时识别到页面级头部手势时调用。适合处理只关心最终识别结果的交互；页面卸载后不会继续接收该事件。

#### `onHeadGestureStateChange(HeadGestureStateChangeEvent event)`

启用 `enableWorldAwareness()` 后，在手势识别进入 `start`、`update`、`end` 或 `cancel` 状态时调用。适合展示手势进行状态，或者在手势取消时恢复临时 UI。

#### `onOrientationStabilityChange(StabilityChangeEvent event)`

启用 `enableWorldAwareness()` 后，在页面方向稳定状态变化时调用。可以通过页面私有的 `this.orientationSensor` 读取当前姿态、时间戳和稳定性数据。

#### `onMessage(MessageEvent event)`

宿主向当前页面发送消息时调用。消息内容位于 `event.data`，既可能是一次性解析后的值，也可能是用于接收流式消息的对象。页面卸载后不再接收页面级消息。

#### `onNetworkStatus(event)`

连接状态变化时调用。`event.online` 为布尔值，`event.status` 为 `'online'` 或 `'offline'`。详细网络类型与质量从 [navigator.connection](/AIUI/api/weixin-compatible-apis-navigator) 读取；在线状态不是请求成功的保证。
