# Media Library

`navigator.mediaLibrary` lists and reads images and audio from the system media library and saves new assets. Use it to browse existing media or save a captured image or recording.

## Browse Images and Read a Thumbnail

Declare `READ_MEDIA_IMAGES` in `app.json`, then request read authorization from an interactive view:

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

`limited` permits access to a user-selected subset. Pass `nextCursor` back with the same media type, filters, and order to fetch the next page; a null cursor means there is no next page.

## Save an Image

Declare `CREATE_MEDIA_IMAGES` in `app.json`. Obtain an image `Blob` or `File`, for example from media capture, then request add authorization and save it:

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

Saving creates a new asset; a filename never replaces an existing one. Reuse the same idempotency key when retrying the same operation to avoid duplicates.

## Read Audio

Declare `READ_MEDIA_AUDIO` and request audio read authorization. Audio only supports the original representation:

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

To save audio, declare `CREATE_MEDIA_AUDIO`, request `add` authorization for `audio`, and pass a non-empty audio `Blob` to `save()`.

## Permissions and Availability

Declare only the permissions the agent needs in `app.json`: `READ_MEDIA_IMAGES` and `READ_MEDIA_AUDIO` for `list()` and `get()`, and `CREATE_MEDIA_IMAGES` and `CREATE_MEDIA_AUDIO` for `save()`. Image and audio permissions are independent. Manifest declarations do not replace system authorization. Handle denied authorization and unavailable capabilities. See [application permissions](/AIUI/framework/open-agent-format-app-json) for manifest configuration.

Authorization requests require an interactive view. Audio library operations are unavailable on iOS; image operations remain available. Availability can vary by environment. Video library operations are not supported. A cloud-only image that is unavailable locally may fail with `OperationError`; there is no `allowNetwork` option.

## API Reference

### `navigator.mediaLibrary`

#### `getAuthorizationStatus(access, mediaType?)`

Returns a `Promise` for the current authorization status without showing system UI. `access` is `'read'` or `'add'`; `mediaType` is `'image'` (default) or `'audio'`. The result is `'prompt'`, `'restricted'`, `'denied'`, `'limited'`, or `'granted'`. `limited` indicates access to a selected subset.

#### `requestAuthorization(access, mediaType?)`

Requests authorization and returns a `Promise` for the same status values. Arguments match `getAuthorizationStatus()`. Call this from an interactive view; a non-interactive view can fail with `InvalidStateError`.

#### `list(options?)`

Returns a `Promise` for `{ items, nextCursor, access }`. `items` is an array of [asset metadata](#asset-metadata); `nextCursor` is a string or `null`, and `access` is `'full'` or `'limited'`.

| Option | Description |
| --- | --- |
| `mediaType` | `'image'` (default) or `'audio'`. |
| `createdAfter`, `createdBefore` | Optional finite integer Unix timestamps in milliseconds. `createdAfter` must not exceed `createdBefore`. |
| `order` | `'ascending'` or `'descending'` (default). |
| `limit` | Integer from 1 to 100; default 20. |
| `cursor` | Cursor returned by a previous page with the same media type, filters, and order. |

#### `get(id, options?)`

Returns a `Promise` for `{ asset, file }`: the [asset metadata](#asset-metadata) and a `File`. `id` must be a non-empty asset ID.

| Option | Description |
| --- | --- |
| `mediaType` | `'image'` (default) or `'audio'`; specify `'audio'` for an audio asset. |
| `representation` | `'original'` (default) or `'thumbnail'`. Audio supports only `'original'`. |
| `width`, `height` | Optional positive integer target bounds for image thumbnails only. |

#### `save(blob, options?)`

Creates an asset and returns a `Promise` for its [metadata](#asset-metadata). `blob` must be a non-empty `Blob` or `File` with an `image/*` or `audio/*` MIME type. Its MIME type determines the required create permission.

| Option | Description |
| --- | --- |
| `filename` | Optional display-name hint; it does not select or overwrite an asset. |
| `creationTime` | Optional finite integer Unix timestamp in milliseconds. |
| `idempotencyKey` | Optional key: reusing it for the same agent returns the first successful result. Use a distinct key for each new operation. |

#### Asset metadata

Each asset has an opaque `id` and `mediaType` (`'image'` or `'audio'`). The following fields may be `null` when unavailable: `mimeType`, `width`, `height`, `durationMs`, `creationTime`, `modificationTime`, `filename`, and `size`. Dimensions are in pixels, duration in milliseconds, timestamps in Unix milliseconds, and size in bytes. Keep the ID to retrieve the asset; access can change or the asset can be removed.

#### Errors

Invalid arguments, including unsupported option combinations, produce `TypeError`. Operations can also fail with `NotAllowedError` (missing manifest or system authorization), `NotFoundError` (asset no longer exists or is no longer visible), `InvalidStateError` (invalid cursor or non-interactive authorization request), `NotSupportedError` (capability unavailable), or `OperationError` (operation failed, including locally unavailable data). Handle both argument errors and rejected operations.
