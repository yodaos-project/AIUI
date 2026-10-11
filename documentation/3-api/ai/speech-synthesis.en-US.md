# Speech Synthesis

Speech synthesis converts text into spoken output. It is well suited for welcome messages, spoken replies, navigation prompts, status reminders, and similar scenarios. AIUI provides two independent methods: `speechSynthesis.speak()` generates and plays speech directly, with all `speak()` requests sharing a runtime-managed speech player; `speechSynthesis.synthesize()` only creates a generation task and does not play it automatically, leaving playback timing and state to a caller-created `SpeechAudioPlayer`.

In AIUI, speech synthesis is typically used at the output stage of a workflow. Use `speak()` when the result only needs to be read aloud. Use `synthesize()` when you need subtitles, audio chunks, or independent playback control. Calling either method does not automatically call the other.

## Speak a Text Response

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

`speak()` immediately enters the direct-playback flow and does not return a generation task or an independent player. Multiple calls share one speech player, and `mode` determines whether a request joins the shared queue or plays immediately.

## Select a Voice

Both `speechSynthesis.speak()` and `speechSynthesis.synthesize()` use `SpeechSynthesisUtterance` as the speech-synthesis request. See the API Reference below for the support status of each property. Set a voice ID through `voice`, then choose one method based on whether you need independent playback control. The following blocks show alternative workflows, not steps that must run in sequence:

```javascript
// Path 1: play directly through the shared speak() player
const spokenUtterance = new SpeechSynthesisUtterance('Welcome to AIUI');
spokenUtterance.voice = 'English_radiant_girl';
speechSynthesis.speak(spokenUtterance, 'enqueue');
```

```javascript
// Path 2: create a task, then control an independent player
const generatedUtterance = new SpeechSynthesisUtterance('Welcome to AIUI');
generatedUtterance.voice = 'English_radiant_girl';

const task = await speechSynthesis.synthesize(generatedUtterance, {
  subtitles: 'word',
});
const player = new SpeechAudioPlayer(task);
player.play();
```

## Generate Audio and Synchronized Subtitles

To separate generation from playback, create a task with `synthesize()` and play it through `SpeechAudioPlayer`. `synthesize()` itself only starts generation; it does not enter the shared player or playback queue used by `speak()`:

```javascript
const utterance = new SpeechSynthesisUtterance('Welcome to AIUI');
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

`preferredFormat` is only a preference hint. Always use `task.audioConfig.format` as the actual format.

## Choose Between `speak()` and `synthesize()`

Both methods accept a `SpeechSynthesisUtterance`, but they differ in who owns the generated result and how playback is controlled:

| Comparison | `speak()` | `synthesize()` |
| --- | --- | --- |
| Primary responsibility | Generate speech and play it directly | Create a generation task without playing it automatically |
| Return value | `void`; no task or player is exposed | `Promise<SpeechSynthesisTask>` |
| Player | All calls share the runtime-managed speech player | The caller can create an independent `SpeechAudioPlayer` for the task |
| Playback control | Use `mode` to enqueue or play immediately | Use the player to play, pause, stop, and seek |
| Subtitles and chunks | Not exposed to the caller | Exposes audio chunks, subtitle cues, and task events |
| Best for | Welcome messages, prompts, and ordinary replies that only need direct playback | Synchronized subtitles, custom playback UI, streaming processing, task cancellation, or independent playback control |

The methods do not share task state: a task created by `synthesize()` does not join the shared `speak()` playback queue, and `speak()` does not return a task that can be passed to `SpeechAudioPlayer`. Calling both methods for the same text starts two independent speech-generation requests.

## Recommendations

- Keep spoken text short enough to be understood in a single listen, rather than reading long paragraphs directly.
- Prefer `speak()` for direct playback. Use `synthesize()` only when you need subtitles, chunks, or independent playback control.
- For multiple consecutive replies, control the playback rhythm at the business layer to avoid overwhelming users with too much simultaneous voice output.
- Use different wording lengths and tones for important prompts versus ordinary prompts.

## Current Capability Scope

- [x] Play directly through the shared `speechSynthesis.speak()` player and use `mode` to enqueue or play immediately.
- [x] Independently generate tasks, audio chunks, and subtitle cues through `speechSynthesis.synthesize()`, then optionally play them through `SpeechAudioPlayer`.
- [x] Properties on `SpeechSynthesisUtterance` are used by both `speak()` and `synthesize()`.
- [x] `volume` accepts integers from `0` to `10` and defaults to `1`.
- [ ] `lang` is not currently supported. Setting it does not change the language used for speech generation.
- [ ] `cancel()`, `pause()`, `resume()`, `getVoices()`, and the full utterance lifecycle events are not exposed yet.

## Read Next

- **[Speech Recognition](/AIUI/api/ai-speech-recognition)**: Learn how to convert user speech into text.
- **[Large Language Model](/AIUI/api/ai-language-model)**: Learn how to generate reply content that can be spoken aloud.

`SpeechAudioPlayer.textTrack` cues retain identity across lists and ID lookup. Keep a cue object to edit it or remove it by identity. See [AudioPlayer](/AIUI/api/media-audio-player) for the full text-track API.

## API Reference

### Entry Point

Speech synthesis is based on the global `speechSynthesis` object and `SpeechSynthesisUtterance`. `speak()` is the direct-playback entry point:

```javascript
const spokenUtterance = new SpeechSynthesisUtterance('Welcome to AIUI');
speechSynthesis.speak(spokenUtterance, 'enqueue');
```

`synthesize()` is the independent task-generation entry point:

```javascript
const generatedUtterance = new SpeechSynthesisUtterance('Welcome to AIUI');
const task = await speechSynthesis.synthesize(generatedUtterance);
const player = new SpeechAudioPlayer(task);
player.play();
```

These entry points represent different workflows. Choose one based on whether you need an independent task and playback controls instead of calling both in sequence for one playback operation.

`SpeechSynthesisUtterance` can also be used through the built-in `speech` module.

### `SpeechSynthesisUtterance`

`SpeechSynthesisUtterance` is a mutable speech-synthesis request object. Both `speechSynthesis.speak()` and `speechSynthesis.synthesize()` accept this object and handle its currently supported properties consistently.

#### `new SpeechSynthesisUtterance(text?)`

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `text` | `string` | No | Initial text to speak; defaults to `''`. |

#### `utterance.text`

Writable `string`, defaulting to an empty string. Create an empty request and set text later.

#### `utterance.lang`

Writable `string`, defaulting to `'en-US'`; the current speech service does not use it to switch languages.

#### `utterance.pitch`

Writable `number`, defaulting to `1`; adjustment support depends on the speech service.

#### `utterance.rate`

Writable `number`, defaulting to `1`; adjustment support depends on the speech service.

#### `utterance.volume`

Writable `number`, defaulting to `1`. Fractional values are retained rather than converted to integers on assignment. Audible volume depends on the speech service.

#### `utterance.voice`

Writable `string | null`, defaulting to `null` to select the default voice.

**Available voices**

| Voice ID | Voice type | Recommended use |
| --- | --- | --- |
| `female-tianmei` | Sweet Mandarin female voice | Short Mandarin text with `tts_streaming` |
| `English_radiant_girl` | Energetic English female voice | Short English text with `tts_streaming` |
| `English_expressive_narrator` | Expressive English narrator | Long English text with `tts_streaming` |
| `male-qn-qingse` | Young Mandarin male voice | The runtime's current default voice and general conversation |
| `male-qn-jingying` | Mature Mandarin male voice | Business content and assistant announcements |
| `female-yujie` | Mature Mandarin female voice | Brand introductions and content narration |
| `Chinese (Mandarin)_News_Anchor` | Mandarin female news voice | News and informational announcements |
| `Chinese (Mandarin)_Radio_Host` | Mandarin male radio voice | Long-form text and stories |
| `clever_boy` | Mandarin boy voice | Children's content |
| `lovely_girl` | Mandarin girl voice | Children's content |
| `English_Trustworthy_Man` | Trustworthy English male voice | English assistants and business content |

### Methods

#### `speechSynthesis.speak(utterance, mode?)`

`speak()` generates and directly plays speech using the current properties of `utterance`. It returns `void`. All `speak()` calls share one runtime-managed speech player and playback queue; that player is not exposed as an object to the caller.

- `utterance`: A `SpeechSynthesisUtterance` instance. At present, playback is mainly initiated using its text content.
- `mode`: Optional playback mode. Supported values are:
  - `'enqueue'`: Append the current playback request to the queue.
  - `'immediate'`: Play the current utterance immediately.

If `mode` is omitted, it defaults to `'enqueue'`, which appends the current playback request to the queue.

`speak()` does not create a `SpeechSynthesisTask` and does not use the independently controlled playback flow provided by a caller-created `SpeechAudioPlayer`.

#### `speechSynthesis.synthesize(utterance, options?)`

Creates an independent streaming speech-generation task without starting playback automatically. Returns `Promise<SpeechSynthesisTask>`. The task does not enter the shared player or playback queue used by `speak()`. To play it, create a `SpeechAudioPlayer` for the task and control playback explicitly.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `utterance` | `SpeechSynthesisUtterance` | Yes | Speech request to synthesize. |
| `options.subtitles` | `'none' \| 'sentence' \| 'word'` | No | Subtitle-cue granularity. |
| `options.audio.preferredFormat` | `'pcm' \| 'mp3' \| 'ogg_opus'` | No | Preferred output audio format. |
| `options.audio.sampleRate` | `number` | No | Preferred sample rate. |
| `options.audio.channels` | `1 \| 2` | No | Preferred channel count. |
| `options.audio.bitrate` | `number` | No | Preferred bitrate. |
| `options.signal` | `AbortSignal` | No | Signal used to cancel generation. |

### `SpeechSynthesisTask`

| Member | Type | Description |
| --- | --- | --- |
| `id` | `string` | Task identifier. |
| `state` | `'running' \| 'completed' \| 'aborted' \| 'errored'` | Current task state. |
| `audioConfig` | `SpeechSynthesisAudioConfig` | Actual generated format, sample rate, channels, sample format, and MIME type. |
| `language` | `string` | Actual language. |
| `granularity` | `'none' \| 'sentence' \| 'word'` | Actual subtitle granularity. |
| `finished` | `Promise<{ duration: number }>` | Resolves when the task finishes. |
| `abort()` | `void` | Aborts generation. |

The task dispatches `chunk`, `end`, `error`, and `abort` events and exposes the matching `onchunk`, `onend`, `onerror`, and `onabort` properties. A `chunk` event contains `audio: Uint8Array` and `cues: readonly SpeechSynthesisCue[]`.

### `new SpeechAudioPlayer(task, options?)`

Creates an independent player that consumes the specified `SpeechSynthesisTask`. It is only used with tasks from `synthesize()` and neither represents nor controls the shared speech player inside `speak()`. `options.trackMode` can be `'hidden'` or `'showing'`.

| Member | Type | Description |
| --- | --- | --- |
| `audioPlayer` | `AudioPlayer` | Underlying audio player. |
| `textTrack` | `TextTrack` | Subtitle track updated from generated cues. |
| `activeCue` | `VTTCue \| null` | Currently active subtitle cue. |
| `currentTime` / `duration` | `number` | Current playback time and duration. |
| `paused` | `boolean` | Whether playback is paused. |
| `play()` / `pause()` / `stop()` | `void` | Controls playback state. |
| `seek(position)` | `void` | Seeks to a time in seconds. |
| `destroy()` | `void` | Releases player resources. |
