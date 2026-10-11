# GPXDocument

`GPXDocument` reads, creates, and edits GPX route data. Add start, end, waypoint, and track points in memory, then export the result as GPX XML for a map component or file.

## Create a Route

`GPXDocument` is available globally and as an export from the built-in `gpx` module:

```javascript
import { GPXDocument } from 'gpx';

const route = new GPXDocument();

route.setStartPoint({
  latitude: 30.2741,
  longitude: 120.1551,
  name: 'Start',
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
  name: 'Finish',
});
```

`bounds` calculates the minimum and maximum coordinates across the route so a map can choose a suitable viewport.

## Read Existing GPX

The constructor, `GPXDocument.from()`, and `GPXDocument.parse()` accept a GPX XML string, `Blob`, `ArrayBuffer`, typed array, or another `GPXDocument`:

```javascript
const response = await fetch('/assets/morning-run.gpx');
const route = GPXDocument.parse(await response.arrayBuffer());

console.log(route.bounds);
```

Invalid GPX input throws an exception. Use `try...catch` when reading external data.

## Export and Display a Route

`toString()` returns GPX XML text that can be passed to the `data` property of `<map-gpx>`:

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

Use `toBlob()` when the result needs to be passed or saved as a binary object. The returned MIME type is `application/gpx+xml`.

Input must contain one complete `<gpx>...</gpx>` root. Truncated XML, route fragments without a root, multiple GPX roots, and mismatched closing tags throw errors. Do not treat these inputs as empty routes.

## API Reference

### `new GPXDocument(input?)`

Creates an empty GPX document or a document from existing input. `GPXDocument` is both a global class and a named export of the `gpx` module.

### `GPXDocument.from(input)` / `GPXDocument.parse(input)`

Creates a `GPXDocument` from existing content. Both methods behave the same way.

| `input` type | Description |
| --- | --- |
| `string` | GPX XML text. |
| `Blob` | A blob containing GPX data. |
| `ArrayBuffer` / `BufferSource` | Binary GPX data. |
| `GPXDocument` | An existing document, copied into an independent document. |

### `bounds`

Returns `GPXBounds`, or `null` when the document contains no position points.

| Property | Type | Description |
| --- | --- | --- |
| `minLatitude` | `number` | Minimum latitude. |
| `minLongitude` | `number` | Minimum longitude. |
| `maxLatitude` | `number` | Maximum latitude. |
| `maxLongitude` | `number` | Maximum longitude. |

### Route Editing Methods

| Method | Description |
| --- | --- |
| `setStartPoint(point)` | Sets the route's start point. |
| `setEndPoint(point)` | Sets the route's end point. |
| `addWaypoint(point)` | Adds a waypoint. |
| `appendTrackPoint(point)` | Appends a point to the current track. |
| `clearTrack()` | Clears track points while preserving the start, end, and waypoints. |

### `GPXPointInit`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `latitude` | `number` | Yes | Latitude. |
| `longitude` | `number` | Yes | Longitude. |
| `elevation` | `number` | No | Elevation. |
| `time` | `string` | No | Time string; ISO 8601 is recommended. |
| `name` | `string` | No | Point name. |

### Export Methods

| Method | Returns | Description |
| --- | --- | --- |
| `toString()` | `string` | Exports GPX XML text. |
| `toBlob()` | `Blob` | Exports a blob with the MIME type `application/gpx+xml`. |
