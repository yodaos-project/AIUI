# 数据流

Streams API 用于分段处理持续到达的数据。它可以让你在完整内容下载结束前就开始读取、转换或写入，适合大文件、实时文本和语音数据。

如果只需要一次读取完整结果，直接使用 `response.json()`、`response.text()` 或 `response.arrayBuffer()` 会更简单。

## 逐段读取响应

`fetch()` 的 `response.body` 是一个 `ReadableStream`：

```javascript
const response = await fetch('https://example.com/stream');
const reader = response.body.getReader();

try {
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    console.log('收到一段数据', value);
  }
} finally {
  reader.releaseLock();
}
```

一个流同时只能被一个 reader 锁定。读取结束后调用 `releaseLock()`，其他代码才能继续获取 reader。

## 创建并转换数据流

```javascript
const source = new ReadableStream({
  start(controller) {
    controller.enqueue('hello');
    controller.enqueue('aiui');
    controller.close();
  }
});

const upperCase = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase());
  }
});

const reader = source.pipeThrough(upperCase).getReader();
console.log(await reader.read());
```

`ReadableStream` 可以传递字符串、对象或二进制数据，不限于网络字节。

## 写入目标

```javascript
const destination = new WritableStream({
  async write(chunk) {
    await saveChunk(chunk);
  },
  close() {
    console.log('全部写入完成');
  }
});

const writer = destination.getWriter();
await writer.write('first');
await writer.write('second');
await writer.close();
```

连续写入时应等待 `write()` 返回的 Promise，避免写入速度超过目标的处理速度。

## 从可迭代数据创建流

```javascript
const source = ReadableStream.from(['first', 'second']);
for await (const chunk of source) {
  console.log(chunk);
}
```

异步迭代会锁定流，正常结束时释放锁。提前 `break` 默认取消数据源；如需继续读取，使用 `stream.values({ preventCancel: true })`。

## 分支读取与字节缓冲区

`stream.tee()` 返回两个分支。普通流的块保持对象身份，两个分支修改同一个对象可能互相影响；字节流会为分支提供独立字节缓冲区。只取消一个分支不会立即取消数据源，取消 Promise 会等待另一个分支或数据源结束。

网络响应体支持 BYOB 读取：

```javascript
const response = await fetch('https://example.com/file');
const reader = response.body.getReader({ mode: 'byob' });
try {
  let buffer = new ArrayBuffer(4096);
  while (true) {
    const { value, done } = await reader.read(new Uint8Array(buffer));
    if (done) break;
    console.log(value.byteLength);
    buffer = value.buffer;
  }
} finally {
  reader.releaseLock();
}
```

BYOB 会转移传入缓冲区的所有权，后续必须使用返回的 `value`，不能继续使用原来的视图。只有字节流支持 BYOB；切换 reader 前先释放原 reader 的锁。

## 管道的关闭与错误

`pipeTo()` 等待目标背压与写入完成。默认在数据源结束时关闭目标，在数据源出错时中止目标，在目标出错时取消数据源。可通过 `preventClose`、`preventAbort`、`preventCancel` 控制这些行为；`signal` 用于中止管道。关闭或失败清理完成后，管道释放两端的锁。

使用 reader 或 writer 后，应在不再需要时调用 `releaseLock()`。

## API Reference

### `ReadableStream`

#### `new ReadableStream(underlyingSource?, strategy?)`

数据源可实现 `start(controller)`、`pull(controller)`、`cancel(reason)`。`type: 'bytes'` 创建字节流，支持 `autoAllocateChunkSize`，此时不能提供 `strategy.size`。

#### `ReadableStream.from(iterable)`

从同步或异步可迭代对象创建流，按读取需求调用迭代器。

#### `stream.locked`

只读的 `boolean`，表示流是否被 reader 或管道锁定。

#### `stream.getReader(options?)`

默认返回 `ReadableStreamDefaultReader`；`{ mode: 'byob' }` 返回 `ReadableStreamBYOBReader`。已锁定或对普通流请求 BYOB 时抛出 `TypeError`。

#### `stream.cancel(reason?)`

返回 `Promise<void>`，丢弃队列并通知数据源。已锁定时应通过 reader 取消。

#### `stream.tee()`

返回两个可读分支并锁定原流。两个分支都取消时，数据源收到包含两个取消原因的数组。

#### `stream.pipeTo(destination, options?)`

返回 `Promise<void>`，写入 `WritableStream` 并处理背压与清理。选项为 `preventClose`、`preventAbort`、`preventCancel` 和 `signal`。

#### `stream.pipeThrough(transform, options?)`

接受 `{ readable, writable }`，返回其可读端。选项与 `pipeTo()` 相同。

#### `stream.values(options?)`

返回异步迭代器。默认提前退出会取消流；`preventCancel: true` 只释放锁。

#### `stream[Symbol.asyncIterator]()`

支持 `for await...of`，等价于默认选项的 `values()`。

### `ReadableStreamDefaultReader`

#### `reader.read()`

默认 reader 返回 `Promise<{ value, done }>`。结束时 `done` 为 `true`；出错时拒绝。

#### `reader.closed`

只读的 `Promise<void>`，关闭时解析，出错或提前释放锁时拒绝。

#### `reader.cancel(reason?)`

返回 `Promise<void>`，取消被该 reader 锁定的流。

#### `reader.releaseLock()`

释放锁。尚未完成的读取会以 `TypeError` 失败，已排队数据仍属于流。

### `ReadableStreamBYOBReader`

#### `reader.read(view, options?)`

BYOB reader 接受非空 TypedArray / `DataView`，返回包含新视图的 Promise。`options.min` 默认为 `1`，按视图元素计；关闭时可能返回少于该值的数据。缓冲区会被转移。

#### `reader.closed`

只读的 `Promise<void>`，关闭时解析，出错或提前释放锁时拒绝。

#### `reader.cancel(reason?)`

返回 `Promise<void>`，取消被该 reader 锁定的流。

#### `reader.releaseLock()`

释放锁。尚未完成的读取会以 `TypeError` 失败，已排队数据仍属于流。

### `ReadableStreamDefaultController`

#### `controller.desiredSize`

只读的 `number | null`，用于观察背压；流出错时为 `null`。

#### `controller.enqueue(chunk)`

普通控制器入队任意块；字节控制器接受字节视图并转移缓冲区。

#### `controller.close()`

在队列读完后结束流。

#### `controller.error(reason?)`

使流出错，丢弃队列并拒绝待完成读取。

### `ReadableByteStreamController`

#### `controller.desiredSize`

只读的 `number | null`，用于观察背压；流出错时为 `null`。

#### `controller.enqueue(chunk)`

普通控制器入队任意块；字节控制器接受字节视图并转移缓冲区。

#### `controller.close()`

在队列读完后结束流。

#### `controller.error(reason?)`

使流出错，丢弃队列并拒绝待完成读取。

#### `controller.byobRequest`

仅字节控制器提供，返回当前 `ReadableStreamBYOBRequest` 或 `null`。

### `ReadableStreamBYOBRequest`

#### `request.view`

只读的字节视图，表示当前待填充区间。

#### `request.respond(bytesWritten)`

提交写入的字节数。响应后不能继续使用旧 request；流关闭时允许以 `0` 完成待处理请求。

#### `request.respondWithNewView(view)`

使用符合当前待处理缓冲区范围的新视图完成请求。

### `WritableStream`

表示可按顺序写入数据段的目标。写入方通常通过 `getWriter()` 获得 writer，再使用 writer 处理背压和生命周期。

#### `new WritableStream(underlyingSink?, strategy?)`

创建可写流。`underlyingSink` 可实现 `start(controller)`、`write(chunk, controller)`、`close()` 和 `abort(reason)`；这些回调可返回 Promise。`strategy` 通过 `highWaterMark` 和可选的 `size(chunk)` 控制队列与背压。

```javascript
const stream = new WritableStream({
  async write(chunk) {
    await saveChunk(chunk);
  },
  close() {
    console.log('所有数据已写入');
  },
  abort(reason) {
    console.error('写入已中止', reason);
  },
});
```

#### `stream.locked`

只读的 `boolean`。当 writer 锁定流时为 `true`。同一时刻只能有一个 writer 锁定流。

#### `stream.getWriter()`

返回 `WritableStreamDefaultWriter`，并将流锁定给该 writer。流已被锁定时调用会抛出 `TypeError`。

```javascript
const writer = stream.getWriter();
try {
  await writer.write('first');
  await writer.write('second');
  await writer.close();
} finally {
  writer.releaseLock();
}
```

#### `stream.close()`

返回 `Promise<void>`，请求在已排队的写入完成后关闭流。已锁定的流应通过 `writer.close()` 关闭。

#### `stream.abort(reason?)`

返回 `Promise<void>`，中止流并将可选原因传给 underlying sink。已锁定的流应通过 `writer.abort()` 中止。

### `WritableStreamDefaultWriter`

由 `stream.getWriter()` 返回的标准 writer。它在存续期间独占流，并暴露写入背压、完成和失败状态。

#### `writer.ready`

只读的 `Promise<void>`。当流的内部队列还有容量时解析。大量连续写入前可等待它，避免无视背压。

#### `writer.closed`

只读的 `Promise<void>`。流成功关闭时解析，流出错或 writer 锁在关闭前被释放时拒绝。

#### `writer.desiredSize`

只读的 `number | null`，表示队列达到 `highWaterMark` 前的大致剩余容量。负值表示队列已超过目标容量；流出错时为 `null`。

#### `writer.write(chunk?)`

将一个数据段排入流，返回 `Promise<void>`。Promise 在 underlying sink 接受该数据段后解析，写入失败或流无法继续写入时拒绝。

```javascript
await writer.ready;
await writer.write(chunk);
```

#### `writer.close()`

返回 `Promise<void>`，请求在已排队的写入完成后关闭流。调用后不应再写入新数据。

#### `writer.abort(reason?)`

返回 `Promise<void>`，中止流、丢弃尚未处理的数据，并将可选原因传给 underlying sink。

#### `writer.releaseLock()`

释放 writer 对流的锁，使其他代码可以调用 `getWriter()`。存在未完成的 `write()` 时不应释放锁；释放后，该 writer 不能再操作流。


### `TransformStream`

#### `new TransformStream(transformer?, writableStrategy?, readableStrategy?)`

转换器可实现 `start(controller)`、`transform(chunk, controller)`、`flush(controller)`；回调可返回 Promise。

#### `transform.readable`

只读的 `ReadableStream`，输出转换后的块。

#### `transform.writable`

只读的 `WritableStream`，接收输入；转换错误传播到两端。

### `CountQueueingStrategy`

#### `new CountQueueingStrategy({ highWaterMark })`

设置期望队列容量。

#### `strategy.highWaterMark`

只读的目标队列容量。

#### `strategy.size(chunk)`

按块数量计算，每块为 `1`。

### `ByteLengthQueueingStrategy`

#### `new ByteLengthQueueingStrategy({ highWaterMark })`

设置期望队列容量。

#### `strategy.highWaterMark`

只读的目标队列容量。

#### `strategy.size(chunk)`

按块的 `byteLength` 计算。
