# 媒体库

`navigator.mediaLibrary` 可以列出和读取系统媒体库中的图片、音频，也可以保存新的媒体资源。需要浏览已有媒体，或保存拍摄的图片和录音时，可以使用此接口。

## 浏览图片并读取缩略图

在 `app.json` 中声明 `READ_MEDIA_IMAGES`，然后在可交互视图中请求读取授权：

```javascript
const library = navigator.mediaLibrary;
const status = await library.requestAuthorization('read', 'image');
if (status === 'granted' || status === 'limited') {
  const page = await library.list({ mediaType: 'image', limit: 20 });
  if (page.items.length > 0) {
    const { asset, file } = await library.get(page.items[0].id, {
      representation: 'thumbnail', width: 320, height: 240,
    });
    console.log(asset.id, file.type, file.size);
  }
  console.log(page.access, page.nextCursor);
}
```

`limited` 表示可以访问用户选择的一部分资源。使用相同的媒体类型、筛选条件和排序，并将 `nextCursor` 传回，可读取下一页；游标为 `null` 表示没有下一页。

## 保存图片

在 `app.json` 中声明 `CREATE_MEDIA_IMAGES`。获取图片 `Blob` 或 `File`（例如通过媒体采集），然后请求添加授权并保存：

```javascript
async function saveImage(imageBlob, operationId) {
  const library = navigator.mediaLibrary;
  const status = await library.requestAuthorization('add', 'image');
  if (status !== 'granted' && status !== 'limited') return;
  const asset = await library.save(imageBlob, {
    filename: 'capture.png',
    idempotencyKey: operationId,
  });
  console.log(asset.id);
}
```

保存会创建新资源；文件名不会替换已有资源。重试同一次操作时复用同一个幂等键，可以避免重复创建。

## 读取音频

声明 `READ_MEDIA_AUDIO` 并请求音频读取授权。音频只支持原始资源：

```javascript
const library = navigator.mediaLibrary;
const status = await library.requestAuthorization('read', 'audio');
if (status === 'granted' || status === 'limited') {
  const page = await library.list({ mediaType: 'audio' });
  if (page.items.length > 0) {
    const { file } = await library.get(page.items[0].id, { mediaType: 'audio' });
    console.log(file.name, file.type, file.size);
  }
}
```

要保存音频，请声明 `CREATE_MEDIA_AUDIO`，请求 `audio` 的 `add` 授权，并向 `save()` 传入非空的音频 `Blob`。

## 权限与可用性

在 `app.json` 中只声明智能体需要的权限：`list()` 和 `get()` 分别使用 `READ_MEDIA_IMAGES` 或 `READ_MEDIA_AUDIO`，`save()` 分别使用 `CREATE_MEDIA_IMAGES` 或 `CREATE_MEDIA_AUDIO`。图片与音频权限相互独立。清单声明不能代替系统授权；应用应处理授权被拒绝和能力不可用的情况。清单配置参见[应用权限](/AIUI/framework/open-agent-format-app-json)。

请求授权需要可交互视图。iOS 不支持音频媒体库操作，图片操作仍然可用；其他环境的可用性可能不同。目前不支持视频媒体库操作。仅存储在云端、无法从本地获取的图片可能以 `OperationError` 失败；接口没有 `allowNetwork` 选项。

## API Reference

### `navigator.mediaLibrary`

#### `getAuthorizationStatus(access, mediaType?)`

返回当前授权状态的 `Promise`，不会显示系统授权界面。`access` 为 `'read'` 或 `'add'`；`mediaType` 为 `'image'`（默认）或 `'audio'`。结果为 `'prompt'`、`'restricted'`、`'denied'`、`'limited'` 或 `'granted'`。`limited` 表示只能访问选定的部分资源。

#### `requestAuthorization(access, mediaType?)`

请求授权，并返回包含上述状态的 `Promise`。参数与 `getAuthorizationStatus()` 相同。请在可交互视图中调用；非交互视图可能以 `InvalidStateError` 失败。

#### `list(options?)`

返回包含 `{ items, nextCursor, access }` 的 `Promise`。`items` 是[资源元数据](#资源元数据)数组；`nextCursor` 是字符串或 `null`；`access` 为 `'full'` 或 `'limited'`。

| 选项 | 说明 |
| --- | --- |
| `mediaType` | `'image'`（默认）或 `'audio'`。 |
| `createdAfter`、`createdBefore` | 可选的有限整数 Unix 时间戳，单位为毫秒。`createdAfter` 不得大于 `createdBefore`。 |
| `order` | `'ascending'` 或 `'descending'`（默认）。 |
| `limit` | 1 至 100 的整数，默认为 20。 |
| `cursor` | 前一页返回的游标；媒体类型、筛选条件和排序须保持一致。 |

#### `get(id, options?)`

返回包含 `{ asset, file }` 的 `Promise`，分别为[资源元数据](#资源元数据)和 `File`。`id` 必须是非空资源 ID。

| 选项 | 说明 |
| --- | --- |
| `mediaType` | `'image'`（默认）或 `'audio'`；读取音频时须指定 `'audio'`。 |
| `representation` | `'original'`（默认）或 `'thumbnail'`。音频只支持 `'original'`。 |
| `width`、`height` | 可选的正整数目标尺寸，仅用于图片缩略图。 |

#### `save(blob, options?)`

创建资源并返回包含其[元数据](#资源元数据)的 `Promise`。`blob` 必须是非空的 `Blob` 或 `File`，且 MIME 类型为 `image/*` 或 `audio/*`；MIME 类型决定所需的创建权限。

| 选项 | 说明 |
| --- | --- |
| `filename` | 可选的显示名称提示，不会选中或覆盖已有资源。 |
| `creationTime` | 可选的有限整数 Unix 时间戳，单位为毫秒。 |
| `idempotencyKey` | 可选的幂等键；同一智能体复用该键时返回第一次成功的结果。每次新操作应使用不同的键。 |

#### 资源元数据

每个资源都有不透明的 `id` 和 `mediaType`（`'image'` 或 `'audio'`）。以下字段不可用时可能为 `null`：`mimeType`、`width`、`height`、`durationMs`、`creationTime`、`modificationTime`、`filename` 和 `size`。尺寸以像素计，时长以毫秒计，时间戳为 Unix 毫秒，大小以字节计。可以保存 ID 以便再次读取，但访问权限可能变化，资源也可能被删除。

#### 错误

无效参数（包括不支持的选项组合）会产生 `TypeError`。操作还可能以以下错误失败：`NotAllowedError`（缺少清单权限或系统授权）、`NotFoundError`（资源不存在或不再可见）、`InvalidStateError`（游标无效或在非交互视图中请求授权）、`NotSupportedError`（能力不可用）和 `OperationError`（操作失败，包括数据无法从本地获取）。请同时处理参数错误和异步操作失败。
