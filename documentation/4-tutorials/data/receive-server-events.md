# 接收服务端事件流

当服务端只需要持续向页面推送增量内容时，可以使用 `EventSource`。监听消息与错误，并在页面离开时关闭连接。

## 完成示例

<!-- aiui-tutorial-step -->

当服务端只需要持续向页面推送增量内容时，可以使用 `EventSource`。监听消息与错误，并在页面离开时关闭连接。

```javascript
const source = new EventSource('https://api.example.com/agent/stream');

source.addEventListener('message', (event) => {
  console.log('Update:', event.data);
});

source.addEventListener('error', (error) => {
  console.error('Stream failed', error);
});

// Call source.close() when the page no longer needs updates.
```

<!-- /aiui-tutorial-step -->

SSE 是单向通道；需要双向通信时选择 WebSocket。参见 [Event Source](/AIUI/api/network-event-source)。
