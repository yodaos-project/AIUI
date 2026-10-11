# 编码 (Encoding)

AIUI 提供了一套遵循 Web 标准的文本编码与解码接口，主要用于在字符串和字节数据之间完成转换。最常见的场景包括：

- 把字符串编码成 `Uint8Array`，用于加密、签名、网络传输或二进制存储。
- 把接口返回的字节数据解码为可读文本。
- 在处理 `ArrayBuffer`、`Uint8Array`、流式数据时，明确区分“文本”和“二进制”。

## 把字符串编码为 UTF-8 字节数组

```javascript
const encoder = new TextEncoder();
const bytes = encoder.encode('你好，AIUI');

console.log(bytes); // Uint8Array(...)
console.log(bytes.length); // UTF-8 编码后的字节长度
```

## 把字节数组解码为字符串

```javascript
const bytes = new Uint8Array([72, 101, 108, 108, 111]);
const decoder = new TextDecoder();

const text = decoder.decode(bytes);
console.log(text); // "Hello"
```

## 使用 encodeInto 写入已有缓冲区

```javascript
const encoder = new TextEncoder();
const target = new Uint8Array(32);

const result = encoder.encodeInto('AIUI', target);

console.log(result.read);    // 已读取的 UTF-16 代码单元数
console.log(result.written); // 已写入的字节数
console.log(target.slice(0, result.written)); // 编码后的有效内容
```

## 解码接口返回的 ArrayBuffer

```javascript
async function loadText(url) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  const decoder = new TextDecoder('utf-8');
  return decoder.decode(buffer);
}
```

## 严格模式下处理非法字节

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

## 分段解码流式文本

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

text += decoder.decode(); // 结束流式解码并刷新剩余字节

console.log(text); // "Hello"
```

## 注意事项

- **`TextEncoder` 始终输出 UTF-8**: 如果你的目标场景不是 UTF-8，就不能通过 `TextEncoder` 切换到其他编码。
- **字符串长度不等于字节长度**: 中文、表情符号等字符在 UTF-8 下通常会占用多个字节，不能用 `string.length` 直接代替字节数。
- **文本和二进制要分清**: `TextEncoder` / `TextDecoder` 适合处理“文本内容”，不适合把任意二进制数据强行当作字符串来回转换。
- **严格模式更适合校验输入**: 如果你希望在输入数据损坏时立即发现问题，可以优先使用 `new TextDecoder('utf-8', { fatal: true })`。
- **BOM 只影响部分文本场景**: 当你在处理文件头或跨工具导出的文本内容时，`ignoreBOM` 选项会更有意义。

## 通过编码流处理网络文本

```javascript
const response = await fetch('https://example.com/stream');
const textStream = response.body.pipeThrough(new TextDecoderStream('utf-8'));
for await (const text of textStream) {
  console.log(text);
}
```

`TextDecoderStream` 会保留跨块字符与 BOM 状态；`TextEncoderStream` 接受字符串并输出 UTF-8 字节。手动写入编码流时，应同时消费 `readable`，否则背压可能使 `write()` 一直等待。

四个编码类均可在页面与 Agent Worker 中使用。编码流的关闭、取消与错误传播遵循 [Streams](/AIUI/api/network-streams)。

## API Reference

### `TextEncoder`

#### `new TextEncoder()`

创建 UTF-8 编码器。

#### `encoder.encoding`

只读，始终为 `'utf-8'`。

#### `encoder.encode(input?)`

返回新的 `Uint8Array`；省略输入时编码空字符串。孤立代理项替换为 U+FFFD。

#### `encoder.encodeInto(source, destination)`

将字符串写入已有 `Uint8Array`，返回 `{ read, written }`。`read` 是已消耗的 UTF-16 代码单元数，`written` 是写入的字节数。空间不足时不会写入半个 UTF-8 字符；继续编码可使用 `source.slice(read)`。

### `TextDecoder`

#### `new TextDecoder(label?, options?)`

`label` 默认为 `'utf-8'`，会去除首尾 ASCII 空白并忽略大小写；未知或不支持的标签抛出 `RangeError`。`options` 支持 `fatal` 和 `ignoreBOM`，均默认为 `false`。

#### `decoder.encoding`

只读，返回规范化后的编码名。

#### `decoder.fatal`

只读的 `boolean`。为 `true` 时，非法输入或结束时未完成的字符会抛出 `TypeError`；否则使用替代字符。

#### `decoder.ignoreBOM`

只读的 `boolean`。默认 `false` 会移除 UTF 编码的初始 BOM；`true` 会保留该字符。BOM 不会切换编码。

#### `decoder.decode(input?, options?)`

返回字符串。输入为 `ArrayBuffer`、`SharedArrayBuffer` 或其 TypedArray / `DataView` 视图，只解码视图区间。`options.stream: true` 保留跨块状态；最后调用 `decode()` 刷新。普通数字数组不是有效输入。

### `TextEncoderStream`

#### `new TextEncoderStream()`

创建 UTF-8 编码流。字符串代理对可以跨写入块组合，关闭时孤立代理项转换为 U+FFFD。

#### `encoderStream.encoding`

只读，始终为 `'utf-8'`。

#### `encoderStream.readable`

只读的 `ReadableStream`，输出 `Uint8Array`。同一实例反复读取此属性得到同一端点。

#### `encoderStream.writable`

只读的 `WritableStream`，输入按字符串转换。写入受到可读端背压控制；取消可读端会使待完成写入失败，中止可写端会使可读端出错。

### `TextDecoderStream`

#### `new TextDecoderStream(label?, options?)`

编码名和选项与 `TextDecoder` 相同。输入字节可以跨块；关闭时刷新剩余状态。严格模式的解码错误会传播到可读端和可写端。

#### `decoderStream.encoding`

只读，返回规范化后的编码名。

#### `decoderStream.fatal`

只读，表示是否启用严格模式。

#### `decoderStream.ignoreBOM`

只读，BOM 行为与 `TextDecoder` 相同。

#### `decoderStream.readable`

只读的 `ReadableStream`，输出非空字符串块，属性返回稳定的端点。

#### `decoderStream.writable`

只读的 `WritableStream`，接受与 `TextDecoder.decode()` 相同的字节输入类型，属性返回稳定的端点。
