<script type="application/json" def>
{
  "navigationBarTitleText": "实时对话"
}
</script>

<script setup>
import wx from 'wx';
import { createRecognizer } from '../../lib/asr.js';
import { createChat, getErrorMessage } from '../../lib/llm.js';
import { getPrompt } from '../../lib/prompts-store.js';
import { DEFAULT_LOCALE, getStrings, resolveUiLocale, interpolate, asrErrorText } from '../../lib/i18n.js';
import { promptMicMode } from '../../lib/mic-mode.js';
import { promptIgnoreIrrelevant } from '../../lib/ignore-store.js';

// The voice pipeline (ASR language, system prompt, replies) stays zh-CN;
// only the on-screen chrome follows the UI locale (lib/i18n.js).
const SCENE_NOTE = '当前场景：Rokid 眼镜上的实时语音对话。用户的话由语音识别实时转写，并按语音停顿分多轮送达；请用简洁的中文口语化回答，便于边听边读。';

// Fixed system prompt: assistant identity, answer rules and output format,
// always placed before the user-selected prompt.
const SYSTEM_PROMPT = `你是智能眼镜的实时对话辅助引擎。
你收到的不是用户自己说的话，而是眼镜麦克风采集的与当前用户对话的对方说的话，以及上一轮对方说的话和你生成的参考信息。

【回答规则】
1. 优先直接回答问题，避免开场白。
2. 默认使用与当前对话相同的语言。
4. 通常控制在30个汉字以内。
5. 不重复问题原文，不解释自己的工作过程。
6. 避免没有信息价值的客套话。

【输出格式】
只输出最终提示文本。禁止 Markdown、JSON、解释和额外字符。

【场景要求】
请根据以下要求，为用户生成可以快速阅读、用于辅助自然对话的参考提示。输出必须简洁、准确、及时，并适合在眼镜的有限显示区域内阅读。`;

const MAX_AI_ROUNDS = 2;

// Skip-mark protocol: when "ignore irrelevant" is on (lib/ignore-store.js),
// the system prompt orders the model to answer unrelated turns with exactly
// this symbol; such replies are dropped instead of rendered.
const SKIP_MARK = '\u238B';

function isSkipText(text) {
  return typeof text === 'string' && text.trim() === SKIP_MARK;
}

// Injected into the system prompt when the toggle is on: irrelevant turns
// (greetings, small talk, off-topic) must answer with the skip mark only.
const IGNORE_RULE = `
【无关内容过滤】
如果对方说的话与上述提示词的要求无关（例如寒暄、闲聊或其他话题），只输出符号「⎋」，不要输出任何其他字符。只有与提示词相关的内容才按上述规则回答。`;

// Cap of the bottom-line rolling transcript: older text drops off the front
// (on screen it is already pushed out on the left).
const MAX_USER_CHARS = 100;

// Gap between utterance turns: 10 non-breaking spaces — plain spaces would
// collapse into one under white-space:nowrap, U+00A0 keeps the width stable.
const ROUND_GAP = '\u00A0'.repeat(10);

// Render-safe defaults; onLoad re-resolves from navigator.languages.
const L = getStrings(DEFAULT_LOCALE);

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default {
  data: {
    // AI replies, at most 2 rounds: the array tail is the latest round
    // (item.latest), the older round sits above it.
    aiRounds: [],
    // Bottom line: rolling transcript accumulated across turns (max 100
    // chars), no wrapping, newest characters glued to the right edge.
    // Starts as a default hint, overwritten by the first recognition result.
    userText: L.rtFaceSpeaker,
  },

  onLoad(query) {
    this.strings = getStrings(resolveUiLocale());
    this.setData({ userText: this.strings.rtFaceSpeaker });
    this.exiting = false;
    this.askQueue = Promise.resolve();
    // userBuffer holds the finalized part of the rolling transcript.
    this.userBuffer = '';
    this.loadedAt = Date.now();

    const prompt = getPrompt(query && query.id ? query.id : '');
    if (!prompt) {
      this.setData({ userText: this.strings.rtPromptMissing });
      return;
    }
    this.systemPrompt = `${SYSTEM_PROMPT}\n${prompt.text}\n${SCENE_NOTE}`;
    // The ignore filter is a per-prompt setting (lib/ignore-store.js); it is
    // read once when the session starts.
    this.ignoreFilter = promptIgnoreIrrelevant(prompt);
    if (this.ignoreFilter) this.systemPrompt += `\n${IGNORE_RULE}`;

    this.chat = createChat();
    this.chat.start(this.systemPrompt).catch((error) => {
      console.error('[rvi] chat.start failed:', getErrorMessage(error));
    });

    // Continuous mode: the selected prompt's own capture mode (lib/mic-mode.js;
    // default far-field — the demo listens to the conversation partner) + VAD
    // segmentation, writer stays open.
    this.voice = createRecognizer({
      SpeechRecognitionSession: typeof SpeechRecognitionSession === 'undefined' ? null : SpeechRecognitionSession,
      captureMode: promptMicMode(prompt),
      vad: true,
    });
    // Interim text is shown appended to the finalized buffer; an empty
    // interim marks a segment boundary and is ignored.
    this.voice.oninterim = ({ text } = {}) => {
      if (this.exiting || !text) return;
      this.setData({ userText: this.joinRound(this.userBuffer, text).slice(-MAX_USER_CHARS) });
    };
    // Every VAD-finalized segment is one turn: commit into the buffer and
    // send to the LLM.
    this.voice.onsegment = ({ text } = {}) => {
      if (this.exiting || !text) return;
      this.userBuffer = this.joinRound(this.userBuffer, text).slice(-MAX_USER_CHARS);
      this.setData({ userText: this.userBuffer });
      this.queueAsk(text);
    };
    // The recognizer reports stable error keys; map them to locale text.
    this.voice.onerror = (payload = {}) => {
      if (this.exiting) return;
      this.setData({
        userText: interpolate(this.strings.rtVoiceError, { message: asrErrorText(this.strings, payload) }),
      });
    };
    this.voice.onend = () => {
      if (this.exiting || this.data.userText) return;
      this.setData({ userText: this.strings.rtVoiceEnded });
    };
    this.voice.start();
  },

  onUnload() {
    this.cleanup();
  },

  onHide() {
    this.cleanup();
  },

  cleanup() {
    this.exiting = true;
    if (this.voice) this.voice.abort();
    if (this.chat) this.chat.destroy();
  },

  // Localize a thrown keyed error (libs emit stable keys, see lib/i18n.js);
  // host errors without a known key fall back to their raw message.
  errorText(error) {
    if (error && error.key && this.strings[error.key]) return this.strings[error.key];
    return getErrorMessage(error);
  },

  pushAiRound(id) {
    // Class names precomputed in JS: the renderer rejects loop-scoped
    // template expressions (same lesson as the select page).
    const rounds = (this.data.aiRounds || [])
      .map((round) => ({ ...round, latest: false, cls: 'ai-text ai-text-old' }))
      .concat([{ id, text: '…', latest: true, cls: 'ai-text ai-text-new' }])
      .slice(-MAX_AI_ROUNDS);
    this.setData({ aiRounds: rounds });
  },

  updateAiRound(id, text) {
    if (this.exiting) return;
    this.setData({
      aiRounds: (this.data.aiRounds || []).map((round) => (round.id === id ? { ...round, text } : round)),
    });
  },

  // A skipped (irrelevant) turn: drop its round instead of rendering the
  // skip mark, and re-mark the remaining latest round.
  dropAiRound(id) {
    if (this.exiting) return;
    const kept = (this.data.aiRounds || []).filter((round) => round.id !== id);
    this.setData({
      aiRounds: kept.map((round, index) => ({
        ...round,
        latest: index === kept.length - 1,
        cls: index === kept.length - 1 ? 'ai-text ai-text-new' : 'ai-text ai-text-old',
      })),
    });
  },

  joinRound(buffer, text) {
    return buffer ? `${buffer}${ROUND_GAP}${text}` : text;
  },

  // The LLM has no streaming-cancel API: turns are queued serially, each
  // waits for the previous stream to finish. The bottom line is a cumulative
  // transcript and is not cleared when a reply completes.
  queueAsk(text) {
    this.askQueue = this.askQueue.then(async () => {
      if (this.exiting) return;
      const assistantId = makeId('assistant');
      this.pushAiRound(assistantId);
      try {
        await this.chat.start(this.systemPrompt);
        const finalText = await this.chat.ask(text, {
          // Skip-mark replies are dropped at any streaming step.
          onDelta: (full) => {
            if (this.ignoreFilter && isSkipText(full)) {
              this.dropAiRound(assistantId);
              return;
            }
            this.updateAiRound(assistantId, full);
          },
        });
        if (this.ignoreFilter && isSkipText(finalText)) {
          this.dropAiRound(assistantId);
          return;
        }
        this.updateAiRound(assistantId, finalText || this.strings.rtNoReply);
      } catch (error) {
        this.updateAiRound(assistantId, interpolate(this.strings.rtLLMError, { message: this.errorText(error) }));
      }
    });
  },

  endConversation() {
    this.cleanup();
    // The device bridge of wx.navigateBack requires ≥1 argument (calling it
    // with none throws even though the options are documented as optional).
    wx.navigateBack({});
  },

  // Enter ends the conversation and goes back; arrows and Backspace keep
  // their host defaults (scroll / back).
  onKeyUp(event) {
    if (!event || event.code !== 'Enter') return;
    if (typeof event.preventDefault === 'function') {
      event.preventDefault();
    }
    // An Enter within 1s of load is the keyup tail of the key that activated
    // this page — ignore it so the session isn't ended immediately.
    if (Date.now() - (this.loadedAt || 0) < 1000) return;
    this.endConversation();
  },
};
</script>

<page>
  <view class="stage">
    <view class="ai-area">
      <view class="ai-round" ink:for="{{aiRounds}}" ink:key="id">
        <text class="{{item.cls}}">{{item.text}}</text>
      </view>
    </view>

    <view class="user-line">
      <text class="user-text">{{userText}}</text>
    </view>
  </view>
</page>

<style>
/* Minimal conversation stage, anchored to the bottom of the screen.
   Top: AI replies (max 2 rounds, newest at the bottom, older rolls up).
   Below a gap: the single-line user transcript (no wrap, newest characters
   always at the right edge). */
.stage {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  box-sizing: border-box;
  padding: 20px 0;
}

/* AI area: bottom-aligned, grows upward; overflow is clipped at the top
   (oldest round first). */
.ai-area {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 16px;
  overflow: hidden;
}

.ai-text {
  font-size: 17px;
  line-height: 26px;
}

/* Older round: faded into the background. */
.ai-text-old {
  color: rgba(255, 255, 255, 0.5);
}

/* Latest round (streaming or just finished). */
.ai-text-new {
  color: rgba(255, 255, 255, 0.85);
}

/* Bottom user line: single line, right-aligned — text past the screen width
   is clipped on the left so the newest words stay visible. */
.user-line {
  margin-top: 24px;
  min-height: 24px;
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  overflow: hidden;
}

.user-text {
  flex-shrink: 0;
  font-size: 15px;
  line-height: 24px;
  color: rgba(255, 255, 255, 0.85);
  white-space: nowrap;
}
</style>
