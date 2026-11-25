# Geocoder

`Geocoder` looks up an address from known WGS-84 coordinates. This is called reverse geocoding. An agent can use it to display a city, street, or full address on a place card.

## Look Up a City-Level Address

Pass latitude followed by longitude to `getFromLocation()`. If there is a match, you can display `formattedAddress` directly.

```javascript
const geocoder = new Geocoder({ level: 'city', acceptLanguages: ['en-US'] });

try {
  const address = await geocoder.getFromLocation(30.2741, 120.1551);
  console.log(address?.formattedAddress ?? 'No address found');
} catch (error) {
  console.error('Address lookup failed:', error.message);
}
```

## Display Street Details

For a map marker that needs a street label, request `street` detail and read the address fields. This example falls back to the formatted address when street fields are missing.

```javascript
const geocoder = new Geocoder({ level: 'street', acceptLanguages: ['en-US'] });

try {
  const address = await geocoder.getFromLocation(30.2741, 120.1551);
  const streetLabel = address?.street
    ? [address.street, address.streetNumber].filter(Boolean).join(' ')
    : address?.formattedAddress;
  console.log(streetLabel ?? 'No address found');
} catch (error) {
  console.error('Address lookup failed:', error.code, error.message);
}
```

## Coordinates and Availability

Looking up supplied coordinates requires no device location permission. Lookup availability and the fields returned depend on the environment and service coverage. To find the address of the device's current position, pass the WGS-84 coordinates from `position.coords` directly. See [Geolocation](./geolocation.en-US.md) for location permissions and coordinate systems.

## API Reference

### `Geocoder`

#### `new Geocoder(options?)`

Creates a reusable address lookup. Each lookup uses the options set when the object was created.

| Option | Type | Description |
| --- | --- | --- |
| `level` | `GeocodeLevel` | Requested address detail. One of `country`, `region`, `city`, `district`, or `street`. Defaults to `city`. |
| `acceptLanguages` | `string[]` | BCP 47 language tags in preference order. Omit the option or pass an empty array to use the lookup service's default language. |
| `timeout` | `number` | Timeout per lookup in milliseconds. Defaults to `3000`. The range is 0 to 2147483647. |

#### `getFromLocation(latitude, longitude)`

Looks up one WGS-84 coordinate and returns `Promise<GeocodeAddress | null>`. The Promise resolves to the best matching address, or `null` if no address matches.

| Parameter | Type | Description |
| --- | --- | --- |
| `latitude` | `number` | Latitude in decimal degrees, from −90 to 90. |
| `longitude` | `number` | Longitude in decimal degrees, from −180 to 180. |

The method throws `TypeError` synchronously for coordinates that are not finite numbers and `RangeError` for out-of-range values. The Promise rejects with error `code` `UNAVAILABLE`, `TIMEOUT`, or `PROVIDER_ERROR` when the service is unavailable, the lookup times out, or the lookup fails, respectively.

### `GeocodeAddress`

Each field below is a `string | null`. Missing fields are returned as `null`.

#### `formattedAddress`

A formatted address ready to display.

#### `country`

Country or territory name.

#### `countryCode`

Country or territory code.

#### `region`

Name of the region, such as a province or state.

#### `city`

City name.

#### `district`

Name of the district, county, or similar administrative division.

#### `street`

Street name.

#### `streetNumber`

Street number.

#### `postalCode`

Postal code.
