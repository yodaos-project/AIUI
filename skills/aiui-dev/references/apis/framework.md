# AIUI Framework API Reference

Read [framework concepts](../framework.md) for file formats and declarations, and [events](../events.md) for lifecycle guidance.

## `navigator`

| Member | Type | Behavior |
| --- | --- | --- |
| `id` | `string` | Opaque identifier for the current agent content. |
| `renderingEnabled` | `boolean` | Whether this instance can render a visible interface. |
| `userAgent` | `string` | AIUI and Ink runtime identification string. |
| `language` | `string` | Preferred language, or an empty string if unavailable. |
| `languages` | `string[]` | Ordered language preferences. Match UI strings with IETF BCP 47 tags (e.g. `zh-CN`, `zh-TW`, `zh-HK`) using RFC 4647 Lookup semantics; distinguish Simplified/Traditional Chinese via script and region subtags. |
| `region` | `string` | Current region, or an empty string if unavailable. |
| `versions.ink` | `string` | Ink runtime version. |
| `versions.skia` | `string` | Skia version. |
| `bluetooth` | `Bluetooth` | BLE client entry point. |
| `geolocation` | `Geolocation` | Location entry point. |
| `mediaDevices` | `MediaDevices` | Camera and microphone capture entry point. |
| `storage` | `StorageManager` | Persistent storage entry point. |

### Language matching

When building multi-language UIs from `navigator.languages`, treat every entry as an IETF BCP 47 language tag (e.g. `zh-CN`, `zh-TW`, `zh-HK`). Walk the preference list in order; for each tag, match by progressively truncating trailing subtags (RFC 4647 Lookup: `zh-Hant-TW` → `zh-Hant` → `zh`), map Chinese variants via script/region subtags (`zh-Hans*`, `zh-SG` → Simplified; `zh-Hant*`, `zh-TW`, `zh-HK`, `zh-MO` → Traditional), and fall back to a default locale when nothing matches. Reference implementation: [`samples/navigator-info`](https://github.com/yodaos-project/AIUI/tree/main/samples/navigator-info).

### `navigator.getDeviceSerialNumber()`

Returns the device serial number as a string, or an empty string when unavailable.

### `navigator.getBattery()`

Returns `Promise<BatteryManager>`.

### `navigator.requestDeviceToken(options?)`

Returns `Promise<DeviceToken>`. This method is available only to system agents; ordinary agents must not depend on it. Do not substitute the incorrect names `getDeviceToken()` or `hasDisplay` for current APIs.

## `window.open(url, '_widget')`

Opens a Widget declared in `app.json.widgets`:

```javascript
window.open('widgets/weather?city=hangzhou', '_widget');
```

The current implementation does not use this API to open another Page.

## Page Data

### `this.data`

Contains rendered Page or Widget state.

### `this.setData(patch)`

Merges changed values into state and updates affected bindings. Dot paths can update nested values:

```javascript
this.setData({
  count: this.data.count + 1,
  'status.label': 'ready',
});
```

## Agent Worker Event

### `event.waitUntil(promise)`

Adds a Promise to the current `onOpen` event lifetime. It must be called before `onOpen` returns. An async `onOpen` return value is not automatically awaited.

## Page Node Access

Use Page-supported query methods only after the interface is ready. A common pattern is:

```javascript
const list = page.querySelector('#results');
```

Do not assume a complete browser DOM. Component nodes expose only their documented AIUI methods and properties.
