<script type="application/json" def>
{
  "navigationBarTitleText": "选择提示词"
}
</script>

<script setup>
import wx from 'wx';
import { listPrompts, getSelectedId } from '../../lib/prompts-store.js';
import { createActionFeedback } from '../../lib/action-feedback.js';
import { DEFAULT_LOCALE, getStrings, resolveUiLocale, interpolate } from '../../lib/i18n.js';

// Clamp list labels to 2 lines with an ellipsis. The renderer has no
// CSS line-clamp, so the cut is precomputed in JS from a per-character pixel
// budget (proportional fonts make pure character counting drift into a 3rd
// line). Conservative widths: fullwidth 14px, halfwidth 8px, space 5px.
const LABEL_MAX_LINES = 2;
// Content width = 480 (screen) − (page right margin 16 + card right padding
// 12 + scrollbar 6 + gap 12 + button padding 12×2 + borders 2×2) = 406.
const LABEL_CONTENT_PX = 404;
const CHAR_PX_FULLWIDTH = 14;
const CHAR_PX_HALFWIDTH = 8;
const CHAR_PX_SPACE = 5;
const ELLIPSIS_PX = CHAR_PX_FULLWIDTH;
// Line breaks rarely land exactly at the line width (Latin words break at
// spaces) — keep an 8% margin so text never spills onto a 3rd line.
const LINE_SAFETY_RATIO = 0.92;
const LABEL_BUDGET_PX = Math.round(LABEL_MAX_LINES * LABEL_CONTENT_PX * LINE_SAFETY_RATIO) - ELLIPSIS_PX;

function charPx(ch) {
  if (ch === ' ') return CHAR_PX_SPACE;
  return ch.codePointAt(0) >= 0x2e80 ? CHAR_PX_FULLWIDTH : CHAR_PX_HALFWIDTH;
}

function textPx(text) {
  let px = 0;
  for (const ch of text) px += charPx(ch);
  return px;
}

function clampLabel(text) {
  if (textPx(text) <= LABEL_BUDGET_PX) return text;
  let width = 0;
  let out = '';
  for (const ch of text) {
    const next = width + charPx(ch);
    if (next > LABEL_BUDGET_PX - ELLIPSIS_PX) break; // keep room for the ellipsis
    width = next;
    out += ch;
  }
  return `${out}…`;
}

// Render-safe defaults; onLoad re-resolves from navigator.languages.
const L = getStrings(DEFAULT_LOCALE);

export default {
  data: {
    // Localized UI strings (templates only interpolate — see lib/i18n.js).
    pageTitle: L.selectTitle,
    emptyText: interpolate(L.selectEmpty, { create: L.homeCreate }),
    openingText: L.opening,
    // Render items { id, cls, labelCls, label }: class names and labels are
    // precomputed in JS — the renderer rejects loop-scoped template
    // expressions (cursor === index) and .length member access, so templates
    // keep only plain {{item.x}} interpolation and simple boolean ink:if.
    prompts: [],
    // Left scroll indicator: one dot per prompt, the cursor dot highlighted.
    scrollDots: [],
    hasPrompts: false,
    cursor: 0,
    pendingAction: '',
  },

  onLoad() {
    this.strings = getStrings(resolveUiLocale());
    this.setData({
      pageTitle: this.strings.selectTitle,
      emptyText: interpolate(this.strings.selectEmpty, { create: this.strings.homeCreate }),
      openingText: this.strings.opening,
    });
    this.actions = createActionFeedback({
      onPendingChange: (id) => {
        const view = this.buildView(undefined, id);
        this.setData({ pendingAction: id, prompts: view.prompts, scrollDots: view.scrollDots });
      },
    });
  },

  onHide() {
    if (this.actions) this.actions.unlockAll();
    this.clearPostShowRefresh();
  },

  onUnload() {
    if (this.actions) this.actions.unlockAll();
    this.clearPostShowRefresh();
  },

  onShow() {
    // The timestamp filters the Enter keyup tail of the key that activated us.
    this.loadedAt = Date.now();
    this.reload();
    this.schedulePostShowRefresh();
  },

  // Device-verified quirk: setData fired synchronously inside onShow is
  // dropped by the navigateBack view transition (the old list stays on
  // screen even though storage is already updated). Re-refresh twice after
  // the transition so the first post-transition setData lands.
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

  // Build render items and scroll dots: cursor state, the "in use" tag and
  // loading text all become ready-made strings here.
  buildView(cursor, pendingAction) {
    const activeCursor = typeof cursor === 'number' ? cursor : this.data.cursor;
    const activePending = pendingAction !== undefined ? pendingAction : this.data.pendingAction;
    const strings = this.strings || L;
    const prompts = listPrompts();
    let selectedId = getSelectedId();
    if (selectedId && !prompts.some((prompt) => prompt.id === selectedId)) {
      selectedId = '';
    }
    return {
      prompts: prompts.map((prompt, index) => {
        const loading = prompt.id === activePending;
        const selected = !loading && prompt.id === selectedId;
        const raw = loading ? strings.opening : (selected ? `${strings.inUsePrefix}${prompt.text}` : prompt.text);
        return {
          id: prompt.id,
          cls: index === activeCursor ? 'btn menu-active' : 'btn',
          labelCls: index === activeCursor ? 'btn-label btn-label-active' : 'btn-label',
          label: clampLabel(raw),
        };
      }),
      scrollDots: prompts.map((prompt, index) => ({
        id: prompt.id,
        cls: index === activeCursor ? 'sd-dot sd-active' : 'sd-dot',
      })),
    };
  },

  reload() {
    const base = this.buildView();
    const cursor = Math.min(this.data.cursor || 0, Math.max(base.prompts.length - 1, 0));
    const view = this.buildView(cursor);
    this.setData({
      prompts: view.prompts,
      scrollDots: view.scrollDots,
      hasPrompts: base.prompts.length > 0,
      cursor,
    });
  },

  // Self-managed cursor: ArrowUp/Down move through the list, Enter opens the
  // edit page of the cursor item.
  onKeyUp(event) {
    const code = event && event.code;
    if (code !== 'ArrowUp' && code !== 'ArrowDown' && code !== 'Enter') return;
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const count = this.data.prompts.length;
    if (!count) return;
    if (code === 'Enter') {
      // An Enter within 1s of onShow is the keyup tail of the key that
      // activated the previous page — ignore it.
      if (Date.now() - (this.loadedAt || 0) < 1000) return;
      const item = this.data.prompts[this.data.cursor] || this.data.prompts[0];
      if (item) this.openEdit(item.id);
      return;
    }
    const current = this.data.cursor >= 0 && this.data.cursor < count ? this.data.cursor : 0;
    const cursor = code === 'ArrowUp' ? (current - 1 + count) % count : (current + 1) % count;
    const view = this.buildView(cursor);
    this.setData({ cursor, prompts: view.prompts, scrollDots: view.scrollDots });
  },

  selectPrompt(event) {
    const id = event && event.currentTarget && event.currentTarget.dataset
      ? event.currentTarget.dataset.id
      : '';
    if (id) this.openEdit(id);
  },

  openEdit(id) {
    if (!id) return;
    // Keyed by prompt id: the loading state hangs on the tapped item only.
    if (!this.actions.lock(id)) return;
    wx.navigateTo({
      url: `/pages/prompt-edit/index?id=${id}`,
      fail: () => this.actions.unlock(id),
    });
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

    <view class="empty" ink:if="{{!hasPrompts}}">
      <text class="empty-text">{{emptyText}}</text>
    </view>

    <view class="menu-card" ink:if="{{hasPrompts}}">
      <view class="list-wrap">
        <view class="scrollbar">
          <view class="{{item.cls}}" ink:for="{{scrollDots}}" ink:key="id"></view>
        </view>
        <view class="button-stack">
          <view
            class="{{item.cls}}"
            ink:for="{{prompts}}"
            ink:key="id"
            data-id="{{item.id}}"
            bindtap="selectPrompt"
          >
            <text class="{{item.labelCls}}">{{item.label}}</text>
          </view>
        </view>
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
  /* The list hugs the left screen edge; the right side keeps a page margin
     so the buttons and their text never reach the right edge. */
  padding: 20px 16px 20px 0;
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

.empty {
  padding: 32px 16px;
}

.empty-text {
  font-size: 13px;
  color: var(--rvi-text-secondary);
}

.menu-card {
  padding: 12px 12px 12px 0;
}

.list-wrap {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.scrollbar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding-top: 14px;
}

/* One dot per prompt; the cursor dot is solid green (rgba fills are not
   rendered by the device, use solid colors). */
.sd-dot {
  width: 6px;
  height: 6px;
  border-radius: 3px;
  background-color: #3a3a3a;
}

.sd-active {
  background-color: #40ff5e;
}

.button-stack {
  display: flex;
  flex-direction: column;
  /* Three-value flex: the `flex:1` shorthand is not parsed on device and the
     column then grows past the screen with its content. */
  flex: 1 1 0;
  gap: 12px;
}

/* Same look as the home menu buttons, but rendered as view: the native button
   hover repaint cannot be overridden with CSS, the view's can. Explicit pixel
   width: the flex chain (list-wrap → button-stack) does not reliably bound
   children on device — 100% width sometimes resolved to the text's intrinsic
   width and the row overflowed past the screen edge. 434 = 480 screen − 16
   page right margin − 12 card right padding − 6 scrollbar − 12 gap. */
.btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 434px;
  min-height: 36px;
  padding: 8px 12px;
  box-sizing: border-box;
  border-radius: var(--radius-md, 12px);
  border: 2px solid rgba(64, 255, 94, 0.6);
  background-color: transparent;
}

/* Label wraps within the button content width (434 − 24 padding − 4 border
   ≈ 406); >2-line overflow was clamped in JS. */
.btn-label {
  width: 404px;
  text-align: left;
  font-size: 14px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.85);
}

/* Cursor item: the only one with a fill. Never change font-weight on
   selection — bold changes glyph widths and re-wraps the clamped label. */
.btn.menu-active {
  border-color: #40ff5e;
  background-color: rgba(64, 255, 94, 0.2);
}

.btn-label-active {
  color: #ffffff;
}

/* Keep hover identical to the resting state (host default repaints black). */
.btn:hover {
  border-color: rgba(64, 255, 94, 0.6);
  background-color: transparent;
}

.btn:hover .btn-label {
  color: rgba(255, 255, 255, 0.85);
}

.btn.menu-active:hover {
  border-color: #40ff5e;
  background-color: rgba(64, 255, 94, 0.2);
}

.btn.menu-active:hover .btn-label {
  color: #ffffff;
}
</style>
