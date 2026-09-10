# 建立 WebSocket 连接

需要双方持续发送消息时，使用 `WebSocket` 建立长连接。只在 `open` 之后发送，并处理关闭与错误状态。

## 完成示例

<!-- aiui-tutorial-step -->

需要双方持续发送消息时，使用 `WebSocket` 建立长连接。只在 `open` 之后发送，并处理关闭与错误状态。

```javascript
const socket = new WebSocket('wss://example.com/realtime');

socket.addEventListener('open', () => {
  socket.send(JSON.stringify({ type: 'subscribe' }));
});

socket.addEventListener('message', (event) => {
  console.log(JSON.parse(event.data));
});

socket.addEventListener('close', () => {
  console.log('Socket closed');
});
```

<!-- /aiui-tutorial-step -->

连接恢复和协议选择参见 [WebSocket](/AIUI/api/network-websocket)。

