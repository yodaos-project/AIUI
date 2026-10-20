// UI strings for three locales, selected from navigator.languages.
// Locale resolution follows the navigator-info sample: RFC 4647 lookup with
// Hans/Hant inference for Chinese variants. The voice pipeline (ASR language,
// system prompt, preset content) stays zh-CN regardless of the UI locale.

const SUPPORTED_LOCALES = Object.freeze(['zh-CN', 'zh-TW', 'en-US']);
const DEFAULT_LOCALE = 'zh-CN';

// Chinese script/region subtags that map to the Traditional table; every
// other zh variant (zh, zh-Hans, zh-SG, …) falls back to Simplified.
const TRADITIONAL_CHINESE_MARKERS = Object.freeze(['hant', 'tw', 'hk', 'mo']);

const STRINGS = Object.freeze({
  'zh-CN': Object.freeze({
    homeTitle: '实时语音智能',
    homeHint: 'AI 监听对话，根据提示词生成参考信息',
    homeStart: '开始会话',
    homeEntering: '正在进入会话…',
    homeCreate: '新建提示词',
    homeEdit: '编辑提示词',
    opening: '正在打开…',
    homeCurrentLabel: '当前提示词',
    homeCurrentEmpty: '还没有提示词，点击「{create}」用语音创建',
    selectTitle: '选择要编辑的提示词',
    selectEmpty: '还没有提示词，请回主页「{create}」',
    inUsePrefix: '[使用中] ',
    editTitle: '编辑提示词',
    editOpeningMic: '正在开启麦克风…',
    editListening: '聆听中，请说话…',
    editStopped: '已停止 · 点击框继续说',
    editIdle: '点击框开始说话',
    editDone: '说完了',
    editSubmitting: '正在提交…',
    editDeleteLast: '删除上句',
    editDelete: '删除提示词',
    editDeleting: '正在删除…',
    editSave: '保存并返回',
    editSaving: '正在保存…',
    editUse: '选择使用',
    editUsing: '正在设置…',
    editEmptyInput: '还没有输入内容，请先说话',
    editSaveFailed: '保存失败：{message}',
    editDeleteFailed: '删除失败：{message}',
    editBackFailed: '返回失败：{message}',
    editMicModeRow: '收音模式',
    editIgnoreRow: '忽略无关对话',
    switchOn: '开',
    switchOff: '关',
    micModeTitle: '选择收音模式',
    micModeSelectedPrefix: '[当前] ',
    promptStatusLine: '忽略无关对话：{ignore} | 收音：{mode} | {label}：',
    micModes: Object.freeze({
      'far-field': '正前方',
      omnidirectional: '360°',
      wearer: '佩戴者',
      'system-audio': '蓝牙音频',
    }),
    micModeDescs: Object.freeze({
      'far-field': '仅收取佩戴者正前方的声音',
      omnidirectional: '收取360°全方向的声音',
      wearer: '仅收取佩戴者自己的声音',
      'system-audio': '仅收取来自手机的媒体音',
    }),
    rtFaceSpeaker: '请面向说话人',
    rtPromptMissing: '未找到提示词，按返回键回主页重新选择',
    rtVoiceError: '语音出错：{message} · 按 Enter 返回',
    rtVoiceEnded: '语音已结束 · 按 Enter 返回',
    rtNoReply: '（没有生成回复）',
    rtLLMError: '出错了：{message}',
    llmUnavailable: 'LanguageModel 不可用',
    promptEmpty: '提示词内容为空',
    asrErrors: Object.freeze({
      sessionUnsupported: '当前环境不支持 SpeechRecognitionSession',
      recorderUnsupported: '当前环境不支持录音',
      micUnsupported: '麦克风不可用',
      formatUnsupported: 'ASR 不支持 PCM 音频输入',
      startTimeout: '语音识别启动超时',
      stopTimeout: '停止语音识别超时',
      resultTimeout: '等待识别结果超时',
      notStarted: '录音尚未开始',
      recognitionFailed: '语音识别失败',
    }),
  }),
  'zh-TW': Object.freeze({
    homeTitle: '即時語音智慧',
    homeHint: 'AI 監聽對話，根據提示詞生成參考資訊',
    homeStart: '開始會話',
    homeEntering: '正在進入會話…',
    homeCreate: '新建提示詞',
    homeEdit: '編輯提示詞',
    opening: '正在開啟…',
    homeCurrentLabel: '目前提示詞',
    homeCurrentEmpty: '還沒有提示詞，點擊「{create}」用語音建立',
    selectTitle: '選擇要編輯的提示詞',
    selectEmpty: '還沒有提示詞，請回主頁「{create}」',
    inUsePrefix: '[使用中] ',
    editTitle: '編輯提示詞',
    editOpeningMic: '正在開啟麥克風…',
    editListening: '聆聽中，請說話…',
    editStopped: '已停止 · 點擊框繼續說',
    editIdle: '點擊框開始說話',
    editDone: '說完了',
    editSubmitting: '正在提交…',
    editDeleteLast: '刪除上句',
    editDelete: '刪除提示詞',
    editDeleting: '正在刪除…',
    editSave: '儲存並返回',
    editSaving: '正在儲存…',
    editUse: '選擇使用',
    editUsing: '正在設定…',
    editEmptyInput: '還沒有輸入內容，請先說話',
    editSaveFailed: '儲存失敗：{message}',
    editDeleteFailed: '刪除失敗：{message}',
    editBackFailed: '返回失敗：{message}',
    editMicModeRow: '收音模式',
    editIgnoreRow: '忽略無關對話',
    switchOn: '開',
    switchOff: '關',
    micModeTitle: '選擇收音模式',
    micModeSelectedPrefix: '[目前] ',
    promptStatusLine: '忽略無關對話：{ignore} | 收音：{mode} | {label}：',
    micModes: Object.freeze({
      'far-field': '正前方',
      omnidirectional: '360°',
      wearer: '佩戴者',
      'system-audio': '藍牙音訊',
    }),
    micModeDescs: Object.freeze({
      'far-field': '僅收取佩戴者正前方的聲音',
      omnidirectional: '收取360°全方向的聲音',
      wearer: '僅收取佩戴者自己的聲音',
      'system-audio': '僅收取來自手機的媒體音',
    }),
    rtFaceSpeaker: '請面向說話人',
    rtPromptMissing: '未找到提示詞，按返回鍵回主頁重新選擇',
    rtVoiceError: '語音出錯：{message} · 按 Enter 返回',
    rtVoiceEnded: '語音已結束 · 按 Enter 返回',
    rtNoReply: '（沒有生成回覆）',
    rtLLMError: '出錯了：{message}',
    llmUnavailable: 'LanguageModel 不可用',
    promptEmpty: '提示詞內容為空',
    asrErrors: Object.freeze({
      sessionUnsupported: '當前環境不支援 SpeechRecognitionSession',
      recorderUnsupported: '當前環境不支援錄音',
      micUnsupported: '麥克風不可用',
      formatUnsupported: 'ASR 不支援 PCM 音訊輸入',
      startTimeout: '語音識別啟動逾時',
      stopTimeout: '停止語音識別逾時',
      resultTimeout: '等待識別結果逾時',
      notStarted: '錄音尚未開始',
      recognitionFailed: '語音識別失敗',
    }),
  }),
  'en-US': Object.freeze({
    homeTitle: 'Realtime Voice Intelligence',
    homeHint: 'AI listens to the conversation and generates cues from your prompt',
    homeStart: 'Start session',
    homeEntering: 'Entering…',
    homeCreate: 'New prompt',
    homeEdit: 'Edit prompts',
    opening: 'Opening…',
    homeCurrentLabel: 'Current prompt',
    homeCurrentEmpty: 'No prompts yet — tap "{create}" to create one by voice',
    selectTitle: 'Select a prompt to edit',
    selectEmpty: 'No prompts yet — go home and tap "{create}"',
    inUsePrefix: '[In use] ',
    editTitle: 'Edit prompt',
    editOpeningMic: 'Opening microphone…',
    editListening: 'Listening, please speak…',
    editStopped: 'Stopped · tap the box to continue',
    editIdle: 'Tap the box to start speaking',
    editDone: 'Done speaking',
    editSubmitting: 'Submitting…',
    editDeleteLast: 'Delete last sentence',
    editDelete: 'Delete prompt',
    editDeleting: 'Deleting…',
    editSave: 'Save & back',
    editSaving: 'Saving…',
    editUse: 'Use this',
    editUsing: 'Setting…',
    editEmptyInput: 'Nothing captured yet — speak first',
    editSaveFailed: 'Save failed: {message}',
    editDeleteFailed: 'Delete failed: {message}',
    editBackFailed: 'Back failed: {message}',
    editMicModeRow: 'Capture mode',
    editIgnoreRow: 'Ignore irrelevant',
    switchOn: 'On',
    switchOff: 'Off',
    micModeTitle: 'Choose capture mode',
    micModeSelectedPrefix: '[Current] ',
    promptStatusLine: 'Ignore irrelevant: {ignore} | Mic: {mode} | {label}:',
    micModes: Object.freeze({
      'far-field': 'Front',
      omnidirectional: '360°',
      wearer: 'Wearer',
      'system-audio': 'Bluetooth audio',
    }),
    micModeDescs: Object.freeze({
      'far-field': 'Capture only sound directly in front of the wearer',
      omnidirectional: 'Capture sound from all directions',
      wearer: "Capture only the wearer's own voice",
      'system-audio': 'Capture only media audio from the phone',
    }),
    rtFaceSpeaker: 'Please face the speaker',
    rtPromptMissing: 'Prompt not found — press Back and pick again',
    rtVoiceError: 'Voice error: {message} · press Enter to go back',
    rtVoiceEnded: 'Voice ended · press Enter to go back',
    rtNoReply: '(no reply generated)',
    rtLLMError: 'Error: {message}',
    llmUnavailable: 'LanguageModel unavailable',
    promptEmpty: 'Prompt text is empty',
    asrErrors: Object.freeze({
      sessionUnsupported: 'SpeechRecognitionSession is not supported here',
      recorderUnsupported: 'Audio recording is not supported here',
      micUnsupported: 'Microphone unavailable',
      formatUnsupported: 'ASR does not accept PCM audio input',
      startTimeout: 'Timed out starting recognition',
      stopTimeout: 'Timed out stopping recognition',
      resultTimeout: 'Timed out waiting for the result',
      notStarted: 'Recording has not started',
      recognitionFailed: 'Speech recognition failed',
    }),
  }),
});

// Normalize an IETF BCP 47 tag: trim, lowercase, underscores to hyphens.
function normalizeLocaleTag(tag) {
  return typeof tag === 'string'
    ? tag.trim().toLowerCase().replace(/_/g, '-')
    : '';
}

// RFC 4647 Lookup: try the full tag, then strip trailing subtags
// (`zh-Hant-TW` → `zh-Hant` → `zh`) until one is supported.
function lookupSupportedLocale(normalizedTag) {
  let current = normalizedTag;
  while (current) {
    const matched = SUPPORTED_LOCALES.find((locale) => (
      locale.toLowerCase() === current
    ));
    if (matched) {
      return matched;
    }
    const lastHyphen = current.lastIndexOf('-');
    current = lastHyphen === -1 ? '' : current.slice(0, lastHyphen);
  }
  return '';
}

// Resolve a single tag: direct lookup first, then script/region inference
// (`zh-Hant*`/`zh-TW`/`zh-HK`/`zh-MO` → zh-TW, other zh* → zh-CN, en* → en-US).
function resolveSingleTag(tag) {
  const normalized = normalizeLocaleTag(tag);
  if (!normalized) {
    return '';
  }
  const direct = lookupSupportedLocale(normalized);
  if (direct) {
    return direct;
  }
  const subtags = normalized.split('-');
  const primary = subtags[0];
  if (primary === 'zh') {
    const isTraditional = subtags
      .slice(1)
      .some((subtag) => TRADITIONAL_CHINESE_MARKERS.includes(subtag));
    return isTraditional ? 'zh-TW' : 'zh-CN';
  }
  if (primary === 'en') {
    return 'en-US';
  }
  return '';
}

// Pick the UI locale from a priority-ordered candidate list (BCP 47 /
// RFC 4647): the first resolvable candidate wins, else the default locale.
export function resolveLocale(candidates) {
  const list = Array.isArray(candidates) ? candidates : [];
  let resolved = '';
  list.some((candidate) => {
    resolved = resolveSingleTag(candidate);
    return Boolean(resolved);
  });
  return resolved || DEFAULT_LOCALE;
}

// Read the UI locale from navigator.language / navigator.languages.
export function resolveUiLocale() {
  const candidates = [];
  if (typeof navigator !== 'undefined' && navigator) {
    if (typeof navigator.language === 'string') candidates.push(navigator.language);
    if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
  }
  return resolveLocale(candidates);
}

// String table for a locale key (unsupported keys fall back to the default).
export function getStrings(locale) {
  return STRINGS[locale] || STRINGS[DEFAULT_LOCALE];
}

// Fill `{key}` placeholders in a template string.
export function interpolate(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (
    values && values[key] !== undefined
      ? String(values[key])
      : match
  ));
}

// Map a recognizer error payload ({ key, message }) to localized text:
// known key → table entry, unknown/host key → raw message, else generic.
export function asrErrorText(strings, { key, message } = {}) {
  const table = (strings && strings.asrErrors) || {};
  return table[key] || message || table.recognitionFailed || '';
}

// Map a capture mode id (lib/mic-mode.js) to its localized display name.
export function micModeText(strings, mode) {
  const table = (strings && strings.micModes) || {};
  return table[mode] || mode;
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE };
