# System Navigation

Use `navigator.maps` to start system navigation and change the destination or travel mode. It is useful when an agent needs to guide someone to a place.

## Start Navigation

First check whether walking is available, then provide a full address:

```javascript
try {
  const capabilities = await navigator.maps.getCapabilities();
  if (!capabilities.supported || !capabilities.travelModes.includes('walking')) {
    console.log('Walking navigation is unavailable');
  } else {
    const session = await navigator.maps.navigate({
      destination: { type: 'address', address: 'West Lake Scenic Area, Hangzhou, Zhejiang, China' },
      travelMode: 'walking',
    });
    session.finished.then((result) => console.log('Navigation ended:', result.reason));
  }
} catch (error) {
  console.error('Could not start navigation:', error.reason, error.message);
}
```

Availability varies by device and environment. Navigation uses the current location; you do not need to call the location API first. If the system asks for authorization, the user must grant it.

## Change the Route or End Navigation

Keep the `session` returned by `navigate()` to change the route or end navigation when the user changes plans:

```javascript
const session = navigator.maps.currentSession;
if (session) {
  try {
    await session.reroute({ travelMode: 'cycling' });
    // When the user chooses to end navigation:
    await session.end();
    console.log((await session.finished).reason);
  } catch (error) {
    console.error('Navigation operation failed:', error.reason, error.message);
  }
}
```

Check the desired travel mode with `getCapabilities()` first. Omitted options keep their current values; a failed update keeps the previous route. Changing pages does not automatically end navigation, so call `end()` when the user wants to stop.

## API Reference

### `navigator.maps`

#### `getCapabilities()`

Returns a Promise with `supported` and the available `travelModes`: `walking`, `cycling`, or `driving`. An unavailable service returns `false` and an empty array.

#### `navigate(options)`

Starts navigation and returns `Promise<MapNavigationSession>` on success. Both fields are required:

| Field | Description |
| --- | --- |
| `destination` | A full address `{ type: 'address', address: '...' }`, or an Amap POI `{ type: 'poi', provider: 'amap', id: '...' }`. |
| `travelMode` | `walking`, `cycling`, or `driving`. |

The Promise rejects on failure. The error's `reason` distinguishes cases such as `unsupported`, `busy`, `cancelled`, and `destination-not-found`. Only one navigation session can exist at a time.

#### `currentSession`

The current session, or `null`. It is also available during startup, when `end()` can cancel the start.

### `MapNavigationSession`

#### `reroute(options?)`

Changes the destination and/or travel mode and returns `Promise<void>`. Call it only while navigation is active and no other operation is pending. Omitted fields retain their values.

#### `end()`

Requests the end of navigation and returns `Promise<void>`. It can be called repeatedly; an ended session cannot restart.

#### `finished`

A Promise for the final result. `result.reason` is `requested`, `user`, `arrived`, `interrupted`, or `error`; `result.error` contains the error only for error termination, otherwise `null`. The Promise resolves even after an error.

#### `state`, `destination`, `travelMode`, and `id`

Read-only session state, current destination, travel mode, and session ID. `state` can be `starting`, `active`, `rerouting`, `ending`, `unknown`, or `ended`.

#### `statechange`, `error`, and `end` events

Use `addEventListener()` or `onstatechange`, `onerror`, and `onend`. An error event has `event.error`; an end event has `event.result`.
