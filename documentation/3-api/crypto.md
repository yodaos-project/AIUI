# 加密 (Crypto)

通过全局 `crypto` 对象或 `import crypto from 'crypto'` 使用安全随机数、SHA 摘要和 HMAC。当前不支持加解密、RSA、ECDSA 或 JWK 密钥格式。

## 生成 UUID 与随机字节

```javascript
const id = crypto.randomUUID();
const bytes = crypto.getRandomValues(new Uint8Array(16));
console.log(id, bytes);
```

## 计算摘要

```javascript
const data = new TextEncoder().encode('Hello AIUI');
const digest = await crypto.subtle.digest('SHA-256', data);
const hex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
console.log(hex);
```

## 生成 HMAC 密钥、签名与验证

```javascript
const key = await crypto.subtle.generateKey(
  { name: 'HMAC', hash: 'SHA-256' },
  true,
  ['sign', 'verify'],
);
const data = new TextEncoder().encode('message');
const signature = await crypto.subtle.sign('HMAC', key, data);
console.log(await crypto.subtle.verify('HMAC', key, signature, data));

const raw = await crypto.subtle.exportKey('raw', key);
const imported = await crypto.subtle.importKey(
  'raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
);
console.log(await crypto.subtle.verify('HMAC', imported, signature, data));
```

只有创建时允许导出的密钥才能导出。不要将导出的密钥写入日志。

## 输入与错误

摘要、签名、验证和原始密钥接受 `BufferSource`，即 `ArrayBuffer` 或其 TypedArray / `DataView` 视图；视图只使用自身的字节区间。字符串应先编码，普通数组、伪造对象或已分离的缓冲区不能作为输入。

使用 `try { await ... } catch (error) { ... }` 同时处理参数检查的同步异常和异步失败。未支持的算法或格式为 `NotSupportedError`；不匹配的密钥或用途为 `InvalidAccessError`；无效用途为 `SyntaxError`；无效原始密钥为 `DataError`。

## API Reference

### `Crypto`

#### `crypto.subtle`

只读的 `SubtleCrypto` 对象。

#### `crypto.randomUUID()`

返回安全随机生成的 v4 UUID 字符串。

#### `crypto.getRandomValues(typedArray)`

填充并返回同一个整数 TypedArray，包括 BigInt 整数数组。浮点数组和普通数组不受支持；单次超过 65,536 字节会抛出 `QuotaExceededError`。

### `SubtleCrypto`

#### `subtle.digest(algorithm, data)`

返回 `Promise<ArrayBuffer>`。支持 `SHA-1`、`SHA-256`、`SHA-384`、`SHA-512`；算法可为名称或 `{ name }`。`data` 为 `BufferSource`。

#### `subtle.generateKey(algorithm, extractable, keyUsages)`

返回 `Promise<CryptoKey>`，生成 HMAC 密钥。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `algorithm` | `object` | `{ name: 'HMAC', hash: 'SHA-256', length?: number }`；`hash` 也接受 `{ name }`，支持上述四种 SHA 算法 |
| `extractable` | `boolean` | 是否允许导出原始密钥 |
| `keyUsages` | `string[]` | 非空数组，只能包含 `'sign'`、`'verify'` |

`length` 以位计，必须为正值。省略时，SHA-1 / SHA-256 使用 512 位，SHA-384 / SHA-512 使用 1024 位。

#### `subtle.importKey(format, keyData, algorithm, extractable, keyUsages)`

返回 `Promise<CryptoKey>`。仅支持 `'raw'` HMAC 密钥；`keyData` 为非空 `BufferSource`。算法、可导出性和用途与 `generateKey()` 相同。指定 `length` 时不能超过输入密钥的位数，也不能丢弃完整的尾部字节。

#### `subtle.exportKey(format, key)`

返回 `Promise<ArrayBuffer>`。仅支持 `'raw'`，并且密钥必须允许导出，否则抛出 `InvalidAccessError`。

#### `subtle.sign(algorithm, key, data)`

返回 `Promise<ArrayBuffer>`。算法为 `'HMAC'` 或 `{ name: 'HMAC' }`；密钥必须包含 `'sign'` 用途。

#### `subtle.verify(algorithm, key, signature, data)`

返回 `Promise<boolean>`。验证 HMAC，密钥必须包含 `'verify'` 用途。`signature` 和 `data` 为 `BufferSource`；签名不匹配时返回 `false`。

### `CryptoKey`

#### `key.type`

只读，当前为 `'secret'`。

#### `key.algorithm`

只读，返回 `{ name: 'HMAC', hash: { name }, length }`，`length` 以位计。

#### `key.extractable`

只读的 `boolean`，与生成或导入时指定的值一致。

#### `key.usages`

只读的用途数组，与生成或导入时指定的用途一致。
