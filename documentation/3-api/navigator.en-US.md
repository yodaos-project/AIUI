# Navigator

Provides `navigator`-related capabilities in the runtime environment as the unified entry point for host identity, language preferences, runtime versions, and device-adjacent capabilities.

## Read Runtime and Locale Information

Read language, region, and runtime versions during startup to select localization settings and record diagnostics:

```javascript
const environment = {
  language: navigator.language,
  languages: navigator.languages,
  region: navigator.region,
  inkVersion: navigator.versions.ink,
  skiaVersion: navigator.versions.skia,
};

console.log(environment);
```

## Read Battery and Persistent Storage

```javascript
const battery = await navigator.getBattery();
const root = await navigator.storage.getDirectory();

console.log('battery:', battery.level);
console.log('storage root:', root.name);
```

## Notes

- `navigator.getDeviceSerialNumber()` returns the serial number provided by the host. If the host does not implement it, the return value is `''`. Be mindful of privacy and data security when using it.
- `navigator.userAgent` is suitable for identifying runtime and platform information. Avoid building tightly coupled logic that depends on string parsing.
- `navigator.language`, `navigator.languages`, and `navigator.region` are all derived from the host environment, so their exact values may vary across platforms.
- `navigator.bluetooth`, `navigator.geolocation`, `navigator.mediaDevices`, `navigator.storage`, and battery status depend on device capabilities and Agent permissions.

## API Reference

### Properties

#### `navigator.userAgent`

- **Type**: Read-only `string`.
- **Description**: Returns the User-Agent used by AIUI and the Ink runtime. The default format is `AIUI/{major.minor} Ink/{inkVersion}`. When the host provides platform or architecture metadata, a parenthesized segment is inserted, for example `AIUI/0.1 (YodaOS Sprite; aarch64) Ink/0.1.0`.
- **Behavior**: The same value is also used for the HTTP `User-Agent` request header sent by the networking layer. Use it for capability identification and diagnostics, not tightly coupled string parsing.

```javascript
const userAgent = navigator.userAgent;
console.log('UA:', userAgent);
```

#### `navigator.id`

- **Type**: Read-only `string`.
- **Description**: Returns an opaque identifier for the current Agent on the current device. Its scope is determined by the **combination of Agent and device**: the same Agent on the same device normally receives the same value; different Agents on the same device, or the same Agent on different devices, receive different values.

```javascript
const agentDeviceId = navigator.id;
console.log('Agent device ID:', agentDeviceId);
```

The value normally starts with `cid_` and is derived by the runtime from the Agent identity and device-side identity material. It is not an Agent URL, file path, device serial number, MAC address, or any other raw hardware identifier. Do not parse the value or depend on its specific format.

As long as the device-side identity material remains available, `navigator.id` stays stable across normal application restarts and upgrades. It may change after a factory reset, after host identity data is cleared or lost, or when the host replaces the device identity material used for derivation. It is an empty string `''` when there is no current app instance.

Use it only for purposes such as associating local data, restoring device-side state, or diagnostics within the same Agent scope. Do not use it as an authentication credential or assume that it never changes. If it is uploaded or stored across services, protect it as device-identifying information with appropriate privacy and security controls.

#### `navigator.language`

- **Type**: Read-only `string`.
- **Description**: Returns the first valid value in `navigator.languages`, representing the host's primary language preference. It is `''` when the host has not configured any language preference.

```javascript
const language = navigator.language;
console.log('Language:', language);
```

#### `navigator.languages`

- **Type**: Read-only `string[]`.
- **Description**: Returns the host-provided language preferences in priority order. The runtime removes surrounding whitespace and empty values; it returns `[]` when no languages are configured. Use this order for locale fallback.
- **Multi-language matching**: Language tags follow the IETF BCP 47 standard (e.g. `zh-CN`, `zh-TW`, `zh-HK`). When matching localized strings, follow BCP 47 / RFC 4647 Lookup semantics: start from the full tag and progressively truncate trailing subtags (`zh-Hant-TW` → `zh-Hant` → `zh`), use script and region subtags to distinguish Simplified from Traditional Chinese (`zh-Hans*` and `zh-SG` map to Simplified; `zh-Hant*`, `zh-TW`, `zh-HK`, and `zh-MO` map to Traditional), and fall back to a default language when nothing matches.

```javascript
const languages = navigator.languages;
console.log('Languages:', languages);
```

For a complete BCP 47 language-matching implementation, see the [`samples/navigator-info`](https://github.com/yodaos-project/AIUI/tree/main/samples/navigator-info) sample: it resolves the UI language from `navigator.languages` in priority order and switches automatically among Simplified Chinese, Traditional Chinese, and English string tables.

#### `navigator.region`

- **Type**: Read-only `string`.
- **Description**: Returns the region string provided by the host after surrounding whitespace is removed. It is `''` when no region is configured. The exact format is host-defined and can be used for regional configuration or service routing.

```javascript
const region = navigator.region;
console.log('Region:', region);
```

#### `navigator.versions.ink`

- **Type**: Read-only `string`.
- **Description**: Returns the current Ink runtime version string. A host may override it at build time. Use it for logging, troubleshooting, and compatibility checks rather than as an application version.

```javascript
const inkVersion = navigator.versions.ink;
console.log('Ink:', inkVersion);
```

#### `navigator.versions.skia`

- **Type**: Read-only `string`.
- **Description**: Returns the current Skia graphics-engine milestone string, such as `m126`. It is intended for graphics-rendering diagnostics and is not an AIUI or Ink version.

#### `navigator.renderingEnabled`

- **Type**: Read-only `boolean`.
- **Description**: Indicates whether the current instance has template, layout, and rendering capabilities. Normal window instances and offscreen rendering instances are usually `true`; a no-display instance is `false`. The value does not change during the instance lifetime.

```javascript
const skiaVersion = navigator.versions.skia;
console.log('Skia:', skiaVersion);
```

#### `navigator.bluetooth`

- **Type**: `Bluetooth`.
- **Description**: Bluetooth capability entry point for device discovery, connections, and GATT services. The object is mounted on `navigator`, but operations still depend on host capabilities, permissions, and device state. See [Bluetooth](/AIUI/api/device-bluetooth).

```javascript
const bluetooth = navigator.bluetooth;
console.log('Bluetooth mounted:', !!bluetooth);
```

#### `navigator.geolocation`

- **Type**: `Geolocation`.
- **Description**: Entry point for reading the current position, watching changes, and clearing watches. Location permission is required; see [Geolocation](/AIUI/api/geo-data-geolocation).

```javascript
const geolocation = navigator.geolocation;
console.log('Geolocation mounted:', !!geolocation);
```

#### `navigator.mediaDevices`

- **Type**: `MediaDevices`.
- **Description**: Media-capture entry point with `getUserMedia()`, `enumerateDevices()`, and `getSupportedConstraints()`. Camera and microphone access depend on host permissions and device capabilities. See [Media Capture](/AIUI/api/media-media-capture).

#### `navigator.storage`

- **Type**: `StorageManager`.
- **Description**: Storage entry point for the current Agent's private OPFS. When the host provides no OPFS backend, its methods fail with `NotSupportedError`. See [OPFS](/AIUI/api/storage-opfs).

### Methods

#### `navigator.getDeviceSerialNumber()`

- **Returns**: `string`.
- **Description**: Returns the serial number provided by the host for the current device. Only system Agents receive the host value; other Agents and hosts that provide no serial number receive `''`. Treat this as sensitive device information and restrict its use.

```javascript
const serialNumber = navigator.getDeviceSerialNumber();
console.log('SN:', serialNumber);
```

#### `navigator.getBattery()`

- **Returns**: `Promise<BatteryManager>`.
- **Description**: Asynchronously resolves a host-backed battery manager for reading battery level, charging state, and estimated remaining time, and for observing changes. The Promise rejects when the host registers no battery capability. See [BatteryManager](/AIUI/api/device-battery-manager).
