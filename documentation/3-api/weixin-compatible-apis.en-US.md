# WeChat Mini Program Compatible APIs

AIUI provides the following WeChat Mini Program-style compatibility APIs to help migrate or reuse existing code. Only the listed capabilities are supported; this is not a complete implementation of the WeChat Mini Program API.

## Base

- `wx.canIUse`: Checks compatibility capabilities.
- `wx.arrayBufferToBase64`: Encodes binary data as Base64.

## Network

- `wx.request`: Sends an HTTP or HTTPS request.
- `wx.connectSocket`, `wx.createSocket`: Create a WebSocket connection.
- `wx.createEventSource`: Creates an SSE connection.

See [Network](/AIUI/api/network) for usage.

## Storage

- `wx.setStorage`, `wx.getStorage`: Asynchronously write and read local data.
- `wx.removeStorage`, `wx.clearStorage`: Asynchronously remove or clear local data.
- The corresponding `Sync` methods: Operate on local data synchronously.

See [Storage](/AIUI/api/storage-api) for usage.

## Canvas

- `wx.createCanvasContext`: Gets a Canvas 2D rendering context.

See [Canvas](/AIUI/api/canvas) for usage.

## Router

- `wx.navigateTo`: Keeps the current page and navigates to another page.
- `wx.redirectTo`: Replaces the current page.
- `wx.navigateBack`: Returns to the previous page or multiple previous pages.

See [Router](/AIUI/api/route) for usage.

## Speech

- `wx.speech.playTTS`: Synthesizes and plays speech from text.
- `wx.speech.startRecognition`: Starts one speech-recognition session.

See [AI](/AIUI/api/ai) for usage.

## Media

- `wx.media.createCameraContext`: Gets the camera context.
- `wx.media.getRecorderManager`: Gets the recorder manager.
- `wx.createVideoContext`: Gets the playback context for a `<video>` component on the current page.

See [Media](/AIUI/api/media) for usage.

## System

- `wx.getWindowInfo`: Gets window and safe-area information.
- `wx.exitMiniProgram`: Requests that the current instance exit.

## UI

- `wx.setBackgroundColor`: Calls the compatible page background-color API.

> Web/wx switches in examples represent two API styles for the same capability. wx-only capabilities continue to use ordinary Markdown code blocks.

## Check whether an API is registered

```javascript
if (wx.canIUse('request')) {
  wx.request({ url: 'https://example.com/data' });
}
console.log(wx.canIUse('media.getDevices'));
console.log(wx.canIUse('request.object.unknown')); // false
```

Pass an exact function path without the `wx.` prefix. Namespaces, unknown paths, and functions added later by the application do not count as registered capabilities. `true` establishes API availability, not permissions, device readiness, or operation success.

## API Reference

### `wx`

#### `wx.canIUse(schema)`

`schema` is a function-path string. Returns a `boolean` by matching compatible APIs registered when the current environment initializes.

#### `wx.exitMiniProgram(options?)`

Requests exit of the current instance and returns `undefined`. Options are optional and may include `success`, `fail`, and `complete` callbacks.
