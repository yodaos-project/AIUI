<script type="application/json" def>
{
  "navigationBarTitleText": "收音模式"
}
</script>

<script setup>
import wx from 'wx';
import { MIC_MODES, DEFAULT_MIC_MODE, setEditMicModeDraft } from '../../lib/mic-mode.js';
import { DEFAULT_LOCALE, getStrings, resolveUiLocale } from '../../lib/i18n.js';

// Render-safe defaults; onLoad re-resolves from navigator.languages.
const L = getStrings(DEFAULT_LOCALE);

// One-line option rows: name + description share a row. Text in a flex row
// does not wrap on device, so descriptions are pre-clamped to the remaining
// width (proportional-font estimate, same approach as the select page).
// Content width = 480 (screen) − card padding 12×2 − border 2×2 = 452.
const CARD_CONTENT_PX = 452;
const NAME_GAP_PX = 12;
const NAME_PX_FULLWIDTH = 15;
const NAME_PX_HALFWIDTH = 8;
const DESC_PX_FULLWIDTH = 12;
const DESC_PX_HALFWIDTH = 7;
const DESC_PX_SPACE = 4;
const DESC_PX_ELLIPSIS = 12;

function namePx(text) {
  let px = 0;
  for (const ch of text) {
    px += ch === ' ' ? DESC_PX_SPACE
      : (ch.codePointAt(0) >= 0x2e80 ? NAME_PX_FULLWIDTH : NAME_PX_HALFWIDTH);
  }
  return px;
}

function clampDesc(name, desc) {
  const budget = CARD_CONTENT_PX - namePx(name) - NAME_GAP_PX - DESC_PX_ELLIPSIS;
  if (budget <= 0) return desc;
  let px = 0;
  let out = '';
  for (const ch of desc) {
    const next = ch === ' ' ? DESC_PX_SPACE
      : (ch.codePointAt(0) >= 0x2e80 ? DESC_PX_FULLWIDTH : DESC_PX_HALFWIDTH);
    if (px + next > budget) return `${out}…`;
    px += next;
    out += ch;
  }
  return desc;
}

export default {
  data: {
    // Localized UI strings (templates only interpolate — see lib/i18n.js).
    pageTitle: L.micModeTitle,
    // Render items { id, cls, nameCls, name, desc }: class names and labels
    // are precomputed in JS — the renderer rejects loop-scoped template
    // expressions (cursor === index), so templates keep only {{item.x}}.
    modes: [],
    cursor: 0,
  },

  onLoad(query) {
    this.strings = getStrings(resolveUiLocale());
    // Opened from the edit page with the prompt's current draft mode; the
    // cursor starts on it.
    this.currentMode = MIC_MODES.includes(query && query.mode)
      ? query.mode
      : DEFAULT_MIC_MODE;
    const cursor = Math.max(0, MIC_MODES.indexOf(this.currentMode));
    this.setData({
      pageTitle: this.strings.micModeTitle,
      cursor,
      modes: this.buildView(cursor),
    });
  },

  onShow() {
    // The timestamp filters the Enter keyup tail of the key that opened us.
    this.loadedAt = Date.now();
    this.reload();
  },

  // Build render items: one per supported mode, the prompt's draft selection
  // tagged with a prefix, the cursor item highlighted.
  buildView(cursor) {
    const activeCursor = typeof cursor === 'number' ? cursor : this.data.cursor;
    const strings = this.strings || L;
    const selected = this.currentMode || DEFAULT_MIC_MODE;
    return MIC_MODES.map((id, index) => {
      const name = `${selected === id ? strings.micModeSelectedPrefix : ''}${strings.micModes[id]}`;
      return {
        id,
        cls: index === activeCursor ? 'mode-card menu-active' : 'mode-card',
        nameCls: index === activeCursor ? 'mode-name mode-name-active' : 'mode-name',
        name,
        desc: clampDesc(name, strings.micModeDescs[id]),
      };
    });
  },

  reload() {
    this.setData({ modes: this.buildView() });
  },

  // Self-managed cursor: ArrowUp/Down move through the four modes, Enter picks
  // the cursor item and returns. Backspace keeps its host default (back).
  onKeyUp(event) {
    const code = event && event.code;
    if (code !== 'ArrowUp' && code !== 'ArrowDown' && code !== 'Enter') return;
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    const count = MIC_MODES.length;
    if (code === 'Enter') {
      // An Enter within 1s of onShow is the keyup tail of the key that opened
      // this page — ignore it.
      if (Date.now() - (this.loadedAt || 0) < 1000) return;
      const item = this.data.modes[this.data.cursor];
      if (item) this.choose(item.id);
      return;
    }
    const current = this.data.cursor >= 0 && this.data.cursor < count ? this.data.cursor : 0;
    const cursor = code === 'ArrowUp' ? (current - 1 + count) % count : (current + 1) % count;
    this.setData({ cursor, modes: this.buildView(cursor) });
  },

  selectMode(event) {
    const id = event && event.currentTarget && event.currentTarget.dataset
      ? event.currentTarget.dataset.id
      : '';
    if (id) this.choose(id);
  },

  // Write the choice into the edit draft (persisted by the edit page on
  // save) and return to it.
  choose(id) {
    setEditMicModeDraft(id);
    // The device bridge of wx.navigateBack requires ≥1 argument (calling it
    // with none throws even though the options are documented as optional).
    wx.navigateBack({});
  },
};
</script>

<page>
  <view class="container">
    <view class="header">
      <text class="page-title">{{pageTitle}}</text>
    </view>

    <view class="mode-list">
      <view
        class="{{item.cls}}"
        ink:for="{{modes}}"
        ink:key="id"
        data-id="{{item.id}}"
        bindtap="selectMode"
      >
        <text class="{{item.nameCls}}">{{item.name}}</text>
        <text class="mode-desc">{{item.desc}}</text>
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
  /* Zero horizontal page margin: the list hugs the screen edges. */
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

.mode-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Option card: view (not native button) so the hover repaint can be
   overridden with CSS — same lesson as the select page. Name and description
   share one row (description pre-clamped in JS). */
.mode-card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 8px 12px;
  box-sizing: border-box;
  border-radius: var(--radius-md, 12px);
  border: 2px solid rgba(64, 255, 94, 0.6);
  background-color: transparent;
}

/* Cursor item: the only one with a fill. */
.mode-card.menu-active {
  border-color: #40ff5e;
  background-color: rgba(64, 255, 94, 0.2);
}

.mode-name {
  /* Three-value flex: the `flex:1` shorthand is not parsed on device. */
  flex: 0 0 auto;
  font-size: 15px;
  line-height: 22px;
  color: rgba(255, 255, 255, 0.85);
}

.mode-name-active {
  color: #ffffff;
}

.mode-desc {
  flex: 1 1 0;
  font-size: 12px;
  line-height: 18px;
  color: var(--rvi-text-secondary);
}

/* Keep hover identical to the resting state (host default repaints black). */
.mode-card:hover {
  border-color: rgba(64, 255, 94, 0.6);
  background-color: transparent;
}

.mode-card.menu-active:hover {
  border-color: #40ff5e;
  background-color: rgba(64, 255, 94, 0.2);
}
</style>
