// Capture mode is a per-prompt attribute: each prompt record stores its own
// mode (lib/prompts-store.js), and the realtime session uses the mode of the
// selected prompt. The picker page (pages/mic-mode) edits the draft of the
// prompt being edited through a local-storage channel. Prompt dictation
// (prompt-edit) always uses the wearer mic regardless of this setting.

import wx from 'wx';

// Picker order and the set of valid values. The first three are getUserMedia
// microphone modes; 'system-audio' captures host playback instead
// (captureSource — no microphoneMode applies there).
export const MIC_MODES = Object.freeze([
  'far-field',
  'omnidirectional',
  'wearer',
  'system-audio',
]);

// Default keeps the original session behavior: the demo listens to the
// conversation partner in front of the wearer, not the wearer.
export const DEFAULT_MIC_MODE = 'far-field';

// The capture mode of a prompt record; prompts without one (created before
// the mode became per-prompt) use the default.
export function promptMicMode(prompt) {
  const mode = prompt && prompt.micMode;
  return MIC_MODES.includes(mode) ? mode : DEFAULT_MIC_MODE;
}

// Draft channel between the edit page and the picker: the edit page seeds
// the draft with the prompt's mode on load, the picker overwrites it, and the
// edit page adopts the draft when it becomes visible again (persisting it
// only on save).
const EDIT_DRAFT_KEY = 'rvi.editMicMode';

export function getEditMicModeDraft() {
  try {
    const raw = wx.getStorageSync(EDIT_DRAFT_KEY);
    return MIC_MODES.includes(raw) ? raw : DEFAULT_MIC_MODE;
  } catch (_) {
    return DEFAULT_MIC_MODE;
  }
}

export function setEditMicModeDraft(mode) {
  if (!MIC_MODES.includes(mode)) return;
  try {
    wx.setStorageSync(EDIT_DRAFT_KEY, mode);
    console.log('[rvi] edit mic-mode draft | mode =', mode);
  } catch (_) {}
}
