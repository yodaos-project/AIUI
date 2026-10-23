# 媒体采集

AIUI 可以调用摄像头和麦克风，让智能体拍照、扫码、读取眼前的文字，或录制音视频流。本文先从常见任务开始，再在 API Reference 中说明每个字段和方法。

## 打开摄像头和麦克风

下面的代码会同时请求摄像头和麦克风，并得到一个 `MediaStream`。流中包含视频轨道和音频轨道，后续拍照、录音和音频分析都从这些轨道开始。

拍照时还可以通过拍照设置中的 `mode` 选择适合场景的拍摄模式；具体取值和效果见下方的 [`mode`](#mode)。

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

console.log('视频流尺寸', width, height);
console.log(microphoneTrack, cameraTrack);
```

`cameraTrack.getSettings()` 返回 AIUI 为这条视频轨道采用的设置，其中 `width` 和 `height` 是视频流尺寸。它们可能与请求时填写的理想值不同，因此需要展示或记录最终尺寸时应读取这里的结果。

如果只需要摄像头或麦克风，把另一项设为 `false` 即可。使用完毕后，应停止所有轨道，这样摄像头和麦克风才能被其他功能继续使用：

```javascript
for (const track of stream.getTracks()) {
  track.stop();
}
```

## 扫码

扫描二维码或条码时选择 `wide` 模式。它默认拍摄 `2016 × 2688`（宽 × 高）的竖向图像，适合支付码和条码识别。示例使用 `high` 质量，并在拍摄前显示系统预览，方便用户对准目标。

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
console.log('拍照结果尺寸', scanBitmap.width, scanBitmap.height);
scanBitmap.close();

const barcodes = await detector.detect(scanImage);

for (const barcode of barcodes) {
  console.log(barcode.format, barcode.rawValue);
}
```

**wx**

```javascript api-style=wx
const camera = wx.media.createCameraContext();
if (!camera) throw new Error('当前环境不支持相机');

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
console.log('拍照结果尺寸', scanBitmap.width, scanBitmap.height);
scanBitmap.close();

const barcodes = await detector.detect(imageBlob);

for (const barcode of barcodes) {
  console.log(barcode.format, barcode.rawValue);
}
```

<!-- /aiui-api-style -->

Web 写法中的 `scanImage` 已经是 `Blob`，可以直接传给 `BarcodeDetector.detect()`。`wx` 写法中的 `scanImage.data` 是编码后的 `ArrayBuffer`，需要结合 `scanImage.mimeType` 创建 `Blob` 后再检测。

`detect()` 返回识别结果数组。每一项的 `format` 是条码格式，`rawValue` 是扫码得到的文本、网址或业务数据。数组为空表示当前图像中没有识别到指定格式的码，可以提示用户重新对准后再拍一次。更多格式和返回字段见 [BarcodeDetector](/AIUI/api/device-barcode)。

`takePhoto()` 返回的是编码图片，本身没有 `width` 和 `height` 字段。示例通过 `createImageBitmap()` 解码图片并读取尺寸，读取完成后调用 `close()` 释放位图。

## 为阅读智能体拍摄图像

需要让阅读智能体分析文字、文档或物体时选择 `telephoto` 模式。它默认拍摄 `2016 × 1512`（宽 × 高）的横向图像，更适合将主体内容交给视觉模型继续分析。

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
console.log('拍照结果尺寸', readingBitmap.width, readingBitmap.height);
readingBitmap.close();
```

**wx**

```javascript api-style=wx
const camera = wx.media.createCameraContext();
if (!camera) throw new Error('当前环境不支持相机');

const readingImage = await camera.takePhoto({
  quality: 'high',
  mode: 'telephoto',
  enableSystemPreview: true,
});

const readingBlob = new Blob([readingImage.data], {
  type: readingImage.mimeType,
});
const readingBitmap = await createImageBitmap(readingBlob);
console.log('拍照结果尺寸', readingBitmap.width, readingBitmap.height);
readingBitmap.close();
```

<!-- /aiui-api-style -->

拍摄结果已经完成图像编码，可以直接作为阅读智能体、OCR 或 AI 识图流程的输入。需要识别细小文字时保留 `quality: 'high'`；如果不希望用户确认取景，可以把 `enableSystemPreview` 改为 `false`。

## 拍摄普通照片

不属于扫码或阅读场景时使用 `default` 模式。它提供全 FOV 和 `3024 × 4032`（宽 × 高）的默认竖向全分辨率，适合普通拍照以及希望保留更多画面内容的场景。

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
console.log('拍照结果尺寸', photoBitmap.width, photoBitmap.height);
photoBitmap.close();
```

**wx**

```javascript api-style=wx
const camera = wx.media.createCameraContext();
if (!camera) throw new Error('当前环境不支持相机');

const photo = await camera.takePhoto({
  quality: 'high',
  mode: 'default',
  enableSystemPreview: true,
});

const photoBlob = new Blob([photo.data], { type: photo.mimeType });
const photoBitmap = await createImageBitmap(photoBlob);
console.log('拍照结果尺寸', photoBitmap.width, photoBitmap.height);
photoBitmap.close();
```

<!-- /aiui-api-style -->

Web 写法需要先取得视频轨道，再用它创建 `ImageCapture`。`takePhoto()` 返回编码后的 `Blob`；如果只想读取当前画面的像素而不需要编码文件，可以使用 `grabFrame()`。Web 写法使用完毕后必须停止视频轨道。

## 录制音频流

录音不是一次返回完整文件，而是持续产生一段段音频数据。智能体可以边录边上传、转写或分析这些分片。下面的示例使用 Opus 编码，每 `250` 毫秒产生一次数据。

如果需要实时读取麦克风音量、波形或频率，可以把同一个 `MediaStream` 传给 `AudioContext.createMediaStreamSource()`。完整示例请查看[音频处理](/AIUI/api/media-web-audio#分析麦克风输入)。

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
  console.log('收到音频分片', event.data.size);
});
recorder.addEventListener('stop', () => {
  console.log('录音结束，共收到', chunks.length, '个分片');
});

recorder.start(250);
// 用户完成说话后调用：
// recorder.stop();
```

**wx**

```javascript api-style=wx
const recorder = wx.media.getRecorderManager();
if (!recorder) throw new Error('当前环境不支持录音');

recorder.onHeader((format, headerBuffer) => {
  console.log(format, headerBuffer.byteLength);
});
recorder.onFrameRecorded(({ frameBuffer }) => {
  console.log(frameBuffer.byteLength);
});
recorder.onStop(({ duration, fileSize }) => {
  console.log('录音结束', duration, fileSize);
});
recorder.onError(({ errMsg }) => {
  console.error('录音失败', errMsg);
});

await recorder.start({
  sampleRate: 16000,
  numberOfChannels: 1,
  format: 'opus',
  frameSize: 250,
});

// 用户完成说话后调用：
// await recorder.stop();
```

<!-- /aiui-api-style -->

Web 的每个 `event.data` 都是编码后的 `Blob`。`wx` 的 `frameBuffer` 是 `ArrayBuffer`；Opus 模式还会先通过 `onHeader()` 提供初始化 header。处理流式音频时，应按收到的顺序保存或发送 header 和音频分片。

## 选择录音音源

默认录音采集麦克风，并使用针对设备佩戴者本人声音优化的拾音模式。需要采集远处的声音或系统正在播放的音频时，应在 `getUserMedia()` 中选择音源和拾音模式，再把返回的流交给 `MediaRecorder`。

下面的示例请求远场麦克风录音，并读取轨道实际采用的设置：

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: {
    captureSource: 'microphone',
    microphoneMode: 'far-field',
    echoCancellation: true,
  },
});
const [audioTrack] = stream.getAudioTracks();
console.log('实际采集设置', audioTrack.getSettings());

function releaseTracks() {
  stream.getTracks().forEach((track) => track.stop());
}

let recorder;
try {
  recorder = new MediaRecorder(stream, { mimeType: 'audio/wav' });
  recorder.addEventListener('dataavailable', ({ data }) => {
    console.log('收到音频分片', data.size);
  });
  recorder.addEventListener('stop', releaseTracks);
  recorder.addEventListener('error', releaseTracks);
  recorder.start(250);
} catch (error) {
  releaseTracks();
  throw error;
}
// 用户完成录音后调用 recorder.stop()。
```

支持的拾音模式及默认值见[音频采集约束](#音频采集约束)。不同设备支持的模式可能不同；请求不可用的音源或模式时，`getUserMedia()` 会以 `OverconstrainedError` 拒绝，应向用户提供可用的录音方式或错误提示。

### 录制系统播放音频

需要录制设备正在播放的混音时，将音源设为 `system-audio`。此时不要设置麦克风拾音模式或开启回声消除：

```javascript
const stream = await navigator.mediaDevices.getUserMedia({
  audio: { captureSource: 'system-audio' },
});

function releaseTracks() {
  stream.getTracks().forEach((track) => track.stop());
}

let recorder;
try {
  recorder = new MediaRecorder(stream, { mimeType: 'audio/wav' });
  recorder.addEventListener('dataavailable', ({ data }) => {
    console.log('收到系统音频分片', data.size);
  });
  recorder.addEventListener('stop', releaseTracks);
  recorder.addEventListener('error', releaseTracks);
  recorder.start(250);
} catch (error) {
  releaseTracks();
  throw error;
}
// 用户完成录音后调用 recorder.stop()。
```

系统音频采集依赖当前设备支持，不会自动改为录制麦克风。`MediaRecorder` 保留输入轨道已选定的音源和拾音模式；需要切换时，应结束当前录制、停止旧轨道，再按新约束请求媒体流。

`wx.media.getRecorderManager().start()` 当前使用默认麦克风，不提供音源或拾音模式选择参数。需要选择音源时使用以上 Web API。

## 录制视频流

录制视频时，需要同时请求摄像头和麦克风，再把包含两种轨道的 `MediaStream` 交给 `MediaRecorder`。示例会选择当前可用的视频格式，每秒产生一个视频分片；停止后把所有分片合并为一个可保存或上传的 `Blob`。

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
console.log('视频流尺寸', width, height);

const mimeType = [
  'video/mp4',
  'video/webm;codecs=vp8,opus',
].find((type) => MediaRecorder.isTypeSupported(type));
if (!mimeType) throw new Error('当前环境不支持视频录制格式');

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
  console.log('视频录制完成', video.type, video.size);
  releaseDevices();
});

recorder.addEventListener('error', (event) => {
  console.error('视频录制失败', event);
  releaseDevices();
});

recorder.start(1000);

// 用户完成录制后调用：
// recorder.stop();
```

`dataavailable` 会持续返回编码后的视频分片。只有在 `stop` 事件触发后，才应把完整的分片列表合并为最终视频。示例也在此时停止摄像头和麦克风轨道，释放设备。

`wx.media.getRecorderManager()` 当前用于录制音频流；录制视频流请使用 Web `MediaRecorder`。

## 权限与当前限制

- 进入 `_blank` target 后即可调用媒体采集 API，无需额外的用户交互或窗口焦点条件。
- `app.config.lifetime === 'cut'` 时，媒体采集不可用。
- Agent Manifest 必须声明对应的摄像头或麦克风权限；拒绝权限时 Promise 会拒绝。
- `MediaRecorder` 当前识别 `audio/wav`、`audio/ogg;codecs=opus`、`video/webm;codecs=vp8,opus` 与 `video/mp4`。
- 约束是请求值，实际设备可以返回不同但兼容的设置；使用 `track.getSettings()` 读取最终结果。

## API Reference

### `navigator.mediaDevices`

#### `getUserMedia(constraints)`

请求音频或视频媒体流，返回 `Promise<MediaStream>`。`constraints.audio` 与 `constraints.video` 可以是 `boolean` 或约束对象；至少启用一种媒体类型。当前约束字段包括 `deviceId`、`captureSource`、`microphoneMode`、`sampleRate`、`channelCount`、`echoCancellation`、`facingMode`、`width`、`height` 与 `frameRate`。音源与拾音模式的字段定义见[音频采集约束](#音频采集约束)。

约束表示请求目标，最终采用的参数应通过轨道的 `getSettings()` 读取。权限被拒绝、设备不可用或约束无法满足时，Promise 会拒绝。

#### `enumerateDevices()`

枚举可用的音频输入与视频输入设备，返回 `Promise<MediaDeviceInfo[]>`。每个条目包含 `deviceId`、`groupId`、`kind` 与 `label`；`kind` 为 `'audioinput'` 或 `'videoinput'`。使用 `deviceId` 可以在后续 `getUserMedia()` 约束中选择特定设备。

```javascript
const devices = await navigator.mediaDevices.enumerateDevices();
const cameras = devices.filter((device) => device.kind === 'videoinput');
if (cameras.length === 0) throw new Error('没有可用摄像头');

const stream = await navigator.mediaDevices.getUserMedia({
  video: { deviceId: { exact: cameras[0].deviceId } },
});
```

#### `getSupportedConstraints()`

返回 `MediaTrackSupportedConstraints`。对象中值为 `true` 的字段可以出现在 `getUserMedia()` 的约束对象中；它只表示字段可识别，不保证当前设备能够满足任意取值。

### 音频采集约束

以下字段放在 `getUserMedia({ audio: { ... } })` 中。它们选择输入音频，`MediaRecorder` 的 `options.mimeType` 则选择输出编码格式。

#### `captureSource`

可选的 `'microphone' | 'system-audio'`，也接受 `{ exact?: AudioCaptureSource, ideal?: AudioCaptureSource }`，默认 `'microphone'`。

- `'microphone'`：采集麦克风声音，可通过 `microphoneMode` 选择拾音模式。
- `'system-audio'`：采集设备正在播放的系统混音，不采集环境声音。

无效或当前设备不支持的音源会使请求以 `OverconstrainedError` 拒绝。`deviceId` 用于选择具体输入设备，与音源类型不同。

#### `microphoneMode`

可选的 `MicrophoneCaptureMode`，也接受 `{ exact?: MicrophoneCaptureMode, ideal?: MicrophoneCaptureMode }`。只适用于麦克风音源；省略时使用 `'wearer'`。

| 值 | 拾音用途 |
| --- | --- |
| `'wearer'` | 优先采集设备佩戴者本人的声音。 |
| `'far-field'` | 采集远距离的语音或声音。 |
| `'near-field'` | 采集近距离的语音或声音。 |
| `'omnidirectional'` | 不偏向特定方向的全向采集。 |

无效或当前设备不支持的模式会使请求以 `OverconstrainedError` 拒绝。与 `captureSource: 'system-audio'` 组合也会拒绝。

#### `echoCancellation`

可选的 `boolean`，请求是否对麦克风输入进行回声消除。省略时不指定此约束。不能将 `true` 与 `captureSource: 'system-audio'` 组合，否则请求以 `OverconstrainedError` 拒绝。

使用音频轨道的 `getSettings()` 读取实际的 `captureSource`、`microphoneMode` 和 `echoCancellation`。`getSupportedConstraints()` 只表明字段可识别，不枚举设备支持的音源或模式。

### `MediaStream`

#### `new MediaStream()`

创建一个不包含任何轨道的空媒体流。新建流的 `active` 为 `false`，适合在需要先创建容器、再由其他流程提供轨道时使用。

#### `id`

类型为只读 `string`，在当前媒体流生命周期内保持不变。它用于区分多个流，不应被当作设备标识；设备选择应使用 `MediaDeviceInfo.deviceId`。

#### `active`

类型为只读 `boolean`。只要流中至少有一条 `readyState === 'live'` 的轨道就为 `true`；所有轨道结束后变为 `false`。读取该字段不会启动或停止采集。

#### `getTracks()`

返回一个新的 `MediaStreamTrack[]`，包含媒体流中的全部音频和视频轨道。修改返回的数组不会改变媒体流；需要结束采集时，应逐条调用轨道的 `stop()`。

#### `getAudioTracks()`

返回一个新的 `MediaStreamTrack[]`，只包含 `kind === 'audio'` 的轨道。没有音频轨道时返回空数组。

#### `getVideoTracks()`

返回一个新的 `MediaStreamTrack[]`，只包含 `kind === 'video'` 的轨道。没有视频轨道时返回空数组。

#### `getTrackById(id)`

按轨道的 `id` 精确查找轨道。找到时返回同一个 `MediaStreamTrack` 对象，否则返回 `null`；该方法不会按设备 `deviceId` 查找。

### `MediaStreamTrack`

#### `id`

类型为只读 `string`，在轨道生命周期内保持不变。可与 `MediaStream.getTrackById()` 配合，在同一媒体流中重新取得该轨道。

#### `kind`

类型为只读 `'audio' | 'video'`，表示轨道承载的媒体类型。可在混合流中用于区分麦克风轨道和摄像头轨道。

#### `label`

类型为只读 `string`，用于向用户描述轨道对应的媒体来源。显示名称可能因设备和权限状态而不同；业务逻辑应使用 `id` 或设置中的 `deviceId`，不要依赖 `label` 文本。

#### `enabled`

类型为可写 `boolean`。设置为 `false` 会暂停该轨道向下游提供有效媒体数据，但不会结束轨道或释放设备；重新设为 `true` 可以继续使用。需要彻底结束采集时调用 `stop()`。

```javascript
const [microphone] = stream.getAudioTracks();
microphone.enabled = false; // 临时静音。
microphone.enabled = true;  // 恢复采集。
```

#### `muted`

类型为只读 `boolean`。表示媒体来源当前无法提供数据，例如采集被系统暂时中断。它与 `enabled` 不同：`enabled` 由应用控制，`muted` 反映来源的当前状态。

#### `readyState`

类型为只读 `'live' | 'ended'`。`'live'` 表示轨道仍可继续提供数据；调用 `stop()` 或媒体来源永久结束后变为 `'ended'`。结束后的轨道不能重新启动，应重新调用 `getUserMedia()` 获取轨道。

#### `getConstraints()`

返回 `MediaTrackConstraints`，包含获取该轨道时请求的约束。这些值表示应用的请求，不一定等于设备最终采用的参数；读取实际结果应使用 `getSettings()`。

#### `getSettings()`

返回 `MediaTrackSettings`，包含轨道最终采用的设备与媒体设置，例如 `deviceId`、音频采样率、声道数，或视频宽高与帧率。字段取决于轨道类型和可用设备。

```javascript
const [videoTrack] = stream.getVideoTracks();
const { deviceId, width, height, frameRate } = videoTrack.getSettings();
console.log({ deviceId, width, height, frameRate });
```

#### `stop()`

停止轨道并将 `readyState` 变为 `'ended'`。无返回值；对已经结束的轨道再次调用不会产生额外效果。同一设备的其他轨道不受影响，因此释放整个流时应停止所有轨道。

```javascript
for (const track of stream.getTracks()) {
  track.stop();
}
```

### 拍照设置

Web `ImageCapture.takePhoto(settings)` 与 `wx` `CameraContext.takePhoto(options)` 使用同一组 AIUI 拍照设置。两种写法的对象名称不同，但 `quality`、`mode` 与 `enableSystemPreview` 的含义和默认值一致。

#### `quality`

类型为 `'high' | 'normal' | 'low'`，默认值为 `'high'`。它选择图像的相对质量档位，会影响可保留的图像细节、编码后的数据量以及拍摄处理开销，但不是固定的 JPEG 压缩百分比。需要确定输出像素尺寸时，应结合 `mode` 的默认分辨率以及返回结果进行判断。

| 值 | 质量与开销 | 推荐场景 |
| --- | --- | --- |
| `'high'` | 最高质量档，优先保留图像细节，通常会产生更大的编码数据并占用更多处理资源。 | 阅读智能体、AI 识图、文字识别，以及需要放大或裁剪的图像。 |
| `'normal'` | 平衡图像细节、编码数据量和处理开销。 | 不需要最高细节的通用拍摄和常规视觉分析。 |
| `'low'` | 较低质量档，优先降低编码数据量和处理开销，可识别的细节相对较少。 | 缩略图、快速预览，或对传输数据量敏感且不依赖精细内容的场景。 |

如果图像需要交给 OCR、阅读智能体或其他依赖细节的视觉模型，优先使用 `'high'`。只有在数据量或处理开销更重要时才降低档位。

#### `mode`

类型为 `'default' | 'wide' | 'telephoto'`，默认值为 `'default'`。它选择 AIUI 定义的拍摄能力，决定默认输出方向、分辨率和主要使用场景。`mode` 与 `quality` 是两个独立维度：先用 `mode` 选择拍摄场景，再用 `quality` 调整该模式下的质量档位。

| 值 | 默认输出分辨率（宽 × 高） | 取景特点 | 推荐场景 |
| --- | --- | --- | --- |
| `'default'` | `3024 × 4032` | 使用完整视场角（全 FOV）和竖向全分辨率，保留最多的画面与图像细节。 | 通用拍摄；省略 `mode` 时使用此模式。 |
| `'wide'` | `2016 × 2688` | 针对扫码任务提供适合识别处理的竖向图像。 | 二维码、条码和支付扫码。 |
| `'telephoto'` | `2016 × 1512` | 提供适合主体内容分析的横向图像。 | 阅读智能体、AI 识图、文字或物体识别。 |

对于扫码场景使用 `'wide'`；对于阅读智能体或 AI 识图使用 `'telephoto'`。不需要特定能力时省略该字段或显式使用 `'default'`。

#### `enableSystemPreview`

类型为 `boolean`，默认值为 `true`。设为 `true` 时，拍照前显示系统相机预览，适合需要用户确认取景的场景；设为 `false` 时直接完成拍摄，适合扫码或由智能体连续处理图像的流程。

### `ImageCapture`

#### `new ImageCapture(videoTrack)`

使用仍处于 `'live'` 状态的视频 `MediaStreamTrack` 创建图像采集器。参数不是 `MediaStreamTrack` 或轨道的 `kind` 不是 `'video'` 时抛出 `TypeError`；轨道已经结束时抛出 `InvalidStateError`。

#### `takePhoto(settings?)`

拍摄编码后的图像，返回 `Promise<Blob>`。`Blob.type` 是实际图像 MIME type，`Blob.size` 是编码后的字节数。视频轨道已经结束时抛出 `InvalidStateError`，拍摄失败时 Promise 会拒绝。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `settings` | `PhotoSettings` | 否 | 拍照设置。省略时使用[拍照设置](#拍照设置)中的默认值。 |

#### `grabFrame()`

获取当前视频帧，返回 `Promise<ImageBitmap>`。结果是已解码的内存位图，不保留原始 JPEG 或 PNG 字节；需要编码图像时应使用 `takePhoto()`。视频轨道已经结束时抛出 `InvalidStateError`。

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

`Canvas` 是 AIUI 提供的离屏画布，不需要创建 DOM 元素。`ImageBitmap` 本身不提供 `arrayBuffer()`；需要原始像素时，将它绘制到离屏画布，再通过 `getImageData()` 读取。示例中的 `buffer` 是独立的 `ArrayBuffer`，像素按 RGBA 顺序排列，每个通道占 1 字节，因此总字节数为 `width * height * 4`。它不是 JPEG 或 PNG 文件字节。

### `MediaRecorder`

#### `new MediaRecorder(stream, options?)`

为指定 `MediaStream` 创建录制器。构造后 `state` 为 `'inactive'`。`options.mimeType` 用于选择输出格式；省略时默认使用 `audio/wav`。AIUI 当前支持 `audio/wav`、`audio/ogg;codecs=opus`、`video/webm;codecs=vp8,opus` 与 `video/mp4`，不支持的格式会抛出 `TypeError`。开始录制时，流中必须至少有一条音频或视频轨道。

音源和麦克风拾音模式由输入轨道决定，应在 `getUserMedia()` 中设置，不能通过此构造函数切换。

#### `state`

类型为只读 `'inactive' | 'recording' | 'paused'`。新建或停止后的录制器为 `'inactive'`，录制期间为 `'recording'`，暂停后为 `'paused'`。调用控制方法前可检查该字段，避免 `InvalidStateError`。

#### `mimeType`

类型为只读 `string`，表示录制器实际使用的输出 MIME type。它可能来自构造参数，也可能是默认的 `audio/wav`；处理 `dataavailable` 的 `Blob` 时应以该值或 `event.data.type` 选择解码方式。

#### `start(timeslice?)`

开始录制。`timeslice` 是可选的分片间隔，单位为毫秒；设置后，录制器会按该节奏产生 `dataavailable` 事件。无返回值。仅当 `state === 'inactive'` 时可以调用，否则抛出 `InvalidStateError`。

#### `pause()`

暂停正在进行的录制并将 `state` 变为 `'paused'`，无返回值。只有 `state === 'recording'` 时可以调用，否则抛出 `InvalidStateError`。暂停不会结束当前录制会话。

#### `resume()`

恢复已暂停的录制并将 `state` 变为 `'recording'`，无返回值。只有 `state === 'paused'` 时可以调用，否则抛出 `InvalidStateError`。

#### `requestData()`

请求立即通过 `dataavailable` 事件交付当前累计的数据分片，并继续当前录制会话。无返回值。录制器为 `'inactive'` 时调用会抛出 `InvalidStateError`。

```javascript
recorder.addEventListener('dataavailable', ({ data }) => {
  console.log('立即取得分片', data.size);
});

recorder.start();
recorder.requestData();
```

#### `stop()`

停止录制并请求交付剩余数据，随后触发 `stop` 事件。`state` 会变为 `'inactive'`。无返回值；如果录制器已经是 `'inactive'`，调用不会产生额外效果。

#### `MediaRecorder.isTypeSupported(type)`

检查指定 MIME type 是否可用于录制，返回 `boolean`。应在创建 `MediaRecorder` 前调用，避免因格式不支持而得到 `TypeError`。

```javascript
const preferredType = 'audio/ogg;codecs=opus';
const mimeType = MediaRecorder.isTypeSupported(preferredType)
  ? preferredType
  : 'audio/wav';

const recorder = new MediaRecorder(stream, { mimeType });
```

#### `dataavailable` 事件

有新的录制数据分片时触发。`event.data` 是包含编码数据的 `Blob`；分片可能由 `timeslice`、`requestData()` 或 `stop()` 产生。异步处理分片时应保留顺序，并根据 `Blob.type` 解释编码格式。

#### `start` 事件

`start()` 成功进入录制状态后触发，此时 `state === 'recording'`。

#### `pause` 事件

`pause()` 成功暂停录制后触发，此时 `state === 'paused'`。

#### `resume` 事件

`resume()` 成功恢复录制后触发，此时 `state === 'recording'`。

#### `stop` 事件

录制停止且剩余 `dataavailable` 数据完成交付后触发。适合在这里完成分片合并或释放媒体轨道。

#### `error` 事件

录制过程中发生错误时触发。错误会结束当前录制会话并使录制器回到 `'inactive'`；应用应停止不再使用的媒体轨道并向用户提供重试入口。

### `wx.media`

#### `wx.media.createCameraContext()`

返回当前 AIUI 应用可用的 `CameraContext`。wasm32 目标、`app.config.lifetime === 'cut'`、没有当前应用实例或当前运行环境不支持相机能力时返回 `undefined`。调用方应在拍照前检查返回值；该对象不需要手动销毁。

#### `wx.media.getRecorderManager()`

返回当前 AIUI 应用可用的 `RecorderManager`。wasm32 目标、`app.config.lifetime === 'cut'`、没有当前应用实例或当前运行环境不支持录音能力时返回 `undefined`；开始录音前应检查返回值并先注册所需回调。

### `CameraContext`

#### `CameraContext.takePhoto(options)`

拍摄编码后的图像，返回 `Promise<{ data: ArrayBuffer, mimeType: string }>`。`data` 是完整的编码图像字节，`mimeType` 表示实际编码格式；可以将两者直接交给文件上传、扫码识别或智能体图像输入流程。

拍摄过程失败时 Promise 会拒绝。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `options` | `object` | 是 | 拍照设置。字段及默认值与 Web 写法一致，见[拍照设置](#拍照设置)。 |

### `RecorderManager`

#### `start(options)`

开始新的录音会话，返回 `Promise<void>`。建议在调用前注册 `onFrameRecorded()`、`onError()` 和 `onStop()`，避免遗漏快速到达的首个事件。重复调用已在录音中的管理器不会创建第二个会话。

| `start()` 参数 | 类型 | 必填 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| `options.sampleRate` | `number` | 否 | `16000` | 请求的采样率。 |
| `options.numberOfChannels` | `number` | 否 | `1` | 请求的声道数。 |
| `options.format` | `'pcm' \| 'opus'` | 否 | `'pcm'` | 请求的编码格式。 |
| `options.frameSize` | `number` | 否 | `250` | 音频帧回调间隔，单位为毫秒；仅正数生效。 |

#### `pause()`

暂停当前录音并返回 `Promise<void>`。只有正在录音时才会发生状态变化；成功后触发通过 `onPause()` 注册的回调。暂停期间不会结束当前会话，之后可以调用 `resume()`。

#### `resume()`

恢复已暂停的录音并返回 `Promise<void>`。成功后通过 `onResume()` 通知。没有处于暂停状态时不会启动新的录音会话。

#### `stop()`

停止当前录音并返回 `Promise<void>`。剩余音频帧处理完成后触发 `onStop()`；相关媒体轨道随后被释放。尚未开始录音或已经停止时调用是安全的。

#### `onStart(callback)`

注册录音开始回调。回调不接收参数，在底层录制器实际开始产出数据后触发。再次调用会替换先前注册的开始回调。

#### `onPause(callback)`

注册录音暂停回调。回调不接收参数，在 `pause()` 完成状态切换后触发。再次调用会替换先前注册的暂停回调。

#### `onResume(callback)`

注册录音恢复回调。回调不接收参数，在 `resume()` 完成状态切换后触发。再次调用会替换先前注册的恢复回调。

#### `onStop(callback)`

注册录音停止回调。回调接收 `{ tempFilePath: '', duration: number, fileSize: number }`：`duration` 是本次录音的毫秒时长，`fileSize` 是通过音频帧交付的总字节数。当前不会生成临时文件，因此 `tempFilePath` 始终为空字符串。再次注册会替换先前的停止回调。

#### `onFrameRecorded(callback)`

注册音频帧回调。回调接收 `{ frameBuffer: ArrayBuffer, isLastFrame: false }`。`frameBuffer` 只在当前回调中表示这一分片，不包含之前已经交付的数据；当前实现不会用 `isLastFrame` 标记最后一帧，完成状态以 `onStop()` 为准。

PCM 模式下，`frameBuffer` 是去除 WAV 容器头的原始 PCM 分片。Opus 模式下，它是 Opus 有效载荷。

```javascript
const audioChunks = [];
recorder.onFrameRecorded(({ frameBuffer }) => {
  audioChunks.push(frameBuffer.slice(0));
});
```

#### `onHeader(callback)`

注册 Opus 初始化 header 回调。回调接收两个位置参数：`format` 为 `'opus'`，`headerBuffer` 为包含初始化 header 的 `ArrayBuffer`。该回调先于第一个 Opus 有效载荷触发；流式保存或传输 Opus 时，应先处理 header，再按顺序处理 `onFrameRecorded()` 的分片。PCM 模式不会触发此回调。

#### `onError(callback)`

注册错误回调。回调接收 `{ errMsg: string }`，其中包含可用于日志和用户提示的错误信息。错误发生后，不应假设当前会话仍在录音；应用应先完成当前会话的清理，再决定是否重新调用 `start()`。

#### `onInterruptionBegin(callback)`

注册录音中断开始回调。回调不接收参数；收到通知后，可以暂停依赖实时音频的智能体交互并更新界面状态。

#### `onInterruptionEnd(callback)`

注册录音中断结束回调。回调不接收参数；收到通知后，可以更新界面或恢复业务流程。是否继续录音仍应由应用显式决定。
