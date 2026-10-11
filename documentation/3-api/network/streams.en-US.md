# Streams

Use the Streams API to process data as it arrives. It lets an application read, transform, or write chunks before the complete content is available, which is useful for large files, live text, and audio data.

When the whole result is small and needed at once, `response.json()`, `response.text()`, or `response.arrayBuffer()` is simpler.

## Read a Response in Chunks

The `body` of a `fetch()` response is a `ReadableStream`:

```javascript
const response = await fetch('https://example.com/stream');
const reader = response.body.getReader();

try {
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    console.log('Received a chunk', value);
  }
} finally {
  reader.releaseLock();
}
```

Only one reader can lock a stream at a time. Call `releaseLock()` when reading is complete before other code obtains a reader.

## Create and Transform a Stream

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

A `ReadableStream` can carry strings, objects, or binary values; it is not limited to network bytes.

## Write to a Destination

```javascript
const destination = new WritableStream({
  async write(chunk) {
    await saveChunk(chunk);
  },
  close() {
    console.log('All chunks saved');
  }
});

const writer = destination.getWriter();
await writer.write('first');
await writer.write('second');
await writer.close();
```

Await the Promise returned by `write()` so the destination has time to process each chunk.

## Create a stream from iterable data

```javascript
const source = ReadableStream.from(['first', 'second']);
for await (const chunk of source) {
  console.log(chunk);
}
```

Async iteration locks the stream and releases the lock on completion. An early `break` cancels the source by default. Use `stream.values({ preventCancel: true })` to allow later reading.

## Branch reading and byte buffers

`stream.tee()` returns two branches. Ordinary streams preserve chunk object identity, so mutations can affect both branches. Byte streams give branches independent byte buffers. Canceling only one branch does not immediately cancel the source; its cancellation Promise waits for the other branch or the source to finish.

Network response bodies support BYOB reading:

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

BYOB transfers ownership of the input buffer. Use the returned `value` afterwards; do not reuse the original view. Only byte streams support BYOB. Release the old reader's lock before switching readers.

## Pipe completion and errors

`pipeTo()` waits for destination backpressure and writes. By default, source completion closes the destination, a source error aborts the destination, and a destination error cancels the source. Control these actions with `preventClose`, `preventAbort`, and `preventCancel`; use `signal` to abort the pipe. Both locks are released after shutdown or failure cleanup.

Release reader or writer locks when they are no longer needed.

## API Reference

### `ReadableStream`

#### `new ReadableStream(underlyingSource?, strategy?)`

The source can implement `start(controller)`, `pull(controller)`, and `cancel(reason)`. `type: 'bytes'` creates a byte stream with optional `autoAllocateChunkSize`; `strategy.size` is invalid for byte streams.

#### `ReadableStream.from(iterable)`

Creates a stream from a synchronous or asynchronous iterable, advancing its iterator as data is requested.

#### `stream.locked`

Read-only `boolean` indicating whether a reader or pipe locks the stream.

#### `stream.getReader(options?)`

Returns a `ReadableStreamDefaultReader` by default, or a `ReadableStreamBYOBReader` for `{ mode: 'byob' }`. Locked streams and BYOB requests on ordinary streams throw `TypeError`.

#### `stream.cancel(reason?)`

Returns `Promise<void>`, discards queued chunks, and notifies the source. Cancel locked streams through their reader.

#### `stream.tee()`

Returns two readable branches and locks the original stream. If both branches cancel, the source receives an array of both reasons.

#### `stream.pipeTo(destination, options?)`

Returns `Promise<void>`, piping to a `WritableStream` with backpressure and cleanup. Options are `preventClose`, `preventAbort`, `preventCancel`, and `signal`.

#### `stream.pipeThrough(transform, options?)`

Accepts `{ readable, writable }` and returns its readable endpoint. Options match `pipeTo()`.

#### `stream.values(options?)`

Returns an async iterator. Early exit cancels by default; `preventCancel: true` only releases the lock.

#### `stream[Symbol.asyncIterator]()`

Supports `for await...of`, equivalent to `values()` with default options.

### `ReadableStreamDefaultReader`

#### `reader.read()`

A default reader returns `Promise<{ value, done }>`. `done` is `true` at the end; stream errors reject the Promise.

#### `reader.closed`

Read-only `Promise<void>`; resolves on close and rejects on error or early lock release.

#### `reader.cancel(reason?)`

Returns `Promise<void>`, canceling the stream locked by this reader.

#### `reader.releaseLock()`

Releases the lock. Pending reads fail with `TypeError`; queued data remains in the stream.

### `ReadableStreamBYOBReader`

#### `reader.read(view, options?)`

A BYOB reader accepts a nonempty TypedArray / `DataView` and returns a Promise containing a new view. `options.min` defaults to `1` and counts view elements; close may return fewer. The buffer is transferred.

#### `reader.closed`

Read-only `Promise<void>`; resolves on close and rejects on error or early lock release.

#### `reader.cancel(reason?)`

Returns `Promise<void>`, canceling the stream locked by this reader.

#### `reader.releaseLock()`

Releases the lock. Pending reads fail with `TypeError`; queued data remains in the stream.

### `ReadableStreamDefaultController`

#### `controller.desiredSize`

Read-only `number | null` for observing backpressure; `null` when the stream is errored.

#### `controller.enqueue(chunk)`

Default controllers enqueue arbitrary chunks. Byte controllers accept byte views and transfer their buffers.

#### `controller.close()`

Closes the stream after queued data is consumed.

#### `controller.error(reason?)`

Errors the stream, discards the queue, and rejects pending reads.

### `ReadableByteStreamController`

#### `controller.desiredSize`

Read-only `number | null` for observing backpressure; `null` when the stream is errored.

#### `controller.enqueue(chunk)`

Default controllers enqueue arbitrary chunks. Byte controllers accept byte views and transfer their buffers.

#### `controller.close()`

Closes the stream after queued data is consumed.

#### `controller.error(reason?)`

Errors the stream, discards the queue, and rejects pending reads.

#### `controller.byobRequest`

Available only on byte controllers; returns the current `ReadableStreamBYOBRequest` or `null`.

### `ReadableStreamBYOBRequest`

#### `request.view`

Read-only byte view of the range to fill.

#### `request.respond(bytesWritten)`

Reports the number of bytes written. Do not reuse the old request afterwards; a closed stream can complete a pending request with `0`.

#### `request.respondWithNewView(view)`

Completes the request with a new view compatible with the pending buffer range.

### `WritableStream`

Represents a destination that accepts chunks in order. Writers normally call `getWriter()` and use the returned writer to manage backpressure and lifecycle.

#### `new WritableStream(underlyingSink?, strategy?)`

Creates a writable stream. `underlyingSink` can implement `start(controller)`, `write(chunk, controller)`, `close()`, and `abort(reason)`; these callbacks may return Promises. `strategy` controls queuing and backpressure through `highWaterMark` and an optional `size(chunk)` function.

```javascript
const stream = new WritableStream({
  async write(chunk) {
    await saveChunk(chunk);
  },
  close() {
    console.log('All chunks written');
  },
  abort(reason) {
    console.error('Writing aborted', reason);
  },
});
```

#### `stream.locked`

A read-only `boolean` that is `true` while a writer locks the stream. Only one writer can lock a stream at a time.

#### `stream.getWriter()`

Returns a `WritableStreamDefaultWriter` and locks the stream to that writer. Calling it while the stream is already locked throws `TypeError`.

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

Returns `Promise<void>` and requests that the stream close after queued writes finish. Close a locked stream through `writer.close()`.

#### `stream.abort(reason?)`

Returns `Promise<void>`, aborts the stream, and passes the optional reason to the underlying sink. Abort a locked stream through `writer.abort()`.

### `WritableStreamDefaultWriter`

The standard writer returned by `stream.getWriter()`. It exclusively locks the stream until released and exposes write backpressure, completion, and failure state.

#### `writer.ready`

A read-only `Promise<void>` that resolves when the stream's internal queue has capacity. Await it before sustained writes to avoid ignoring backpressure.

#### `writer.closed`

A read-only `Promise<void>` that resolves when the stream closes successfully. It rejects if the stream errors or the writer releases its lock before the stream closes.

#### `writer.desiredSize`

A read-only `number | null` estimating the capacity remaining before the queue reaches its `highWaterMark`. A negative value means the queue exceeds its target capacity; it is `null` when the stream has errored.

#### `writer.write(chunk?)`

Queues one chunk and returns `Promise<void>`. The Promise resolves when the underlying sink accepts the chunk and rejects if writing fails or the stream can no longer accept writes.

```javascript
await writer.ready;
await writer.write(chunk);
```

#### `writer.close()`

Returns `Promise<void>` and requests that the stream close after queued writes finish. Do not write additional chunks after calling it.

#### `writer.abort(reason?)`

Returns `Promise<void>`, aborts the stream, discards unprocessed chunks, and passes the optional reason to the underlying sink.

#### `writer.releaseLock()`

Releases the writer's lock so other code can call `getWriter()`. Do not release the lock while a `write()` is pending. The writer can no longer operate on the stream after release.


### `TransformStream`

#### `new TransformStream(transformer?, writableStrategy?, readableStrategy?)`

The transformer can implement `start(controller)`, `transform(chunk, controller)`, and `flush(controller)`; callbacks may return Promises.

#### `transform.readable`

Read-only `ReadableStream` emitting transformed chunks.

#### `transform.writable`

Read-only `WritableStream` accepting input; transform errors propagate to both endpoints.

### `CountQueueingStrategy`

#### `new CountQueueingStrategy({ highWaterMark })`

Sets the desired queue capacity.

#### `strategy.highWaterMark`

Read-only target queue capacity.

#### `strategy.size(chunk)`

Counts chunks, returning `1` per chunk.

### `ByteLengthQueueingStrategy`

#### `new ByteLengthQueueingStrategy({ highWaterMark })`

Sets the desired queue capacity.

#### `strategy.highWaterMark`

Read-only target queue capacity.

#### `strategy.size(chunk)`

Measures the chunk by its `byteLength`.
