# 网络

页面需要从 HTTPS 接口取得一次响应时，使用 `fetch()`。在页面的事件处理函数里，把示例地址换成自己的接口，并在读取 JSON 之前检查 HTTP 状态。

```javascript
const response = await fetch('https://api.example.com/message');
if (!response.ok) {
  throw new Error(`Request failed: ${response.status}`);
}
const data = await response.json();
console.log(data);
```

在异步处理函数中运行这段代码，并确认控制台输出预期的 JSON。如果请求失败，在页面上显示能帮助用户继续操作的错误提示。完整页面示例见[加载并显示远程数据](../../../4-tutorials/data/load-remote-data.md)。

- [选择网络 API](../../../3-api/network.md)，了解 HTTPS、服务端事件和双向通信分别适用于哪些场景。
- [查询 `fetch` 和 `wx.request`](../../../3-api/network/https.md) 的参数、返回值和流式读取方式。
- 调试或发布智能体前，先[了解眼镜如何联网](./usage.md)。
