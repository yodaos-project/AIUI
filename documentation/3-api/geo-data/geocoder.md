# Geocoder

`Geocoder` 根据已有的 WGS-84 经纬度查询地址，也称为反向地理编码。智能体可以用它为地点卡片显示城市名、街道或完整地址。

## 根据坐标查询城市级地址

将纬度和经度依次传给 `getFromLocation()`。如果找到匹配地址，可以直接显示 `formattedAddress`。

```javascript
const geocoder = new Geocoder({ level: 'city', acceptLanguages: ['zh-CN'] });

try {
  const address = await geocoder.getFromLocation(30.2741, 120.1551);
  console.log(address?.formattedAddress ?? '未找到地址');
} catch (error) {
  console.error('地址查询失败：', error.message);
}
```

## 显示街道信息

需要在地图标记旁显示街道信息时，可以请求 `street` 级别并读取地址字段。示例在缺少街道字段时使用格式化地址。

```javascript
const geocoder = new Geocoder({ level: 'street', acceptLanguages: ['zh-CN'] });

try {
  const address = await geocoder.getFromLocation(30.2741, 120.1551);
  const streetLabel = address?.street
    ? [address.street, address.streetNumber].filter(Boolean).join(' ')
    : address?.formattedAddress;
  console.log(streetLabel ?? '未找到地址');
} catch (error) {
  console.error('地址查询失败：', error.code, error.message);
}
```

## 坐标与可用性

查询已有坐标无需设备定位权限。地址查询可用性及返回的字段取决于运行环境和服务覆盖范围。查询设备当前位置的地址时，可以直接传入 `position.coords` 中的 WGS-84 经纬度。定位权限和坐标系说明见 [Geolocation](./geolocation.md)。

## API Reference

### `Geocoder`

#### `new Geocoder(options?)`

创建可重复使用的地址查询器。每次查询都使用构造时指定的选项。

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `level` | `GeocodeLevel` | 请求的地址级别，可选 `country`、`region`、`city`、`district` 或 `street`，默认 `city`。 |
| `acceptLanguages` | `string[]` | 按优先顺序排列的 BCP 47 语言标签。省略或传入空数组时使用查询服务的默认语言。 |
| `timeout` | `number` | 单次查询超时，单位为毫秒，默认 `3000`，范围为 0 至 2147483647。 |

#### `getFromLocation(latitude, longitude)`

查询一个 WGS-84 坐标，返回 `Promise<GeocodeAddress | null>`。找到匹配结果时返回最匹配的地址，无匹配时返回 `null`。

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `latitude` | `number` | 纬度，以十进制度表示，范围为 −90 至 90。 |
| `longitude` | `number` | 经度，以十进制度表示，范围为 −180 至 180。 |

坐标不是有限数字时同步抛出 `TypeError`，超出范围时同步抛出 `RangeError`。服务不可用、查询超时或查询失败时，Promise 会拒绝，错误的 `code` 分别为 `UNAVAILABLE`、`TIMEOUT` 或 `PROVIDER_ERROR`。

### `GeocodeAddress`

下列字段的类型均为 `string | null`。查询结果缺少某个字段时，该字段为 `null`。

#### `formattedAddress`

可直接显示的格式化地址。

#### `country`

国家或地区名称。

#### `countryCode`

国家或地区代码。

#### `region`

省、州等地区名称。

#### `city`

城市名称。

#### `district`

区、县等行政区名称。

#### `street`

街道名称。

#### `streetNumber`

门牌号。

#### `postalCode`

邮政编码。
