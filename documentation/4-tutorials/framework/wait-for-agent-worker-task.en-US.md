# Keep an Agent Worker Alive Until a Task Finishes

Keep a short-lived Agent Worker running long enough to finish a delayed operation.

## Declare a Short-Lived Worker

<!-- aiui-tutorial-step -->

Merge the following settings into your project’s `app.json`, keeping the home page. If your practice project already declares an `open` Worker, temporarily replace that entry with this one.

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

## Register the Promise in onOpen

<!-- aiui-tutorial-step -->

Create `workers/delayed-task.js`. Call `event.waitUntil()` synchronously before `onOpen()` returns, passing the promise that includes the final log message.

```javascript
export default {
  onOpen(event) {
    console.log('Task started');

    const task = new Promise((resolve) => setTimeout(resolve, 500))
      .then(() => console.log('Task finished'));

    event.waitUntil(task);
  }
};
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Open the home page and check the Agent Worker logs. “Task started” should appear first, followed by “Task finished” about half a second later.

See [Agent Worker](/AIUI/framework/open-agent-format-agent-worker) for Worker lifetimes.
