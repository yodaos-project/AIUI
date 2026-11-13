# Realtime Voice Intelligence

A conversation assistant sample: while you talk with others, it keeps listening, transcribes each utterance, and quietly streams in explanations, references, and suggestions.

Pipeline: **Audio → VAD → Streaming ASR → Prompt → LLM → UI**. The mic stream is encoded to Ogg/Opus by the native recorder, `SpeechRecognitionSession` segments it by VAD silence, and each finalized transcript is prepended with the selected prompt and streamed to `LanguageModel`. UI text follows `navigator.languages` (zh-CN / zh-TW / en-US, `lib/i18n.js`).

## Pages

- **Home (`pages/prompt-list`, entry)** — menu (start session / new prompt / edit prompt) plus a card for the current prompt with its mic mode and ignore-irrelevant settings. Arrows move the cursor, Enter confirms.
- **Prompt select (`pages/prompt-select`)** — prompts ordered by last use, "in use" badge on the active one; Enter opens the editor.
- **Prompt edit (`pages/prompt-edit`)** — sentence-by-sentence dictation (interim results live, fixed wearer mic); per-prompt settings row: mic-mode entry + ignore-irrelevant toggle.
- **Mic mode (`pages/mic-mode`)** — far-field / omnidirectional / wearer / system audio (phone media), each with a one-line description; saved with the prompt, default far-field.
- **Realtime (`pages/realtime`)** — listens with the prompt's mic mode; every VAD segment goes to the LLM as one turn. Bottom single-line rolling transcript, latest two AI replies above. Enter exits.

## Code structure

- `lib/asr.js` — one ASR pipeline, two modes:
  - **Dictation** (prompt editor, default): wearer mic, no segmentation; `stop()` drains the audio queue and closes the writer to flush the final result.
  - **VAD continuous** (realtime page, `{ captureMode, vad: true }`): segmentation negotiated from capabilities (prefer 800 ms silence within the supported range); writer stays open, each `isFinal` result is one turn.
  - Capture path: `getUserMedia` (mic mode preserved, constraint fallback chain) → native `MediaRecorder` (16 kHz mono Ogg/Opus, one blob per 250 ms) → writer fed in order (header validated, backpressure-capped) → on stop, drain and close. Requires Ogg/Opus ASR; the realtime page additionally requires VAD segmentation.
- `lib/mic-mode.js` — per-prompt mic mode: `microphoneMode` (wearer / far-field / omnidirectional) or `captureSource: 'system-audio'` (phone media; never combined with echoCancellation; falls back to mic when unsupported).
- `lib/ignore-store.js` — per-prompt "ignore irrelevant talk" flag. When on, the system prompt appends a filter rule (irrelevant turns make the model reply `⎋`); matching replies are dropped before rendering.
- `lib/llm.js` — `LanguageModel` wrapper: availability check → `create({ initialPrompts })` → `promptStreaming()` + `read()` polling; turns queue serially (no streaming cancel API).
- `lib/i18n.js` — locale resolution (BCP 47 / RFC 4647) and `{key}` interpolation; libraries report stable error keys that pages map to localized text.
- `lib/prompts-store.js` — prompt persistence via `wx.setStorageSync`, seeded with two presets on first run.
- `lib/action-feedback.js` — tap-action lock + 200 ms-delayed loading feedback.
- `app.wxss` — shared design tokens and loading styles.

## Deploy & debug

```bash
# One-time: enable developer mode on the glasses
adb shell settings put global development_settings_enabled 1

# Package, push, and install (rerun to overwrite)
aix install ./samples/realtime-voice-intelligence

# Open the entry page on the device (voice launch also works)
aix launch-page ./samples/realtime-voice-intelligence
```

Debug with `adb logcat -v time | grep -a -i aiui`; `adb shell screencap -p` for screenshots.

## Boundaries

- ASR and LLM use AIUI's own APIs (`SpeechRecognitionSession` / `LanguageModel`) only — no external services.
- Prompts stay in local storage; no import/export.
- i18n covers UI text only; the voice pipeline (ASR language, system prompt, presets) is zh-CN.
- No TTS or speaker diarization; LLM context lives within one realtime session and is discarded on exit.
