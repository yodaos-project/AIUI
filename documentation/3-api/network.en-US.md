# Network

AIUI networking capabilities mainly fall into three categories: one-shot request and response, continuous server push, and bidirectional real-time communication. Most business APIs and AI service calls should start with `HTTPS`; if the server needs to keep pushing incremental results to the frontend, you can use `SSE`; only consider `WebSocket` when you truly need a long-lived bidirectional real-time connection.

In the AI glasses scenario, networking also needs to balance battery life and power consumption. To reduce the energy cost of direct network access on the device side, AIUI on Rokid Glasses connects to the mobile app over Bluetooth and carries HTTPS traffic through that link. For developers, the request style stays the same, but when you are interpreting network behavior, poor-network conditions, and on-device debugging results, you should keep in mind that these requests actually travel through the Bluetooth link between the device and the phone.

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

- **[HTTPS](/AIUI/api/network-https)**: Learn how ordinary request-response scenarios work in AIUI.
- **[Event Source](/AIUI/api/network-event-source)**: Learn which business scenarios fit one-way streaming pushes from the server.
- **[WebSocket](/AIUI/api/network-websocket)**: Learn the typical usage patterns for bidirectional real-time connections, plus connection management and reconnection recommendations.
- **[Streams](/AIUI/api/network-streams)**: Learn how to read, write, and transform data in chunks.
- **[Device](/AIUI/api/device)**: See Bluetooth connectivity and device sensor capabilities, including accelerometer, orientation, and gyroscope APIs.
- **[WeChat Mini Program Compatible APIs](/AIUI/api/weixin-compatible-apis)**: See compatible APIs such as `wx.request`, `wx.connectSocket`, and `wx.createEventSource`.
