# Speech Recognition

Speech recognition converts what the user says in real time into text. It is suitable for voice input, voice commands, hands-free input, and conversational interaction.

In AIUI, speech recognition is usually the first step in a voice interaction pipeline: user speech is recognized into text first, and then the text is passed to business logic or a large language model for further processing.

## Recognize a Voice Input

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
console.log('Recognition session:', sessionId);
```

<!-- /aiui-api-style -->

## Recognize the Current Microphone

`SpeechRecognitionSession` does not open the microphone directly. Get the current microphone first, then use `MediaRecorder` to write recorded chunks into the session. Declare recording permission in `app.json`:

```json
{
  "permissions": ["RECORD_AUDIO"]
}
```

The following page example selects an audio format supported by both recording and recognition, and also adds custom phrases and initial ASR context:

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
      throw new Error('Recording and recognition have no shared audio format');
    }

    const session = new SpeechRecognitionSession({
      lang: 'en-US',
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
        { role: 'user', text: 'I am asking about Rokid products by voice.' },
        { role: 'assistant', text: 'Please say the product name or question.' },
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

    // Start from a user click and produce an audio chunk every 250 ms.
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
<button bindtap="startMicrophoneRecognition">Start recognition</button>
<button bindtap="stopMicrophoneRecognition">Stop recognition</button>
```

`startMicrophoneRecognition()` must be triggered by a valid interaction such as a user click. On stop, wait for all recorded chunks before closing the writer. `writer.close()` tells the recognition service that audio has ended so it can produce a final result. Finally, call `stop()` on every microphone track to release the device.

## Recognize Existing or Incremental Audio

`SpeechRecognitionSession` does not open the microphone itself. Write a recording, an existing audio file, or incoming audio chunks to its `audio` stream:

```javascript
const session = new SpeechRecognitionSession({
  lang: 'en-US',
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

Each `write()` accepts a `Blob`, `ArrayBuffer`, or typed array. Calling `close()` means all audio has been written and allows recognition to produce its final result. Call `writer.abort()` to cancel.

Raw PCM input requires an explicit format:

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

## Add Custom Phrases

Custom phrases help the recognition service understand product names, people, places, and domain-specific vocabulary. Check `getCapabilities()` first, then pass `phrases` when creating the session:

```javascript
const capabilities = await SpeechRecognitionSession.getCapabilities();

const options = {
  lang: 'en-US',
  interimResults: true,
};

if (capabilities.phrases) {
  options.phrases = [
    { phrase: 'Rokid', boost: 5 },
    { phrase: 'AIUI', boost: 5 },
    { phrase: 'Lingban', boost: 3 },
  ];
}

const session = new SpeechRecognitionSession(options);
const writer = session.audio.getWriter();
const audio = await fetch('/assets/product-intro.wav')
  .then((response) => response.blob());

await writer.write(audio);
await writer.close();
```

`phrase` is the term to prioritize and must not be empty. `boost` is an optional weight that defaults to `1`; a higher value asks the recognition service to give the phrase more consideration. Support is reported by `capabilities.phrases`.

## Choose a Speech Segmentation Mode

`segmentation` hints how the recognition service should determine the boundary of each final result. Check `segmentationModes` and `vadSilenceDuration` first, then pass a mode and VAD silence threshold supported by the current service:

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
    // Use the runtime or recognition service's default VAD silence threshold.
    segmentation = 'vad';
  }
} else if (capabilities.segmentationModes.includes('auto')) {
  segmentation = 'auto';
}

const session = new SpeechRecognitionSession({
  lang: 'en-US',
  interimResults: true,
  segmentation,
});
```

The modes have the following meanings:

| Mode | Segmentation basis |
| --- | --- |
| `auto` | Uses the current runtime or recognition service's default segmentation strategy. |
| `vad` | Prefers voice activity detection (VAD), which detects continuous silence after speech to determine a speech boundary. |
| `semantic` | Prefers sentence boundaries based on whether the recognized content is semantically complete. |

For `vad`, time means the duration of continuous silence after speech is detected. It is not an absolute time measured from the start of the session, nor is it the audio chunk interval in `MediaRecorder.start(250)`. To customize it, use `{ mode: 'vad', silenceDurationMs }`. `silenceDurationMs` is measured in milliseconds and must be a non-negative integer inside the inclusive range advertised by `vadSilenceDuration.minMs` and `maxMs`. When `vadSilenceDuration.supported` is `false`, the string form `'vad'` remains available, but the runtime or recognition service chooses the threshold.

Segmentation only determines when a recognition result becomes a final segment. It does not close the `audio` stream or end the session; `writer.close()` still signals that all audio input has ended. When `segmentation` is omitted, the runtime sends no explicit segmentation mode. The string form remains backwards compatible, and an object without `silenceDurationMs` also uses the runtime's default threshold.

`silenceDurationMs` is valid only with `mode: 'vad'`. A value that is not a finite non-negative integer, or using the field with another mode, makes the constructor throw `RangeError` or `TypeError`. On the first `writer.write()`, an explicit mode outside `segmentationModes`, lack of custom VAD timing support, or a missing or invalid advertised range rejects with `NotSupportedError`; a value outside the advertised range rejects with `RangeError`.

## Update ASR Context

Context tells the recognition service what the current conversation is about. Set initial context before the first audio write, or replace it during recognition with `updateContext()`:

```javascript
const capabilities = await SpeechRecognitionSession.getCapabilities();
const session = new SpeechRecognitionSession({
  lang: 'en-US',
  audio: {
    mimeType: 'audio/pcm',
    sampleRate: 16000,
    channelCount: 1,
    sampleFormat: 's16',
  },
});

if (capabilities.contextUpdates) {
  await session.updateContext([
    { role: 'user', text: 'I am asking about tomorrow’s weather in Hangzhou.' },
    { role: 'assistant', text: 'I will focus on Hangzhou and tomorrow.' },
  ]);
}

const writer = session.audio.getWriter();
const firstPart = await fetch('/assets/question-1.pcm')
  .then((response) => response.arrayBuffer());
await writer.write(firstPart);

// Replace the context when the conversation changes.
if (capabilities.contextUpdates) {
  await session.updateContext([
    { role: 'user', text: 'Now I want to check flights from Shanghai.' },
    { role: 'assistant', text: 'What is your departure date?' },
  ]);
}

const secondPart = await fetch('/assets/question-2.pcm')
  .then((response) => response.arrayBuffer());
await writer.write(secondPart);
await writer.close();
```

Each message must use `user` or `assistant` as its `role`, and `text` must not be empty. Do not call this method when the current service does not support context updates.

## Use Cases

- Voice input fields
- Voice Q&A
- Voice control commands
- Interaction flows that need to listen and process at the same time

## Event Handling Recommendations

- Use `onresult` to receive recognition results.
- Use `onerror` to handle exceptions such as permission issues, device problems, or recognition failures.
- Use `onend` to know when the current recognition session has ended and update the UI state in time.

## Recommendations

- Before starting recognition, make sure the current screen is ready for interaction.
- Clearly present states such as "listening", "recognizing", "recognition complete", and "recognition failed" to users.
- Do not start multiple recognition sessions concurrently on the same instance.

## Read Next

- **[Speech Synthesis](/AIUI/api/ai-speech-synthesis)**: Learn how to speak text results to the user.
- **[Large Language Model](/AIUI/api/ai-language-model)**: Learn how to pass recognized text to the model for further processing.
- **[Media Capture](/AIUI/api/media-media-capture)**: See complete microphone, camera, and `MediaRecorder` usage.

A separate `SPEECH_RECOGNITION` permission is no longer required. Microphone capture still requires `RECORD_AUDIO` and platform microphone authorization; external-audio sessions do not open the microphone themselves.

## API Reference

### `SpeechRecognition`

A microphone-oriented speech recognition object that inherits from `EventTarget`. Each `start()` call begins a new recognition session.

#### `new SpeechRecognition()`

Creates a recognition object that has not started listening.

#### `recognition.lang`

A writable `string` containing the requested recognition language. An empty string uses the runtime's default language.

#### `recognition.continuous`

A writable `boolean` that controls whether recognition continues after one result. It defaults to `false`.

#### `recognition.interimResults`

A writable `boolean` that controls whether revisable interim results are requested. It defaults to `false`.

#### `recognition.maxAlternatives`

A writable `number` containing the requested maximum alternatives per result. Its default and minimum are `1`.

#### `recognition.start()`

Requests microphone access and begins one recognition session. Calling it again while the same object is active throws `InvalidStateError`. This method must be called during a user interaction.

```javascript
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';
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

Stops recording and writes the final audio chunk. The recognition session continues until it delivers final results and ends.

```javascript
document.querySelector('#stop').addEventListener('click', () => recognition.stop());
recognition.onend = () => console.log('Recognition ended');
```

#### `recognition.abort()`

Stops capture, releases the microphone tracks, and aborts the active session without waiting for a final result.

```javascript
document.querySelector('#cancel').addEventListener('click', () => recognition.abort());
```

#### `start` / `audiostart` / `soundstart` / `speechstart` events

Indicate that the recognition session, audio capture, detected sound, and detected speech have started, respectively. Listen through the matching `on...` properties or `addEventListener()`.

#### `result` event

Provides a `SpeechRecognitionEvent`. `results` contains the cumulative results for this session, and `resultIndex` identifies the first result changed by this event.

#### `nomatch` event

Fires when recognized audio cannot be matched to a useful result.

#### `error` event

Provides a `SpeechRecognitionErrorEvent`. Its `error` is a stable error category, `message` contains diagnostic text, and `sessionId` correlates the failure with the current session.

#### `speechend` / `soundend` / `audioend` / `end` events

Indicate the end of speech, sound, audio capture, and the complete recognition session, respectively. Use `end` as the final lifecycle signal for restoring UI state.

### `SpeechRecognitionSession`

A one-shot ASR session for application-provided audio that inherits from `EventTarget`. It does not request microphone permission or create a recorder. Create a new instance for every recognition task.

#### `new SpeechRecognitionSession(options?)`

Creates a recognition session with a writable audio stream. Common options include:

| Option | Type | Description |
| --- | --- | --- |
| `lang` | `string` | Recognition language, such as `en-US`. |
| `interimResults` | `boolean` | Whether unconfirmed interim results are reported. Defaults to `false`. |
| `maxAlternatives` | `number` | Maximum alternatives returned for each result. The default and minimum are `1`. |
| `phrases` | `SpeechRecognitionPhrase[]` | Custom phrases and optional weights. Check `capabilities.phrases` first. |
| `segmentation` | `SpeechRecognitionSegmentationMode \| SpeechRecognitionSegmentationOptions` | Optional segmentation hint. It accepts the existing string form or an object that configures the VAD silence threshold. Omit it to leave the mode unspecified. |
| `audio` | `SpeechRecognitionAudioOptions` | Input audio format. |

**`SpeechRecognitionSegmentationMode`**

The type is `'auto' | 'vad' | 'semantic'`.

**`SpeechRecognitionSegmentationOptions`**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `mode` | `SpeechRecognitionSegmentationMode` | Yes | Segmentation mode. Check `capabilities.segmentationModes` first. |
| `silenceDurationMs` | `number` | No | Milliseconds of continuous silence after detected speech that end a VAD segment. Valid only for `vad` and must be inside the runtime-advertised range. |

**`SpeechRecognitionPhrase`**

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `phrase` | `string` | Yes | Phrase text; it must not be empty. |
| `boost` | `number` | No | Phrase weight. Defaults to `1`. |

**`SpeechRecognitionAudioOptions`**

| Field | Type | Description |
| --- | --- | --- |
| `mimeType` | `string` | Audio MIME type, such as `audio/pcm`. |
| `sampleRate` | `number` | Sample rate, such as `16000`. |
| `channelCount` | `number` | Channel count; use `1` for mono. |
| `sampleFormat` | `'s16' \| 'f32'` | PCM sample format. |

#### `session.audio`

A read-only `WritableStream<Blob | ArrayBuffer | ArrayBufferView>` for ordered audio input. Call `session.audio.getWriter()` to obtain a standard `WritableStreamDefaultWriter`. The `writer` is neither a `SpeechRecognitionSession` property nor a speech-recognition-specific class.

- `writer.write(audio)` writes a `Blob`, `ArrayBuffer`, or `ArrayBufferView`. Await its Promise to respect stream backpressure.
- `writer.close()` signals that all audio has been written. The runtime waits for pending writes and final recognition results before ending the session.
- `writer.abort(reason?)` discards unsent input and aborts the session without waiting for final results.

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

Use `close()` for normal input completion. Use `abort()` when the user cancels or the application cannot continue providing audio. See [Streams](/AIUI/api/network-streams) for the general `WritableStream`, writer-lock, and backpressure contracts.

#### `session.state`

The read-only lifecycle state: `idle | opening | streaming | closing | closed | aborted | errored`.

#### `SpeechRecognitionSession.getCapabilities()`

```javascript
const capabilities = await SpeechRecognitionSession.getCapabilities();
```

Returns `Promise<SpeechRecognitionCapabilities>`. Call it before creating a session to choose supported audio, phrase, context, and segmentation options. The Promise rejects if capabilities cannot be queried.

| Property | Type | Description |
| --- | --- | --- |
| `audioFormats` | `SpeechRecognitionAudioFormatCapability[]` | Supported audio formats and their sample rates, channel counts, and sample formats. |
| `maxChunkBytes` | `number` | Maximum bytes in each transmitted part. Larger writes are split automatically. |
| `interimResults` | `boolean` | Whether interim recognition results are supported. |
| `maxAlternatives` | `number` | Maximum alternatives supported for each result. |
| `phrases` | `boolean` | Whether custom `phrases` are supported. |
| `contextUpdates` | `boolean` | Whether ASR context can be set and updated. |
| `segmentationModes` | `SpeechRecognitionSegmentationMode[]` | Audio segmentation modes the runtime can honor. |
| `vadSilenceDuration` | `{ supported: boolean; minMs?: number; maxMs?: number }` | Whether a custom VAD silence threshold is supported and the range accepted by the runtime. |

`vadSilenceDuration` contains:

| Property | Type | Description |
| --- | --- | --- |
| `supported` | `boolean` | Whether `silenceDurationMs` can customize the VAD silence threshold. |
| `minMs` | `number` | Minimum accepted milliseconds. Present only when customization is supported and a valid range is advertised. |
| `maxMs` | `number` | Maximum accepted milliseconds. Present only when customization is supported and a valid range is advertised. |

Each item in `audioFormats` contains:

| Property | Type | Description |
| --- | --- | --- |
| `mimeType` | `string` | Supported audio MIME type. |
| `sampleRates` | `number[]` | Supported sample rates; an empty array means unrestricted. |
| `channelCounts` | `number[]` | Supported channel counts; an empty array means unrestricted. |
| `sampleFormats` | `Array<'s16' \| 'f32'>` | Supported PCM sample formats; an empty array means unrestricted. |

#### `session.updateContext(messages)`

Replaces the current ASR context with a new list of messages and returns `Promise<void>`.

```javascript
await session.updateContext([
  { role: 'user', text: 'What will the weather be tomorrow?' },
  { role: 'assistant', text: 'Which city should I check?' },
]);
```

| Parameter | Type | Description |
| --- | --- | --- |
| `messages` | `SpeechRecognitionContextMessage[]` | Context messages in conversation order. |

| Message field | Type | Description |
| --- | --- | --- |
| `role` | `'user' \| 'assistant'` | Message role. No other values are accepted. |
| `text` | `string` | Message text. It must not be empty. |

- Before the first audio write, the context is included when the session starts.
- During recognition, the active context is replaced immediately.
- A non-array value, unsupported role, or empty text throws a `TypeError`.
- Before the session starts, the method stores the context first. If context is unsupported, the first `writer.write()` rejects.
- During recognition, the Promise returned by `updateContext()` rejects when the update fails. Check `contextUpdates` from `getCapabilities()` first.

**Events**

#### `start` / `audiostart` events

Fire after the recognition task is ready and before streaming results begin.

#### `result` event

Provides a `SpeechRecognitionEvent` with cumulative results and the first changed position in `resultIndex`.

#### `error` event

Provides a `SpeechRecognitionErrorEvent`. This is the channel for asynchronous recognition-service failures; do not rely only on the Promise returned by `writer.write()` to determine whether recognition succeeded.

#### `audioend` / `end` events

Each fires once when normal completion, abort, or failure reaches its terminal path.

### Result and error types

#### `SpeechRecognitionAlternative`

One candidate result with read-only `transcript: string` and `confidence: number` properties.

#### `SpeechRecognitionResult`

An array-like list of alternatives with read-only `length`, numeric indexes, and `isFinal`. A result whose `isFinal` is `true` is never revised.

#### `SpeechRecognitionResultList`

An array-like cumulative ordered result list with read-only `length` and numeric indexes.

#### `SpeechRecognitionEvent`

Extends `Event` and exposes read-only `resultIndex: number`, `results: SpeechRecognitionResultList`, and `sessionId: string` properties.

#### `SpeechRecognitionErrorEvent`

Extends `Event` and exposes read-only `error: string`, `message: string`, and `sessionId: string` properties.
