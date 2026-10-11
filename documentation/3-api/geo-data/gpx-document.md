# GPXDocument

`GPXDocument` 用于读取、创建和修改 GPX 路线数据。你可以在内存中添加起点、终点、途经点和轨迹点，再把结果导出为 GPX XML，交给地图组件显示或保存到文件。

## 创建一条路线

`GPXDocument` 可以直接使用，也可以从内置 `gpx` 模块导入：

```javascript
import { GPXDocument } from 'gpx';

const route = new GPXDocument();

route.setStartPoint({
  latitude: 30.2741,
  longitude: 120.1551,
  name: '起点',
});

route.appendTrackPoint({
  latitude: 30.2765,
  longitude: 120.1582,
  elevation: 18,
  time: new Date().toISOString(),
});

route.setEndPoint({
  latitude: 30.2792,
  longitude: 120.1618,
  name: '终点',
});
```

`bounds` 会根据路线中的点计算最小和最大经纬度，便于地图确定显示范围。

## 读取已有 GPX

构造函数、`GPXDocument.from()` 和 `GPXDocument.parse()` 都可以读取 GPX XML 字符串、`Blob`、`ArrayBuffer`、类型化数组或另一个 `GPXDocument`：

```javascript
const response = await fetch('/assets/morning-run.gpx');
const route = GPXDocument.parse(await response.arrayBuffer());

console.log(route.bounds);
```

输入内容不是有效的 GPX 时会抛出异常，读取外部数据时建议使用 `try...catch` 处理。

## 导出并显示路线

`toString()` 返回 GPX XML 文本，可以传给 `<map-gpx>` 的 `data` 属性：

```javascript
export default {
  data: {
    routeGpx: '',
  },
  onLoad() {
    const route = new GPXDocument();
    route.appendTrackPoint({ latitude: 30.2741, longitude: 120.1551 });
    route.appendTrackPoint({ latitude: 30.2792, longitude: 120.1618 });

    this.setData({ routeGpx: route.toString() });
  },
};
```

```xml
<map style="width: 320px; height: 320px;">
  <template slot="overlays">
    <map-gpx data="{{ routeGpx }}" />
  </template>
</map>
```

需要以二进制对象传递或保存时，可以使用 `toBlob()`。返回结果的 MIME 类型是 `application/gpx+xml`。

读取输入时必须包含一个完整的 `<gpx>...</gpx>` 根元素。截断 XML、只有路线片段、多个 GPX 根或错误闭合会抛出异常；不要把这些输入当作空路线继续处理。

## API Reference

### `new GPXDocument(input?)`

创建空的 GPX 文档，或者根据已有输入创建副本。`GPXDocument` 同时是全局类和 `gpx` 模块的具名导出。

### `GPXDocument.from(input)` / `GPXDocument.parse(input)`

根据已有内容创建 `GPXDocument`。两个方法行为相同。

| `input` 类型 | 说明 |
| --- | --- |
| `string` | GPX XML 文本。 |
| `Blob` | 包含 GPX 数据的 Blob。 |
| `ArrayBuffer` / `BufferSource` | GPX 的二进制数据。 |
| `GPXDocument` | 已有文档，会创建独立副本。 |

### `bounds`

返回 `GPXBounds`；文档没有任何位置点时返回 `null`。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `minLatitude` | `number` | 最小纬度。 |
| `minLongitude` | `number` | 最小经度。 |
| `maxLatitude` | `number` | 最大纬度。 |
| `maxLongitude` | `number` | 最大经度。 |

### 路线编辑方法

| 方法 | 说明 |
| --- | --- |
| `setStartPoint(point)` | 设置路线起点。 |
| `setEndPoint(point)` | 设置路线终点。 |
| `addWaypoint(point)` | 添加一个途经点。 |
| `appendTrackPoint(point)` | 在当前轨迹末尾添加一个轨迹点。 |
| `clearTrack()` | 清除轨迹点，保留起点、终点和途经点。 |

### `GPXPointInit`

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `latitude` | `number` | 是 | 纬度。 |
| `longitude` | `number` | 是 | 经度。 |
| `elevation` | `number` | 否 | 海拔。 |
| `time` | `string` | 否 | 时间字符串，建议使用 ISO 8601 格式。 |
| `name` | `string` | 否 | 点的名称。 |

### 导出方法

| 方法 | 返回值 | 说明 |
| --- | --- | --- |
| `toString()` | `string` | 导出 GPX XML 文本。 |
| `toBlob()` | `Blob` | 导出 MIME 类型为 `application/gpx+xml` 的 Blob。 |
