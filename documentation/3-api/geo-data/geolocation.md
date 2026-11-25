# Geolocation

使用 `navigator.geolocation` 可以获取当前位置或持续接收位置变化，两种方式返回的经纬度都使用 WGS-84 坐标系。

## 获取当前位置

`getCurrentPosition()` 会请求一次位置。成功后，可以从 `position.coords` 读取经纬度和精度：

```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    console.log('当前位置：', latitude, longitude);
    console.log('精度：', accuracy, '米');
  },
  (error) => {
    console.error('定位失败：', error.message);
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  }
);
```

`getCurrentPosition()` 的 `reverseGeocode` 选项暂不可用。如何用返回的坐标查询地址，见 [Geocoder](./geocoder.md)。

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

## 常见坐标系与转换

同一个位置在不同坐标系下可能有不同的经纬度。把定位结果画在地图上之前，先确认目标地图 API 接受哪种坐标系。坐标系不一致时，地图上的标记会出现偏移。

| 坐标系 | 背景 | 常见场景 |
| --- | --- | --- |
| **WGS-84** | 世界大地测量系统 1984，是 GPS 使用的全球大地参考系。 | GPS 模块输出、AIUI 定位结果和 Google Earth 使用的 KML 数据。[NGA WGS-84 说明](https://earth-info.nga.mil/?action=wgs84&dir=wgs84)、[Google KML 文档](https://developers.google.com/kml/articles/vector) |
| **GCJ-02** | 由原中国国家测绘局制定，俗称火星坐标系。在 WGS-84 经纬度的基础上施加随位置变化的偏移。 | 高德地图和腾讯地图在中国大陆的标注、地点查询和路线规划。[高德坐标系说明](https://lbs.amap.com/api/javascript-api-v2/guide/transform/convertfrom)、[腾讯坐标系说明](https://cloud.tencent.com/developer/article/1361312) |
| **BD-09** | 百度在 GCJ-02 基础上做了二次偏移。`BD09LL` 表示经纬度，`BD09MC` 表示以米为单位的墨卡托平面坐标。 | 百度地图在中国大陆的地图标注和地点服务通常用 `BD09LL`。[百度地图坐标系说明](https://lbsyun.baidu.com/docs/android?title=androidsdk%2Fguide%2Ftool%2Fcoordinate) |

按所用 API、地区和图层确认输入坐标系。Google Maps JavaScript API 的经纬度采用 WGS-84，百度地图 JS API 的海外地图也使用 WGS-84。[Google Maps 坐标文档](https://developers.google.com/maps/documentation/javascript/coordinates)、[百度地图 JS API 坐标系](https://lbsyun.baidu.com/docs/jsapi?title=jsapi4%2Fguide%2Fconcept%2Fcoord)

### 使用地图平台转换

保存 `position.coords` 中的原始 WGS-84 经纬度，绘制标记或调用地图服务时按目标接口的要求转换一次。调用 `Geocoder.getFromLocation(latitude, longitude)` 时可以直接使用原始定位结果。

| 转换方向 | 转换方法 |
| --- | --- |
| WGS-84 → GCJ-02 | 高德传入 `coordsys=gps`，腾讯传入 `type=1`。[高德坐标转换](https://lbs.amap.com/api/webservice/guide/api/convert)、[腾讯坐标转换](https://github.com/Tencent/tencentmap-webservice-skill/blob/main/references/api-tools.md#坐标转换) |
| WGS-84 → BD09LL | 百度坐标转换传入 `model=2`。[百度坐标转换](https://lbsyun.baidu.com/docs/webapi?title=geoconv%2Fguide%2Fchangeposition-base) |
| GCJ-02 → BD09LL | 百度坐标转换传入 `model=1`。[百度坐标转换](https://lbsyun.baidu.com/docs/webapi?title=geoconv%2Fguide%2Fchangeposition-base) |
| BD09LL → GCJ-02 | 高德传入 `coordsys=baidu`，腾讯传入 `type=3`，或百度传入 `model=5`。[高德坐标转换](https://lbs.amap.com/api/webservice/guide/api/convert)、[腾讯坐标转换](https://github.com/Tencent/tencentmap-webservice-skill/blob/main/references/api-tools.md#坐标转换)、[百度坐标转换](https://lbsyun.baidu.com/docs/webapi?title=geoconv%2Fguide%2Fchangeposition-base) |
| BD09LL ↔ BD09MC | 百度坐标转换中，转为米制坐标用 `model=3`，转回经纬度用 `model=4`。[百度坐标转换](https://lbsyun.baidu.com/docs/webapi?title=geoconv%2Fguide%2Fchangeposition-base) |

输入为经纬度时，高德的 `locations` 和百度的 `coords` 按 `经度,纬度` 传参，腾讯的 `locations` 按 `纬度,经度` 传参。例如，同一个 WGS-84 定位点传给高德时写作 `locations=120.1551,30.2741`，传给腾讯时写作 `locations=30.2741,120.1551`。

### 转回 WGS-84

上述地图转换接口不提供转回 WGS-84 的方向。需要原始定位结果时，优先使用保存的 WGS-84 坐标。如果数据源只提供 GCJ-02 或 `BD09LL`，可以用第三方库（如 [`gcoord`](https://github.com/hujiulong/gcoord)）做近似逆转换。结果可能与原始定位有误差，使用前应按应用所需的精度验证。

在安装了 `gcoord` 的 Node.js 项目中，传入 `[经度, 纬度]`、源坐标系和目标坐标系。以下示例将 GCJ-02 转为 WGS-84。输入为百度经纬度时，将源坐标系改为 `gcoord.BD09LL`。

```javascript
import gcoord from 'gcoord';

const gcj02 = [120.1598, 30.2717];
const [longitude, latitude] = gcoord.transform(gcj02, gcoord.GCJ02, gcoord.WGS84);
console.log({ longitude, latitude });
```

## API Reference

### `navigator.geolocation`

返回当前应用的 `Geolocation` 对象。该对象由运行时提供，不需要自行构造。

#### `getCurrentPosition(success, error?, options?)`

获取一次当前位置。方法没有返回值，成功回调收到包含 WGS-84 经纬度的 `GeolocationPosition`。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `success` | `(position) => void` | 是 | 成功获得位置时调用。 |
| `error` | `(error) => void` | 否 | 定位失败时调用。 |
| `options` | `PositionOptions` | 否 | 精度、超时和缓存设置。 |

#### `watchPosition(success, error?, options?)`

持续监听位置变化，返回数字类型的 `watchId`。每次成功回调都收到包含 WGS-84 经纬度的 `GeolocationPosition`。不再需要更新时，把 `watchId` 传给 `clearWatch()`。

#### `clearWatch(watchId)`

停止 `watchId` 对应的位置监听。

### `PositionOptions`

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `enableHighAccuracy` | `boolean` | 是否优先获取更精确的位置。默认值为 `false`；高精度定位可能消耗更多电量。 |
| `timeout` | `number` | 等待结果的最长时间，单位为毫秒；省略时由设备决定。 |
| `maximumAge` | `number` | 可以接受的缓存位置最长时间，单位为毫秒；省略时由设备决定。 |
| `reverseGeocode` | `object` | 设置 `enabled: true` 查询地址。`getCurrentPosition()` 暂不支持此选项；请用 `Geocoder` 查询坐标。`level` 可选 `country`、`region`、`city`、`district`、`street`，默认 `city`；`acceptLanguages` 是按优先顺序排列的语言标签数组。 |

### `GeolocationPosition`

`coords.latitude` 和 `coords.longitude` 以十进制表示，单位为度。

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
