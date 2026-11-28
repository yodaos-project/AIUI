# 网络

用 HTTPS 发送请求并接收一次响应，用服务端发送事件（SSE）接收持续更新。客户端和服务端都需要主动发送消息时，使用 WebSocket。

Rokid 眼镜的 HTTPS 请求可能经由眼镜与手机之间的蓝牙连接传输。请求 API 保持一致。请在眼镜上验证页面如何处理响应变慢或连接断开的情况。

## 如何选择

- **HTTPS**：适合普通接口调用，例如拉取配置、提交表单、请求智能体结果。
- **SSE**：适合服务端持续推送文本增量、状态流、任务进度等单向流式场景。
- **WebSocket**：适合客户端和服务端需要双向实时收发消息的场景，例如多人协作、实时控制、低延迟消息通道。
- **Streams**：适合分段读取、写入或转换持续到达的数据，例如文本流、大文件和语音片段。

## 简单示例

例如，请求一个智能体服务接口：

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
  data: { message: '你好' },
  success(res) {
    console.log(res.data);
  },
});
```

<!-- /aiui-api-style -->

## 继续阅读

- 跟着[加载并显示远程数据](../4-tutorials/data/load-remote-data.md)构建页面，显示加载提示、返回内容或错误。
- **[HTTPS](/AIUI/api/network-https)**：了解普通请求响应场景在 AIUI 中该如何使用。
- **[Event Source](/AIUI/api/network-event-source)**：了解服务端单向流式推送适合怎样的业务场景。
- **[WebSocket](/AIUI/api/network-websocket)**：了解双向实时连接的典型使用方式、连接管理和重连建议。
- **[数据流](/AIUI/api/network-streams)**：了解如何分段读取、写入和转换数据。
- **[设备](/AIUI/api/device)**：查看蓝牙连接和设备传感器能力，包括加速度、姿态和陀螺仪等接口。
- **[微信小程序兼容 API](/AIUI/api/weixin-compatible-apis)**：查看 `wx.request`、`wx.connectSocket`、`wx.createEventSource` 等兼容接口。
