# HTTPS

在 AIUI 中，`HTTPS` 用于基于 HTTP / HTTPS 的请求式通信。最常见的形式是“发起一次请求，再等待服务端返回响应”，但这并不意味着响应体一定要一次性读完。

如果你在做配置拉取、普通 REST 接口、表单提交、调用智能体服务，通常优先使用 `HTTPS`。当服务端采用分块传输时，你也可以通过 `fetch()` 返回的 `Response` 对象按流式方式读取响应体。

## 发起 JSON 请求

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
const response = await fetch('https://api.example.com/agent/chat', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    message: '帮我总结今天的会议内容',
  }),
});

if (!response.ok) {
  throw new Error(`请求失败: ${response.status}`);
}

const data = await response.json();
console.log(data);
```

**wx**

```javascript api-style=wx
wx.request({
  url: 'https://api.example.com/agent/chat',
  method: 'POST',
  header: {
    'content-type': 'application/json',
  },
  data: {
    message: '帮我总结今天的会议内容',
  },
  success(res) {
    console.log(res.statusCode, res.data);
  },
  fail(error) {
    console.error(error);
  },
});
```

<!-- /aiui-api-style -->

## 使用 `fetch` 流式读取文本响应

```javascript
const response = await fetch('https://api.example.com/agent/stream');
const reader = response.body.getReader();
const decoder = new TextDecoder('utf-8');
let text = '';

while (true) {
  const { value, done } = await reader.read();
  if (done) {
    break;
  }

  text += decoder.decode(value, { stream: true });
}

text += decoder.decode();
console.log(text);
```

## 读取包内资源并检查请求内容

GET/HEAD Fetch 请求可以读取完整应用包内的根路径。`/assets/route.gpx` 与 `file:///assets/route.gpx` 访问同一个包内资源，不能访问设备任意文件。远端 API 地址应使用显式 `https://` URL。

```javascript
const response = await fetch('/assets/route.gpx');
const route = await response.text();
console.log(route);

const request = new Request('https://api.example.com/order', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ quantity: 2 }),
});
console.log(await request.clone().json());
console.log(request.bodyUsed); // false
await fetch(request);
```

`Request` 的便捷读取和流式读取共用消费状态。需要检查请求体并继续发送时，先克隆再读取；锁定或已经消费的 body 不能再次读取或克隆。

## 上传文件和表单

使用 `File` 和 `FormData` 可以同时提交文本字段和文件：

```javascript
const attachment = new File(['AIUI 0.18'], 'release.txt', {
  type: 'text/plain'
});

const form = new FormData();
form.append('title', '版本说明');
form.append('attachment', attachment);

await fetch('https://example.com/upload', {
  method: 'POST',
  body: form
});
```

传入 `FormData` 时不需要手动设置 `content-type`；运行时会生成包含 boundary 的请求头。

## 使用 `RequestTask` 监听响应头和分块

```javascript
const task = wx.request({
  url: 'https://api.example.com/agent/stream',
  method: 'GET',
  success(res) {
    console.log('最终结果:', res.data);
  },
});

task.onHeadersReceived((headers) => {
  console.log('收到响应头:', headers);
});

task.onChunkReceived((chunk) => {
  console.log('收到分块数据:', chunk);
});
```

## 什么时候用 HTTPS

- 拉取页面初始化数据
- 调用普通 REST 接口
- 提交一次性表单或指令
- 请求一个完整结果，随后用 `json()`、`text()` 或 `arrayBuffer()` 一次性读取
- 发起一次 HTTP 请求，但希望对响应体做分块消费

## 接入方式

AIUI 当前提供两种常见入口：

- **`fetch(url, options?)`**：更接近 Web 标准，适合 Promise 风格与 `Response` 风格的读取方式。
- **`wx.request(options)`**：更接近微信小程序兼容接口，适合回调风格与 `RequestTask` 风格的控制方式。

## 流式消费说明

- 如果你需要边收边处理文本或字节，优先使用 `response.body.getReader()`。
- 如果你只关心最终结果，优先使用 `text()`、`json()` 或 `arrayBuffer()`。
- 一旦 body 被 reader 锁定，`text()`、`json()` 这类便捷读取方法就不能再复用同一个 body。
- 当文本可能跨 chunk 边界时，配合 `TextDecoder.decode(value, { stream: true })` 做增量解码会更安全。

## HTTPS 使用建议

- 优先把一次业务动作建模成一次明确的 HTTP 请求。
- 如果只关心最终结果，直接使用 `response.json()` 或 `wx.request().success` 会更简单。
- 如果服务端是一次请求但响应会持续分块返回，优先用 `fetch` 配合 `response.body` 做流式消费。
- 为请求设置清晰的超时、取消、失败提示和重试策略。
- 对于需要鉴权的接口，把认证信息统一放在请求头或会话机制里处理。

## 什么时候不用 HTTPS

- 需要服务端主动长期单向推送，而不是由一次请求触发返回时
- 需要客户端与服务端保持双向实时通信时

如果你需要服务端单向持续推送，继续参考 [Event Source](/AIUI/api/network-event-source)。如果需要双向实时通信，改用 [WebSocket](/AIUI/api/network-websocket)。

## 继续阅读

- **[Event Source](/AIUI/api/network-event-source)**：查看服务端单向流式推送的典型使用方式。
- **[WebSocket](/AIUI/api/network-websocket)**：查看双向实时长连接场景如何设计与管理。
- **[微信小程序兼容 API](/AIUI/api/weixin-compatible-apis)**：查看 AIUI 支持的 wx API 列表。

## API Reference

### `fetch(input, options?)`

`fetch()` 会发起一个 HTTP / HTTPS 请求，并返回一个 `Promise<Response>`。

#### 参数

#### `input`

请求地址，可以是字符串、`URL` 或 `Request`。传入 `Request` 后，`options` 中提供的字段会覆盖对应设置。

```javascript
const response = await fetch('https://example.com/data.json');
```

#### `options.method`

HTTP 方法，默认是 `GET`。

```javascript
await fetch('https://example.com/items', {
  method: 'POST',
});
```

#### `options.headers`

请求头对象。当前实现会按字符串方式读取 header 值。

```javascript
await fetch('https://example.com/items', {
  headers: {
    Authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  },
});
```

#### `options.body`

请求体支持字符串、`Blob`、`FormData`、`URLSearchParams`、`ArrayBuffer`、TypedArray 和 `ReadableStream`。

```javascript
await fetch('https://example.com/items', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    title: 'hello',
  }),
});
```

#### `options.timeout`

单次请求超时时间，单位为毫秒。

```javascript
await fetch('https://example.com/items', {
  timeout: 3000,
});
```

#### `options.signal`

用于取消请求的 `AbortSignal`。

```javascript
const controller = new AbortController();

fetch('https://example.com/items', { signal: controller.signal });
controller.abort();
```

### `Request`

#### `new Request(input, options?)`

从 URL 字符串、`URL` 或另一个 `Request` 构建请求，支持上方请求选项；显式选项覆盖原请求设置。

#### `method`

只读 HTTP 方法，默认为 `GET`。包内资源只支持 GET/HEAD。

#### `url`

只读请求地址。包根路径和限定在包内的 `file:///` URL 是本地资源；远端地址应使用显式 HTTP/HTTPS URL。

#### `headers`

请求 `Headers` 对象，可在发送前读取和更新请求头。

#### `body`

只读 `ReadableStream` 或 `null`。流式读取与便捷方法共用同一请求体；锁定期间阻止其他消费，释放锁不会恢复已经消费的字节。

#### `bodyUsed`

只读 `boolean`，表示是否已开始消费请求体。锁定与消费不同；body 尚未消费时也可能已经锁定，此时即使值为 false 也不能由另一消费者读取。

#### `signal`

只读的关联 `AbortSignal`，使用传入该 signal 的控制器取消请求。

#### `redirect`

只读的请求重定向模式配置。

#### `clone()`

返回 body 可独立读取的新 `Request`。必须在获取 reader 或消费前克隆；body 已锁定或消费时抛出 `TypeError`。

#### `text()`

返回 `Promise<string>`，以 UTF-8 文本消费请求体。body 已锁定或消费时以 `TypeError` 拒绝。

#### `json()`

返回从请求体文本解析出的 JSON 值的 Promise。与其他读取方法共用消费状态，非法 JSON 会拒绝。

#### `arrayBuffer()`

返回 `Promise<ArrayBuffer>` 并消费请求体；没有 body 时得到空缓冲区。

#### `blob()`

返回 `Promise<Blob>` 并消费请求体；存在 `content-type` 请求头时用它设置 Blob 类型。

### `Blob`、`File` 与 `FormData`

- `new Blob(parts, options?)` 创建一组不可变的二进制数据，支持 `arrayBuffer()`、`bytes()`、`text()`、`stream()` 和 `slice()`。
- `new File(parts, name, options?)` 在 `Blob` 基础上增加 `name` 和 `lastModified`。
- `new FormData()` 管理表单字段，支持 `append()`、`set()`、`get()`、`getAll()`、`has()`、`delete()`、`entries()`、`keys()`、`values()` 和 `forEach()`。

### `Response`

`fetch()` 返回的 `Promise` 会在响应头可用时进入 resolved 状态，而不是等整个响应体下载完成以后才返回。这意味着：

- 你可以先检查 `status`、`ok` 等元信息。
- 如果服务端分块返回数据，可以通过 `response.body` 按块消费。
- 如果你只关心最终结果，也可以直接使用 `text()`、`json()`、`arrayBuffer()` 这类便捷方法。
- 如果响应带有 HTTP `Content-Encoding`，读取到的是解码后的 body 字节，而不是原始压缩传输字节。

#### 常用字段

#### `response.ok`

当状态码位于 `200-299` 区间时为 `true`。

#### `response.status`

HTTP 数字状态码，例如 `200`、`404`、`500`。

#### `response.statusText`

HTTP 状态文本。当前实现中，`200` 返回 `"OK"`，其他状态通常为空字符串。

#### `response.url`

本次响应对应的 URL。

#### `response.body`

响应体对应的 `ReadableStream`。如果服务端按块返回数据，可以通过 `getReader()` 逐块读取，而不是等待整个响应结束。

```javascript
const response = await fetch('https://example.com/stream');
const reader = response.body.getReader();
const decoder = new TextDecoder('utf-8');
let buffer = '';

while (true) {
  const { value, done } = await reader.read();
  if (done) {
    break;
  }

  buffer += decoder.decode(value, { stream: true });
}

buffer += decoder.decode();
console.log(buffer);
```

#### `response.bodyUsed`

表示响应体是否已开始被消费。锁定与消费不同：获取 reader 后 body 可能仍未消费，但锁定期间其他读取方法仍会失败；读取开始后 `bodyUsed` 为 `true`。

#### 常用方法

#### `response.clone()`

返回当前响应的一个新副本。当前实现支持分别消费原始响应与克隆响应。

```javascript
const response = await fetch('https://example.com/data.json');
const copy = response.clone();

console.log(await response.text());
console.log(await copy.text());
```

#### `response.text()`

把响应体解码为字符串。它会等待整个响应体读取完成，再返回最终文本。

```javascript
const response = await fetch('https://example.com/message.txt');
console.log(await response.text());
```

#### `response.json()`

把响应体解析为 JSON。它会先完整读取响应体，再执行解析。

```javascript
const response = await fetch('https://example.com/data.json');
console.log(await response.json());
```

#### `response.arrayBuffer()`

把响应体读取为 `ArrayBuffer`，适合二进制内容。

```javascript
const response = await fetch('https://example.com/model.bin');
const buffer = await response.arrayBuffer();
console.log(buffer.byteLength);
```

#### `response.blob()`

把响应体读取为 `Blob`，适合需要保留媒体类型的二进制内容。

### wx APIs

#### `wx.request(options)`

`wx.request()` 提供了微信小程序兼容风格的 HTTPS 请求入口，更适合基于回调或 `RequestTask` 的写法。

#### 参数

#### `options.url`

请求地址。

#### `options.method`

HTTP 方法，默认是 `GET`。

#### `options.header`

请求头对象。

```javascript
wx.request({
  url: 'https://example.com/items',
  header: {
    Authorization: `Bearer ${token}`,
  },
});
```

#### `options.data`

请求数据。当前实现支持：

- `String`
- `ArrayBuffer`
- 普通对象
- 类表单对象

当 `content-type` 包含 `application/x-www-form-urlencoded` 时，对象会按表单方式编码；否则普通对象通常会被序列化为 JSON 字符串。

```javascript
wx.request({
  url: 'https://example.com/items',
  method: 'POST',
  header: {
    'content-type': 'application/json',
  },
  data: {
    title: 'hello',
  },
});
```

#### `options.body`

当 `data` 未提供时，可以使用备用字符串请求体。

#### `options.timeout`

单次请求超时时间，单位为毫秒。

#### `options.responseType`

响应体模式，默认是 `text`。当设置为 `arraybuffer` 时，`success` 回调中的 `res.data` 会是 `ArrayBuffer`。

#### `options.dataType`

返回值解析模式，默认是 `json`。当设置为 `json` 时，运行时会尝试在赋值给 `res.data` 之前先做一次 JSON 解析。

#### `options.success`

请求成功回调，接收的结果对象通常包含：

- `data`
- `statusCode`
- `header`
- `cookies`
- `errMsg`

#### `options.fail`

请求失败回调，通常接收包含 `errMsg` 的对象。

#### `options.complete`

请求结束回调。无论成功还是失败都会调用。

#### `RequestTask`

`wx.request(...)` 会返回一个 `RequestTask`，可用于中断请求或监听更早到达的响应事件。

#### 方法

- **`abort()`**：中断当前请求。
- **`onHeadersReceived(callback)`** / **`offHeadersReceived(callback?)`**：监听或移除响应头到达事件。
- **`onChunkReceived(callback)`** / **`offChunkReceived(callback?)`**：监听或移除分块响应到达事件。

#### 行为说明

- `onHeadersReceived()` 会在响应头到达时触发，早于请求最终完成。
- `onChunkReceived()` 会在新的响应体分块到达时持续触发。
- 即使启用了分块事件，`success()` 与 `complete()` 仍然会等待完整响应结束。
