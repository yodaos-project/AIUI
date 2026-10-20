// Local persistence for the prompt list (wx.setStorageSync).
// Arrays are stored directly, but reads normalize defensively: the host may
// transparently deserialize the stored value OR hand it back as a JSON string.

import wx from 'wx';
import { MIC_MODES } from './mic-mode.js';

const STORAGE_KEY = 'rvi.prompts';
const SELECTED_KEY = 'rvi.selectedPromptId';
const SEEDED_KEY = 'rvi.presetsSeeded';
const SEED_VERSION = '6';

// Presets written on first run only. Afterwards they behave like ordinary
// prompts — editable, deletable, never resurrected. Each carries the capture
// mode its scenario expects. PRESETS[0] sorts first and becomes the default
// selection.
const PRESETS = [
  {
    micMode: 'far-field',
    ignoreIrrelevant: true,
    text: '你在用户参与真实对话，仅在有实际帮助时生成一条简短的提示信息。例如解释当前讨论中值得理解的概念。针对需要用户回答的问题提供参考。提出有价值的追问、澄清或行动建议。避免重复已有提示或转述用户已知的信息。',
  },
  {
    micMode: 'far-field',
    ignoreIrrelevant: true,
    text: '你是我脑海里的小妖精。当别人对我说话时，你会像内心旁白一样，快速理解对方的意思，然后用有点俏皮、略带吐槽的方式提醒我：这句话可能是什么意思、值不值得在意、以及我可以怎么回应。例如你可以点评对方说的话：这句像在试探你口风。可以给我建议：别急着亮底牌。',
  },
];

// Seed texts from earlier versions, dropped on reseed. Exact-match only:
// copies the user edited (changed text) are ordinary prompts and stay.
const LEGACY_PRESET_TEXTS = [
  '快速提供最有价值的答案关键词，帮助我理解问题并自行组织表达。',
];

function makeId() {
  return `prompt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

// List order: most recently used first, then most recently updated.
function byUsageRecency(a, b) {
  const usedA = a.lastUsedAt || 0;
  const usedB = b.lastUsedAt || 0;
  if (usedA !== usedB) return usedB - usedA;
  return (b.updatedAt || 0) - (a.updatedAt || 0);
}

function normalizePrompts(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }
  console.warn('[rvi] prompts storage unexpected type:', typeof raw);
  return [];
}

function readAll() {
  try {
    const prompts = normalizePrompts(wx.getStorageSync(STORAGE_KEY))
      .filter((item) => item && typeof item.text === 'string');
    return prompts.slice().sort(byUsageRecency);
  } catch (error) {
    console.error('[rvi] prompts read failed:', error && (error.message || error));
    return [];
  }
}

export function listPrompts() {
  return readAll();
}

export function getPrompt(id) {
  if (!id) return null;
  return readAll().find((prompt) => prompt.id === id) || null;
}

export function savePrompt(text, id, settings) {
  const prompts = readAll();
  const trimmed = String(text || '').trim();
  if (!trimmed) throw Object.assign(new Error('prompt text is empty'), { key: 'promptEmpty' });
  const existing = id ? prompts.find((prompt) => prompt.id === id) : null;
  // New prompts start with "ignore irrelevant" on (per-prompt flag, see
  // lib/ignore-store.js).
  const saved = existing || { id: makeId(), text: trimmed, createdAt: Date.now(), ignoreIrrelevant: true };
  saved.text = trimmed;
  // Session settings picked on the edit page; invalid values keep whatever
  // the record already had (readers re-validate anyway).
  if (settings && typeof settings === 'object') {
    if (MIC_MODES.includes(settings.micMode)) saved.micMode = settings.micMode;
    if (typeof settings.ignoreIrrelevant === 'boolean') saved.ignoreIrrelevant = settings.ignoreIrrelevant;
  }
  saved.updatedAt = Date.now();
  if (!existing) prompts.unshift(saved);
  wx.setStorageSync(STORAGE_KEY, prompts);
  // Saving (create or edit) makes the prompt the selected one.
  setSelectedId(saved.id);
  return saved;
}

export function deletePrompt(id) {
  if (!id) return;
  const prompts = readAll();
  const remaining = prompts.filter((prompt) => prompt.id !== id);
  if (remaining.length === prompts.length) return;
  try {
    wx.setStorageSync(STORAGE_KEY, remaining);
    if (getSelectedId() === id) {
      wx.setStorageSync(SELECTED_KEY, remaining.length ? remaining[0].id : '');
    }
  } catch (error) {
    console.error('[rvi] deletePrompt write failed:', error && (error.message || error));
  }
}

export function getSelectedId() {
  try {
    const raw = wx.getStorageSync(SELECTED_KEY);
    return typeof raw === 'string' ? raw : '';
  } catch (_) {
    return '';
  }
}

export function setSelectedId(id) {
  try {
    if (id) wx.setStorageSync(SELECTED_KEY, id);
  } catch (_) {}
}

// Starting a conversation marks the prompt used: bumps lastUsedAt (drives the
// list order) and selects it.
export function markUsed(id) {
  if (!id) return;
  const prompts = readAll();
  const target = prompts.find((prompt) => prompt.id === id);
  if (!target) return;
  target.lastUsedAt = Date.now();
  try {
    wx.setStorageSync(STORAGE_KEY, prompts);
    setSelectedId(id);
  } catch (error) {
    console.error('[rvi] markUsed write failed:', error && (error.message || error));
  }
}

// Seed presets once per seed version. Prompts the user deleted are not
// resurrected (presence check is by exact text).
export function ensurePresets() {
  try {
    if (wx.getStorageSync(SEEDED_KEY) === SEED_VERSION) return;
    const prompts = normalizePrompts(wx.getStorageSync(STORAGE_KEY))
      .filter((item) => item && typeof item.text === 'string')
      .filter((item) => !LEGACY_PRESET_TEXTS.includes(item.text));
    const base = Date.now();
    // Earlier presets get a larger updatedAt so PRESETS[0] sorts first.
    PRESETS.forEach((preset, index) => {
      if (!prompts.some((prompt) => prompt.text === preset.text)) {
        prompts.push({
          id: makeId(),
          text: preset.text,
          micMode: preset.micMode,
          ignoreIrrelevant: preset.ignoreIrrelevant !== false,
          createdAt: base,
          updatedAt: base + PRESETS.length - index,
        });
      }
    });
    wx.setStorageSync(STORAGE_KEY, prompts);
    wx.setStorageSync(SEEDED_KEY, SEED_VERSION);
    console.log('[rvi] presets seeded | version =', SEED_VERSION, '| count =', prompts.length);
  } catch (error) {
    console.error('[rvi] ensurePresets failed:', error && (error.message || error));
  }
}
