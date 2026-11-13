# Agent: Realtime Voice Intelligence

- **Version**: 1.6.0
- **Description**: Joins your conversations with others and offers timely explanations, references, and suggestions.

## Pages

- `pages/prompt-list` (entry): menu (start session / new prompt / edit prompt) + current-prompt card with mic mode and ignore-irrelevant settings.
- `pages/prompt-select`: prompts ordered by last use ("in use" badge); Enter opens the editor.
- `pages/prompt-edit`: sentence-by-sentence dictation editing (fixed wearer mic); per-prompt mic-mode entry + ignore-irrelevant toggle.
- `pages/mic-mode`: far-field / omnidirectional / wearer / system-audio picker; selection returns to the editor and is saved with the prompt.
- `pages/realtime`: listens with the prompt's mic mode (default far-field); every VAD segment is one LLM turn; `⎋` replies are dropped when ignore-irrelevant is on; bottom rolling transcript + latest two replies; Enter exits.

## Capabilities

- Permissions: `RECORD_AUDIO`
- ASR: `SpeechRecognitionSession` (Ink `MediaRecorder` output `audio/ogg;codecs=opus`; `getCapabilities()` negotiates VAD segmentation)
- Mic mode: `lib/mic-mode.js` — `microphoneMode` (wearer / far-field / omnidirectional) or `captureSource: 'system-audio'` (phone media; no echoCancellation; mic fallback)
- LLM: `LanguageModel` (`initialPrompts` fixes the system prompt; `promptStreaming()` for streamed reads)
- Storage: `wx.setStorageSync` (prompts and selection)
- i18n: `lib/i18n.js` resolves the UI locale from `navigator.languages` (zh-CN / zh-TW / en-US); libraries report stable error keys
- Keys: page-level `onKeyUp` (arrows move the cursor, Enter confirms, `preventDefault()` when handled)

## Privacy

- Prompts stay in on-device storage only.
- Mic audio goes only to the on-device ASR session and is never stored elsewhere.
