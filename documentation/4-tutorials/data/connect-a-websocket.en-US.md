# Connect a WebSocket

Use `WebSocket` when both sides need to send messages continuously. Send only after `open`, and handle close and error states.

## Complete the Example

<!-- aiui-tutorial-step -->

Use `WebSocket` when both sides need to send messages continuously. Send only after `open`, and handle close and error states.

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

See [WebSocket](/AIUI/api/network-websocket) for reconnection and protocol guidance.

