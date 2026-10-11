# 音频播放

音频播放适合背景音乐、完整语音、本地音频文件，以及持续到达的音频数据。AIUI 通过 `AudioPlayer` 提供常规文件播放和流式播放能力。

> **什么时候选择音频处理？**
> [`AudioContext`](/AIUI/api/media-web-audio) 更适合生成声音、处理 PCM、添加滤波器和分析音频。只播放完整音频文件时，`AudioPlayer` 更简单，并且可以使用运行时提供的文件播放能力。
>
> 因此，可以把本页介绍的音频播放能力作为播放普通音频文件的首选；需要实时处理声音时，再使用[音频处理](/AIUI/api/media-web-audio)。

## 文件播放

如果你要播放一个完整的音频文件，优先使用文件播放模式。这种方式更适合背景音乐、完整语音内容或已经落盘的本地音频资源。

- 使用 `src` 设置本地路径或网络 URL。
- 本地路径既可以是相对路径，也可以是相对于项目根目录解析的绝对路径，例如 `/assets/intro.ogg`。
- 如果是本地 `.ogg` 文件，可直接设置到 `src`。
- 如果你已经拿到了完整的二进制数据，也可以通过 `setBuffer(data, hint)` 一次性设置，其中本地 `.ogg` 数据可传入 `hint = "ogg"`。

### 示例：通过 `src` 播放文件

```javascript
const player = new AudioPlayer();

player.src = '/assets/intro.ogg';
player.autoplay = false;
player.onCanplay(() => {
  player.play();
});
player.onEnded(() => {
  console.info('playback finished');
});
```

### 示例：通过 `setBuffer()` 播放本地 Ogg 文件数据

```javascript
import introOgg from '../assets/intro.ogg';

const player = new AudioPlayer();
const bytes = new Uint8Array(await introOgg.arrayBuffer());

player.setBuffer(bytes, 'ogg');
player.play();
```

## 流式播放

如果你的音频数据是边生成边下发的，例如实时 TTS、分段解码或服务端推流，使用流式播放模式。

- 流式播放需要在构造函数中传入 `options`，并显式声明 `format`。
- 如需追加 PCM 数据，请设置 `format: 'pcm'`。
- 如需播放 Ogg 容器封装的 Opus 流，请设置 `format: 'ogg_opus'`。
- 数据分段通过 `append()` 追加，流结束后调用 `finish()`。

### 示例：流式追加 PCM 数据

```javascript
const player = new AudioPlayer({
  format: 'pcm',
});

player.play();

for await (const chunk of pcmChunks) {
  player.append(chunk);
}

player.finish();
```

### 示例：流式追加 Ogg/Opus 数据

```javascript
const player = new AudioPlayer({
  format: 'ogg_opus',
});

player.play();

for await (const chunk of oggOpusChunks) {
  player.append(chunk);
}

player.finish();
```

## 添加字幕并保留 cue 对象

```javascript
const player = new AudioPlayer();
const track = player.addTextTrack('subtitles', '字幕', 'zh-CN');
track.mode = 'hidden';
const cue = new VTTCue(0, 2, '欢迎使用 AIUI');
cue.id = 'greeting';
track.addCue(cue);
console.log(track.cues.item(0) === cue); // true
console.log(track.cues.getCueById('greeting') === cue); // true
track.addEventListener('cuechange', () => {
  console.log(track.activeCues.item(0)?.text ?? '');
});
```

同一个 cue 在 `cues`、`activeCues` 和 `getCueById()` 中保持对象身份。读取后可以修改文字或时间，再把同一个对象交给 `removeCue()`。`SpeechAudioPlayer` 的生成字幕也遵循此规则，见[语音播报](/AIUI/api/ai-speech-synthesis)。

## API Reference

### 构造函数

```javascript
new AudioPlayer(options)
```

- `options`: 可选配置对象，会透传到底层音频运行时，可包含 `audio_setting` 等参数。
- 只有传入 `options` 时才会启用流式模式。
- 流式播放时必须显式声明 `options.format`，当前文档明确支持 `pcm` 和 `ogg_opus`。

### 支持的格式

`AudioPlayer` 当前文档明确支持以下几类格式/输入路径：

- `format: 'pcm'`：用于 `append()` 追加原始 PCM 音频块。
- `format: 'ogg_opus'`：用于 `append()` 追加 Ogg 容器封装的 Opus 音频流。
- `hint: 'ogg'`：用于 `setBuffer()` 指定本地 `.ogg` 资源的格式提示。
- 本地 `.ogg` 文件：可通过 `src` 或 `setBuffer()` 播放本地 Ogg/Opus 资源。

#### 流式格式说明

- `append()` 仅文档化支持 `pcm` 和 `ogg_opus` 两种流式输入格式。
- 当使用 `format: 'ogg_opus'` 时，首次追加的数据必须包含标准 Ogg 头，例如 `OpusHead` 和 `OpusTags`，以便运行时先完成解码器初始化。
- 流式播放必须显式声明 `format`；不要依赖隐式默认值。

### 属性

#### `src`
- **类型**: `String`
- **说明**: 音频资源的 URL 或路径。支持本地路径和网络 URL；本地路径既支持相对路径，也支持相对于项目根目录解析的绝对路径，例如 `/assets/music.mp3`。文档中额外明确支持本地 `.ogg` 资源路径。
- **示例**: `player.src = "/assets/music.mp3";`

#### `startTime`
- **类型**: `Number`
- **说明**: 开始播放的时间位置（单位：秒）。默认从 0 开始。

#### `autoplay`
- **类型**: `Boolean`
- **说明**: 是否在设置 `src` 后自动开始播放。默认值为 `false`。

#### `loop`
- **类型**: `Boolean`
- **说明**: 是否循环播放当前音频。默认值为 `false`。

#### `volume`
- **类型**: `Number`
- **说明**: 播放音量大小，范围为 `0.0` (静音) 到 `1.0` (最大音量)。

#### `duration`
- **类型**: `Number` (只读)
- **说明**: 音频的总时长（单位：秒）。在元数据加载完成前，该值为 `0`。

#### `sampleRate`
- **类型**: `Number` (只读)
- **说明**: 音频的采样率（如 44100）。

#### `channels`
- **类型**: `Number` (只读)
- **说明**: 音频的声道数。

#### `currentTime`
- **类型**: `Number`
- **说明**: 当前播放的时间位置（单位：秒）。设置该值会使播放器跳转到指定位置。

设置 `currentTime` 会实际执行 seek，而不是只修改读数。需要在跳转完成后更新界面时监听播放器的 seek 相关事件；流式资源的可跳转范围仍取决于播放器与数据源。

#### `paused`
- **类型**: `Boolean` (只读)
- **说明**: 当前播放器是否处于暂停状态。

#### `buffered`
- **类型**: `Number` (只读)
- **说明**: 已缓冲的音频时长（单位：秒）。

### 方法

#### `play()`
- **说明**: 开始播放音频。如果音频处于暂停状态，则从当前位置继续播放。

#### `pause()`
- **说明**: 暂停当前音频播放。

#### `stop()`
- **说明**: 停止播放并将播放位置重置为初始状态。

#### `append(buffer)`
- **参数**: `buffer` (`ArrayBuffer` | `TypedArray`)
- **说明**: 向播放器追加流式音频数据。当前文档明确支持原始 PCM 数据和 Ogg/Opus 字节流。

#### `finish()`
- **说明**: 标记流式音频数据追加结束。调用后，播放器将在播放完剩余缓存数据后进入 `ended` 状态。

#### `seek(position)`
- **参数**: `position` (`Number`) - 目标位置（秒）
- **说明**: 跳转到音频的指定时间点进行播放。

#### `setBuffer(data, hint)`
- **参数**: 
  - `data` (`ArrayBuffer` | `TypedArray`) - 完整的音频数据。
  - `hint` (`String`, 可选) - 格式提示；本地 `.ogg` 资源可传入 `"ogg"`。
- **说明**: 直接设置播放器的音频数据缓冲区。当前文档额外明确支持通过 `hint = "ogg"` 播放本地 Ogg/Opus 数据。

#### `destroy()`
- **说明**: 销毁播放器实例，释放底层解码器和相关硬件资源。调用后该实例将不再可用。

### 事件监听

AudioPlayer 提供了一系列监听方法来响应播放状态的变化：

#### 播放状态事件
- **`onCanplay(callback)`**: 当音频数据加载到足以开始播放时触发。
- **`onPlay(callback)`**: 当调用 `play()` 方法或 `autoplay` 生效开始播放时触发。
- **`onPause(callback)`**: 当调用 `pause()` 方法暂停播放时触发。
- **`onStop(callback)`**: 当调用 `stop()` 方法停止播放时触发。
- **`onEnded(callback)`**: 当音频播放到末尾时触发。

#### 进度与交互事件
- **`onTimeUpdate(callback)`**: 播放位置发生变化时连续触发（通常每秒多次）。
- **`onSeeking(callback)`**: 当开始执行跳转（seek）操作时触发。
- **`onSeeked(callback)`**: 当跳转（seek）操作完成且音频准备好继续播放时触发。

#### 异常与缓冲事件
- **`onError(callback)`**: 当播放过程中发生解码错误、网络错误或资源不存在时触发。
- **`onWaiting(callback)`**: 当网络加载速度赶不上播放速度，导致播放暂停进入缓冲状态时触发。

#### 移除监听
- 每个 `onXxx` 方法都对应一个 `offXxx([callback])` 方法，用于移除特定的回调或清空所有监听器。
- **示例**: `player.offPlay(myPlayCallback);` 或 `player.offPlay();` (移除所有 play 监听)

### `AudioPlayer`

#### `player.textTracks`

只读的 `TextTrackList`，列出播放器的字幕轨道。

#### `player.addTextTrack(kind, label?, language?)`

返回新的 `TextTrack`，可选 label / language 默认为空字符串。不能直接 `new TextTrack()`。

### `TextTrack`

#### `track.id`

只读的轨道标识字符串。

#### `track.kind`

只读的轨道类型字符串。

#### `track.label`

只读的轨道标签字符串。

#### `track.language`

只读的语言字符串。

#### `track.mode`

可写：`disabled`、`hidden`、`showing`。使用 `hidden` 可跟踪活动字幕而不要求自动呈现字幕。

#### `track.cues`

只读的 `TextTrackCueList`，包含全部 cue。列表查询返回同一 cue 对象。

#### `track.activeCues`

只读的 `TextTrackCueList`，包含当前时间范围内的活动 cue。

#### `track.addCue(cue)`

添加 `VTTCue`，返回 `undefined`。已经属于轨道的 cue 不能再次添加。

#### `track.removeCue(cue)`

按对象身份删除 cue，返回 `undefined`；不属于该轨道时抛出 `NotFoundError`。

#### `cuechange / track.oncuechange`

活动 cue 集合变化时触发，支持 `addEventListener()` 或 `oncuechange`。

### `TextTrackCueList`

#### `list.length`

只读的 cue 数量。

#### `list.item(index)`

返回该位置的 `VTTCue`，越界时为 `null`。

#### `list.getCueById(id)`

返回 ID 对应的 `VTTCue`，没有匹配时为 `null`。

### `TextTrackList`

#### `list.length`

只读的轨道数量。

#### `list.item(index)`

返回该位置的 `TextTrack`，越界时为 `null`。

#### `list.getTrackById(id)`

返回 ID 对应的 `TextTrack`，没有匹配时为 `null`。

### `VTTCue`

#### `new VTTCue(startTime, endTime, text)`

时间以秒计，要求有限、非负且 endTime 不小于 startTime。

#### `cue.id`

可写的标识字符串，默认空字符串。

#### `cue.startTime`

可写的开始时间，以秒计。

#### `cue.endTime`

可写的结束时间，以秒计。

#### `cue.text`

可写的字幕字符串；列表再次读取仍得到原对象。

#### `cue.charIndex`

只读的源文本起始索引，可为 `null`；主要用于生成的语音字幕。

#### `cue.charLength`

只读的源文本长度，可为 `null`。

#### `cue.pauseOnExit`

可写的 `boolean`，默认 `false`；当前保存该标记，不会自动暂停播放器。需要暂停时由应用在字幕变化回调中调用 `pause()`。
