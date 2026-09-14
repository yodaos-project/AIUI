const SUPPORTED_LOCALES = Object.freeze(['zh-CN', 'zh-TW', 'en-US']);

const DEFAULT_LOCALE = 'zh-CN';

// 中文按书写系统区分简繁：Hant（繁体）及繁体通行地区（台湾、香港、澳门）归入
// zh-TW，Hans（简体）及其余中文变体（含 zh、zh-CN、zh-SG）归入 zh-CN。
const TRADITIONAL_CHINESE_MARKERS = Object.freeze(['hant', 'tw', 'hk', 'mo']);

const STRINGS = Object.freeze({
  'zh-CN': Object.freeze({
    statusReading: '正在读取 Navigator 信息',
    statusReady: 'Navigator 信息读取完成',
    readAtSuffix: '读取',
    panelRuntime: '运行时',
    panelLocale: '语言与区域',
    panelMounts: '能力入口',
    panelBattery: '电池',
    keySystem: '系统',
    keyArch: '架构',
    keyInkSkia: 'Ink / Skia',
    keyRendering: '渲染',
    keyLanguage: '首选语言',
    keyLanguages: '语言偏好',
    keyRegion: '区域',
    keyUiLocale: '界面语言',
    mountsNote: '是否可用取决于宿主能力与权限',
    mounted: '已挂载',
    notMounted: '未挂载',
    renderingEnabled: '已启用',
    renderingDisabled: '未启用',
    notSet: '(未设置)',
    unknown: '--',
    charging: '充电中',
    discharging: '放电中',
    batteryUnavailable: '不可用',
    noBatteryApi: '宿主未提供电池接口',
    noBatteryCapability: '宿主未注册电池能力',
    batteryCallFailed: '电池接口调用失败',
    autoRefreshTemplate: '{n}s 后自动读取',
    hintReadonly: '只读展示 · 不保存不上传',
    hintRefresh: '长按镜腿重新读取',
    batteryMethod: 'getBattery()'
  }),
  'zh-TW': Object.freeze({
    statusReading: '正在讀取 Navigator 資訊',
    statusReady: 'Navigator 資訊讀取完成',
    readAtSuffix: '讀取',
    panelRuntime: '執行環境',
    panelLocale: '語言與地區',
    panelMounts: '能力入口',
    panelBattery: '電池',
    keySystem: '系統',
    keyArch: '架構',
    keyInkSkia: 'Ink / Skia',
    keyRendering: '渲染',
    keyLanguage: '首選語言',
    keyLanguages: '語言偏好',
    keyRegion: '地區',
    keyUiLocale: '介面語言',
    mountsNote: '是否可用取決於宿主能力與權限',
    mounted: '已掛載',
    notMounted: '未掛載',
    renderingEnabled: '已啟用',
    renderingDisabled: '未啟用',
    notSet: '(未設定)',
    unknown: '--',
    charging: '充電中',
    discharging: '放電中',
    batteryUnavailable: '不可用',
    noBatteryApi: '宿主未提供電池介面',
    noBatteryCapability: '宿主未註冊電池能力',
    batteryCallFailed: '電池介面呼叫失敗',
    autoRefreshTemplate: '{n}s 後自動讀取',
    hintReadonly: '唯讀展示 · 不保存不上傳',
    hintRefresh: '長按鏡腿重新讀取',
    batteryMethod: 'getBattery()'
  }),
  'en-US': Object.freeze({
    statusReading: 'Reading Navigator info',
    statusReady: 'Navigator info loaded',
    readAtSuffix: 'read',
    panelRuntime: 'Runtime',
    panelLocale: 'Locale',
    panelMounts: 'Capabilities',
    panelBattery: 'Battery',
    keySystem: 'System',
    keyArch: 'Arch',
    keyInkSkia: 'Ink / Skia',
    keyRendering: 'Rendering',
    keyLanguage: 'Language',
    keyLanguages: 'Preferences',
    keyRegion: 'Region',
    keyUiLocale: 'UI Locale',
    mountsNote: 'Availability depends on host capability and permission',
    mounted: 'Mounted',
    notMounted: 'Unmounted',
    renderingEnabled: 'Enabled',
    renderingDisabled: 'Disabled',
    notSet: '(Not set)',
    unknown: '--',
    charging: 'Charging',
    discharging: 'Discharging',
    batteryUnavailable: 'Unavailable',
    noBatteryApi: 'Host provides no battery API',
    noBatteryCapability: 'Battery capability not registered',
    batteryCallFailed: 'Battery API call failed',
    autoRefreshTemplate: 'auto refresh in {n}s',
    hintReadonly: 'Read-only · nothing saved or uploaded',
    hintRefresh: 'Long-press temple to refresh',
    batteryMethod: 'getBattery()'
  })
});

/**
 * 规范化 IETF BCP 47 语言标签：去空白、转小写、下划线分隔符转连字符。
 *
 * @param {unknown} tag 原始语言标签。
 * @returns {string} 规范化标签，无效时返回空字符串。
 */
function normalizeLocaleTag(tag) {
  return typeof tag === 'string'
    ? tag.trim().toLowerCase().replace(/_/g, '-')
    : '';
}

/**
 * 按 RFC 4647 Lookup 语义查找支持的语言：从完整标签开始，
 * 逐步去掉末尾子标签（如 `zh-Hant-TW` → `zh-Hant` → `zh`）直到命中。
 *
 * @param {string} normalizedTag 规范化后的语言标签。
 * @returns {string} 支持的语言键，未命中时返回空字符串。
 */
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

/**
 * 解析单个语言标签，未命中支持语言时返回空字符串。
 *
 * 匹配顺序：
 * 1. RFC 4647 Lookup 截断匹配（`zh-CN`、`zh-TW`、`en-US` 直接命中）；
 * 2. 中文简繁推断：`zh-Hant*`、`zh-TW`、`zh-HK`、`zh-MO` 归入繁体 zh-TW，
 *    其余中文变体（`zh`、`zh-Hans*`、`zh-SG` 等）归入简体 zh-CN；
 * 3. `en*` 归入 en-US。
 *
 * @param {unknown} tag 原始语言标签。
 * @returns {string} 支持的语言键，无法解析时返回空字符串。
 */
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

/**
 * 按优先级从语言偏好中解析界面语言。
 *
 * 依据 BCP 47 / RFC 4647：依次处理每个候选标签（首选语言在最前），
 * 第一个解析成功的候选生效；全部未命中时回退默认语言。
 *
 * @param {unknown} candidates 按优先级排列的语言标签列表。
 * @returns {string} 支持的语言键。
 */
export function resolveLocale(candidates) {
  const list = Array.isArray(candidates) ? candidates : [];
  let resolved = '';
  list.some((candidate) => {
    resolved = resolveSingleTag(candidate);
    return Boolean(resolved);
  });
  return resolved || DEFAULT_LOCALE;
}

/**
 * 读取指定语言的文案表。
 *
 * @param {string} locale 语言键。
 * @returns {object} 文案表，未支持的语言回退默认语言。
 */
export function getStrings(locale) {
  return STRINGS[locale] || STRINGS[DEFAULT_LOCALE];
}

/**
 * 以 `{key}` 占位符填充模板。
 *
 * @param {string} template 文案模板。
 * @param {object} values 占位符取值表。
 * @returns {string} 填充后的文本。
 */
export function interpolate(template, values) {
  return template.replace(/\{(\w+)\}/g, (match, key) => (
    values && values[key] !== undefined
      ? String(values[key])
      : match
  ));
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE };
