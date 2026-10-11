# Audio Playback

Audio playback is intended for background music, complete voice clips, local audio files, and audio data that arrives over time. AIUI provides regular file playback and streaming playback through `AudioPlayer`.

> **When should you choose audio processing?**
> [`AudioContext`](/AIUI/api/media-web-audio) is intended for generating sound, processing PCM, applying filters, and analysing audio. For ordinary file playback, `AudioPlayer` is simpler and can use the runtime's file playback path.
>
> Use the audio playback capability described on this page for ordinary audio files. Choose [Audio Processing (Web Audio)](/AIUI/api/media-web-audio) when real-time processing is required.

## File Playback

If you need to play a complete audio file, prefer file playback mode. This path is better suited for background music, complete voice clips, or local audio assets that already exist as files.

- Use `src` with a local path or a network URL.
- A local path can be either a relative path or a project-root absolute path, for example `/assets/intro.ogg`.
- For a local `.ogg` file, you can assign it directly to `src`.
- If you already have the full binary payload, you can also call `setBuffer(data, hint)` once. For local `.ogg` data, pass `hint = "ogg"`.

### Example: Play a File with `src`

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

### Example: Play Local Ogg Data with `setBuffer()`

```javascript
import introOgg from '../assets/intro.ogg';

const player = new AudioPlayer();
const bytes = new Uint8Array(await introOgg.arrayBuffer());

player.setBuffer(bytes, 'ogg');
player.play();
```

## Streaming Playback

If audio data arrives progressively, such as in real-time TTS, chunked decoding, or server-side streaming, use streaming playback mode.

- Streaming playback requires an `options` object in the constructor and an explicit `format`.
- To append PCM data, set `format: 'pcm'`.
- To play an Opus stream inside an Ogg container, set `format: 'ogg_opus'`.
- Append chunks with `append()` and call `finish()` when the stream ends.

### Example: Stream PCM Data

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

### Example: Stream Ogg/Opus Data

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

## Add subtitles and retain cue objects

```javascript
const player = new AudioPlayer();
const track = player.addTextTrack('subtitles', 'Subtitles', 'en-US');
track.mode = 'hidden';
const cue = new VTTCue(0, 2, 'Welcome to AIUI');
cue.id = 'greeting';
track.addCue(cue);
console.log(track.cues.item(0) === cue); // true
console.log(track.cues.getCueById('greeting') === cue); // true
track.addEventListener('cuechange', () => {
  console.log(track.activeCues.item(0)?.text ?? '');
});
```

The same cue preserves its identity across `cues`, `activeCues`, and `getCueById()`. Modify its text or times after reading it, and pass that same object to `removeCue()`. Generated subtitles on `SpeechAudioPlayer` follow the same rule; see [Speech synthesis](/AIUI/api/ai-speech-synthesis).

## API Reference

### Constructor

```javascript
new AudioPlayer(options)
```

- `options`: Optional configuration object forwarded to the underlying audio runtime, including parameters such as `audio_setting`.
- Streaming mode is enabled only when `options` is provided.
- In streaming mode, you must explicitly declare `options.format`. The current documentation covers `pcm` and `ogg_opus`.

### Supported Formats

The current documentation explicitly covers these `AudioPlayer` format and input paths:

- `format: 'pcm'`: Used by `append()` for raw PCM chunks.
- `format: 'ogg_opus'`: Used by `append()` for Opus audio packed in an Ogg container.
- `hint: 'ogg'`: Used by `setBuffer()` as a format hint for local `.ogg` resources.
- Local `.ogg` files: Supported through `src` or `setBuffer()` for local Ogg/Opus playback.

#### Streaming Format Notes

- `append()` is currently documented only for `pcm` and `ogg_opus` streaming input.
- When using `format: 'ogg_opus'`, the first appended bytes must include the standard Ogg headers such as `OpusHead` and `OpusTags` so the runtime can initialize the decoder.
- In streaming mode, you must explicitly declare `format`; do not rely on an implicit default.

### Properties

#### `src`
- **Type**: `String`
- **Description**: The URL or path of the audio resource. Supports local paths and network URLs. Local paths can be either relative paths or project-root absolute paths such as `/assets/music.mp3`. The current documentation also explicitly covers local `.ogg` resource paths.
- **Example**: `player.src = "/assets/music.mp3";`

#### `startTime`
- **Type**: `Number`
- **Description**: The start playback position in seconds. Defaults to `0`.

#### `autoplay`
- **Type**: `Boolean`
- **Description**: Whether playback starts automatically after `src` is set. The default value is `false`.

#### `loop`
- **Type**: `Boolean`
- **Description**: Whether to loop the current audio. The default value is `false`.

#### `volume`
- **Type**: `Number`
- **Description**: Playback volume, ranging from `0.0` (mute) to `1.0` (maximum volume).

#### `duration`
- **Type**: `Number` (read-only)
- **Description**: The total duration of the audio in seconds. Before metadata is loaded, this value is `0`.

#### `sampleRate`
- **Type**: `Number` (read-only)
- **Description**: The audio sample rate, such as `44100`.

#### `channels`
- **Type**: `Number` (read-only)
- **Description**: The number of audio channels.

#### `currentTime`
- **Type**: `Number`
- **Description**: The current playback position in seconds. Setting this value seeks the player to the specified position.

Assigning `currentTime` performs a real seek rather than only changing the reported value. Use the player’s seek events when UI work depends on completion; the seekable range of streamed resources still depends on the player and source.

#### `paused`
- **Type**: `Boolean` (read-only)
- **Description**: Whether the player is currently paused.

#### `buffered`
- **Type**: `Number` (read-only)
- **Description**: The buffered audio duration in seconds.

### Methods

#### `play()`
- **Description**: Starts audio playback. If the audio is paused, playback resumes from the current position.

#### `pause()`
- **Description**: Pauses current audio playback.

#### `stop()`
- **Description**: Stops playback and resets the playback position to the initial state.

#### `append(buffer)`
- **Parameters**: `buffer` (`ArrayBuffer` | `TypedArray`)
- **Description**: Appends streaming audio data to the player. The current documentation explicitly covers raw PCM data and Ogg/Opus byte streams.

#### `finish()`
- **Description**: Marks the end of streaming audio data appending. After this call, the player enters the `ended` state after the remaining buffered data finishes playing.

#### `seek(position)`
- **Parameters**: `position` (`Number`) - Target position in seconds
- **Description**: Seeks playback to the specified time position.

#### `setBuffer(data, hint)`
- **Parameters**:
  - `data` (`ArrayBuffer` | `TypedArray`) - Complete audio data.
  - `hint` (`String`, optional) - Format hint. For a local `.ogg` resource, pass `"ogg"`.
- **Description**: Directly sets the player's audio data buffer. The current documentation explicitly covers local Ogg/Opus playback through `hint = "ogg"`.

#### `destroy()`
- **Description**: Destroys the player instance and releases the underlying decoder and related hardware resources. The instance is no longer usable after this call.

### Event Listeners

AudioPlayer provides a set of listener methods to respond to playback state changes:

#### Playback State Events
- **`onCanplay(callback)`**: Triggered when enough audio data is loaded to begin playback.
- **`onPlay(callback)`**: Triggered when `play()` is called or when playback starts because `autoplay` takes effect.
- **`onPause(callback)`**: Triggered when playback is paused by calling `pause()`.
- **`onStop(callback)`**: Triggered when playback is stopped by calling `stop()`.
- **`onEnded(callback)`**: Triggered when audio playback reaches the end.

#### Progress and Interaction Events
- **`onTimeUpdate(callback)`**: Triggered continuously when the playback position changes, usually multiple times per second.
- **`onSeeking(callback)`**: Triggered when a seek operation starts.
- **`onSeeked(callback)`**: Triggered when a seek operation completes and the audio is ready to continue playing.

#### Error and Buffering Events
- **`onError(callback)`**: Triggered when a decoding error, network error, or missing resource occurs during playback.
- **`onWaiting(callback)`**: Triggered when network loading cannot keep up with playback speed, causing playback to pause and enter a buffering state.

#### Remove Listeners
- Each `onXxx` method has a corresponding `offXxx([callback])` method for removing a specific callback or clearing all listeners.
- **Example**: `player.offPlay(myPlayCallback);` or `player.offPlay();` (removes all play listeners)

### `AudioPlayer`

#### `player.textTracks`

Read-only `TextTrackList` containing the player’s text tracks.

#### `player.addTextTrack(kind, label?, language?)`

Returns a new `TextTrack`. Optional label / language default to empty strings. Direct `new TextTrack()` construction is unsupported.

### `TextTrack`

#### `track.id`

Read-only track ID string.

#### `track.kind`

Read-only track kind string.

#### `track.label`

Read-only track label string.

#### `track.language`

Read-only language string.

#### `track.mode`

Writable: `disabled`, `hidden`, or `showing`. Use `hidden` to track active cues without requiring automatic subtitle display.

#### `track.cues`

Read-only `TextTrackCueList` of all cues. Queries preserve cue object identity.

#### `track.activeCues`

Read-only `TextTrackCueList` containing cues active at the current time.

#### `track.addCue(cue)`

Adds a `VTTCue`, returning `undefined`. A cue already owned by a track cannot be added again.

#### `track.removeCue(cue)`

Removes a cue by identity, returning `undefined`; throws `NotFoundError` if it does not belong to this track.

#### `cuechange / track.oncuechange`

Fires when the active cue set changes; use `addEventListener()` or `oncuechange`.

### `TextTrackCueList`

#### `list.length`

Read-only cue count.

#### `list.item(index)`

Returns the `VTTCue` at the index, or `null` out of range.

#### `list.getCueById(id)`

Returns the `VTTCue` matching an ID, or `null` if absent.

### `TextTrackList`

#### `list.length`

Read-only track count.

#### `list.item(index)`

Returns the `TextTrack` at the index, or `null` out of range.

#### `list.getTrackById(id)`

Returns the `TextTrack` matching an ID, or `null` if absent.

### `VTTCue`

#### `new VTTCue(startTime, endTime, text)`

Times are finite, nonnegative seconds, with endTime at least startTime.

#### `cue.id`

Writable ID string, defaulting to an empty string.

#### `cue.startTime`

Writable start time in seconds.

#### `cue.endTime`

Writable end time in seconds.

#### `cue.text`

Writable subtitle text; later list queries return the same object.

#### `cue.charIndex`

Read-only source-text start index, possibly `null`; primarily for generated speech subtitles.

#### `cue.charLength`

Read-only source-text length, possibly `null`.

#### `cue.pauseOnExit`

Writable `boolean`, defaulting to `false`. Currently stores the flag without automatically pausing playback; call `pause()` from application cue-change logic when needed.
