# HTTPS

In AIUI, `HTTPS` is used for request-oriented communication over HTTP / HTTPS. The most common pattern is "send one request, then wait for the server response", but that does not mean the response body must always be consumed all at once.

If you are building configuration fetching, ordinary REST APIs, form submissions, or agent service calls, `HTTPS` is usually the first choice. When the server returns chunked data, you can also consume the response incrementally through the `Response` object returned by `fetch()`.

## Send a JSON request

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
const response = await fetch('https://api.example.com/agent/chat', {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Summarize today\'s meeting for me',
  }),
});

if (!response.ok) {
  throw new Error(`Request failed: ${response.status}`);
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
    message: 'Summarize today\'s meeting for me',
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

## Read a streaming text response with `fetch`

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

## Read Packaged Assets and Inspect a Request

GET/HEAD Fetch requests can read paths rooted in a full application's package. `/assets/route.gpx` and `file:///assets/route.gpx` access the same packaged resource, not arbitrary device files. Use explicit `https://` URLs for remote API endpoints.

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

`Request` convenience readers and stream reads share consumption state. To inspect a body and still send it, clone before reading. Locked or consumed bodies cannot be read or cloned again.

## Upload a File and Form Fields

Use `File` and `FormData` to submit text fields and files together:

```javascript
const attachment = new File(['AIUI 0.18'], 'release.txt', {
  type: 'text/plain'
});

const form = new FormData();
form.append('title', 'Release notes');
form.append('attachment', attachment);

await fetch('https://example.com/upload', {
  method: 'POST',
  body: form
});
```

Do not set `content-type` manually for `FormData`; the runtime creates the request header with the required boundary.

## Observe headers and chunks with `RequestTask`

```javascript
const task = wx.request({
  url: 'https://api.example.com/agent/stream',
  method: 'GET',
  success(res) {
    console.log('Final result:', res.data);
  },
});

task.onHeadersReceived((headers) => {
  console.log('Response headers:', headers);
});

task.onChunkReceived((chunk) => {
  console.log('Chunk received:', chunk);
});
```

## When to Use HTTPS

- Fetching initial page data
- Calling ordinary REST APIs
- Submitting one-off forms or commands
- Requesting one complete result and reading it with `json()`, `text()`, or `arrayBuffer()`
- Sending one HTTP request while consuming the response body incrementally

## Streaming Consumption Notes

- Use `response.body.getReader()` when you need incremental access to text or bytes.
- Use `text()`, `json()`, or `arrayBuffer()` when you only care about the final buffered result.
- Once the body is locked to a reader, convenience methods such as `text()` and `json()` can no longer reuse that same body.
- When text may cross chunk boundaries, using `TextDecoder.decode(value, { stream: true })` is safer for incremental decoding.

## HTTPS Recommendations

- Prefer modeling one business action as one clear HTTP request.
- If you only care about the final result, `response.json()` or `wx.request().success` is usually the simplest choice.
- If one request returns chunked content over time, prefer `fetch` with `response.body` for incremental consumption.
- Set clear timeout, cancellation, failure messaging, and retry strategies.
- For authenticated APIs, handle authentication consistently in request headers or session mechanisms.

## When Not to Use HTTPS

- When you need long-lived one-way server push instead of a response triggered by a single request
- When bidirectional real-time communication is required between client and server

If you need continuous one-way server push, continue with [Event Source](/AIUI/api/network-event-source). If you need bidirectional real-time communication, use [WebSocket](/AIUI/api/network-websocket) instead.

## Read Next

- **[Event Source](/AIUI/api/network-event-source)**: Learn the typical usage pattern for one-way streaming pushes from the server.
- **[WebSocket](/AIUI/api/network-websocket)**: Learn how to design and manage bidirectional real-time long connections.
- **[WeChat Mini Program Compatible APIs](/AIUI/api/weixin-compatible-apis)**: See the wx APIs supported by AIUI.

## API Reference

### Entry Points

AIUI currently provides two common entry points:

- **`fetch(url, options?)`**: Closer to Web standards and better suited for Promise-based code and `Response`-style consumption.
- **`wx.request(options)`**: Closer to the WeChat Mini Program compatible API style and better suited for callback-based code and `RequestTask`-style control.

### `fetch(input, options?)`

`fetch()` sends an HTTP / HTTPS request and returns a `Promise<Response>`.

#### Parameters

#### `input`

The request address can be a string, `URL`, or `Request`. When a `Request` is passed, fields in `options` override the corresponding request settings.

```javascript
const response = await fetch('https://example.com/data.json');
```

#### `options.method`

HTTP method. Defaults to `GET`.

```javascript
await fetch('https://example.com/items', {
  method: 'POST',
});
```

#### `options.headers`

Request headers object. The current implementation reads header values as strings.

```javascript
await fetch('https://example.com/items', {
  headers: {
    Authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  },
});
```

#### `options.body`

The request body accepts a string, `Blob`, `FormData`, `URLSearchParams`, `ArrayBuffer`, typed array, or `ReadableStream`.

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

Per-request timeout in milliseconds.

```javascript
await fetch('https://example.com/items', {
  timeout: 3000,
});
```

#### `options.signal`

An `AbortSignal` used to cancel the request.

```javascript
const controller = new AbortController();

fetch('https://example.com/items', { signal: controller.signal });
controller.abort();
```

### `Request`

#### `new Request(input, options?)`

Prepares a request from a URL string, `URL`, or another `Request`, with the request options above. Supplied options override the original request settings.

#### `method`

Read-only HTTP method, defaulting to `GET`. Packaged resources support GET/HEAD only.

#### `url`

Read-only request URL. Package-root and package-scoped `file:///` URLs are local resources; remote endpoints require explicit HTTP/HTTPS URLs.

#### `headers`

Request `Headers` object for reading and updating headers before sending.

#### `body`

Read-only `ReadableStream` or `null`. Stream reads and convenience readers consume the same body; locking prevents other consumers until the lock is released, and consumed bytes cannot be reread.

#### `bodyUsed`

Read-only `boolean` indicating whether body consumption has started. A body can be locked before it is consumed; even while `bodyUsed` is false, another consumer cannot use a locked body.

#### `signal`

Read-only associated `AbortSignal`. Use the controller that supplied it to cancel a request.

#### `redirect`

Read-only configured redirect mode for the request.

#### `clone()`

Returns a new `Request` with an independently readable body. Clone before acquiring a reader or consuming the body; locked or consumed bodies throw `TypeError`.

#### `text()`

Returns `Promise<string>` and consumes the body as UTF-8 text. Reusing a locked or consumed body rejects with `TypeError`.

#### `json()`

Returns a Promise for the JSON value parsed from body text. Shares consumption state with all other readers; invalid JSON rejects.

#### `arrayBuffer()`

Returns `Promise<ArrayBuffer>` containing the body's bytes and consumes the body. An absent body produces an empty buffer.

#### `blob()`

Returns `Promise<Blob>` and consumes the body. The Blob type derives from the `content-type` header when present.

### `Blob`, `File`, and `FormData`

- `new Blob(parts, options?)` creates immutable binary data and supports `arrayBuffer()`, `bytes()`, `text()`, `stream()`, and `slice()`.
- `new File(parts, name, options?)` adds `name` and `lastModified` to `Blob` data.
- `new FormData()` manages form fields with `append()`, `set()`, `get()`, `getAll()`, `has()`, `delete()`, `entries()`, `keys()`, `values()`, and `forEach()`.

### `Response`

The `Promise` returned by `fetch()` resolves as soon as the response headers are available, rather than waiting for the full response body to finish downloading. This means:

- You can inspect metadata such as `status` and `ok` first.
- If the server returns chunked data, you can consume it incrementally through `response.body`.
- If you only care about the final result, you can use convenience methods such as `text()`, `json()`, and `arrayBuffer()`.
- When the response uses HTTP `Content-Encoding`, body readers observe decoded body bytes rather than raw compressed transport bytes.

#### Common Fields

#### `response.ok`

`true` when the status code is in the `200-299` range.

#### `response.status`

Numeric HTTP status code, such as `200`, `404`, or `500`.

#### `response.statusText`

HTTP status text. In the current implementation, `200` returns `"OK"` and other statuses are usually an empty string.

#### `response.url`

The URL associated with this response.

#### `response.body`

The response body as a `ReadableStream`. If the server returns data in chunks, use `getReader()` to read it incrementally instead of waiting for the full response to finish.

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

Indicates whether response-body consumption has started. Locking and consumption differ: acquiring a reader can leave the body unused, but other readers still fail while it is locked. Once reading starts, `bodyUsed` is `true`.

#### Common Methods

#### `response.clone()`

Returns a new clone of the current response. The current implementation supports consuming the original response and the cloned response independently.

```javascript
const response = await fetch('https://example.com/data.json');
const copy = response.clone();

console.log(await response.text());
console.log(await copy.text());
```

#### `response.text()`

Decodes the response body as text. It waits for the full response body to be read before returning the final text.

```javascript
const response = await fetch('https://example.com/message.txt');
console.log(await response.text());
```

#### `response.json()`

Parses the response body as JSON. It reads the full response body before parsing.

```javascript
const response = await fetch('https://example.com/data.json');
console.log(await response.json());
```

#### `response.arrayBuffer()`

Reads the response body as an `ArrayBuffer`, which is useful for binary content.

```javascript
const response = await fetch('https://example.com/model.bin');
const buffer = await response.arrayBuffer();
console.log(buffer.byteLength);
```

#### `response.blob()`

Reads the response body as a `Blob`, which is useful for binary content that should retain its media type.

### wx APIs

#### `wx.request(options)`

`wx.request()` provides a WeChat Mini Program compatible HTTPS request entry and is better suited for callback-based code or `RequestTask`-style control.

#### Parameters

#### `options.url`

Request URL.

#### `options.method`

HTTP method. Defaults to `GET`.

#### `options.header`

Request headers object.

```javascript
wx.request({
  url: 'https://example.com/items',
  header: {
    Authorization: `Bearer ${token}`,
  },
});
```

#### `options.data`

Request data. The current implementation accepts:

- `String`
- `ArrayBuffer`
- plain objects
- form-like objects

When `content-type` contains `application/x-www-form-urlencoded`, objects are encoded as form data. Otherwise plain objects are typically serialized as JSON strings.

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

Fallback string body that can be used when `data` is not provided.

#### `options.timeout`

Per-request timeout in milliseconds.

#### `options.responseType`

Response body mode. Defaults to `text`. When set to `arraybuffer`, `res.data` in the `success` callback is an `ArrayBuffer`.

#### `options.dataType`

Response parsing mode. Defaults to `json`. When set to `json`, the runtime attempts to parse the response before assigning it to `res.data`.

#### `options.success`

Success callback. The result object typically includes:

- `data`
- `statusCode`
- `header`
- `cookies`
- `errMsg`

#### `options.fail`

Failure callback. It typically receives an object containing `errMsg`.

#### `options.complete`

Completion callback. It runs whether the request succeeds or fails.

#### `RequestTask`

`wx.request(...)` returns a `RequestTask`, which can be used to abort the request or observe earlier response events.

#### Methods

- **`abort()`**: Aborts the current request.
- **`onHeadersReceived(callback)`** / **`offHeadersReceived(callback?)`**: Adds or removes a listener for response headers.
- **`onChunkReceived(callback)`** / **`offChunkReceived(callback?)`**: Adds or removes a listener for response body chunks.

#### Behavior Notes

- `onHeadersReceived()` fires as soon as response headers arrive, before the request fully completes.
- `onChunkReceived()` fires repeatedly as new response body chunks arrive.
- Even when chunk events are enabled, `success()` and `complete()` still wait for the full response to finish.
