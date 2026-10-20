<script type="application/json" def>
{
  "navigationBarTitleText": "提示词"
}
</script>

<script setup>
import wx from 'wx';
import { createRecognizer, collectTranscript } from '../../lib/asr.js';
import { savePrompt, getPrompt, deletePrompt, markUsed } from '../../lib/prompts-store.js';
import { createActionFeedback } from '../../lib/action-feedback.js';
import { DEFAULT_LOCALE, getStrings, resolveUiLocale, interpolate, asrErrorText, micModeText } from '../../lib/i18n.js';
import { DEFAULT_MIC_MODE, promptMicMode, getEditMicModeDraft, setEditMicModeDraft } from '../../lib/mic-mode.js';
import { DEFAULT_IGNORE_IRRELEVANT, promptIgnoreIrrelevant, getEditIgnoreDraft, setEditIgnoreDraft } from '../../lib/ignore-store.js';

// Render-safe defaults; onLoad re-resolves from navigator.languages.
const L = getStrings(DEFAULT_LOCALE);

export default {
  data: {
    // Localized UI strings (templates only interpolate — see lib/i18n.js).
    pageTitle: L.editTitle,
    statusOpeningMic: L.editOpeningMic,
    statusListening: L.editListening,
    statusStopped: L.editStopped,
    statusIdle: L.editIdle,
    btnDone: L.editDone,
    btnDonePending: L.editSubmitting,
    btnDeleteLast: L.editDeleteLast,
    btnDelete: L.editDelete,
    btnDeletePending: L.editDeleting,
    btnSave: L.editSave,
    btnSavePending: L.editSaving,
    btnUse: L.editUse,
    btnUsePending: L.editUsing,
    micModeRowText: `${L.editMicModeRow} · ${micModeText(L, DEFAULT_MIC_MODE)}`,
    ignoreOn: true,
    ignoreToggleText: `${L.editIgnoreRow} · ${L.switchOn}`,
    listening: false,
    committedText: '',
    interim: '',
    hasInput: false,
    error: '',
    cursor: 0,
    // Action id pending for >200ms (voice/voicestop/save/delete/select).
    pendingAction: '',
  },

  onLoad(query) {
    this.strings = getStrings(resolveUiLocale());
    // The timestamp filters the Enter keyup tail of the key that activated us.
    this.loadedAt = Date.now();
    this.editingId = query && query.id ? query.id : '';
    const prompt = this.editingId ? getPrompt(this.editingId) : null;
    // Session settings are per-prompt attributes: editing starts from the
    // prompt's stored values (missing → far-field + ignore on). The storage
    // drafts are the channel the picker/toggle write back through.
    this.editMicMode = promptMicMode(prompt);
    setEditMicModeDraft(this.editMicMode);
    this.editIgnore = prompt ? promptIgnoreIrrelevant(prompt) : DEFAULT_IGNORE_IRRELEVANT;
    setEditIgnoreDraft(this.editIgnore);
    this.setData({
      pageTitle: this.strings.editTitle,
      statusOpeningMic: this.strings.editOpeningMic,
      statusListening: this.strings.editListening,
      statusStopped: this.strings.editStopped,
      statusIdle: this.strings.editIdle,
      btnDone: this.strings.editDone,
      btnDonePending: this.strings.editSubmitting,
      btnDeleteLast: this.strings.editDeleteLast,
      btnDelete: this.strings.editDelete,
      btnDeletePending: this.strings.editDeleting,
      btnSave: this.strings.editSave,
      btnSavePending: this.strings.editSaving,
      btnUse: this.strings.editUse,
      btnUsePending: this.strings.editUsing,
      micModeRowText: `${this.strings.editMicModeRow} · ${micModeText(this.strings, this.editMicMode)}`,
      ignoreOn: this.editIgnore,
      ignoreToggleText: this.ignoreText(this.editIgnore),
    });
    // Editing is sentence-based: each dictation run (start → done speaking)
    // commits one sentence; the backspace button removes the last sentence.
    this.sentences = [];
    this.sessionTranscript = '';
    this.actions = createActionFeedback({
      onPendingChange: (id) => this.setData({ pendingAction: id }),
    });
    this.voice = createRecognizer({
      SpeechRecognitionSession: typeof SpeechRecognitionSession === 'undefined' ? null : SpeechRecognitionSession,
      // Dictation always listens to the wearer, regardless of the capture
      // mode picked for the realtime session.
      captureMode: 'wearer',
    });
    this.voice.onstart = () => {
      this.sessionTranscript = '';
      this.actions.unlock('voice');
      // Listening: focus moves to the "done speaking" button so Enter stops
      // and commits.
      this.setData({ listening: true, error: '', cursor: 1 });
    };
    this.voice.onresult = (event) => {
      // Dictation mode: show the accumulated transcript as the interim text.
      this.sessionTranscript = collectTranscript(event);
      this.setData({ interim: this.sessionTranscript });
    };
    // The recognizer reports stable error keys; map them to locale text.
    this.voice.onerror = (payload = {}) => {
      this.sessionTranscript = '';
      this.actions.unlock('voice');
      this.actions.unlock('voicestop');
      this.setData({ listening: false, interim: '', error: asrErrorText(this.strings, payload) });
    };
    // Session end (after stop() closed the writer) commits the final text.
    this.voice.onend = () => this.commitSession();

    if (prompt) {
      // Edit mode: existing content is the first sentence, so the
      // sentence-backspace can remove it wholesale.
      this.sentences = [prompt.text];
      this.setData({ committedText: prompt.text, hasInput: true });
    }
    // No auto-listening: the cursor rests on the voice box, tap/Enter starts.
  },

  onUnload() {
    if (this.voice) this.voice.abort();
    if (this.actions) this.actions.unlockAll();
    this.clearPostShowRefresh();
  },

  onHide() {
    if (this.voice) this.voice.abort();
    if (this.actions) this.actions.unlockAll();
    this.clearPostShowRefresh();
    this.setData({ listening: false, interim: '' });
  },

  onShow() {
    // The timestamp filters the Enter keyup tail of the key that activated us
    // (also when returning from the mic-mode picker).
    this.loadedAt = Date.now();
    this.refreshSettingsRow();
    this.schedulePostShowRefresh();
  },

  // The settings row shows the per-prompt drafts (the picker/toggle may have
  // changed them while we were hidden); refresh whenever visible again.
  ignoreText(on) {
    return `${this.strings.editIgnoreRow} · ${on ? this.strings.switchOn : this.strings.switchOff}`;
  },

  refreshSettingsRow() {
    this.editMicMode = getEditMicModeDraft();
    this.editIgnore = getEditIgnoreDraft();
    this.setData({
      micModeRowText: `${this.strings.editMicModeRow} · ${micModeText(this.strings, this.editMicMode)}`,
      ignoreOn: this.editIgnore,
      ignoreToggleText: this.ignoreText(this.editIgnore),
    });
  },

  // Device-verified quirk: setData fired synchronously inside onShow is
  // dropped by the navigateBack view transition (returning from the picker
  // would leave the old label on screen). Re-refresh after the transition so
  // the new label lands.
  schedulePostShowRefresh() {
    this.clearPostShowRefresh();
    this.postShowTimers = [250, 800].map((delay) => setTimeout(() => {
      this.refreshSettingsRow();
    }, delay));
  },

  clearPostShowRefresh() {
    if (this.postShowTimers) {
      this.postShowTimers.forEach((timer) => clearTimeout(timer));
      this.postShowTimers = null;
    }
  },

  // Localize a thrown keyed error (libs emit stable keys, see lib/i18n.js);
  // host errors without a known key fall back to their raw message.
  errorText(error) {
    if (error && error.key && this.strings[error.key]) return this.strings[error.key];
    return (error && (error.message || error)) || '';
  },

  commitSession() {
    this.actions.unlock('voicestop');
    const transcript = (this.sessionTranscript || '').trim();
    this.sessionTranscript = '';
    if (transcript) this.sentences.push(transcript);
    this.setData({
      listening: false,
      interim: '',
      committedText: this.sentences.join(''),
      hasInput: this.sentences.length > 0,
      // Content present → cursor on "save"; nothing captured → back to the
      // voice box to retry.
      cursor: this.sentences.length > 0 ? 3 : 0,
    });
  },

  navCount() {
    // Cursor path: 0 = voice box; while listening 1 = done speaking;
    // after stop 1 = delete last sentence, 2 = delete prompt,
    // 3 = save & back, 4 = select for use, 5 = capture mode picker,
    // 6 = ignore-irrelevant toggle.
    if (this.data.listening) return 2;
    return 7;
  },

  // Self-managed cursor: ArrowUp/Down move, Enter activates. Backspace is
  // left to the host default (leave page without saving).
  onKeyUp(event) {
    const code = event && event.code;
    if (code !== 'ArrowUp' && code !== 'ArrowDown' && code !== 'Enter') {
      return;
    }
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const count = this.navCount();
    if (code === 'Enter') {
      // An Enter within 1s of onShow is the keyup tail of the key that
      // activated the previous page — ignore it.
      if (Date.now() - (this.loadedAt || 0) < 1000) return;
      this.activateCursor();
      return;
    }
    const current = this.data.cursor >= 0 && this.data.cursor < count ? this.data.cursor : 0;
    const cursor = code === 'ArrowUp' ? (current - 1 + count) % count : (current + 1) % count;
    this.setData({ cursor });
  },

  activateCursor() {
    if (this.data.cursor === 0) {
      this.tapVoiceBox();
    } else if (this.data.listening) {
      this.tapDoneSpeaking();
    } else if (this.data.cursor === 1) {
      this.deleteLastSentence();
    } else if (this.data.cursor === 2) {
      this.tapDeletePrompt();
    } else if (this.data.cursor === 3) {
      this.tapSave();
    } else if (this.data.cursor === 4) {
      this.tapSelectUse();
    } else if (this.data.cursor === 5) {
      this.tapMicMode();
    } else {
      this.tapIgnoreToggle();
    }
  },

  tapVoiceBox() {
    if (this.data.listening) {
      // Stopping must drain the audio queue and wait for the final result —
      // can take seconds.
      if (!this.actions.lock('voicestop')) return;
      this.voice.stop();
    } else {
      // Opening the mic + capability negotiation + session setup takes a
      // few hundred ms.
      if (!this.actions.lock('voice')) return;
      this.setData({ error: '' });
      this.voice.start();
    }
  },

  tapDoneSpeaking() {
    if (!this.data.listening) return;
    if (!this.actions.lock('voicestop')) return;
    this.voice.stop();
  },

  deleteLastSentence() {
    if (this.data.listening || !this.sentences.length) return;
    this.sentences.pop();
    this.setData({
      committedText: this.sentences.join(''),
      hasInput: this.sentences.length > 0,
    });
  },

  tapDeletePrompt() {
    if (!this.actions.lock('delete')) return;
    // Create mode has no stored entry: discarding the draft just goes back.
    if (!this.editingId) {
      if (this.voice) this.voice.abort();
      wx.navigateBack({ fail: () => this.actions.unlock('delete') });
      return;
    }
    try {
      deletePrompt(this.editingId);
    } catch (error) {
      this.actions.unlock('delete');
      console.error('[rvi] deletePrompt failed:', error && error.message);
      this.setData({ error: interpolate(this.strings.editDeleteFailed, { message: this.errorText(error) }) });
      return;
    }
    if (this.voice) this.voice.abort();
    wx.navigateBack({ fail: () => this.actions.unlock('delete') });
  },

  tapSave() {
    const text = this.sentences.join('').trim();
    if (!text) {
      this.setData({ error: this.strings.editEmptyInput });
      return;
    }
    if (!this.actions.lock('save')) return;
    try {
      savePrompt(text, this.editingId || undefined, { micMode: this.editMicMode, ignoreIrrelevant: this.editIgnore });
    } catch (error) {
      this.actions.unlock('save');
      console.error('[rvi] savePrompt failed:', error && error.message);
      this.setData({ error: interpolate(this.strings.editSaveFailed, { message: this.errorText(error) }) });
      return;
    }
    // The device bridge of wx.navigateBack requires ≥1 argument (calling it
    // with none throws even though the options are documented as optional).
    wx.navigateBack({ fail: () => this.actions.unlock('save') });
  },

  // "Select for use": save the draft, make it the selected prompt, go home.
  tapSelectUse() {
    const text = this.sentences.join('').trim();
    if (!text) {
      this.setData({ error: this.strings.editEmptyInput });
      return;
    }
    if (!this.actions.lock('select')) return;
    try {
      const saved = savePrompt(text, this.editingId || undefined, { micMode: this.editMicMode, ignoreIrrelevant: this.editIgnore });
      markUsed(saved.id);
    } catch (error) {
      this.actions.unlock('select');
      console.error('[rvi] select-use save failed:', error && error.message);
      this.setData({ error: interpolate(this.strings.editSaveFailed, { message: this.errorText(error) }) });
      return;
    }
    if (this.voice) this.voice.abort();
    // Reached from the select page (2 levels) in edit mode, from home (1
    // level) in create mode — delta returns to home either way.
    const delta = this.editingId ? 2 : 1;
    wx.navigateBack({ delta, fail: () => this.actions.unlock('select') });
  },

  // Open the capture-mode picker with the prompt's current draft mode; the
  // choice becomes this prompt's mode once saved.
  tapMicMode() {
    if (!this.actions.lock('micmode')) return;
    wx.navigateTo({
      url: `/pages/mic-mode/index?mode=${encodeURIComponent(this.editMicMode)}`,
      fail: () => this.actions.unlock('micmode'),
    });
  },

  // Toggle this prompt's "ignore irrelevant" flag (per-prompt draft; saved
  // with the prompt). See pages/realtime for the prompt rule and filtering.
  tapIgnoreToggle() {
    const on = !getEditIgnoreDraft();
    setEditIgnoreDraft(on);
    this.editIgnore = on;
    this.setData({ ignoreOn: on, ignoreToggleText: this.ignoreText(on) });
  },
};
</script>

<page>
  <view class="container">
    <view class="header">
      <text class="page-title">{{pageTitle}}</text>
    </view>

    <view class="loading" ink:if="{{pendingAction}}">
      <view class="loading-dot"></view>
      <view class="loading-dot loading-dot-2"></view>
      <view class="loading-dot loading-dot-3"></view>
    </view>

    <view
      class="voice-box {{listening ? 'live' : ''}} {{cursor === 0 ? 'cursor' : ''}}"
      bindtap="tapVoiceBox"
    >
      <text class="box-status" ink:if="{{pendingAction === 'voice'}}">{{statusOpeningMic}}</text>
      <text class="box-status" ink:if="{{pendingAction !== 'voice'}}">{{listening ? statusListening : (hasInput ? statusStopped : statusIdle)}}</text>
      <view class="box-text">
        <text class="committed">{{committedText}}</text><text class="interim" ink:if="{{interim}}">{{interim}}</text>
      </view>
    </view>

    <text class="error-text" ink:if="{{error}}">{{error}}</text>

    <view class="button-row">
      <button class="btn {{cursor === 1 ? 'menu-active' : ''}}" ink:if="{{listening}}" bindtap="tapDoneSpeaking">{{pendingAction === 'voicestop' ? btnDonePending : btnDone}}</button>
      <button class="btn {{cursor === 1 ? 'menu-active' : ''}} {{hasInput ? '' : 'btn-disabled'}}" ink:if="{{!listening}}" bindtap="deleteLastSentence">{{btnDeleteLast}}</button>
      <button class="btn {{cursor === 2 ? 'menu-active' : ''}}" ink:if="{{!listening}}" bindtap="tapDeletePrompt">{{pendingAction === 'delete' ? btnDeletePending : btnDelete}}</button>
      <button class="btn {{cursor === 3 ? 'menu-active' : ''}} {{hasInput ? '' : 'btn-disabled'}}" ink:if="{{!listening}}" bindtap="tapSave">{{pendingAction === 'save' ? btnSavePending : btnSave}}</button>
      <button class="btn {{cursor === 4 ? 'menu-active' : ''}} {{hasInput ? '' : 'btn-disabled'}}" ink:if="{{!listening}}" bindtap="tapSelectUse">{{pendingAction === 'select' ? btnUsePending : btnUse}}</button>
    </view>

    <view class="settings-row" ink:if="{{!listening}}">
      <view
        class="setting-card {{cursor === 5 ? 'menu-active' : ''}}"
        bindtap="tapMicMode"
      >
        <text class="{{cursor === 5 ? 'setting-text setting-text-active' : 'setting-text'}}">{{micModeRowText}}</text>
      </view>
      <view
        class="setting-card setting-toggle {{cursor === 6 ? 'menu-active' : ''}} {{ignoreOn ? 'toggle-on' : ''}}"
        bindtap="tapIgnoreToggle"
      >
        <text class="{{cursor === 6 ? 'setting-text setting-text-active' : 'setting-text'}}">{{ignoreToggleText}}</text>
      </view>
    </view>
  </view>
</page>

<style>
/* Design tokens and the .loading indicator live in app.wxss. */
.container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  /* Zero horizontal page margin: the voice box and buttons run full width. */
  padding: 20px 0;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--rvi-text);
}

/* Voice box: unfocused = no border/fill (transparent 2px border keeps the
   layout stable when focus switches). Kept compact so the button row and the
   capture-mode entry below stay on screen. */
.voice-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 110px;
  padding: 12px;
  border-radius: var(--radius-md, 12px);
  border: 2px solid transparent;
  background-color: transparent;
}

/* Focused (cursor 0): bright border + fill. */
.voice-box.cursor {
  border-color: var(--rvi-green);
  background-color: var(--rvi-green-fill);
}

.box-status {
  font-size: 12px;
  color: var(--rvi-text-hint);
}

.voice-box.live .box-status {
  color: var(--rvi-text);
}

/* Column layout: text nodes inside a flex row don't wrap on device and
   overflow instead — committed and interim each take full-width rows. */
.box-text {
  display: flex;
  flex-direction: column;
}

.committed {
  font-size: 16px;
  line-height: 24px;
  color: var(--rvi-text-body);
}

/* Live interim transcript: same size, lower opacity. */
.interim {
  font-size: 16px;
  line-height: 24px;
  color: var(--rvi-text-secondary);
}

.error-text {
  font-size: 13px;
  line-height: 18px;
  color: var(--rvi-text-secondary);
}

.button-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* Native button component: var() does not apply, colors must be literals.
   Four buttons share one row: override the native padding, drop min-width
   so they can shrink to their label. */
.btn {
  flex: 1 1 auto;
  min-width: 0;
  padding: 8px 8px;
  box-sizing: border-box;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(64, 255, 94, 0.6);
  background-color: rgba(64, 255, 94, 0.2);
}

/* Device-verified: the native disabled attribute makes a button vanish when
   the page is repainted after navigateBack (e.g. returning from the mic-mode
   picker) — disabled buttons rendered on first paint only. Use a class
   instead; the tap handlers already guard empty input. */
.btn-disabled {
  color: rgba(255, 255, 255, 0.35);
  border-color: rgba(64, 255, 94, 0.25);
}

.btn-disabled:hover {
  color: rgba(255, 255, 255, 0.35);
  border-color: rgba(64, 255, 94, 0.25);
  background-color: rgba(64, 255, 94, 0.2);
}

/* Host hover redraws text black unless overridden explicitly. */
.btn:hover {
  color: rgba(255, 255, 255, 0.85);
  background-color: rgba(64, 255, 94, 0.2);
}

/* Cursor button: solid green border + white text (no bold — it would change
   glyph widths and re-wraps labels). */
.btn.menu-active {
  border: 2px solid #40ff5e;
  color: #ffffff;
}

/* Settings row: capture-mode entry (left, opens pages/mic-mode) + the
   ignore-irrelevant toggle (right). Views, not native buttons, so the hover
   repaint can be overridden; short single-line labels, so the no-wrap
   behavior of flex-row text is fine here. */
.settings-row {
  display: flex;
  flex-direction: row;
  gap: 10px;
}

.setting-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* Three-value flex: the `flex:1` shorthand is not parsed on device. */
  flex: 1 1 0;
  min-height: 36px;
  padding: 8px 12px;
  box-sizing: border-box;
  border-radius: var(--radius-md, 12px);
  border: 2px solid rgba(64, 255, 94, 0.6);
  background-color: transparent;
}

/* Toggle card: sized to its label, sits next to the mode card. */
.setting-toggle {
  flex: 0 0 auto;
}

.setting-card.menu-active {
  border-color: #40ff5e;
  background-color: rgba(64, 255, 94, 0.2);
}

/* Toggle ON: border stays like the other cards; a 10% green fill marks the
   on state. */
.setting-toggle.toggle-on {
  background-color: rgba(64, 255, 94, 0.1);
}

.setting-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
}

.setting-text-active {
  color: #ffffff;
}

.setting-card:hover {
  border-color: rgba(64, 255, 94, 0.6);
  background-color: transparent;
}

.setting-card.menu-active:hover {
  border-color: #40ff5e;
  background-color: rgba(64, 255, 94, 0.2);
}

.setting-toggle.toggle-on:hover {
  background-color: rgba(64, 255, 94, 0.1);
}

.setting-toggle.toggle-on.menu-active:hover {
  border-color: #40ff5e;
  background-color: rgba(64, 255, 94, 0.2);
}
</style>
