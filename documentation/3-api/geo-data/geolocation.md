# Geolocation

使用 `Geocoder` 可以根据已有经纬度查询地址；使用 `navigator.geolocation.watchPosition()` 可以持续接收设备的位置变化。`getCurrentPosition()` 暂时不可用。

## 根据坐标查询地址

已有经纬度时，可以使用 `Geocoder`，不必先获取设备位置：

```javascript
const geocoder = new Geocoder({ level: 'city', acceptLanguages: ['zh-CN'] });
try {
  const address = await geocoder.getFromLocation(30.2741, 120.1551);
  console.log(address?.formattedAddress ?? '未找到地址');
} catch (error) {
  console.error('地址查询失败：', error.message);
}
```

坐标使用 WGS-84。此查询不需要设备定位权限，但地址查询能力并非在所有环境中可用。返回字段可能为 `null`，请准备备用显示文字。

## 持续获取位置变化

`watchPosition()` 会返回一个监听编号。页面不再需要位置更新时，使用这个编号停止监听：

```javascript
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    console.log(position.coords.latitude, position.coords.longitude);
  },
  (error) => {
    console.error(error.code, error.message);
  }
);

// 不再需要位置更新时调用。
navigator.geolocation.clearWatch(watchId);
```

及时停止监听可以减少不必要的定位和电量消耗。

## 声明定位权限

使用定位前，需要在 `app.json` 中声明 `GEOLOCATION` 权限：

```json
{
  "permissions": ["GEOLOCATION"]
}
```

用户还需要允许设备的定位权限。定位被拒绝、暂时不可用或超时时，失败回调会收到对应错误。

## API Reference

### `navigator.geolocation`

返回当前应用的 `Geolocation` 对象。该对象由运行时提供，不需要自行构造。

#### `getCurrentPosition(success, error?, options?)`

暂时不可用。该方法用于请求一次当前位置，结果通过回调传递；请勿依赖它获取坐标。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `success` | `(position) => void` | 是 | 成功获得位置时调用。 |
| `error` | `(error) => void` | 否 | 定位失败时调用。 |
| `options` | `PositionOptions` | 否 | 精度、超时和缓存设置。 |

#### `watchPosition(success, error?, options?)`

持续监听位置变化，返回数字类型的 `watchId`。应在不再需要更新时把它传给 `clearWatch()`。

#### `clearWatch(watchId)`

停止 `watchId` 对应的位置监听。

### `PositionOptions`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `enableHighAccuracy` | `boolean` | 是否优先获取更精确的位置。默认值为 `false`；高精度定位可能消耗更多电量。 |
| `timeout` | `number` | 等待结果的最长时间，单位为毫秒；省略时由设备决定。 |
| `maximumAge` | `number` | 可以接受的缓存位置最长时间，单位为毫秒；省略时由设备决定。 |
| `reverseGeocode` | `object` | 设置 `enabled: true` 查询地址；`level` 可选 `country`、`region`、`city`、`district`、`street`，默认 `city`；`acceptLanguages` 是按优先顺序排列的语言标签数组。 |

### `GeolocationPosition`

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `coords.latitude` | `number` | 纬度。 |
| `coords.longitude` | `number` | 经度。 |
| `coords.accuracy` | `number` | 经纬度精度，单位为米。 |
| `coords.altitude` | `number \| null` | 海拔，不可用时为 `null`。 |
| `coords.altitudeAccuracy` | `number \| null` | 海拔精度，不可用时为 `null`。 |
| `coords.heading` | `number \| null` | 移动方向，不可用时为 `null`。 |
| `coords.speed` | `number \| null` | 移动速度，不可用时为 `null`。 |
| `timestamp` | `number` | 获取该位置时的时间戳。 |
| `address` | `GeocodeAddress \| null` | 查询到的地址；未请求、不可用或无结果时为 `null`。 |
| `reverseGeocodeStatus` | `string` | 地址查询状态：`not-requested`、`success`、`not-found`、`unavailable`、`timeout`、`error` 或 `rate-limited`。 |

### `GeolocationPositionError`

| `code` | 常量 | 说明 |
| --- | --- | --- |
| `1` | `PERMISSION_DENIED` | 用户或应用未允许定位。 |
| `2` | `POSITION_UNAVAILABLE` | 当前无法获得位置。 |
| `3` | `TIMEOUT` | 在设定时间内没有获得位置。 |

`message` 包含便于阅读的错误说明。

### `Geocoder`

#### `new Geocoder(options?)`

创建可重复使用的地址查询器。`options.level` 与 `acceptLanguages` 的含义与上面的定位选项相同；`timeout` 是查询超时毫秒数，默认 `3000`，范围为 0 至 2147483647。

#### `getFromLocation(latitude, longitude)`

查询一个 WGS-84 坐标，返回 `Promise<GeocodeAddress | null>`。纬度范围为 -90 至 90，经度范围为 -180 至 180；无匹配结果返回 `null`，服务不可用、超时或查询失败时拒绝 Promise，错误 `code` 分别为 `UNAVAILABLE`、`TIMEOUT`、`PROVIDER_ERROR`。

### `GeocodeAddress`

`formattedAddress`、`country`、`countryCode`、`region`、`city`、`district`、`street`、`streetNumber` 和 `postalCode` 均为字符串或 `null`。实际返回内容取决于地址查询服务。
