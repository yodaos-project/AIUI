# 运行 Agent Worker

Agent Worker 适合没有界面的后台任务。在 `app.json` 中声明入口，并在脚本的 `onOpen()` 中处理每次打开事件。

## 完成示例

<!-- aiui-tutorial-step -->

Agent Worker 适合没有界面的后台任务。在 `app.json` 中声明入口，并在脚本的 `onOpen()` 中处理每次打开事件。

```javascript
export default {
  openCount: 0,

  onOpen(event) {
    this.openCount += 1;
    console.log('Worker opened', this.openCount, event.type);
  }
};
```

<!-- /aiui-tutorial-step -->

Agent Worker 不提供 `fetch`、页面路由或界面渲染。参见 [Agent Worker](/AIUI/framework/open-agent-format-agent-worker)。

