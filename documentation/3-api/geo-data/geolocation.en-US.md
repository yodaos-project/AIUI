# Geolocation

Use `navigator.geolocation` to get the current position or receive position updates. Both operations report latitude and longitude in the WGS-84 coordinate system.

## Get the Current Position

`getCurrentPosition()` requests one position. Read the coordinates and accuracy from `position.coords` after it succeeds:

```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    console.log('Current position:', latitude, longitude);
    console.log('Accuracy:', accuracy, 'metres');
  },
  (error) => {
    console.error('Location failed:', error.message);
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  }
);
```

The `reverseGeocode` option for `getCurrentPosition()` is temporarily unavailable. To look up an address using the returned coordinates, see [Geocoder](./geocoder.en-US.md).

## Watch Position Changes

`watchPosition()` returns a watch ID. Stop the watch with that ID when the page no longer needs updates:

```javascript
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    console.log(position.coords.latitude, position.coords.longitude);
  },
  (error) => {
    console.error(error.code, error.message);
  }
);

// Call this when location updates are no longer needed.
navigator.geolocation.clearWatch(watchId);
```

Stopping unused watches avoids unnecessary positioning work and battery use.

## Declare Location Permission

Declare the `GEOLOCATION` permission in `app.json` before using location:

```json
{
  "permissions": ["GEOLOCATION"]
}
```

The user must also allow the device's location permission. The error callback reports permission denial, an unavailable position, or a timeout.

## Coordinate Systems and Conversion

The same location can have different latitude and longitude values in different coordinate systems. Before plotting a position, check which coordinate system the target map API accepts. A mismatch shifts the marker on the map.

| Coordinate system | Background | Common uses |
| --- | --- | --- |
| **WGS-84** | The World Geodetic System 1984 is the global geodetic reference system used by GPS. | GPS module output, AIUI position results, and KML data for Google Earth. [NGA WGS-84 overview](https://earth-info.nga.mil/?action=wgs84&dir=wgs84), [Google KML documentation](https://developers.google.com/kml/articles/vector) |
| **GCJ-02** | Developed by China's former State Bureau of Surveying and Mapping, GCJ-02 is also known as the Mars coordinate system. It applies a location-dependent offset to WGS-84 coordinates. | Map markers, place search, and route planning in Amap and Tencent Maps in mainland China. [Amap coordinate systems](https://lbs.amap.com/api/javascript-api-v2/guide/transform/convertfrom), [Tencent coordinate systems](https://cloud.tencent.com/developer/article/1361312) |
| **BD-09** | Baidu applies a second offset to GCJ-02. `BD09LL` is the latitude and longitude variant. `BD09MC` uses projected Mercator coordinates in metres. | Map markers and place services in Baidu Maps in mainland China typically use `BD09LL`. [Baidu coordinate systems](https://lbsyun.baidu.com/docs/android?title=androidsdk%2Fguide%2Ftool%2Fcoordinate) |

Check the input coordinate system for the API, region, and map layer you use. The Google Maps JavaScript API uses WGS-84 for latitude and longitude. The Baidu Maps JS API also uses WGS-84 for maps outside China. [Google Maps coordinates](https://developers.google.com/maps/documentation/javascript/coordinates), [Baidu Maps JS API coordinate systems](https://lbsyun.baidu.com/docs/jsapi?title=jsapi4%2Fguide%2Fconcept%2Fcoord)

### Convert with a Map Provider

Store the original WGS-84 position from `position.coords`. Convert it once when plotting a marker or calling a map service that expects a different coordinate system. Pass the original position directly to `Geocoder.getFromLocation(latitude, longitude)`.

| Conversion | How to convert |
| --- | --- |
| WGS-84 → GCJ-02 | Use `coordsys=gps` with Amap or `type=1` with Tencent. [Amap coordinate conversion](https://lbs.amap.com/api/webservice/guide/api/convert), [Tencent coordinate conversion](https://github.com/Tencent/tencentmap-webservice-skill/blob/main/references/api-tools.md#坐标转换) |
| WGS-84 → BD09LL | Use `model=2` with Baidu. [Baidu coordinate conversion](https://lbsyun.baidu.com/docs/webapi?title=geoconv%2Fguide%2Fchangeposition-base) |
| GCJ-02 → BD09LL | Use `model=1` with Baidu. [Baidu coordinate conversion](https://lbsyun.baidu.com/docs/webapi?title=geoconv%2Fguide%2Fchangeposition-base) |
| BD09LL → GCJ-02 | Use `coordsys=baidu` with Amap, `type=3` with Tencent, or `model=5` with Baidu. [Amap coordinate conversion](https://lbs.amap.com/api/webservice/guide/api/convert), [Tencent coordinate conversion](https://github.com/Tencent/tencentmap-webservice-skill/blob/main/references/api-tools.md#坐标转换), [Baidu coordinate conversion](https://lbsyun.baidu.com/docs/webapi?title=geoconv%2Fguide%2Fchangeposition-base) |
| BD09LL ↔ BD09MC | Use Baidu's `model=3` for coordinates in metres or `model=4` for latitude and longitude. [Baidu coordinate conversion](https://lbsyun.baidu.com/docs/webapi?title=geoconv%2Fguide%2Fchangeposition-base) |

For latitude and longitude inputs, Amap's `locations` and Baidu's `coords` use `longitude,latitude`. Tencent's `locations` uses `latitude,longitude`. For example, send the same WGS-84 point as `locations=120.1551,30.2741` to Amap and `locations=30.2741,120.1551` to Tencent.

### Convert Back to WGS-84

The map conversion APIs above do not convert back to WGS-84. Use the stored WGS-84 coordinates when you need the original position. If your source provides only GCJ-02 or `BD09LL`, a third-party library such as [`gcoord`](https://github.com/hujiulong/gcoord) can approximate the inverse transformation. Check the result against your application's accuracy requirements.

In a Node.js project with `gcoord` installed, pass `[longitude, latitude]`, the source coordinate system, and the target coordinate system. This example converts GCJ-02 to WGS-84. For Baidu latitude and longitude, use `gcoord.BD09LL` as the source.

```javascript
import gcoord from 'gcoord';

const gcj02 = [120.1598, 30.2717];
const [longitude, latitude] = gcoord.transform(gcj02, gcoord.GCJ02, gcoord.WGS84);
console.log({ longitude, latitude });
```

## API Reference

### `navigator.geolocation`

Returns the application's `Geolocation` object. The runtime provides this object; applications do not construct it.

#### `getCurrentPosition(success, error?, options?)`

Requests one current position. The method has no return value. The success callback receives a `GeolocationPosition` with WGS-84 latitude and longitude.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `success` | `(position) => void` | Yes | Called when a position is available. |
| `error` | `(error) => void` | No | Called when positioning fails. |
| `options` | `PositionOptions` | No | Accuracy, timeout, and cache settings. |

#### `watchPosition(success, error?, options?)`

Watches for position changes and returns a numeric `watchId`. Each successful update delivers a `GeolocationPosition` with WGS-84 latitude and longitude to the success callback. Pass the `watchId` to `clearWatch()` when updates are no longer needed.

#### `clearWatch(watchId)`

Stops the location watch identified by `watchId`.

### `PositionOptions`

| Field | Type | Description |
| --- | --- | --- |
| `enableHighAccuracy` | `boolean` | Prefer a more accurate position. Defaults to `false`; high-accuracy positioning may use more power. |
| `timeout` | `number` | Maximum time to wait, in milliseconds; the device decides when omitted. |
| `maximumAge` | `number` | Maximum acceptable age of a cached position, in milliseconds; the device decides when omitted. |
| `reverseGeocode` | `object` | Set `enabled: true` to look up an address. This option is temporarily unavailable for `getCurrentPosition()`; use `Geocoder` for coordinate lookup. `level` is `country`, `region`, `city`, `district`, or `street` (default `city`); `acceptLanguages` is an ordered array of language tags. |

### `GeolocationPosition`

`coords.latitude` and `coords.longitude` are expressed in decimal degrees.

| Property | Type | Description |
| --- | --- | --- |
| `coords.latitude` | `number` | Latitude. |
| `coords.longitude` | `number` | Longitude. |
| `coords.accuracy` | `number` | Coordinate accuracy in metres. |
| `coords.altitude` | `number \| null` | Altitude, or `null` when unavailable. |
| `coords.altitudeAccuracy` | `number \| null` | Altitude accuracy, or `null` when unavailable. |
| `coords.heading` | `number \| null` | Direction of travel, or `null` when unavailable. |
| `coords.speed` | `number \| null` | Travel speed, or `null` when unavailable. |
| `timestamp` | `number` | Timestamp when the position was obtained. |
| `address` | `GeocodeAddress \| null` | The address, or `null` when not requested, unavailable, or not found. |
| `reverseGeocodeStatus` | `string` | Address status: `not-requested`, `success`, `not-found`, `unavailable`, `timeout`, `error`, or `rate-limited`. |

### `GeolocationPositionError`

| `code` | Constant | Description |
| --- | --- | --- |
| `1` | `PERMISSION_DENIED` | The user or application did not allow location access. |
| `2` | `POSITION_UNAVAILABLE` | A position is currently unavailable. |
| `3` | `TIMEOUT` | No position was available before the timeout. |

`message` contains a human-readable description of the error.
