# Media Capture

AIUI can use the camera and microphone so an agent can take photos, scan codes, read nearby text, or record audio and video streams. This page starts with common tasks and then documents every field and method in the API Reference.

## Turn On the Camera and Microphone

The following code requests both the camera and microphone and returns a `MediaStream`. The stream contains video and audio tracks used by later photo, recording, and audio-analysis operations.

When taking a photo, you can choose a capture mode through the photo setting `mode`. See [`mode`](#mode) below for the available values and their effects.

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
});

const [microphoneTrack] = stream.getAudioTracks();
const [cameraTrack] = stream.getVideoTracks();
const { width, height } = cameraTrack.getSettings();

console.log('Video stream size', width, height);
console.log(microphoneTrack, cameraTrack);
```

`cameraTrack.getSettings()` returns the settings selected by AIUI for this video track. Its `width` and `height` are the video-stream dimensions. They may differ from the ideal values in the request, so read these settings when displaying or logging the final size.

Set either `audio` or `video` to `false` when only one input is needed. Stop every track after use so other features can use the camera and microphone:

```javascript
for (const track of stream.getTracks()) {
  track.stop();
}
```

## Scan a Code

Choose `wide` mode when scanning a QR code or barcode. It captures a portrait image with a default resolution of `2016 × 2688` (width × height), suitable for payment codes and barcode recognition. This example uses high quality and shows the system preview first so the user can align the target.

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
const [videoTrack] = stream.getVideoTracks();
const capture = new ImageCapture(videoTrack);

let scanImage;
try {
  scanImage = await capture.takePhoto({
    quality: 'high',
    mode: 'wide',
    enableSystemPreview: true,
  });
} finally {
  videoTrack.stop();
}

const detector = new BarcodeDetector({
  formats: ['qr_code', 'code_128'],
});
const scanBitmap = await createImageBitmap(scanImage);
console.log('Captured image size', scanBitmap.width, scanBitmap.height);
scanBitmap.close();

const barcodes = await detector.detect(scanImage);

for (const barcode of barcodes) {
  console.log(barcode.format, barcode.rawValue);
}
```

**wx**

```javascript api-style=wx
const camera = wx.media.createCameraContext();
if (!camera) throw new Error('Camera is unavailable');

const scanImage = await camera.takePhoto({
  quality: 'high',
  mode: 'wide',
  enableSystemPreview: true,
});

const imageBlob = new Blob([scanImage.data], {
  type: scanImage.mimeType,
});
const detector = new BarcodeDetector({
  formats: ['qr_code', 'code_128'],
});
const scanBitmap = await createImageBitmap(imageBlob);
console.log('Captured image size', scanBitmap.width, scanBitmap.height);
scanBitmap.close();

const barcodes = await detector.detect(imageBlob);

for (const barcode of barcodes) {
  console.log(barcode.format, barcode.rawValue);
}
```

<!-- /aiui-api-style -->

In the Web example, `scanImage` is already a `Blob` and can be passed directly to `BarcodeDetector.detect()`. In the `wx` example, `scanImage.data` is an encoded `ArrayBuffer`; create a `Blob` with `scanImage.mimeType` before detection.

`detect()` returns an array of recognized codes. Each result contains `format`, the barcode format, and `rawValue`, the decoded text, URL, or business data. An empty array means that no requested format was found in the image; prompt the user to align the code and try again. See [BarcodeDetector](/AIUI/api/device-barcode) for more formats and result fields.

`takePhoto()` returns an encoded image without `width` or `height` fields. The example decodes it with `createImageBitmap()`, reads the dimensions, and then calls `close()` to release the bitmap.

## Capture an Image for a Reading Agent

Choose `telephoto` mode when a reading agent needs to analyze text, a document, or an object. It captures a landscape image with a default resolution of `2016 × 1512` (width × height), suited to sending the subject to a vision model for further analysis.

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
const [videoTrack] = stream.getVideoTracks();
const capture = new ImageCapture(videoTrack);

let readingImage;
try {
  readingImage = await capture.takePhoto({
    quality: 'high',
    mode: 'telephoto',
    enableSystemPreview: true,
  });
} finally {
  videoTrack.stop();
}

const readingBitmap = await createImageBitmap(readingImage);
console.log('Captured image size', readingBitmap.width, readingBitmap.height);
readingBitmap.close();
```

**wx**

```javascript api-style=wx
const camera = wx.media.createCameraContext();
if (!camera) throw new Error('Camera is unavailable');

const readingImage = await camera.takePhoto({
  quality: 'high',
  mode: 'telephoto',
  enableSystemPreview: true,
});

const readingBlob = new Blob([readingImage.data], {
  type: readingImage.mimeType,
});
const readingBitmap = await createImageBitmap(readingBlob);
console.log('Captured image size', readingBitmap.width, readingBitmap.height);
readingBitmap.close();
```

<!-- /aiui-api-style -->

The result is already encoded and can be used directly as input for a reading agent, OCR, or an AI image-understanding workflow. Keep `quality: 'high'` when recognizing small text. Set `enableSystemPreview` to `false` when the user does not need to confirm framing.

## Capture a General Photo

Use `default` mode for photos that are not specifically intended for scanning or reading. It provides the full FOV and a default portrait resolution of `3024 × 4032` (width × height), making it suitable for general photography and scenes where preserving more content matters.

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
const [videoTrack] = stream.getVideoTracks();
const capture = new ImageCapture(videoTrack);

let photo;
try {
  photo = await capture.takePhoto({
    quality: 'high',
    mode: 'default',
    enableSystemPreview: true,
  });
} finally {
  videoTrack.stop();
}

const photoBitmap = await createImageBitmap(photo);
console.log('Captured image size', photoBitmap.width, photoBitmap.height);
photoBitmap.close();
```

**wx**

```javascript api-style=wx
const camera = wx.media.createCameraContext();
if (!camera) throw new Error('Camera is unavailable');

const photo = await camera.takePhoto({
  quality: 'high',
  mode: 'default',
  enableSystemPreview: true,
});

const photoBlob = new Blob([photo.data], { type: photo.mimeType });
const photoBitmap = await createImageBitmap(photoBlob);
console.log('Captured image size', photoBitmap.width, photoBitmap.height);
photoBitmap.close();
```

<!-- /aiui-api-style -->

The Web API first obtains a video track and uses it to create `ImageCapture`. `takePhoto()` returns an encoded `Blob`. Use `grabFrame()` when you only need pixels from the current frame rather than an encoded file. Always stop the video track after the Web flow finishes.

## Record an Audio Stream

Recording does not return one complete file immediately. It continuously produces audio chunks that an agent can upload, transcribe, or analyze while recording. The following example uses Opus and produces data every `250` milliseconds.

To inspect microphone volume, waveform, or frequency data in real time, pass the same `MediaStream` to `AudioContext.createMediaStreamSource()`. See [Audio Processing (Web Audio)](/AIUI/api/media-web-audio#analyse-microphone-input) for a complete example.

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const recorder = new MediaRecorder(stream, {
  mimeType: 'audio/ogg;codecs=opus',
});

const chunks = [];
recorder.addEventListener('dataavailable', (event) => {
  chunks.push(event.data);
  console.log('Received audio chunk', event.data.size);
});
recorder.addEventListener('stop', () => {
  console.log('Recording stopped with', chunks.length, 'chunks');
});

recorder.start(250);
// Call after the user finishes speaking:
// recorder.stop();
```

**wx**

```javascript api-style=wx
const recorder = wx.media.getRecorderManager();
if (!recorder) throw new Error('Recorder is unavailable');

recorder.onHeader((format, headerBuffer) => {
  console.log(format, headerBuffer.byteLength);
});
recorder.onFrameRecorded(({ frameBuffer }) => {
  console.log(frameBuffer.byteLength);
});
recorder.onStop(({ duration, fileSize }) => {
  console.log('Recording stopped', duration, fileSize);
});
recorder.onError(({ errMsg }) => {
  console.error('Recording failed', errMsg);
});

await recorder.start({
  sampleRate: 16000,
  numberOfChannels: 1,
  format: 'opus',
  frameSize: 250,
});

// Call after the user finishes speaking:
// await recorder.stop();
```

<!-- /aiui-api-style -->

Each Web `event.data` value is an encoded `Blob`. The `wx` `frameBuffer` is an `ArrayBuffer`; in Opus mode, `onHeader()` first provides an initialization header. Store or send the header and audio chunks in the order received when processing streaming audio.

## Detect Speech While Recording

**VAD** stands for **Voice Activity Detection**. It detects whether someone is speaking during a recording and delivers that state alongside the audio. Think of it as a speaking indicator: an application can use it to show that speech is in progress or help decide whether someone has finished speaking.

### Understand What Speech Detection Does

Suppose a user says, "Check today's weather." VAD detects whether speech is present and whether the speech segment is still in progress. Understanding the words "today's weather" requires speech recognition, which converts audio to text. VAD itself does not produce text or identify who is speaking.

Speech detection also differs from measuring volume. Volume tells you how loud the sound is; speech detection looks for speech in that sound. "No speech detected" does not mean the microphone received no sound: a recording can still contain background sounds such as a fan or passing traffic.

People often pause briefly within a sentence, as in "Could you check... today's weather?" To avoid treating every pause as the end of a speech segment, a detector can wait for a continuous period of silence before marking the segment as finished. During that wait, the state may still indicate that the segment is in progress even though the person has briefly stopped making a sound.

### Read Speech Detection Results While Recording

The Web and `wx` examples below enable `vad` and read each audio chunk's `voiceActive` field. Both examples handle a missing detection result separately so it is not mistaken for "no speech detected."

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
const recorder = new MediaRecorder(stream, {
  mimeType: 'audio/wav',
  vad: { enabled: true, silenceDurationMs: 500 },
});

recorder.addEventListener('dataavailable', ({ data, voiceActive }) => {
  if (voiceActive === undefined) {
    console.log('No speech detection result for this chunk');
  } else if (voiceActive) {
    console.log('Speech in progress (including brief pauses)');
  } else {
    console.log('No speech detected');
  }
  console.log('Received audio chunk', data.size);
});
recorder.addEventListener('stop', () => {
  stream.getTracks().forEach((track) => track.stop());
});

recorder.start(100);
// Call when recording is complete:
// recorder.stop();
```

**wx**

```javascript api-style=wx
const recorder = wx.media.getRecorderManager();
if (!recorder) throw new Error('Recorder is unavailable');

recorder.onFrameRecorded(({ frameBuffer, voiceActive }) => {
  if (voiceActive === undefined) {
    console.log('No speech detection result for this chunk');
  } else if (voiceActive) {
    console.log('Speech in progress (including brief pauses)');
  } else {
    console.log('No speech detected');
  }
  console.log('Received audio chunk', frameBuffer.byteLength);
});
recorder.onError(({ errMsg }) => {
  console.error('Recording failed', errMsg);
});

await recorder.start({
  format: 'pcm',
  frameSize: 100,
  vad: { enabled: true, silenceDurationMs: 500 },
});
// Call when recording is complete:
// await recorder.stop();
```

<!-- /aiui-api-style -->

### Understand Speech, Pauses, and Audio Chunks

In these examples, `100` requests an audio chunk roughly every `100` milliseconds. This breaks the continuous recording into small pieces that the application can process as they arrive. Separately, `silenceDurationMs: 500` requests `500` milliseconds (half a second) of continuous silence after speech before reporting the segment as finished. One interval controls how often audio is delivered; the other controls how long to wait before deciding that speech has ended.

When the environment supports this setting and speech is successfully detected, a typical sequence is:

1. The user starts speaking. A chunk reports `voiceActive: true`, indicating that a speech segment is in progress.
2. The user pauses briefly. Before the silence delay has elapsed, the state may remain `true` rather than immediately treating the pause as the end of speech.
3. After the user stops and the requested silence delay has elapsed, a later chunk may report `false`, indicating that the speech segment has finished.

Chunks may also report `false` before the user has said anything. If the application uses VAD to help decide when to stop recording, first observe `true`, then treat a subsequent transition to `false` as an indication that speech has ended. Do not stop simply because the first result is `false`.

The state arrives with audio chunks, rather than as a separate speech-start or speech-end notification. Do not expect a callback at the exact instant half a second of silence has elapsed. An application can compare successive states, but each chunk carries only one snapshot; it cannot reconstruct whether speech was present at every instant within that chunk.

The `500` milliseconds is not the total recording length. VAD only attaches metadata; it does not trim silence or stop recording automatically. Call `stop()` explicitly when the application needs to end the recording. It does not configure speech recognition either: `SpeechRecognitionSession`'s `segmentation` setting controls how recognized text is split into segments and is independent of recording VAD.

### Handle Missing Detection Results

`voiceActive: undefined` means that the current chunk has no available detection result, for example because detection is disabled or unavailable in the current environment. Recording continues, and the application can still save, upload, or transcribe the audio; it just cannot use this field to determine whether speech is present. Check `voiceActive === undefined` first, as the examples do, rather than converting a missing value to `false`.

## Record a Video Stream

To record video, request both the camera and microphone and pass the `MediaStream` containing both tracks to `MediaRecorder`. The example selects an available video format and produces one video chunk per second. After recording stops, it combines all chunks into a `Blob` that can be saved or uploaded.

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    frameRate: { ideal: 30 },
  },
});

const [videoTrack] = stream.getVideoTracks();
const { width, height } = videoTrack.getSettings();
console.log('Video stream size', width, height);

const mimeType = [
  'video/mp4',
  'video/webm;codecs=vp8,opus',
].find((type) => MediaRecorder.isTypeSupported(type));
if (!mimeType) throw new Error('No video recording format is available');

const recorder = new MediaRecorder(stream, { mimeType });
const chunks = [];

function releaseDevices() {
  for (const track of stream.getTracks()) {
    track.stop();
  }
}

recorder.addEventListener('dataavailable', (event) => {
  if (event.data.size > 0) {
    chunks.push(event.data);
  }
});

recorder.addEventListener('stop', () => {
  const video = new Blob(chunks, { type: recorder.mimeType });
  console.log('Video recording complete', video.type, video.size);
  releaseDevices();
});

recorder.addEventListener('error', (event) => {
  console.error('Video recording failed', event);
  releaseDevices();
});

recorder.start(1000);

// Call after the user finishes recording:
// recorder.stop();
```

Each `dataavailable` event provides an encoded video chunk. Combine the complete chunk list only after the `stop` event fires. The example also stops the camera and microphone tracks at that point to release the devices.

`wx.media.getRecorderManager()` currently records audio streams. Use the Web `MediaRecorder` API to record a video stream.

## Permissions and Current Limits

- Media capture APIs are available after entering the `_blank` target; no additional user-interaction or window-focus condition applies.
- Media capture is unavailable when `app.config.lifetime === 'cut'`.
- The Agent Manifest must declare the corresponding camera or microphone permission; permission denial rejects the Promise.
- `MediaRecorder` currently recognizes `audio/wav`, `audio/ogg;codecs=opus`, `video/webm;codecs=vp8,opus`, and `video/mp4`.
- Constraints are requests. A device may return different compatible settings; read the final result with `track.getSettings()`.

## API Reference

### `navigator.mediaDevices`

#### `getUserMedia(constraints)`

Requests an audio or video media stream and returns `Promise<MediaStream>`. `constraints.audio` and `constraints.video` can be booleans or constraint objects; enable at least one media type. Current fields include `deviceId`, `sampleRate`, `channelCount`, `echoCancellation`, `facingMode`, `width`, `height`, and `frameRate`.

Constraints express requested targets; read the settings ultimately selected for each track with `getSettings()`. The promise rejects when permission is denied, a device is unavailable, or the constraints cannot be satisfied.

#### `enumerateDevices()`

Enumerates available audio-input and video-input devices and returns `Promise<MediaDeviceInfo[]>`. Each entry contains `deviceId`, `groupId`, `kind`, and `label`; `kind` is either `'audioinput'` or `'videoinput'`. Use `deviceId` in a later `getUserMedia()` constraint to select a specific device.

```javascript
const devices = await navigator.mediaDevices.enumerateDevices();
const cameras = devices.filter((device) => device.kind === 'videoinput');
if (cameras.length === 0) throw new Error('No camera is available');

const stream = await navigator.mediaDevices.getUserMedia({
  video: { deviceId: { exact: cameras[0].deviceId } },
});
```

#### `getSupportedConstraints()`

Returns `MediaTrackSupportedConstraints`. A field whose value is `true` can be used in a `getUserMedia()` constraint object; this only means that AIUI recognizes the field, not that the current device can satisfy every possible value.

### `MediaStream`

#### `new MediaStream()`

Creates an empty media stream with no tracks. A new empty stream has `active === false` and is useful when a flow needs a stream container before tracks are supplied elsewhere.

#### `id`

A read-only `string` that remains unchanged for the lifetime of the media stream. Use it to distinguish streams, not devices; device selection uses `MediaDeviceInfo.deviceId`.

#### `active`

A read-only `boolean` that is `true` while the stream contains at least one track whose `readyState` is `'live'`. It becomes `false` after every track ends. Reading this property does not start or stop capture.

#### `getTracks()`

Returns a new `MediaStreamTrack[]` containing every audio and video track in the stream. Changing the returned array does not change the stream. To end capture, call `stop()` on each track.

#### `getAudioTracks()`

Returns a new `MediaStreamTrack[]` containing only tracks whose `kind` is `'audio'`. Returns an empty array when the stream has no audio track.

#### `getVideoTracks()`

Returns a new `MediaStreamTrack[]` containing only tracks whose `kind` is `'video'`. Returns an empty array when the stream has no video track.

#### `getTrackById(id)`

Finds a track by an exact track `id`. Returns the same `MediaStreamTrack` object when one matches, or `null` otherwise. This method does not search by device `deviceId`.

### `MediaStreamTrack`

#### `id`

A read-only `string` that remains unchanged for the lifetime of the track. Pass it to `MediaStream.getTrackById()` to retrieve that track again from the same stream.

#### `kind`

A read-only value of either `'audio'` or `'video'`, indicating the type of media carried by the track. Use it to distinguish microphone and camera tracks in a mixed stream.

#### `label`

A read-only `string` describing the media source associated with the track. The display name can vary with the device and permission state. Use `id` or the settings `deviceId` for application logic instead of depending on label text.

#### `enabled`

A writable `boolean`. Set it to `false` to stop the track from supplying usable media data downstream without ending the track or releasing its device. Set it back to `true` to continue. Call `stop()` when capture must end completely.

```javascript
const [microphone] = stream.getAudioTracks();
microphone.enabled = false; // Temporarily mute.
microphone.enabled = true;  // Resume capture.
```

#### `muted`

A read-only `boolean` indicating whether the media source is currently unable to provide data, for example during a temporary system interruption. Unlike `enabled`, which the application controls, `muted` reflects the current source state.

#### `readyState`

A read-only value of either `'live'` or `'ended'`. A live track can continue providing data. Calling `stop()` or permanently losing the media source changes it to `'ended'`. An ended track cannot be restarted; call `getUserMedia()` again to obtain a new one.

#### `getConstraints()`

Returns `MediaTrackConstraints` containing the constraints requested when the track was acquired. These are application requests and may differ from the settings ultimately selected by the device; use `getSettings()` for actual values.

#### `getSettings()`

Returns `MediaTrackSettings` containing the device and media settings ultimately selected for the track, such as `deviceId`, audio sample rate and channel count, or video dimensions and frame rate. Available fields depend on the track type and device.

```javascript
const [videoTrack] = stream.getVideoTracks();
const { deviceId, width, height, frameRate } = videoTrack.getSettings();
console.log({ deviceId, width, height, frameRate });
```

#### `stop()`

Stops the track and changes `readyState` to `'ended'`. Returns no value. Calling it again on an ended track has no additional effect. Other tracks using the same device are unaffected, so stop every track when releasing a complete stream.

```javascript
for (const track of stream.getTracks()) {
  track.stop();
}
```

### Photo Capture Settings

Web `ImageCapture.takePhoto(settings)` and `wx` `CameraContext.takePhoto(options)` use the same AIUI photo settings. The object names differ between the two API styles, but `quality`, `mode`, and `enableSystemPreview` have the same meanings and defaults.

#### `quality`

Type: `'high' | 'normal' | 'low'`. Default: `'high'`. This selects a relative image-quality tier. It affects the detail retained, encoded data size, and capture-processing cost, but it is not a fixed JPEG compression percentage. When an exact pixel size matters, consider the default resolution for the selected `mode` and inspect the returned result.

| Value | Quality and cost | Recommended use cases |
| --- | --- | --- |
| `'high'` | The highest quality tier. It prioritizes image detail and generally produces more encoded data while using more processing resources. | Reading agents, AI image understanding, text recognition, and images that will be enlarged or cropped. |
| `'normal'` | Balances image detail, encoded data size, and processing cost. | General photography and routine visual analysis that do not require maximum detail. |
| `'low'` | A lower quality tier that prioritizes reduced encoded data size and processing cost, with less recognizable detail. | Thumbnails, quick previews, or data-sensitive workflows that do not depend on fine content. |

Prefer `'high'` for OCR, reading agents, and other vision models that depend on detail. Lower the tier only when data size or processing cost is more important.

#### `mode`

Type: `'default' | 'wide' | 'telephoto'`. Default: `'default'`. This selects an AIUI-defined capture capability and determines the default orientation, resolution, and primary use case. `mode` and `quality` are independent: first use `mode` to choose the capture scenario, then use `quality` to adjust the quality tier within that mode.

| Value | Default output resolution (width × height) | Framing | Recommended use cases |
| --- | --- | --- | --- |
| `'default'` | `3024 × 4032` | Uses the full field of view (FOV) and portrait resolution to preserve the most scene and image detail. | General photography; used when `mode` is omitted. |
| `'wide'` | `2016 × 2688` | Produces a portrait image suited to recognition in scanning workflows. | QR-code, barcode, and payment scanning. |
| `'telephoto'` | `2016 × 1512` | Produces a landscape image suited to subject-content analysis. | Reading agents, AI image understanding, and text or object recognition. |

Use `'wide'` for scanning and `'telephoto'` for reading agents or AI image understanding. Omit the field or explicitly use `'default'` when no specialized capability is required.

#### `enableSystemPreview`

Type: `boolean`. Default: `true`. Set it to `true` to show the system camera preview before capture when the user should confirm framing. Set it to `false` to capture directly in scanning or agent-driven image-processing flows.

### `ImageCapture`

#### `new ImageCapture(videoTrack)`

Creates an image capture object from a video `MediaStreamTrack` whose `readyState` is still `'live'`. Passing a value that is not a `MediaStreamTrack`, or a track whose `kind` is not `'video'`, throws a `TypeError`. Passing an ended track throws `InvalidStateError`.

#### `takePhoto(settings?)`

Captures an encoded image and returns `Promise<Blob>`. `Blob.type` is the actual image MIME type and `Blob.size` is its encoded byte size. An ended video track causes `InvalidStateError`; capture failures reject the promise.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `settings` | `PhotoSettings` | No | Photo settings. Omitting it uses the defaults in [Photo Capture Settings](#photo-capture-settings). |

#### `grabFrame()`

Captures the current video frame and returns `Promise<ImageBitmap>`. The result contains decoded in-memory pixels, not the original JPEG or PNG bytes; use `takePhoto()` when an encoded image is required. An ended video track causes `InvalidStateError`.

```javascript
const bitmap = await capture.grabFrame();
const canvas = new Canvas(bitmap.width, bitmap.height);

const context = canvas.getContext('2d');
context.drawImage(bitmap, 0, 0);
const rgba = context.getImageData(0, 0, bitmap.width, bitmap.height).data;
const buffer = rgba.buffer.slice(
  rgba.byteOffset,
  rgba.byteOffset + rgba.byteLength,
);

console.log(buffer.byteLength); // bitmap.width * bitmap.height * 4
bitmap.close();
```

`Canvas` is an offscreen canvas provided by AIUI and does not require a DOM element. `ImageBitmap` does not provide `arrayBuffer()` itself. To obtain raw pixels, draw the bitmap to the offscreen canvas and read it with `getImageData()`. The `buffer` in this example is an independent `ArrayBuffer`. Its pixels are stored in RGBA order with one byte per channel, so the total byte length is `width * height * 4`. It does not contain JPEG or PNG file bytes.

### `MediaRecordingVADOptions`

Web `MediaRecorderOptions.vad` and `RecorderManager.start()`'s `options.vad` use the same recording VAD options. Omitting `vad` leaves detection disabled. When VAD is unavailable or the requested silence delay is outside the current environment's supported range, recording continues normally without `voiceActive` metadata.

#### `enabled`

An optional `boolean`, defaulting to `false`. Set it to `true` to request speech detection results on audio chunks. Recording support does not guarantee VAD support; check each chunk's `voiceActive` field.

#### `silenceDurationMs`

An optional `number`, defaulting to `500`. It specifies how many milliseconds of continuous silence to wait after detected speech before reporting `voiceActive: false`, meaning that the speech segment has finished. It must be an integer from `0` to `4294967295`, inclusive; the setting is requested only when `enabled: true`. It is separate from the chunk interval in `MediaRecorder.start(timeslice)` or `options.frameSize`, and does not determine when recording stops.

`vad` must be an options object, `enabled` must be a boolean, and `silenceDurationMs` must meet the numeric requirements above. Invalid field types or values make the `MediaRecorder` constructor throw `TypeError` or the Promise returned by `RecorderManager.start()` reject with `TypeError`. Valid options that are unsupported in the current environment fall back to ordinary recording as described above.

### `MediaRecorder`

#### `new MediaRecorder(stream, options?)`

Creates a recorder for the specified `MediaStream`. Its initial `state` is `'inactive'`. `options.mimeType` selects the output format and defaults to `audio/wav`. AIUI currently supports `audio/wav`, `audio/ogg;codecs=opus`, `video/webm;codecs=vp8,opus`, and `video/mp4`; an unsupported value throws a `TypeError`. The stream must contain at least one audio or video track when recording starts.

The optional `options.vad` accepts [`MediaRecordingVADOptions`](#mediarecordingvadoptions) to request speech detection results on audio chunks. Set it at construction, then read `event.voiceActive` in the `dataavailable` event.

#### `state`

A read-only value of `'inactive'`, `'recording'`, or `'paused'`. A new or stopped recorder is inactive, an active recorder is recording, and a paused recorder is paused. Check this property before control calls to avoid `InvalidStateError`.

#### `mimeType`

A read-only `string` containing the output MIME type actually used by the recorder. It comes from the constructor option or defaults to `audio/wav`. Use this value or `event.data.type` to choose how to decode `dataavailable` blobs.

#### `start(timeslice?)`

Starts recording. The optional `timeslice` specifies the data-chunk interval in milliseconds; when provided, the recorder dispatches `dataavailable` events at that cadence. Returns no value. It can only be called while `state === 'inactive'`; otherwise it throws `InvalidStateError`.

#### `pause()`

Pauses an active recording and changes `state` to `'paused'`. Returns no value. It can only be called while `state === 'recording'`; otherwise it throws `InvalidStateError`. Pausing does not end the current recording session.

#### `resume()`

Resumes a paused recording and changes `state` to `'recording'`. Returns no value. It can only be called while `state === 'paused'`; otherwise it throws `InvalidStateError`.

#### `requestData()`

Requests immediate delivery of the currently accumulated chunk through a `dataavailable` event without ending the recording session. Returns no value. Calling it while the recorder is `'inactive'` throws `InvalidStateError`.

```javascript
recorder.addEventListener('dataavailable', ({ data }) => {
  console.log('Immediate chunk', data.size);
});

recorder.start();
recorder.requestData();
```

#### `stop()`

Stops recording, requests delivery of remaining data, and then dispatches the `stop` event. Its `state` changes to `'inactive'`. Returns no value. Calling it while already inactive has no additional effect.

#### `MediaRecorder.isTypeSupported(type)`

Checks whether the specified MIME type can be recorded and returns a `boolean`. Call it before constructing `MediaRecorder` to avoid a `TypeError` for an unsupported format.

```javascript
const preferredType = 'audio/ogg;codecs=opus';
const mimeType = MediaRecorder.isTypeSupported(preferredType)
  ? preferredType
  : 'audio/wav';

const recorder = new MediaRecorder(stream, { mimeType });
```

#### `dataavailable` event

Dispatched when a new recorded data chunk is available. `event.data` is a `Blob` containing encoded data. A chunk can be produced by `timeslice`, `requestData()`, or `stop()`. Preserve chunk order during asynchronous processing and interpret the encoding using `Blob.type`.

Audio chunks may also include the optional read-only `event.voiceActive` field:

| Value | Meaning |
| --- | --- |
| `true` | The detector considers the speech segment to be in progress. This may include a brief pause shorter than the silence delay. |
| `false` | No speech is currently detected, or the previous speech segment has finished. This is a valid result and does not mean that the audio contains no sound at all. |
| `undefined` | No detection state is available for this chunk, for example because VAD is disabled or unsupported. This does not establish silence. |

This field is a state snapshot associated with the current audio chunk. It does not indicate whether speech occurred anywhere within the chunk and is not a separate speech-start or speech-end event. Do not interpret it as the proportion of speech in a chunk or as a recognition result. Output containing only initialization headers or no audio may also omit the field.

#### `start` event

Dispatched after `start()` successfully enters the recording state. At this point, `state === 'recording'`.

#### `pause` event

Dispatched after `pause()` successfully pauses recording. At this point, `state === 'paused'`.

#### `resume` event

Dispatched after `resume()` successfully resumes recording. At this point, `state === 'recording'`.

#### `stop` event

Dispatched after recording stops and the remaining `dataavailable` data has been delivered. Use it to finalize chunk assembly or release media tracks.

#### `error` event

Dispatched when an error occurs during recording. The error ends the current recording session and returns the recorder to `'inactive'`. Stop media tracks that are no longer needed and provide a retry path to the user.

### `wx.media`

#### `wx.media.createCameraContext()`

Returns a `CameraContext` available to the current AIUI application. It returns `undefined` on wasm32, when `app.config.lifetime === 'cut'`, when no current app exists, or when camera capture is unavailable in the current environment. Check the result before taking a photo. The object does not require manual disposal.

#### `wx.media.getRecorderManager()`

Returns a `RecorderManager` available to the current AIUI application. It returns `undefined` on wasm32, when `app.config.lifetime === 'cut'`, when no current app exists, or when audio recording is unavailable in the current environment. Check the result and register the required callbacks before recording.

### `CameraContext`

#### `CameraContext.takePhoto(options)`

Captures an encoded image and returns `Promise<{ data: ArrayBuffer, mimeType: string }>`. `data` contains the complete encoded image bytes and `mimeType` identifies the actual encoding. The pair can be passed directly to file upload, code recognition, or agent image-input workflows.

A failure during capture rejects the promise.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `options` | `object` | Yes | Photo settings. Fields and defaults match the Web API; see [Photo Capture Settings](#photo-capture-settings). |

### `RecorderManager`

#### `start(options)`

Starts a new recording session and returns `Promise<void>`. Register `onFrameRecorded()`, `onError()`, and `onStop()` first so an early event is not missed. Calling it again while already recording does not create a second session.

| `start()` Parameter | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `options.sampleRate` | `number` | No | `16000` | Requested sample rate. |
| `options.numberOfChannels` | `number` | No | `1` | Requested channel count. |
| `options.format` | `'pcm' \| 'opus'` | No | `'pcm'` | Requested encoding format. |
| `options.frameSize` | `number` | No | `250` | Audio-frame callback interval in milliseconds; only positive values apply. |
| `options.vad` | `MediaRecordingVADOptions` | No | Disabled | Requests recording VAD. See [recording VAD options](#mediarecordingvadoptions) for fields and fallback behavior. |

#### `pause()`

Pauses the current recording and returns `Promise<void>`. State changes only while recording; after success, the callback registered with `onPause()` runs. Pausing does not end the session, so it can later be resumed.

#### `resume()`

Resumes a paused recording and returns `Promise<void>`. After success, the callback registered with `onResume()` runs. Calling it when no session is paused does not start a new recording.

#### `stop()`

Stops the current recording and returns `Promise<void>`. `onStop()` runs after remaining audio-frame processing finishes, and the related media tracks are then released. Calling it before recording starts or after recording stops is safe.

#### `onStart(callback)`

Registers a recording-start callback. The callback receives no arguments and runs after the recorder actually begins producing data. Registering again replaces the previous start callback.

#### `onPause(callback)`

Registers a recording-pause callback. The callback receives no arguments and runs after `pause()` completes its state transition. Registering again replaces the previous pause callback.

#### `onResume(callback)`

Registers a recording-resume callback. The callback receives no arguments and runs after `resume()` completes its state transition. Registering again replaces the previous resume callback.

#### `onStop(callback)`

Registers a recording-stop callback. It receives `{ tempFilePath: '', duration: number, fileSize: number }`: `duration` is the recording length in milliseconds and `fileSize` is the total number of bytes delivered through audio frames. No temporary file is currently generated, so `tempFilePath` is always an empty string. Registering again replaces the previous stop callback.

#### `onFrameRecorded(callback)`

Registers an audio-frame callback. It receives `{ frameBuffer: ArrayBuffer, isLastFrame: false, voiceActive?: boolean }`. Each `frameBuffer` contains only that chunk, not bytes delivered earlier. The current implementation does not use `isLastFrame` to mark the final chunk; use `onStop()` for completion.

`voiceActive` has the same semantics as the field on Web [`dataavailable` events](#dataavailable-event). `false` means no speech is detected or a speech segment has finished; an omitted field means detection state is unavailable. Audio frames continue to be delivered when no speech is detected.

In PCM mode, `frameBuffer` contains a raw PCM chunk with the WAV container header removed. In Opus mode, it contains the Opus payload.

```javascript
const audioChunks = [];
recorder.onFrameRecorded(({ frameBuffer }) => {
  audioChunks.push(frameBuffer.slice(0));
});
```

#### `onHeader(callback)`

Registers the Opus initialization-header callback. It receives two positional arguments: `format` is `'opus'`, and `headerBuffer` is an `ArrayBuffer` containing the initialization header. This callback runs before the first Opus payload. When storing or transmitting Opus as a stream, process the header first and then process `onFrameRecorded()` chunks in order. PCM mode does not invoke this callback.

#### `onError(callback)`

Registers an error callback. It receives `{ errMsg: string }` containing a message suitable for logging or a user-facing failure notice. After an error, do not assume the current session is still recording; clean it up before deciding whether to call `start()` again.

#### `onInterruptionBegin(callback)`

Registers a callback for the beginning of a recording interruption. It receives no arguments. When notified, pause agent interactions that depend on live audio and update the interface state as needed.

#### `onInterruptionEnd(callback)`

Registers a callback for the end of a recording interruption. It receives no arguments. When notified, update the interface or resume the business flow as needed. The application should still decide explicitly whether recording continues.
