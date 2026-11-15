# Agent Worker

Agent Worker 是随智能体运行的后台脚本。它适合管理多个 Page 或 Widget 打开期间共用的一份临时任务状态，或者管理只应启动一次的任务。

Agent Worker 不包含界面，也不是浏览器中的 Web Worker。它拥有独立的 JavaScript 运行环境，不提供 Page 或 Widget 的界面对象。

## 声明后台任务

在 `app.json` 的 `agentWorkers` 数组中声明入口：

```json
{
  "pages": ["pages/index/index"],
  "agentWorkers": [
    {
      "name": "sync",
      "script": "workers/sync.js",
      "trigger": { "type": "open" },
      "lifetime": "foreground"
    }
  ]
}
```

| 字段 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `name` | `string` | 是 | 当前智能体内唯一且非空的任务名称 |
| `script` | `string` | 是 | 相对于项目根目录的 `.js` 或 `.ts` 文件路径 |
| `trigger` | `object` | 是 | 启动条件；当前仅支持 `{ "type": "open" }` |
| `lifetime` | `string` | 是 | 任务保持运行的方式：`instant` 或 `foreground` |

`script` 不能使用绝对路径、URL、反斜杠或 `..`。当前一个智能体只能声明一个使用 `open` 的 Agent Worker。

## 编写入口脚本

入口文件必须默认导出一个对象。每次 Page 或 Widget 成功打开时，运行时都会调用一次 `onOpen(event)`。

```javascript
export default {
  openCount: 0,

  onOpen(event) {
    this.openCount += 1;
    event.waitUntil(this.refresh());
  },

  async refresh() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.latestStatus = 'ready';
  },
};
```

同一个正在运行的 Agent Worker 会保留 `this` 上的数据；后续打开 Page 或 Widget 时，仍会触发这个任务并继续使用已有状态。任务停止并重新启动后，这些数据会重新初始化；需要长期保存的数据应写入存储。

如果 `onOpen()` 启动了异步操作，需要在回调返回前调用 `event.waitUntil(promise)`。仅把 `onOpen()` 声明为 `async` 不会自动等待返回的 Promise。

## 避免重复启动任务

多个入口在短时间内打开时，前一次异步初始化可能尚未结束。可以保存正在执行的 Promise，让它们共用同一次初始化：

```javascript
export default {
  service: null,
  startPromise: null,

  onOpen(event) {
    event.waitUntil(this.ensureService());
  },

  ensureService() {
    if (this.service) return Promise.resolve(this.service);

    if (!this.startPromise) {
      this.startPromise = this.createService()
        .then((service) => {
          this.service = service;
          return service;
        })
        .finally(() => {
          this.startPromise = null;
        });
    }
    return this.startPromise;
  },

  async createService() {
    return { startedAt: Date.now() };
  },
};
```

## 在后台发起网络请求

例如，智能体打开时获取一份配置：

```javascript
export default {
  onOpen(event) {
    const work = fetch('https://api.example.com/config')
      .then((response) => {
        if (!response.ok) throw new Error(`请求失败：${response.status}`);
        return response.json();
      })
      .then((config) => console.log('配置：', config))
      .catch((error) => console.error('获取配置失败：', error.message));
    event.waitUntil(work);
  },
};
```

在 `onOpen()` 返回前同步调用 `waitUntil()`，才能让短任务等待请求完成。需要长连接时可使用 `WebSocket`；根据任务生命周期关闭连接，并处理网络变化造成的中断。

## 选择运行时长

| `lifetime` | 行为 | 适合场景 |
| :--- | :--- | :--- |
| `instant` | 入口脚本、`onOpen()` 和通过 `waitUntil()` 登记的任务完成后停止 | 同步一次数据、完成一次短任务 |
| `foreground` | 只要当前智能体仍有 Page 或 Widget 打开就继续运行 | 共享连接、持续监听 |

`background` 是预留值，当前版本不支持；使用它会导致 `app.json` 校验失败。

## 可用能力与限制

Agent Worker 可以使用：

- 定时器、Promise、`console`、`performance`、`fetch` 和 `WebSocket`
- URL、文本编解码、Web Crypto 和 WebAssembly
- 项目内的 ES Module

Agent Worker 可以直接发起网络请求，但不提供 Page、Widget、`window`、`document`、界面渲染、路由和媒体采集能力。更新可见界面仍需由 Page 或 Widget 处理。

## 继续阅读

- [AgentWorker API](/AIUI/api/framework-agent-worker)：查看 `onOpen()`、`waitUntil()`、`close()` 和可用属性
- [app.json](/AIUI/framework/open-agent-format-app-json)：查看应用入口配置
