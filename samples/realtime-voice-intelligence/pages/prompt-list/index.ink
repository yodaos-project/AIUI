<script type="application/json" def>
{
  "navigationBarTitleText": "实时语音智能"
}
</script>

<script setup>
import wx from 'wx';
import { listPrompts, getSelectedId, setSelectedId, markUsed, ensurePresets } from '../../lib/prompts-store.js';
import { createActionFeedback } from '../../lib/action-feedback.js';
import { DEFAULT_LOCALE, getStrings, resolveUiLocale, interpolate, micModeText } from '../../lib/i18n.js';
import { DEFAULT_MIC_MODE, promptMicMode } from '../../lib/mic-mode.js';
import { promptIgnoreIrrelevant } from '../../lib/ignore-store.js';

const MENU_COUNT = 3;
// Render-safe defaults; onLoad re-resolves from navigator.languages.
const L = getStrings(DEFAULT_LOCALE);

export default {
  data: {
    // Localized UI strings (templates only interpolate — see lib/i18n.js).
    pageTitle: L.homeTitle,
    pageHint: L.homeHint,
    btnStart: L.homeStart,
    enteringText: L.homeEntering,
    btnCreate: L.homeCreate,
    btnEdit: L.homeEdit,
    openingText: L.opening,
    currentEmptyText: interpolate(L.homeCurrentEmpty, { create: L.homeCreate }),
    // Card status line: the selected prompt's own settings joined as plain
    // text ("忽略无关对话：开 | 收音：x | 当前提示词：") — no chip styling.
    statusLine: interpolate(L.promptStatusLine, {
      ignore: L.switchOn,
      mode: micModeText(L, DEFAULT_MIC_MODE),
      label: L.homeCurrentLabel,
    }),
    selectedId: '',
    currentText: '',
    hasSelection: false,
    cursor: 0,
    // Action id pending for >200ms: shows the loading indicator, repeat taps ignored.
    pendingAction: '',
  },

  onLoad() {
    this.strings = getStrings(resolveUiLocale());
    this.setData({
      pageTitle: this.strings.homeTitle,
      pageHint: this.strings.homeHint,
      btnStart: this.strings.homeStart,
      enteringText: this.strings.homeEntering,
      btnCreate: this.strings.homeCreate,
      btnEdit: this.strings.homeEdit,
      openingText: this.strings.opening,
      currentEmptyText: interpolate(this.strings.homeCurrentEmpty, { create: this.strings.homeCreate }),
    });
    this.actions = createActionFeedback({
      onPendingChange: (id) => this.setData({ pendingAction: id }),
    });
  },

  // Unlock everything when covered/unloaded: navigation has necessarily ended.
  onHide() {
    if (this.actions) this.actions.unlockAll();
    this.clearPostShowRefresh();
  },

  onUnload() {
    if (this.actions) this.actions.unlockAll();
    this.clearPostShowRefresh();
  },

  onShow() {
    // onShow covers both first entry and returning from another page.
    // The timestamp filters the Enter keyup tail of the key that activated us.
    this.loadedAt = Date.now();
    ensurePresets();
    this.reload();
    this.schedulePostShowRefresh();
  },

  // Device-verified quirk: setData fired synchronously inside onShow is
  // dropped by the navigateBack view transition (returning from the edit page
  // would leave the old card and capture-mode tag on screen). Re-refresh
  // twice after the transition so the first post-transition setData lands.
  schedulePostShowRefresh() {
    this.clearPostShowRefresh();
    this.postShowTimers = [250, 800].map((delay) => setTimeout(() => {
      this.reload();
    }, delay));
  },

  clearPostShowRefresh() {
    if (this.postShowTimers) {
      this.postShowTimers.forEach((timer) => clearTimeout(timer));
      this.postShowTimers = null;
    }
  },

  // Current prompt = most recently created/edited/used; falls back to the
  // first list entry when the stored selection no longer exists.
  reload() {
    const prompts = listPrompts();
    let selectedId = getSelectedId();
    if (selectedId && !prompts.some((prompt) => prompt.id === selectedId)) {
      selectedId = '';
    }
    if (!selectedId && prompts.length) {
      selectedId = prompts[0].id;
      setSelectedId(selectedId);
    }
    const current = prompts.find((prompt) => prompt.id === selectedId);
    const strings = this.strings || L;
    this.setData({
      selectedId,
      hasSelection: Boolean(selectedId),
      currentText: current ? current.text : '',
      // The line shows the settings the realtime session would use: the
      // selected prompt's own ignore flag and capture mode.
      statusLine: interpolate(strings.promptStatusLine, {
        ignore: promptIgnoreIrrelevant(current) ? strings.switchOn : strings.switchOff,
        mode: micModeText(strings, promptMicMode(current)),
        label: strings.homeCurrentLabel,
      }),
      cursor: Math.min(this.data.cursor || 0, MENU_COUNT - 1),
    });
  },

  // Self-managed cursor navigation: ArrowUp/Down move between the three menu
  // items, Enter activates — no dependence on the host Navigation mode.
  onKeyUp(event) {
    const code = event && event.code;
    if (code !== 'ArrowUp' && code !== 'ArrowDown' && code !== 'Enter') return;
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    if (code === 'Enter') {
      // An Enter within 1s of onShow is the keyup tail of the key that
      // activated the previous page — ignore it.
      if (Date.now() - (this.loadedAt || 0) < 1000) return;
      this.activateCursor();
      return;
    }
    const current = this.data.cursor >= 0 && this.data.cursor < MENU_COUNT ? this.data.cursor : 0;
    const cursor = code === 'ArrowUp'
      ? (current - 1 + MENU_COUNT) % MENU_COUNT
      : (current + 1) % MENU_COUNT;
    this.setData({ cursor });
  },

  activateCursor() {
    if (this.data.cursor === 0) {
      this.startConversation();
    } else if (this.data.cursor === 1) {
      this.createPrompt();
    } else {
      this.editPrompts();
    }
  },

  startConversation() {
    const id = this.data.selectedId;
    if (!id) return;
    // Navigation takes a moment: lock against repeat triggers.
    if (!this.actions.lock('conversation')) return;
    markUsed(id);
    wx.navigateTo({
      url: `/pages/realtime/index?id=${id}`,
      fail: () => this.actions.unlock('conversation'),
    });
  },

  createPrompt() {
    if (!this.actions.lock('create')) return;
    wx.navigateTo({
      url: '/pages/prompt-edit/index',
      fail: () => this.actions.unlock('create'),
    });
  },

  editPrompts() {
    if (!this.actions.lock('edit')) return;
    wx.navigateTo({
      url: '/pages/prompt-select/index',
      fail: () => this.actions.unlock('edit'),
    });
  },
};
</script>

<page>
  <view class="container">
    <view class="header">
      <text class="page-title">{{pageTitle}}</text>
      <text class="page-hint">{{pageHint}}</text>
    </view>

    <view class="loading" ink:if="{{pendingAction}}">
      <view class="loading-dot"></view>
      <view class="loading-dot loading-dot-2"></view>
      <view class="loading-dot loading-dot-3"></view>
    </view>

    <view class="menu-card">
      <view class="button-stack">
        <button class="btn {{cursor === 0 ? 'menu-active' : ''}}" bindtap="startConversation" disabled="{{!hasSelection}}">{{pendingAction === 'conversation' ? enteringText : btnStart}}</button>
        <button class="btn {{cursor === 1 ? 'menu-active' : ''}}" bindtap="createPrompt">{{pendingAction === 'create' ? openingText : btnCreate}}</button>
        <button class="btn {{cursor === 2 ? 'menu-active' : ''}}" bindtap="editPrompts">{{pendingAction === 'edit' ? openingText : btnEdit}}</button>
      </view>
    </view>

    <view class="current-card">
      <text class="card-label">{{statusLine}}</text>
      <text class="current-text" ink:if="{{hasSelection}}">{{currentText}}</text>
      <text class="current-empty" ink:if="{{!hasSelection}}">{{currentEmptyText}}</text>
    </view>
  </view>
</page>

<style>
/* Design tokens and the .loading indicator live in app.wxss. */
.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--rvi-text);
}

.page-hint {
  font-size: 12px;
  line-height: 18px;
  color: var(--rvi-text-hint);
}

.menu-card {
  padding: 12px 16px;
}

.button-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Native button component: var() does not apply, colors must be literals. */
.btn {
  width: 100%;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(64, 255, 94, 0.6);
  background-color: rgba(64, 255, 94, 0.2);
}

/* Cursor item: solid green border + bold white text. */
.btn.menu-active {
  border: 2px solid #40ff5e;
  font-weight: bold;
  color: #ffffff;
}

/* Host hover redraws text black unless overridden explicitly. */
.btn:hover {
  color: rgba(255, 255, 255, 0.85);
  background-color: rgba(64, 255, 94, 0.2);
}

.current-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* "收音：x | 当前提示词：" — plain text, no chip styling. Short single-line
   string, so the no-wrap behavior of flex-column text is fine here. */
.card-label {
  font-size: 12px;
  color: var(--rvi-text-hint);
}

.current-text {
  font-size: 15px;
  line-height: 22px;
  color: var(--rvi-text-body);
}

.current-empty {
  font-size: 13px;
  line-height: 18px;
  color: var(--rvi-text-secondary);
}
</style>
