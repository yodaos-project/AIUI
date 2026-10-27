# Permission State

Use `navigator.permissions.query()` to read the current geolocation, camera, or microphone permission state and observe changes. Queries read local state without showing a permission dialog or starting capture.

## Check Before Using the Microphone

For a full application, declare `RECORD_AUDIO` in `app.json.permissions`, then query and use the microphone from a user action:

```javascript
async function openMicrophone() {
  const status = await navigator.permissions.query({ name: 'microphone' });
  if (status.state === 'denied') {
    console.log('Microphone permission denied');
    return null;
  }
  return navigator.mediaDevices.getUserMedia({ audio: true });
}
```

`prompt` means undecided. Only a sensitive operation such as `getUserMedia()` can begin an authorization flow. Even with `granted`, capture can fail because a device is unavailable or system permission is denied. Handle Promise rejection and stop all tracks in the returned stream when finished.

## Update the Interface When Permission Changes

Retain the returned status object and read its current `state`. Use a signal to remove listeners when the page unloads:

```javascript
export default {
  data: { microphonePermission: 'prompt' },
  async onLoad() {
    const lifetime = new AbortController();
    this.permissionLifetime = lifetime;
    const status = await navigator.permissions.query({ name: 'microphone' });
    if (lifetime.signal.aborted) return;
    const update = () => this.setData({ microphonePermission: status.state });
    status.addEventListener('change', update, { signal: lifetime.signal });
    update();
  },
  onUnload() {
    this.permissionLifetime?.abort();
  },
};
```

## Declarations and Authorization

| Capability | `app.json.permissions` declaration | Query name |
| --- | --- | --- |
| Geolocation | `GEOLOCATION` | `geolocation` |
| Camera | `CAMERA` | `camera` |
| Microphone | `RECORD_AUDIO` | `microphone` |

A manifest declaration does not grant system permission. Applications should declare the permissions they need. Permission state belongs to an application session; reopening the application starts a new session. Editing `app.json` during execution does not update current permissions.

Capture requiring both camera and microphone can proceed only after both are allowed. There is no generic `navigator.permissions.request()` method. Queries do not support other names such as media-library or Bluetooth permissions.

## API Reference

### `Permissions`

#### `navigator.permissions`

Read-only query object available through the existing `navigator`. It cannot be created with `new Permissions()`.

#### `query(descriptor)`

Returns `Promise<PermissionStatus>`.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `descriptor.name` | `'geolocation' \| 'camera' \| 'microphone'` | Yes | Case-sensitive permission name. |
| `descriptor.panTiltZoom` | `false` | No | Camera only; `true` is unsupported. |

Missing or invalid descriptor objects, unknown names, and camera `panTiltZoom: true` reject with `TypeError`. A query neither requests authorization nor guarantees that the device is available.

### `PermissionStatus`

#### `name`

Read-only permission name matching the queried `descriptor.name`.

#### `state`

Live, read-only state: `granted` means allowed in the current session, `denied` means refused, and `prompt` means undecided. This reflects the session permission record, not an independent check of operating-system permission.

#### `change`

An `Event` fired when this permission state changes. Read `status.state` inside the callback and use standard event methods to add or remove listeners.

#### `onchange`

Assignable event handler, initially `null`. Set it to `null` to clear this handler. Status objects cannot be created with `new PermissionStatus()`.
