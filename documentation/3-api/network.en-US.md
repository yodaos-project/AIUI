# Network

Choose HTTPS for a request that returns one response, server-sent events (SSE) for updates from the server, or WebSocket when both sides need to send messages.

On Rokid Glasses, HTTPS requests can travel through the phone’s Bluetooth connection. Use the same request API and check how your page handles slow responses or lost connections on the device.

## How To Choose

- **HTTPS**: Suitable for regular API calls, such as loading configuration, submitting forms, or requesting agent results.
- **SSE**: Suitable for one-way streaming scenarios where the server keeps pushing text increments, status streams, or task progress.
- **WebSocket**: Suitable for scenarios where the client and server need to send and receive messages bidirectionally in real time, such as multi-user collaboration, real-time control, or low-latency messaging channels.
- **Streams**: Suitable for reading, writing, or transforming incoming data in chunks, such as live text, large files, and audio chunks.

## Simple Example

For example, request an agent service API:

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
const response = await fetch('/api/agent/chat', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify({ message: '你好' }),
});
```

**wx**

```javascript api-style=wx
wx.request({
  url: '/api/agent/chat',
  method: 'POST',
  header: {
    'content-type': 'application/json',
  },
  data: { message: 'Hello' },
  success(res) {
    console.log(res.data);
  },
});
```

<!-- /aiui-api-style -->

## Continue Reading

- Start with [Load and Display Remote Data](../4-tutorials/data/load-remote-data.en-US.md) to display the loading message, response, or error.
- **[HTTPS](/AIUI/api/network-https)**: Learn how ordinary request-response scenarios work in AIUI.
- **[Event Source](/AIUI/api/network-event-source)**: Learn which business scenarios fit one-way streaming pushes from the server.
- **[WebSocket](/AIUI/api/network-websocket)**: Learn the typical usage patterns for bidirectional real-time connections, plus connection management and reconnection recommendations.
- **[Streams](/AIUI/api/network-streams)**: Learn how to read, write, and transform data in chunks.
- **[Device](/AIUI/api/device)**: See Bluetooth connectivity and device sensor capabilities, including accelerometer, orientation, and gyroscope APIs.
- **[WeChat Mini Program Compatible APIs](/AIUI/api/weixin-compatible-apis)**: See compatible APIs such as `wx.request`, `wx.connectSocket`, and `wx.createEventSource`.
