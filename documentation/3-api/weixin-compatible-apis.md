# 微信小程序兼容 API

AIUI 提供以下微信小程序风格的兼容接口，便于迁移或复用已有代码。它们只覆盖表中列出的能力，并不代表完整支持微信小程序 API。

## 基础

- `wx.canIUse`：查询兼容能力。
- `wx.arrayBufferToBase64`：将二进制数据编码为 Base64。

## 网络

- `wx.request`：发起 HTTP 或 HTTPS 请求。
- `wx.connectSocket`、`wx.createSocket`：创建 WebSocket 连接。
- `wx.createEventSource`：创建 SSE 连接。

具体用法见[网络](/AIUI/api/network)。

## 存储

- `wx.setStorage`、`wx.getStorage`：异步写入和读取本地数据。
- `wx.removeStorage`、`wx.clearStorage`：异步删除或清空本地数据。
- 上述接口对应的 `Sync` 方法：同步操作本地数据。

具体用法见[存储](/AIUI/api/storage-api)。

## Canvas

- `wx.createCanvasContext`：获取 Canvas 2D 绘图上下文。

具体用法见[画布](/AIUI/api/canvas)。

## 路由

- `wx.navigateTo`：保留当前页面并跳转。
- `wx.redirectTo`：替换当前页面。
- `wx.navigateBack`：返回上一页或多级页面。

具体用法见[路由](/AIUI/api/route)。

## 语音

- `wx.speech.playTTS`：合成并播放文本语音。
- `wx.speech.startRecognition`：开始一次语音识别。

具体用法见[AI](/AIUI/api/ai)。

## 多媒体

- `wx.media.createCameraContext`：获取相机上下文。
- `wx.media.getRecorderManager`：获取录音管理器。
- `wx.createVideoContext`：获取当前页面 `<video>` 组件的播放控制上下文。

具体用法见[多媒体](/AIUI/api/media)。

## 系统

- `wx.getWindowInfo`：获取窗口与安全区域信息。
- `wx.exitMiniProgram`：请求退出当前实例。

## 界面

- `wx.setBackgroundColor`：调用页面背景色兼容接口。

> 代码示例中的 Web/wx 切换只用于表达同一能力的两种 API Style。仅支持 wx 的能力仍使用普通 Markdown 代码块。

## 查询接口是否注册

```javascript
if (wx.canIUse('request')) {
  wx.request({ url: 'https://example.com/data' });
}
console.log(wx.canIUse('media.getDevices'));
console.log(wx.canIUse('request.object.unknown')); // false
```

传入不带 `wx.` 前缀的精确函数路径。命名空间、未知路径和之后由应用自行添加的函数不算已注册能力。返回 `true` 只表示接口存在，不保证权限、设备状态或请求成功。

## API Reference

### `wx`

#### `wx.canIUse(schema)`

`schema` 为函数路径字符串，返回 `boolean`；匹配当前运行环境初始化时注册的兼容接口。

#### `wx.exitMiniProgram(options?)`

请求退出当前实例，返回 `undefined`。`options` 可省略；提供时可包含 `success`、`fail`、`complete` 回调。
