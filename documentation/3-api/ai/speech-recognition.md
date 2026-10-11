# 语音识别

语音识别用于把用户实时说出的内容转换成文本，适合语音输入、语音命令、免手输入和对话式交互等场景。

在 AIUI 中，语音识别通常作为语音交互链路的第一步：先把用户语音识别成文本，再把文本交给业务逻辑或大语言模型处理。

## 识别一次语音输入

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
  const best = event.results[0][0];
  console.log(best.transcript, best.confidence);
};

recognition.onerror = (event) => {
  console.error(event.error, event.message);
};

recognition.start();
```

**wx**

```javascript api-style=wx
const sessionId = wx.speech.startRecognition();
console.log('识别会话:', sessionId);
```

<!-- /aiui-api-style -->

## 使用当前麦克风进行识别

`SpeechRecognitionSession` 不会直接打开麦克风。需要先获取当前麦克风，再用 `MediaRecorder` 把录音片段持续写入会话。使用前在 `app.json` 中声明录音权限：

```json
{
  "permissions": ["RECORD_AUDIO"]
}
```

下面的页面示例会自动选择录音和识别服务都支持的音频格式，同时加入热词和初始 ASR 上下文：

```javascript
export default {
  session: null,
  recorder: null,
  microphone: null,
  writer: null,
  writeQueue: Promise.resolve(),

  async startMicrophoneRecognition() {
    const capabilities = await SpeechRecognitionSession.getCapabilities();
    const candidates = ['audio/ogg;codecs=opus', 'audio/wav'];
    const mimeType = candidates.find((candidate) =>
      MediaRecorder.isTypeSupported(candidate) &&
      capabilities.audioFormats.some(
        (format) => format.mimeType.toLowerCase() === candidate
      )
    );

    if (!mimeType) {
      throw new Error('当前没有录音和语音识别都支持的音频格式');
    }

    const session = new SpeechRecognitionSession({
      lang: 'zh-CN',
      interimResults: capabilities.interimResults,
      audio: { mimeType },
      phrases: capabilities.phrases
        ? [
            { phrase: 'Rokid', boost: 5 },
            { phrase: 'AIUI', boost: 5 },
          ]
        : undefined,
    });
    this.session = session;

    if (capabilities.contextUpdates) {
      await session.updateContext([
        { role: 'user', text: '我正在使用语音查询 Rokid 产品' },
        { role: 'assistant', text: '好的，请说出产品名称或问题' },
      ]);
    }

    session.onresult = (event) => {
      const result = event.results[event.resultIndex][0];
      console.log(result.transcript);
    };
    session.onerror = (event) => {
      console.error(event.error, event.message);
    };

    this.microphone = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.writer = session.audio.getWriter();
    this.writeQueue = Promise.resolve();
    this.recorder = new MediaRecorder(this.microphone, { mimeType });

    this.recorder.ondataavailable = (event) => {
      if (event.data.size === 0) return;
      this.writeQueue = this.writeQueue.then(() =>
        this.writer.write(event.data)
      );
    };

    this.recorder.onstop = async () => {
      try {
        await this.writeQueue;
        await this.writer.close();
      } finally {
        this.microphone.getTracks().forEach((track) => track.stop());
        this.recorder = null;
        this.microphone = null;
        this.writer = null;
        this.session = null;
      }
    };

    // 在用户点击事件中开始录音，每 250 ms 产生一个音频片段。
    this.recorder.start(250);
  },

  stopMicrophoneRecognition() {
    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }
  },
};
```

```xml
<button bindtap="startMicrophoneRecognition">开始识别</button>
<button bindtap="stopMicrophoneRecognition">停止识别</button>
```

`startMicrophoneRecognition()` 必须由用户点击等有效交互触发。停止时要等待所有录音片段写入完成，再关闭 `writer`；`writer.close()` 会通知识别服务音频已经结束，使其生成最终结果。最后调用每条麦克风音轨的 `stop()` 释放设备。

## 识别已有或分段到达的音频

`SpeechRecognitionSession` 不会主动打开麦克风。你可以把录音文件、已有音频，或者持续收到的音频片段写入 `audio`：

```javascript
const session = new SpeechRecognitionSession({
  lang: 'zh-CN',
  interimResults: true
});

session.onresult = (event) => {
  const result = event.results[event.resultIndex][0];
  console.log(result.transcript);
};

session.onerror = (event) => {
  console.error(event.error, event.message);
};

const audio = await fetch('/assets/question.wav').then(response => response.blob());
const writer = session.audio.getWriter();
await writer.write(audio);
await writer.close();
```

每次 `write()` 可以传入 `Blob`、`ArrayBuffer` 或 TypedArray。调用 `close()` 表示音频已经全部写完，识别服务随后完成最终结果。需要取消时调用 `writer.abort()`。

写入原始 PCM 数据时，必须明确设置格式：

```javascript
const session = new SpeechRecognitionSession({
  audio: {
    mimeType: 'audio/pcm',
    sampleRate: 16000,
    channelCount: 1,
    sampleFormat: 's16'
  }
});
```

## 添加自定义热词

热词可以帮助识别服务更准确地理解产品名、人名、地点和行业词汇。先通过 `getCapabilities()` 确认当前服务支持热词，再通过 `phrases` 创建会话：

```javascript
const capabilities = await SpeechRecognitionSession.getCapabilities();

const options = {
  lang: 'zh-CN',
  interimResults: true,
};

if (capabilities.phrases) {
  options.phrases = [
    { phrase: 'Rokid', boost: 5 },
    { phrase: 'AIUI', boost: 5 },
    { phrase: '灵伴', boost: 3 },
  ];
}

const session = new SpeechRecognitionSession(options);
const writer = session.audio.getWriter();
const audio = await fetch('/assets/product-intro.wav')
  .then((response) => response.blob());

await writer.write(audio);
await writer.close();
```

`phrase` 是希望优先识别的词语，不能为空。`boost` 是可选权重，省略时为 `1`；数值越高，表示越希望识别服务优先考虑这个词。是否支持热词以 `capabilities.phrases` 为准。

## 选择语音分段方式

`segmentation` 用于提示识别服务如何确定一段最终结果的边界。先检查 `segmentationModes` 和 `vadSilenceDuration`，再传入当前服务支持的模式与 VAD 静音阈值：

```javascript
const capabilities = await SpeechRecognitionSession.getCapabilities();
let segmentation;

if (capabilities.segmentationModes.includes('vad')) {
  const timing = capabilities.vadSilenceDuration;
  const preferredSilenceMs = 800;

  if (
    timing.supported &&
    timing.minMs !== undefined &&
    timing.maxMs !== undefined
  ) {
    segmentation = {
      mode: 'vad',
      silenceDurationMs: Math.min(
        timing.maxMs,
        Math.max(timing.minMs, preferredSilenceMs)
      ),
    };
  } else {
    // 使用运行时或识别服务的默认 VAD 静音阈值。
    segmentation = 'vad';
  }
} else if (capabilities.segmentationModes.includes('auto')) {
  segmentation = 'auto';
}

const session = new SpeechRecognitionSession({
  lang: 'zh-CN',
  interimResults: true,
  segmentation,
});
```

三种模式的含义如下：

| 模式 | 分段依据 |
| --- | --- |
| `auto` | 使用当前运行时或识别服务的默认分段策略。 |
| `vad` | 优先使用语音活动检测（Voice Activity Detection）识别说话后的连续静音，并以此确定语音边界。 |
| `semantic` | 优先根据识别内容的语义完整性确定句子边界。 |

`vad` 中的时间指“检测到语音后持续静音的时长”，不是从会话开始计算的绝对时间，也不是 `MediaRecorder.start(250)` 中的音频分片间隔。需要自定义时，把 `segmentation` 写成 `{ mode: 'vad', silenceDurationMs }`；`silenceDurationMs` 的单位是毫秒，并且必须是运行时通过 `vadSilenceDuration.minMs` 和 `maxMs` 声明的闭区间内的非负整数。如果 `vadSilenceDuration.supported` 为 `false`，可以继续使用字符串形式的 `'vad'`，但静音阈值由运行时或识别服务决定。

分段只决定识别结果何时成为一个最终句段，不会关闭 `audio` 流或结束会话。调用 `writer.close()` 仍然表示音频输入全部结束。省略 `segmentation` 时，运行时不会发送明确的分段模式；字符串形式仍然兼容，对象形式省略 `silenceDurationMs` 时也使用运行时默认阈值。

`silenceDurationMs` 只能与 `mode: 'vad'` 一起使用。值不是有限非负整数，或在其他模式中设置该字段时，构造函数会抛出 `RangeError` 或 `TypeError`。显式模式不在 `segmentationModes` 中、运行时不支持自定义 VAD 时间或没有声明有效范围时，首次 `writer.write()` 会以 `NotSupportedError` 拒绝；值超出运行时声明范围时则以 `RangeError` 拒绝。

## 更新 ASR 上下文

上下文用于告诉识别服务当前对话正在讨论什么。可以在写入第一段音频前设置初始上下文，也可以在识别过程中通过 `updateContext()` 替换上下文：

```javascript
const capabilities = await SpeechRecognitionSession.getCapabilities();
const session = new SpeechRecognitionSession({
  lang: 'zh-CN',
  audio: {
    mimeType: 'audio/pcm',
    sampleRate: 16000,
    channelCount: 1,
    sampleFormat: 's16',
  },
});

if (capabilities.contextUpdates) {
  await session.updateContext([
    { role: 'user', text: '我正在查询杭州明天的天气' },
    { role: 'assistant', text: '好的，我会关注杭州和明天这个时间范围' },
  ]);
}

const writer = session.audio.getWriter();
const firstPart = await fetch('/assets/question-1.pcm')
  .then((response) => response.arrayBuffer());
await writer.write(firstPart);

// 对话主题发生变化时，替换当前上下文。
if (capabilities.contextUpdates) {
  await session.updateContext([
    { role: 'user', text: '接下来改为查询上海的航班' },
    { role: 'assistant', text: '好的，请告诉我出发日期' },
  ]);
}

const secondPart = await fetch('/assets/question-2.pcm')
  .then((response) => response.arrayBuffer());
await writer.write(secondPart);
await writer.close();
```

每条消息的 `role` 只能是 `user` 或 `assistant`，`text` 不能为空。当前服务不支持更新上下文时，不要调用该方法。

## 适用场景

- 语音输入框
- 语音问答
- 语音控制命令
- 需要边听边处理的交互流程

## 事件处理建议

- 使用 `onresult` 接收识别结果。
- 使用 `onerror` 处理权限、设备或识别失败等异常情况。
- 使用 `onend` 感知本轮识别已经结束，并及时更新界面状态。

## 使用建议

- 开始识别前，先确保当前界面处于可交互状态。
- 把“正在聆听”“识别中”“识别完成”“识别失败”这些状态明确展示给用户。
- 不要在同一个实例上并发启动多轮识别请求。

## 继续阅读

- **[语音播报](/AIUI/api/ai-speech-synthesis)**：查看如何把文本结果播报给用户。
- **[大语言模型](/AIUI/api/ai-language-model)**：查看如何把识别文本继续交给模型处理。
- **[媒体采集](/AIUI/api/media-media-capture)**：查看麦克风、相机和 `MediaRecorder` 的完整用法。

当前不再要求独立的 `SPEECH_RECOGNITION` 权限。识别流程采集麦克风时，仍须声明 `RECORD_AUDIO` 并获得平台麦克风授权；外部音频会话本身不打开麦克风。

## API Reference

### `SpeechRecognition`

面向麦克风的语音识别对象，继承自 `EventTarget`。每次调用 `start()` 都会开始一个新的识别会话。

#### `new SpeechRecognition()`

创建一个尚未开始识别的对象。

#### `recognition.lang`

可读写的 `string`，表示请求的识别语言。空字符串表示使用运行时默认语言。

#### `recognition.continuous`

可读写的 `boolean`，表示是否在一条结果后继续识别；默认为 `false`。

#### `recognition.interimResults`

可读写的 `boolean`，表示是否请求可被后续结果修订的中间结果；默认为 `false`。

#### `recognition.maxAlternatives`

可读写的 `number`，表示每条结果请求的最大候选数；默认且最小为 `1`。

#### `recognition.start()`

请求麦克风权限并开始一轮识别。同一对象已处于 active 状态时再次调用会抛出 `InvalidStateError`。该方法必须在用户交互中调用。

```javascript
const recognition = new SpeechRecognition();
recognition.lang = 'zh-CN';
recognition.interimResults = true;
recognition.onresult = (event) => {
  const result = event.results[event.resultIndex];
  console.log(result[0].transcript, result.isFinal);
};
recognition.onerror = (event) => {
  console.error(event.error, event.message);
};

document.querySelector('#start').addEventListener('click', () => recognition.start());
```

#### `recognition.stop()`

停止录音并写入最后一个音频片段。识别会话会继续等待最终结果，然后结束。

```javascript
document.querySelector('#stop').addEventListener('click', () => recognition.stop());
recognition.onend = () => console.log('识别已结束');
```

#### `recognition.abort()`

停止采集、释放麦克风轨道，并立即中止当前会话，不等待最终结果。

```javascript
document.querySelector('#cancel').addEventListener('click', () => recognition.abort());
```

#### `start` / `audiostart` / `soundstart` / `speechstart` 事件

分别表示识别会话已开始、音频采集已开始、检测到声音和检测到语音。可通过同名 `on...` 属性或 `addEventListener()` 监听。

#### `result` 事件

传入 `SpeechRecognitionEvent`。`results` 是本轮会话的累计结果，`resultIndex` 指向本次事件中第一个变化的结果。

#### `nomatch` 事件

当识别音频无法匹配为可用结果时触发。

#### `error` 事件

传入 `SpeechRecognitionErrorEvent`，其 `error` 为稳定错误类别，`message` 为诊断信息，`sessionId` 用于关联当前会话。

#### `speechend` / `soundend` / `audioend` / `end` 事件

分别表示语音、声音、音频采集和整个识别会话结束。`end` 是恢复界面状态的最终生命周期信号。

### `SpeechRecognitionSession`

用于识别应用外部传入音频的一次性 ASR 会话，继承自 `EventTarget`。它不请求麦克风权限，也不创建录音器；每个识别任务应创建新实例。

#### `new SpeechRecognitionSession(options?)`

创建一个可写入音频的识别会话。常用选项包括：

| 选项 | 类型 | 说明 |
| --- | --- | --- |
| `lang` | `string` | 识别语言，例如 `zh-CN`。 |
| `interimResults` | `boolean` | 是否接收尚未最终确认的中间结果，默认 `false`。 |
| `maxAlternatives` | `number` | 每个结果最多返回多少个候选，默认且最小为 `1`。 |
| `phrases` | `SpeechRecognitionPhrase[]` | 自定义热词及可选权重。使用前检查 `capabilities.phrases`。 |
| `segmentation` | `SpeechRecognitionSegmentationMode \| SpeechRecognitionSegmentationOptions` | 可选的分段提示。支持原有字符串形式，也可使用对象形式设置 VAD 静音阈值；省略时不指定模式。 |
| `audio` | `SpeechRecognitionAudioOptions` | 输入音频格式。 |

**`SpeechRecognitionSegmentationMode`**

类型为 `'auto' | 'vad' | 'semantic'`。

**`SpeechRecognitionSegmentationOptions`**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `mode` | `SpeechRecognitionSegmentationMode` | 是 | 分段模式。使用前检查 `capabilities.segmentationModes`。 |
| `silenceDurationMs` | `number` | 否 | VAD 检测到语音后，结束句段所需的连续静音毫秒数。只能用于 `vad`，并且必须在运行时声明的范围内。 |

**`SpeechRecognitionPhrase`**

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `phrase` | `string` | 是 | 热词文本，不能为空。 |
| `boost` | `number` | 否 | 热词权重，默认 `1`。 |

**`SpeechRecognitionAudioOptions`**

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `mimeType` | `string` | 音频 MIME 类型，例如 `audio/pcm`。 |
| `sampleRate` | `number` | 采样率，例如 `16000`。 |
| `channelCount` | `number` | 声道数，例如单声道为 `1`。 |
| `sampleFormat` | `'s16' \| 'f32'` | PCM 采样格式。 |

#### `session.audio`

只读的 `WritableStream<Blob | ArrayBuffer | ArrayBufferView>`，用于按顺序写入音频。调用 `session.audio.getWriter()` 获得标准的 `WritableStreamDefaultWriter`；`writer` 不是 `SpeechRecognitionSession` 的属性，也不是语音识别专用类。

- `writer.write(audio)` 写入一个 `Blob`、`ArrayBuffer` 或 `ArrayBufferView`。应等待返回的 Promise，以遵守流的背压。
- `writer.close()` 表示所有音频已写入。运行时会等待待完成的写入和最终识别结果，然后结束会话。
- `writer.abort(reason?)` 丢弃未发送的输入并中止会话，不等待最终结果。

```javascript
const session = new SpeechRecognitionSession({
  audio: {
    mimeType: 'audio/pcm',
    sampleRate: 16000,
    channelCount: 1,
    sampleFormat: 's16',
  },
});

session.onresult = (event) => {
  const result = event.results[event.resultIndex];
  console.log(result[0].transcript, result.isFinal);
};
session.onerror = (event) => {
  console.error(event.error, event.message);
};

const writer = session.audio.getWriter();
try {
  const pcm = await fetch('/audio/input.pcm').then((response) => response.arrayBuffer());
  await writer.write(pcm);
  await writer.close();
} catch (error) {
  await writer.abort(error).catch(() => {});
}
```

`close()` 适用于正常完成输入；用户取消或无法继续提供音频时使用 `abort()`。`WritableStream`、writer 锁和背压的通用契约参见[数据流](/AIUI/api/network-streams)。

#### `session.state`

只读生命周期状态：`idle | opening | streaming | closing | closed | aborted | errored`。

#### `SpeechRecognitionSession.getCapabilities()`

```javascript
const capabilities = await SpeechRecognitionSession.getCapabilities();
```

返回 `Promise<SpeechRecognitionCapabilities>`。建议在创建会话前调用，按照实际支持情况选择音频格式、热词、上下文和分段方式。查询失败时 Promise 会拒绝。

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `audioFormats` | `SpeechRecognitionAudioFormatCapability[]` | 支持的音频格式及其采样率、声道数和采样格式。 |
| `maxChunkBytes` | `number` | 每个传输片段支持的最大字节数。写入更大的数据时，会自动拆分后发送。 |
| `interimResults` | `boolean` | 是否支持返回中间识别结果。 |
| `maxAlternatives` | `number` | 每个识别结果支持的最大候选数量。 |
| `phrases` | `boolean` | 是否支持 `phrases` 自定义热词。 |
| `contextUpdates` | `boolean` | 是否支持设置和更新 ASR 上下文。 |
| `segmentationModes` | `SpeechRecognitionSegmentationMode[]` | 运行时能够执行的音频分段方式。 |
| `vadSilenceDuration` | `{ supported: boolean; minMs?: number; maxMs?: number }` | 是否支持自定义 VAD 静音阈值及运行时接受的范围。 |

`vadSilenceDuration` 包含：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `supported` | `boolean` | 是否支持通过 `silenceDurationMs` 自定义 VAD 静音阈值。 |
| `minMs` | `number` | 可接受的最小毫秒数；仅在支持自定义并声明有效范围时存在。 |
| `maxMs` | `number` | 可接受的最大毫秒数；仅在支持自定义并声明有效范围时存在。 |

`audioFormats` 中的每一项包含：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `mimeType` | `string` | 支持的音频 MIME 类型。 |
| `sampleRates` | `number[]` | 支持的采样率；空数组表示不限制。 |
| `channelCounts` | `number[]` | 支持的声道数；空数组表示不限制。 |
| `sampleFormats` | `Array<'s16' \| 'f32'>` | 支持的 PCM 采样格式；空数组表示不限制。 |

#### `session.updateContext(messages)`

使用一组新的消息替换当前 ASR 上下文，返回 `Promise<void>`。

```javascript
await session.updateContext([
  { role: 'user', text: '帮我查一下明天的天气' },
  { role: 'assistant', text: '你想查哪座城市？' },
]);
```

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `messages` | `SpeechRecognitionContextMessage[]` | 按对话顺序排列的上下文消息。 |

| 消息字段 | 类型 | 说明 |
| --- | --- | --- |
| `role` | `'user' \| 'assistant'` | 消息角色，只支持这两个值。 |
| `text` | `string` | 消息内容，不能为空。 |

- 在首次写入音频前调用时，上下文会随会话一起开始。
- 在识别过程中调用时，会立即替换正在使用的上下文。
- `messages` 不是数组、角色不受支持或文本为空时，会抛出 `TypeError`。
- 在会话开始前调用时，方法会先保存上下文；如果服务不支持上下文，首次 `writer.write()` 会拒绝。
- 在识别过程中更新失败时，`updateContext()` 返回的 Promise 会拒绝。调用前应检查 `getCapabilities()` 返回的 `contextUpdates`。

**事件**

#### `start` / `audiostart` 事件

识别任务就绪后、流式结果开始前触发。

#### `result` 事件

传入 `SpeechRecognitionEvent`，携带累计结果和第一个变化位置 `resultIndex`。

#### `error` 事件

传入 `SpeechRecognitionErrorEvent`。这是识别服务异步失败的通道，不能只依赖 `writer.write()` 的 Promise 判断识别是否成功。

#### `audioend` / `end` 事件

正常结束、中止或失败进入终态时各触发一次。

### 结果与错误类型

#### `SpeechRecognitionAlternative`

一个候选结果，包含只读的 `transcript: string` 和 `confidence: number`。

#### `SpeechRecognitionResult`

类数组的候选列表，提供只读的 `length`、数字索引和 `isFinal`。`isFinal` 为 `true` 的结果不会再被修订。

#### `SpeechRecognitionResultList`

类数组的累计有序结果列表，提供只读的 `length` 和数字索引。

#### `SpeechRecognitionEvent`

继承自 `Event`，提供只读的 `resultIndex: number`、`results: SpeechRecognitionResultList` 和 `sessionId: string`。

#### `SpeechRecognitionErrorEvent`

继承自 `Event`，提供只读的 `error: string`、`message: string` 和 `sessionId: string`。
