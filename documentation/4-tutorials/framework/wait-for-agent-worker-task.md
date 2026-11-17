# 让 Agent Worker 等待异步任务完成

让短生命周期的 Agent Worker 等待一个延迟操作完成，再停止运行。

## 声明短生命周期任务

<!-- aiui-tutorial-step -->

将以下配置合并到已有项目的 `app.json`，保留首页。如果已声明一个 `open` 触发的 Worker，可在练习项目中临时使用下面的条目替换它。

```json
{
  "agentWorkers": [
    {
      "name": "delayed-task",
      "script": "workers/delayed-task.js",
      "trigger": { "type": "open" },
      "lifetime": "instant"
    }
  ]
}
```

<!-- /aiui-tutorial-step -->

## 在 onOpen 中登记 Promise

<!-- aiui-tutorial-step -->

创建 `workers/delayed-task.js`。`onOpen()` 返回前同步调用 `event.waitUntil()`，把包含最终日志的 Promise 交给运行时。

```javascript
export default {
  onOpen(event) {
    console.log('任务已开始');

    const task = new Promise((resolve) => setTimeout(resolve, 500))
      .then(() => console.log('任务已完成'));

    event.waitUntil(task);
  }
};
```

<!-- /aiui-tutorial-step -->

## 验证效果

打开项目首页并查看 Agent Worker 日志。应先看到「任务已开始」，约半秒后看到「任务已完成」。

任务生命周期参见 [Agent Worker](/AIUI/framework/open-agent-format-agent-worker)。
