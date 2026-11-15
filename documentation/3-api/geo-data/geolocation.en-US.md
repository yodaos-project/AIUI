# Geolocation

Use `navigator.geolocation` to get the current position or receive position updates, and `Geocoder` to look up an address from supplied coordinates.

## Look Up an Address from Coordinates

When you already have coordinates, use `Geocoder` without requesting the device's position:

```javascript
const geocoder = new Geocoder({ level: 'city', acceptLanguages: ['en-US'] });
try {
  const address = await geocoder.getFromLocation(30.2741, 120.1551);
  console.log(address?.formattedAddress ?? 'No address found');
} catch (error) {
  console.error('Address lookup failed:', error.message);
}
```

Coordinates use WGS-84. This lookup does not require device location permission, but address lookup is not available in every environment. Returned fields can be `null`, so provide fallback text.

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

The `reverseGeocode` option for `getCurrentPosition()` is temporarily unavailable. Use `Geocoder` above to look up an address from the coordinates.

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

## API Reference

### `navigator.geolocation`

Returns the application's `Geolocation` object. The runtime provides this object; applications do not construct it.

#### `getCurrentPosition(success, error?, options?)`

Requests one current position. It has no return value and delivers the result through callbacks. The `reverseGeocode` option is temporarily unavailable; use `Geocoder` to look up the returned coordinates.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `success` | `(position) => void` | Yes | Called when a position is available. |
| `error` | `(error) => void` | No | Called when positioning fails. |
| `options` | `PositionOptions` | No | Accuracy, timeout, and cache settings. |

#### `watchPosition(success, error?, options?)`

Watches for position changes and returns a numeric `watchId`. Pass it to `clearWatch()` when updates are no longer needed.

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

### `Geocoder`

#### `new Geocoder(options?)`

Creates a reusable address lookup. `options.level` and `acceptLanguages` have the same meaning as in the position options above; `timeout` is the lookup timeout in milliseconds, defaulting to `3000`, with a range of 0 to 2147483647.

#### `getFromLocation(latitude, longitude)`

Looks up one WGS-84 coordinate and returns `Promise<GeocodeAddress | null>`. Latitude must be between -90 and 90 and longitude between -180 and 180. A missing match returns `null`; an unavailable service, timeout, or lookup failure rejects with error `code` `UNAVAILABLE`, `TIMEOUT`, or `PROVIDER_ERROR`, respectively.

### `GeocodeAddress`

`formattedAddress`, `country`, `countryCode`, `region`, `city`, `district`, `street`, `streetNumber`, and `postalCode` are each a string or `null`. The actual fields depend on the address service.
