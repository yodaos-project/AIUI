# Navigator

提供运行环境中的 `navigator` 相关能力，作为宿主标识、语言偏好、运行时版本与设备邻接能力的统一入口。

## 读取运行环境与语言信息

在启动时读取语言、区域和运行时版本，用于选择本地化配置并记录诊断信息：

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

## 读取电池并访问持久化文件

```javascript
const battery = await navigator.getBattery();
const root = await navigator.storage.getDirectory();

console.log('battery:', battery.level);
console.log('storage root:', root.name);
```

## 注意事项

- `navigator.getDeviceSerialNumber()` 返回的是宿主提供的设备序列号，若宿主未实现则返回空字符串；使用时应注意隐私与数据安全。
- `navigator.userAgent` 适合用于识别运行时与平台信息，不建议依赖字符串解析实现强耦合逻辑。
- `navigator.language`、`navigator.languages` 与 `navigator.region` 都来自宿主环境，不同平台的具体值格式可能不同。
- `navigator.bluetooth`、`navigator.geolocation`、`navigator.mediaDevices`、`navigator.storage` 与电池状态都依赖设备能力和 Agent 权限。

## API Reference

### 属性

#### `navigator.userAgent`

- **类型**：`string`，只读。
- **说明**：返回 AIUI 与 Ink 运行时使用的 User-Agent。默认格式为 `AIUI/{major.minor} Ink/{inkVersion}`；宿主提供平台或架构信息时，会在中间插入括号段，例如 `AIUI/0.1 (YodaOS Sprite; aarch64) Ink/0.1.0`。
- **行为**：该值也用于网络层发送的 HTTP `User-Agent` 请求头。应将其用于能力识别和诊断，不要依赖字符串解析来实现强耦合逻辑。

```javascript
const userAgent = navigator.userAgent;
console.log('UA:', userAgent);
```

#### `navigator.id`

- **类型**：`string`，只读。
- **说明**：返回当前 Agent 在当前设备上的不透明标识。它的作用域由 **Agent 与设备共同决定**：同一个 Agent 在同一设备上通常得到相同的值；同一设备上的不同 Agent，或不同设备上的同一 Agent，得到不同的值。

```javascript
const agentDeviceId = navigator.id;
console.log('Agent device ID:', agentDeviceId);
```

该值通常以 `cid_` 开头，由运行时根据 Agent 身份与设备侧身份材料派生。它不是 Agent URL、文件路径、设备序列号、MAC 地址或其他原始硬件标识，也不应解析其内容或依赖其具体格式。

在设备侧身份材料未被清除的情况下，`navigator.id` 会在应用正常重启和升级后保持稳定。恢复出厂设置、清除或丢失宿主身份数据，或宿主更换用于派生标识的设备身份材料时，该值可能变化。没有当前应用实例时返回空字符串 `''`。

建议仅将它用于同一 Agent 范围内的本地数据关联、设备侧状态恢复或诊断。不要将其用作认证凭据，也不要假设它永久不变；如需上传或跨服务保存，应按设备标识信息采取适当的隐私与安全保护。

#### `navigator.language`

- **类型**：`string`，只读。
- **说明**：返回 `navigator.languages` 的第一个有效值，即宿主当前首选语言。宿主没有配置语言时返回 `''`。

```javascript
const language = navigator.language;
console.log('Language:', language);
```

#### `navigator.languages`

- **类型**：`string[]`，只读。
- **说明**：返回宿主提供的按优先级排列的语言偏好列表。运行时会去除首尾空白和空值；宿主没有配置语言时返回空数组 `[]`。应用可按该顺序实现本地化兜底。
- **多语言匹配**：语言标签遵循 IETF BCP 47 标准（如 `zh-CN`、`zh-TW`、`zh-HK`）。做多语言文案匹配时，建议按 BCP 47 / RFC 4647 Lookup 语义处理：从完整标签开始逐步截断末尾子标签进行匹配（如 `zh-Hant-TW` → `zh-Hant` → `zh`），并结合文字系统与地区子标签区分简繁体（`zh-Hans*`、`zh-SG` 等归入简体，`zh-Hant*`、`zh-TW`、`zh-HK`、`zh-MO` 归入繁体），全部未命中时回退默认语言。

```javascript
const languages = navigator.languages;
console.log('Languages:', languages);
```

完整的 BCP 47 语言匹配实现可参考示例 [`samples/navigator-info`](https://github.com/yodaos-project/AIUI/tree/main/samples/navigator-info)：它按 `navigator.languages` 优先级解析界面语言，自动切换简体中文 / 繁体中文 / 英文三套文案。

#### `navigator.region`

- **类型**：`string`，只读。
- **说明**：返回宿主提供的区域字符串，运行时会去除首尾空白；宿主没有配置区域时返回 `''`。具体格式由宿主决定，可用于地区化配置或服务分流。

```javascript
const region = navigator.region;
console.log('Region:', region);
```

#### `navigator.versions.ink`

- **类型**：`string`，只读。
- **说明**：返回当前 Ink 运行时版本字符串。构建时可由宿主覆盖，用于日志、问题排查和兼容性判断；不应将其当作业务版本号。

```javascript
const inkVersion = navigator.versions.ink;
console.log('Ink:', inkVersion);
```

#### `navigator.versions.skia`

- **类型**：`string`，只读。
- **说明**：返回当前 Skia 图形引擎 milestone 字符串，例如 `m126`。适合用于图形渲染问题排查，不代表 AIUI 或 Ink 的版本号。

#### `navigator.renderingEnabled`

- **类型**：`boolean`，只读。
- **说明**：表示当前实例是否具备模板、布局和渲染能力。普通窗口实例与离屏渲染实例通常为 `true`；无显示实例为 `false`。该值在实例生命周期内保持不变。

```javascript
const skiaVersion = navigator.versions.skia;
console.log('Skia:', skiaVersion);
```

#### `navigator.bluetooth`

- **类型**：`Bluetooth`。
- **说明**：蓝牙能力入口，用于发现设备、建立连接和访问 GATT 服务。对象会挂载在 `navigator` 上，但具体操作仍取决于宿主能力、权限和设备状态；完整接口见[蓝牙](/AIUI/api/device-bluetooth)。

```javascript
const bluetooth = navigator.bluetooth;
console.log('Bluetooth mounted:', !!bluetooth);
```

#### `navigator.geolocation`

- **类型**：`Geolocation`。
- **说明**：地理位置能力入口，用于读取当前位置、监听位置变化和清理监听。使用前需要获得定位权限；完整接口见 [Geolocation](/AIUI/api/geo-data-geolocation)。

```javascript
const geolocation = navigator.geolocation;
console.log('Geolocation mounted:', !!geolocation);
```

#### `navigator.mediaDevices`

- **类型**：`MediaDevices`。
- **说明**：媒体采集入口，提供 `getUserMedia()`、`enumerateDevices()` 与 `getSupportedConstraints()`。摄像头和麦克风访问取决于宿主权限及设备能力；完整用法见[媒体采集](/AIUI/api/media-media-capture)。

#### `navigator.storage`

- **类型**：`StorageManager`。
- **说明**：当前 Agent 私有 OPFS 的存储入口。宿主未提供 OPFS 后端时，相关方法会以 `NotSupportedError` 失败；完整用法见 [OPFS](/AIUI/api/storage-opfs)。

### 方法

#### `navigator.getDeviceSerialNumber()`

- **返回值**：`string`。
- **说明**：返回宿主提供的当前设备序列号。该能力仅对系统 Agent 返回宿主值，其他 Agent 或宿主未提供时返回空字符串 `''`。这是敏感设备信息，应限制使用范围。

```javascript
const serialNumber = navigator.getDeviceSerialNumber();
console.log('SN:', serialNumber);
```

#### `navigator.getBattery()`

- **返回值**：`Promise<BatteryManager>`。
- **说明**：异步获取宿主电池管理器，用于读取电量、充电状态和预计剩余时长，并监听变化。宿主未注册电池能力时 Promise 会拒绝；完整行为见 [BatteryManager](/AIUI/api/device-battery-manager)。
- **相关文档**：[BatteryManager](/AIUI/api/device-battery-manager)。
