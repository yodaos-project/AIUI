// Per-prompt "ignore irrelevant conversation" flag: prompt records carry
// ignoreIrrelevant (lib/prompts-store.js); the realtime session reads the
// selected prompt's flag. Missing or invalid reads as ON — presets and new
// prompts default to on. The edit page toggles a local-storage draft that is
// adopted into the prompt on save (same channel as the capture mode in
// lib/mic-mode.js).

import wx from 'wx';

export const DEFAULT_IGNORE_IRRELEVANT = true;

// Read a prompt record's flag; only an explicit false turns it off.
export function promptIgnoreIrrelevant(prompt) {
  return !(prompt && prompt.ignoreIrrelevant === false);
}

// Draft channel between the edit page and its own save: seeded on load,
// toggled in place, persisted with the prompt on save.
const EDIT_DRAFT_KEY = 'rvi.editIgnoreIrrelevant';

export function getEditIgnoreDraft() {
  try {
    const raw = wx.getStorageSync(EDIT_DRAFT_KEY);
    // The host may hand stored values back as JSON strings.
    return !(raw === false || raw === 'false');
  } catch (_) {
    return DEFAULT_IGNORE_IRRELEVANT;
  }
}

export function setEditIgnoreDraft(on) {
  try {
    wx.setStorageSync(EDIT_DRAFT_KEY, on === true);
    console.log('[rvi] edit ignore draft | on =', on === true);
  } catch (_) {}
}
