# Encoding

AIUI provides text encoding and decoding APIs that follow Web standards. They are mainly used to convert between strings and byte data. Common scenarios include:

- Encoding a string into `Uint8Array` for encryption, signing, network transmission, or binary storage.
- Decoding byte data returned by an API into readable text.
- Clearly distinguishing between text and binary data when working with `ArrayBuffer`, `Uint8Array`, or streaming data.

## Encode a String into a UTF-8 Byte Array

```javascript
const encoder = new TextEncoder();
const bytes = encoder.encode('你好，AIUI');

console.log(bytes); // Uint8Array(...)
console.log(bytes.length); // UTF-8 编码后的字节长度
```

## Decode a Byte Array into a String

```javascript
const bytes = new Uint8Array([72, 101, 108, 108, 111]);
const decoder = new TextDecoder();

const text = decoder.decode(bytes);
console.log(text); // "Hello"
```

## Use encodeInto to Write into an Existing Buffer

```javascript
const encoder = new TextEncoder();
const target = new Uint8Array(32);

const result = encoder.encodeInto('AIUI', target);

console.log(result.read);    // UTF-16 code units read
console.log(result.written); // Bytes written
console.log(target.slice(0, result.written)); // Encoded output
```

## Decode an ArrayBuffer Returned by an API

```javascript
async function loadText(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
}
```

## Handle Invalid Bytes in Strict Mode

```javascript
const invalidBytes = new Uint8Array([0xff, 0xfe, 0xfd]);
const decoder = new TextDecoder('utf-8', { fatal: true });

try {
  const text = decoder.decode(invalidBytes);
  console.log(text);
} catch (error) {
  console.error('解码失败:', error);
}
```

## Decode Streaming Text in Chunks

```javascript
const response = await fetch('https://example.com/stream');
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

text += decoder.decode(); // Finish streaming decode and flush remaining bytes

console.log(text); // "Hello"
```

## Notes

- **`TextEncoder` always outputs UTF-8**: If your target scenario is not UTF-8, you cannot switch encodings through `TextEncoder`.
- **String length is not byte length**: Characters such as Chinese text and emojis usually take multiple bytes in UTF-8, so `string.length` cannot directly replace the byte length.
- **Keep text and binary separate**: `TextEncoder` / `TextDecoder` are suitable for text content, not for forcing arbitrary binary data to round-trip through strings.
- **Strict mode is better for validating input**: If you want to detect corrupted input immediately, prefer `new TextDecoder('utf-8', { fatal: true })`.
- **BOM mainly matters in some text scenarios**: The `ignoreBOM` option is more meaningful when processing file headers or text exported from other tools.

## Process network text through an encoding stream

```javascript
const response = await fetch('https://example.com/stream');
const textStream = response.body.pipeThrough(new TextDecoderStream('utf-8'));
for await (const text of textStream) {
  console.log(text);
}
```

`TextDecoderStream` preserves split characters and BOM state across chunks. `TextEncoderStream` accepts strings and emits UTF-8 bytes. When writing manually, consume `readable` concurrently; otherwise backpressure can leave `write()` waiting.

All four encoding classes are available in pages and Agent Workers. Closing, cancellation, and error propagation follow [Streams](/AIUI/api/network-streams).

## API Reference

### `TextEncoder`

#### `new TextEncoder()`

Creates a UTF-8 encoder.

#### `encoder.encoding`

Read-only; always `'utf-8'`.

#### `encoder.encode(input?)`

Returns a new `Uint8Array`; omitted input encodes an empty string. Lone surrogates are replaced with U+FFFD.

#### `encoder.encodeInto(source, destination)`

Writes a string into an existing `Uint8Array` and returns `{ read, written }`. `read` counts consumed UTF-16 code units; `written` counts output bytes. Insufficient space never writes a partial UTF-8 character. Continue with `source.slice(read)`.

### `TextDecoder`

#### `new TextDecoder(label?, options?)`

`label` defaults to `'utf-8'`; leading/trailing ASCII whitespace and case are normalized. Unknown or unsupported labels throw `RangeError`. `options` accepts `fatal` and `ignoreBOM`, both defaulting to `false`.

#### `decoder.encoding`

Read-only canonical encoding name.

#### `decoder.fatal`

Read-only `boolean`. When `true`, malformed input or incomplete characters at the end throw `TypeError`; otherwise replacement characters are used.

#### `decoder.ignoreBOM`

Read-only `boolean`. The default `false` removes an initial BOM for UTF encodings; `true` preserves the character. A BOM does not switch the encoding.

#### `decoder.decode(input?, options?)`

Returns a string. Accepts an `ArrayBuffer`, `SharedArrayBuffer`, or TypedArray / `DataView` view, decoding only the view range. `options.stream: true` preserves state across chunks; call `decode()` at the end to flush. Ordinary numeric arrays are invalid inputs.

### `TextEncoderStream`

#### `new TextEncoderStream()`

Creates a UTF-8 encoding stream. Surrogate pairs can span input chunks; a trailing lone surrogate becomes U+FFFD on close.

#### `encoderStream.encoding`

Read-only; always `'utf-8'`.

#### `encoderStream.readable`

Read-only `ReadableStream` emitting `Uint8Array` chunks. Repeated access returns the same endpoint.

#### `encoderStream.writable`

Read-only `WritableStream`; input is converted to strings. Writes follow readable-side backpressure. Canceling the readable side rejects pending writes; aborting the writable side errors the readable side.

### `TextDecoderStream`

#### `new TextDecoderStream(label?, options?)`

Uses the same labels and options as `TextDecoder`. Byte sequences can span chunks; close flushes remaining state. Fatal decoding errors propagate to both endpoints.

#### `decoderStream.encoding`

Read-only canonical encoding name.

#### `decoderStream.fatal`

Read-only fatal decoding mode.

#### `decoderStream.ignoreBOM`

Read-only; BOM behavior matches `TextDecoder`.

#### `decoderStream.readable`

Read-only `ReadableStream` emitting nonempty string chunks; the endpoint is stable.

#### `decoderStream.writable`

Read-only `WritableStream` accepting the same byte input types as `TextDecoder.decode()`; the endpoint is stable.
