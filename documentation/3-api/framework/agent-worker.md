# AgentWorker

`AgentWorker` 表示由运行时创建的后台任务实例。入口脚本默认导出对象中的字段和方法会复制到该实例，并在调用 `onOpen(event)` 时作为 `this` 使用。

## 保存当前任务的共享状态

可以把需要复用的数据和方法直接放在默认导出对象上：

```javascript
export default {
  openCount: 0,
  status: null,

  onOpen(event) {
    this.openCount += 1;
    event.waitUntil(this.loadStatus());
  },

  async loadStatus() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.status = 'ready';
  },
};
```

这些字段会在当前 Agent Worker 运行期间保留。任务停止后再次启动时会创建新实例，因此不能把它当作永久存储。

## 等待异步任务完成

`onOpen()` 的返回值会被忽略。需要等待异步操作时，应在 `onOpen()` 返回前调用 `event.waitUntil()`：

```javascript
export default {
  onOpen(event) {
    event.waitUntil(this.synchronize());
  },
  async synchronize() {
    await new Promise((resolve) => setTimeout(resolve, 100));
  },
};
```

`waitUntil()` 可以接收 Promise，但调用动作本身必须发生在 `onOpen()` 的同步执行期间。回调结束后再调用会抛出 `InvalidStateError`。

## 主动停止后台任务

调用 `this.close()` 可以请求停止当前 Agent Worker：

```javascript
export default {
  openCount: 0,
  onOpen() {
    this.openCount += 1;
    if (this.openCount >= 3) {
      this.close();
      return;
    }
  },
};
```

停止请求不会让当前函数立刻中断。调用后应直接返回，不要继续启动新的任务。

## 使用全局事件写法

除了默认导出的 `onOpen()`，也可以在全局对象上监听 `open`：

```javascript
self.addEventListener('open', (event) => {
  event.waitUntil(new Promise((resolve) => setTimeout(resolve, 100)));
});
```

`AgentWorker` 实例本身不是 `EventTarget`；需要 `addEventListener()` 时使用 `self`。默认导出的 `onOpen()` 更适合需要通过 `this` 保存状态的场景。

## 当前行为

- `AgentWorker` 由运行时创建，不能使用 `new AgentWorker()`。
- `name`、`navigator` 和 `close` 是保留成员，默认导出中的同名字段不会覆盖它们。
- `this.navigator` 与全局 `navigator` 是同一个对象。
- 全局 `self` 和 `globalThis` 指向 Agent Worker 的全局对象，不等于 `onOpen()` 中的 `this`。
- `onOpen()` 每次触发都会调用，不会因为前一次异步操作仍在执行而自动合并。
- Agent Worker 不提供 `fetch`；网络请求应由 Page 或 Widget 发起。

Agent Worker 的声明方式和运行时长配置请参阅 [Agent Worker 开发](/AIUI/framework/open-agent-format-agent-worker)。

## API Reference

### `AgentWorker`

| 成员 | 类型 | 说明 |
| :--- | :--- | :--- |
| `name` | `string` | `app.json` 中声明的 Agent Worker 名称 |
| `navigator` | `WorkerNavigator` | 当前后台任务可用的环境信息和附加能力 |
| `close()` | `function` | 请求停止当前 Agent Worker |
| 自定义字段与方法 | `any` | 从入口脚本默认导出对象复制的成员 |

### `onOpen(event)`

每次智能体成功打开时调用一次。如果入口模块仍在加载，事件会排队，并在加载完成后依次调用。

| 参数 | 类型 | 说明 |
| :--- | :--- | :--- |
| `event` | `ExtendableEvent` | 本次 `open` 事件，可通过 `waitUntil()` 登记需要等待的 Promise |

返回值会被忽略。

### `ExtendableEvent`

`ExtendableEvent` 继承标准 `Event`，并增加以下方法：

| 方法 | 说明 |
| :--- | :--- |
| `waitUntil(value)` | 等待 `Promise.resolve(value)` 完成；必须在事件同步派发期间调用 |

事件的 `type` 为 `'open'`，`target` 和 `currentTarget` 指向 Agent Worker 的全局对象。

### `WorkerNavigator`

| 属性 | 类型 | 说明 |
| :--- | :--- | :--- |
| `id` | `string` | 当前智能体的内容标识 |
| `renderingEnabled` | `boolean` | 启动当前任务的入口是否具备界面显示能力 |
| `versions` | `NavigatorVersions` | AIUI 运行时版本信息 |
| `userAgent` | `string` | 当前运行环境标识 |
| `language` | `string` | 首选语言 |
| `languages` | `string[]` | 按优先级排列的语言列表 |
| `region` | `string` | 当前区域信息 |

### `AgentWorkerGlobalScope`

全局 `self`、`globalThis` 和 `name` 位于 `AgentWorkerGlobalScope`。它继承 `EventTarget`，支持：

```javascript
self.addEventListener('open', listener);
self.removeEventListener('open', listener);
close();
```
