# Crypto

Use the global `crypto` object or `import crypto from 'crypto'` for secure random values, SHA digests, and HMAC. Encryption, decryption, RSA, ECDSA, and JWK key formats are currently unsupported.

## Generate UUIDs and random bytes

```javascript
const id = crypto.randomUUID();
const bytes = crypto.getRandomValues(new Uint8Array(16));
console.log(id, bytes);
```

## Compute a digest

```javascript
const data = new TextEncoder().encode('Hello AIUI');
const digest = await crypto.subtle.digest('SHA-256', data);
const hex = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
console.log(hex);
```

## Generate an HMAC key, sign, and verify

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

Only keys created as extractable can be exported. Do not log exported keys.

## Inputs and errors

Digests, signing, verification, and raw keys accept `BufferSource`: an `ArrayBuffer` or a TypedArray / `DataView` view. Views use only their own byte range. Encode strings first; ordinary arrays, fabricated objects, and detached buffers are invalid inputs.

Use `try { await ... } catch (error) { ... }` to handle both synchronous validation errors and asynchronous failures. Unsupported algorithms or formats cause `NotSupportedError`; incompatible keys or usages cause `InvalidAccessError`; invalid usages cause `SyntaxError`; invalid raw keys cause `DataError`.

## API Reference

### `Crypto`

#### `crypto.subtle`

Read-only `SubtleCrypto` object.

#### `crypto.randomUUID()`

Returns a securely generated v4 UUID string.

#### `crypto.getRandomValues(typedArray)`

Fills and returns the same integer TypedArray, including BigInt integer arrays. Floating-point arrays and ordinary arrays are unsupported. Requests above 65,536 bytes throw `QuotaExceededError`.

### `SubtleCrypto`

#### `subtle.digest(algorithm, data)`

Returns `Promise<ArrayBuffer>`. Supports `SHA-1`, `SHA-256`, `SHA-384`, and `SHA-512`; the algorithm can be a name or `{ name }`. `data` is a `BufferSource`.

#### `subtle.generateKey(algorithm, extractable, keyUsages)`

Returns `Promise<CryptoKey>` for an HMAC key.

| Parameter | Type | Description |
| --- | --- | --- |
| `algorithm` | `object` | `{ name: 'HMAC', hash: 'SHA-256', length?: number }`; `hash` also accepts `{ name }` and supports the four SHA algorithms above |
| `extractable` | `boolean` | Whether the raw key may be exported |
| `keyUsages` | `string[]` | A nonempty array containing only `'sign'` and/or `'verify'` |

`length` is a positive bit count. Defaults to 512 bits for SHA-1 / SHA-256, or 1024 bits for SHA-384 / SHA-512.

#### `subtle.importKey(format, keyData, algorithm, extractable, keyUsages)`

Returns `Promise<CryptoKey>`. Only `'raw'` HMAC keys are supported; `keyData` is a nonempty `BufferSource`. Algorithm, extractability, and usages follow `generateKey()`. An explicit `length` cannot exceed the input bit count or discard a complete trailing byte.

#### `subtle.exportKey(format, key)`

Returns `Promise<ArrayBuffer>`. Only `'raw'` is supported. A non-extractable key causes `InvalidAccessError`.

#### `subtle.sign(algorithm, key, data)`

Returns `Promise<ArrayBuffer>`. The algorithm is `'HMAC'` or `{ name: 'HMAC' }`; the key must have the `'sign'` usage.

#### `subtle.verify(algorithm, key, signature, data)`

Returns `Promise<boolean>` for HMAC verification. The key must have the `'verify'` usage. `signature` and `data` are `BufferSource` values; a mismatched signature returns `false`.

### `CryptoKey`

#### `key.type`

Read-only; currently `'secret'`.

#### `key.algorithm`

Read-only; returns `{ name: 'HMAC', hash: { name }, length }`, with `length` in bits.

#### `key.extractable`

Read-only `boolean`, matching the value used to generate or import the key.

#### `key.usages`

Read-only usage array, matching the usages used to generate or import the key.
