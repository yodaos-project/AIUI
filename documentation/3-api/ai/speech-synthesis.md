# 语音播报

语音播报用于把文本内容转换成语音输出，适合欢迎语、回复播报、导航提示、状态提醒等场景。AIUI 提供两种彼此独立的方法：`speechSynthesis.speak()` 生成语音后直接播放，所有 `speak()` 请求共享一个由运行时管理的语音播放器；`speechSynthesis.synthesize()` 只创建语音生成任务，不会自动播放，播放时机和状态由调用方创建的 `SpeechAudioPlayer` 控制。

在 AIUI 中，语音播报通常用在结果输出阶段：只需要把结果读给用户时使用 `speak()`；需要字幕、音频分片或独立播放控制时使用 `synthesize()`。调用其中一种方法不会自动调用另一种方法。

## 播报一段文本

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
const utterance = new SpeechSynthesisUtterance('欢迎使用 AIUI');
speechSynthesis.speak(utterance, 'enqueue');
```

**wx**

```javascript api-style=wx
wx.speech.playTTS('欢迎使用 AIUI');
```

<!-- /aiui-api-style -->

`speak()` 会立即进入直接播报流程，不会返回生成任务或独立播放器。多次调用共享同一个语音播放器，并通过 `mode` 决定加入共享队列还是立即播放。

## 选择音色播报

`speechSynthesis.speak()` 和 `speechSynthesis.synthesize()` 都使用 `SpeechSynthesisUtterance` 作为语音合成请求，各属性的支持情况见下方 API Reference。通过 `voice` 设置音色 ID，再根据是否需要独立控制播放选择其中一种方法。以下两段代码是互斥的使用路径，并不是必须连续执行的步骤：

```javascript
// 路径一：直接播放，并使用 speak() 的共享播放器
const spokenUtterance = new SpeechSynthesisUtterance('欢迎使用 AIUI');
spokenUtterance.voice = 'female-tianmei';
speechSynthesis.speak(spokenUtterance, 'enqueue');
```

```javascript
// 路径二：只生成任务，再使用独立播放器控制播放
const generatedUtterance = new SpeechSynthesisUtterance('欢迎使用 AIUI');
generatedUtterance.voice = 'female-tianmei';

const task = await speechSynthesis.synthesize(generatedUtterance, {
  subtitles: 'word',
});
const player = new SpeechAudioPlayer(task);
player.play();
```

## 生成音频与同步字幕

如果需要把生成与播放分开，使用 `synthesize()` 创建任务，再交给 `SpeechAudioPlayer` 播放。`synthesize()` 本身只开始生成，不会进入 `speak()` 的共享播放器或共享播放队列：

```javascript
const utterance = new SpeechSynthesisUtterance('欢迎使用 AIUI');
const task = await speechSynthesis.synthesize(utterance, {
  subtitles: 'word',
  audio: { preferredFormat: 'mp3' },
});

console.log('actual format:', task.audioConfig.format);

const player = new SpeechAudioPlayer(task);
player.textTrack.addEventListener('cuechange', () => {
  const cue = player.textTrack.activeCues.item(0);
  console.log(cue?.text ?? '');
});
player.play();
```

`preferredFormat` 只是偏好提示，实际格式始终以 `task.audioConfig.format` 为准。

## 选择 `speak()` 还是 `synthesize()`

两种方法都接收 `SpeechSynthesisUtterance`，但生成结果的所有权和播放方式不同：

| 对比项 | `speak()` | `synthesize()` |
| --- | --- | --- |
| 主要职责 | 生成语音并直接播放 | 创建语音生成任务，不自动播放 |
| 返回结果 | `void`，不暴露任务或播放器 | `Promise<SpeechSynthesisTask>` |
| 播放器 | 所有调用共享运行时管理的语音播放器 | 调用方可为任务创建独立的 `SpeechAudioPlayer` |
| 播放控制 | 通过 `mode` 选择排队或立即播放 | 通过播放器控制播放、暂停、停止和跳转 |
| 字幕与分片 | 不向调用方暴露 | 可监听音频分片、字幕 cue 和任务事件 |
| 适用场景 | 欢迎语、提示音、普通回复等只需直接播报的内容 | 同步字幕、自定义播放界面、流式处理、任务取消或独立播放控制 |

两种方法不会共享任务状态：`synthesize()` 创建的任务不会加入 `speak()` 的共享播放队列，`speak()` 也不会返回可交给 `SpeechAudioPlayer` 的任务。如果对同一段文本同时调用两种方法，会发起两次独立的语音生成请求。

## 使用建议

- 把要播报的文本控制在适合一次听清的长度内，避免整段长文本直接朗读。
- 只需要直接播报时优先使用 `speak()`；只有需要字幕、分片或独立播放控制时才使用 `synthesize()`。
- 对于连续多条回复，建议在业务层控制播报节奏，避免用户同时收到过多语音输出。
- 对重要提示和普通提示使用不同的文案长度与语气。

## 当前能力范围

- [x] 通过 `speechSynthesis.speak()` 使用共享语音播放器直接播报，并通过 `mode` 控制排队或立即播放。
- [x] 通过独立的 `speechSynthesis.synthesize()` 生成任务、音频分片与字幕 cue，并按需使用 `SpeechAudioPlayer` 播放。
- [x] `SpeechSynthesisUtterance` 上的属性同时用于 `speak()` 和 `synthesize()`。
- [x] `volume` 支持 `0` 到 `10` 的整数，默认值为 `1`。
- [ ] `lang` 当前不支持，设置后不会改变语音生成的语言。
- [ ] `cancel()`、`pause()`、`resume()`、`getVoices()` 以及完整的 utterance 生命周期事件（当前未暴露）。

## 继续阅读

- **[语音识别](/AIUI/api/ai-speech-recognition)**：查看如何把用户语音转换成文本。
- **[大语言模型](/AIUI/api/ai-language-model)**：查看如何生成可播报的回复内容。

`SpeechAudioPlayer.textTrack` 的 cue 在列表与 ID 查询之间保持对象身份，可以保留对象、修改属性并按同一对象删除。完整字幕接口见 [AudioPlayer](/AIUI/api/media-audio-player)。

## API Reference

### 入口

语音播报基于全局 `speechSynthesis` 对象和 `SpeechSynthesisUtterance`。`speak()` 是直接播放入口：

```javascript
const spokenUtterance = new SpeechSynthesisUtterance('欢迎使用 AIUI');
speechSynthesis.speak(spokenUtterance, 'enqueue');
```

`synthesize()` 是独立的任务生成入口：

```javascript
const generatedUtterance = new SpeechSynthesisUtterance('欢迎使用 AIUI');
const task = await speechSynthesis.synthesize(generatedUtterance);
const player = new SpeechAudioPlayer(task);
player.play();
```

示例中的两条入口用于不同工作流。实际使用时应根据是否需要独立任务和播放控制选择其中一种，而不是为了完成一次播报依次调用两者。

`SpeechSynthesisUtterance` 也可通过内置 `speech` 模块使用。

### `SpeechSynthesisUtterance`

`SpeechSynthesisUtterance` 是一个可修改的语音合成请求对象。`speechSynthesis.speak()` 和 `speechSynthesis.synthesize()` 都接收该对象，并对当前支持的属性采用相同的处理方式。

#### `new SpeechSynthesisUtterance(text?)`

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `text` | `string` | 否 | 初始播报文本，省略时为 `''`。 |

#### `utterance.text`

可写的 `string`，默认空字符串；可以先创建空请求，再设置文本。

#### `utterance.lang`

可写的 `string`，默认 `'en-US'`；当前语音服务不支持用此属性切换语言。

#### `utterance.pitch`

可写的 `number`，默认 `1`；是否支持调整由语音服务决定。

#### `utterance.rate`

可写的 `number`，默认 `1`；是否支持调整由语音服务决定。

#### `utterance.volume`

可写的 `number`，默认 `1`；可保存小数值，不会在对象赋值时自动转换为整数。实际音量效果取决于语音服务。

#### `utterance.voice`

可写的 `string | null`，默认 `null`，此时使用默认音色。

**可用音色**

| Voice ID | 类型 | 用途 |
| --- | --- | --- |
| `female-tianmei` | 中文甜美女声 | `tts_streaming` 中文短文本 |
| `English_radiant_girl` | 英文活力女声 | `tts_streaming` 英文短文本 |
| `English_expressive_narrator` | 英文叙事声 | `tts_streaming` 英文长文本 |
| `male-qn-qingse` | 中文青年男声 | 运行时当前默认音色、通用对话 |
| `male-qn-jingying` | 中文成熟男声 | 商务、助手播报 |
| `female-yujie` | 中文成熟御姐 | 品牌介绍、内容解说 |
| `Chinese (Mandarin)_News_Anchor` | 中文新闻女声 | 新闻和信息播报 |
| `Chinese (Mandarin)_Radio_Host` | 中文电台男声 | 长文本和故事 |
| `clever_boy` | 中文男童 | 儿童内容 |
| `lovely_girl` | 中文女童 | 儿童内容 |
| `English_Trustworthy_Man` | 英文可信男声 | 英文助手、商务内容 |

### 方法

#### `speechSynthesis.speak(utterance, mode?)`

`speak()` 使用当前 `utterance` 的属性生成语音并直接播放，返回 `void`。所有 `speak()` 调用共享一个由运行时管理的语音播放器和播放队列；该播放器不会作为对象暴露给调用方。

- `utterance`：`SpeechSynthesisUtterance` 实例，当前主要使用其中的文本内容发起播报。
- `mode`：可选的播报模式，支持以下取值：
  - `'enqueue'`：把当前播报请求追加到播放队列中。
  - `'immediate'`：立即播放当前播报。

如果省略 `mode`，默认按 `'enqueue'` 处理，也就是把当前播报请求追加到播放队列中。

`speak()` 不会创建 `SpeechSynthesisTask`，也不会使用调用方通过 `SpeechAudioPlayer` 控制的独立播放流程。

#### `speechSynthesis.synthesize(utterance, options?)`

创建独立的流式语音生成任务，但不会自动开始播放。返回 `Promise<SpeechSynthesisTask>`。该任务不进入 `speak()` 的共享播放器或播放队列；需要播放时，调用方应为任务创建 `SpeechAudioPlayer` 并自行控制播放状态。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `utterance` | `SpeechSynthesisUtterance` | 是 | 要合成的语音请求。 |
| `options.subtitles` | `'none' \| 'sentence' \| 'word'` | 否 | 字幕 cue 的粒度。 |
| `options.audio.preferredFormat` | `'pcm' \| 'mp3' \| 'ogg_opus'` | 否 | 目标音频格式偏好。 |
| `options.audio.sampleRate` | `number` | 否 | 期望采样率。 |
| `options.audio.channels` | `1 \| 2` | 否 | 期望声道数。 |
| `options.audio.bitrate` | `number` | 否 | 期望比特率。 |
| `options.signal` | `AbortSignal` | 否 | 用于取消生成任务。 |

### `SpeechSynthesisTask`

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 任务标识。 |
| `state` | `'running' \| 'completed' \| 'aborted' \| 'errored'` | 当前任务状态。 |
| `audioConfig` | `SpeechSynthesisAudioConfig` | 实际生成的格式、采样率、声道、采样格式与 MIME type。 |
| `language` | `string` | 实际语言。 |
| `granularity` | `'none' \| 'sentence' \| 'word'` | 实际字幕粒度。 |
| `finished` | `Promise<{ duration: number }>` | 任务结束后解析。 |
| `abort()` | `void` | 中止生成任务。 |

任务会分发 `chunk`、`end`、`error` 与 `abort` 事件，也可以使用对应的 `onchunk`、`onend`、`onerror` 与 `onabort` 属性。`chunk` 事件包含 `audio: Uint8Array` 和 `cues: readonly SpeechSynthesisCue[]`。

### `new SpeechAudioPlayer(task, options?)`

创建一个消费指定 `SpeechSynthesisTask` 的独立播放器。它只用于 `synthesize()` 生成的任务，不代表也不控制 `speak()` 内部共享的语音播放器。`options.trackMode` 可设为 `'hidden'` 或 `'showing'`。

| 成员 | 类型 | 说明 |
| --- | --- | --- |
| `audioPlayer` | `AudioPlayer` | 底层音频播放器。 |
| `textTrack` | `TextTrack` | 根据生成 cue 更新的字幕轨道。 |
| `activeCue` | `VTTCue \| null` | 当前激活字幕。 |
| `currentTime` / `duration` | `number` | 当前播放时间与时长。 |
| `paused` | `boolean` | 当前是否暂停。 |
| `play()` / `pause()` / `stop()` | `void` | 控制播放状态。 |
| `seek(position)` | `void` | 跳转到指定秒数。 |
| `destroy()` | `void` | 释放播放器资源。 |
