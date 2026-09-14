<script def>
{
    "navigationBarTitleText": "设备信息",
    "description": "读取并展示眼镜当前的 Navigator 运行环境、语言区域、能力挂载与电池状态，界面语言跟随 navigator.languages 自动解析。",
    "schema": {
        "data": {
            "type": "object",
            "properties": {}
        }
    }
}
</script>

<script setup>
import {
    DEFAULT_LOCALE,
    getStrings,
    interpolate,
    resolveLocale
} from '../../lib/i18n.js';

const PageStatus = Object.freeze({
    INITIALIZING: 'initializing',
    READY: 'ready',
    ERROR: 'error'
});

const AutoRefreshConfig = Object.freeze({
    INTERVAL_SECONDS: 5,
    TICK_MS: 1000
});

const UserAgentPattern = Object.freeze({
    AIUI: /(?:^|\s)AIUI\/([0-9]+(?:\.[0-9]+){1,3})(?=\s|\(|$)/,
    PLATFORM: /AIUI\/[0-9]+(?:\.[0-9]+){1,3}\s*\(([^;()]+);\s*([^)]+)\)/,
    INK: /(?:^|\s)Ink\/([0-9]+(?:\.[0-9]+){1,3}(?:-[A-Za-z0-9.-]+)?)(?=\s|$)/
});

const BatteryEventType = Object.freeze([
    'levelchange',
    'chargingchange'
]);

const initialStrings = getStrings(DEFAULT_LOCALE);

/**
 * 安全读取 navigator 上的指定属性。
 *
 * @param {string} field 属性名。
 * @returns {unknown} 属性值，无法读取时返回 null。
 */
function readNavigatorField(field) {
    try {
        const value = navigator[field];
        return value === undefined ? null : value;
    } catch (error) {
        return null;
    }
}

/**
 * 安全读取当前运行环境的 User-Agent。
 *
 * @returns {string} User-Agent 原文，无法读取时返回空字符串。
 */
function readUserAgent() {
    const userAgent = readNavigatorField('userAgent');
    return typeof userAgent === 'string' ? userAgent : '';
}

/**
 * 安全读取宿主提供的设备序列号。
 *
 * @returns {string | null} 序列号，接口不存在或读取失败时返回 null。
 */
function readSerialNumber() {
    try {
        return typeof navigator.getDeviceSerialNumber === 'function'
            ? navigator.getDeviceSerialNumber()
            : null;
    } catch (error) {
        return null;
    }
}

/**
 * 读取正则表达式的第一个捕获组。
 *
 * @param {string} source 待解析字符串。
 * @param {RegExp} pattern 解析规则。
 * @returns {string} 捕获结果，未匹配时返回占位符。
 */
function readFirstMatch(source, pattern) {
    const match = source.match(pattern);
    return match && match[1]
        ? match[1].trim()
        : initialStrings.unknown;
}

/**
 * 解析 AIUI 运行时 User-Agent。
 *
 * 支持格式：`AIUI/0.15 (YodaOS Sprite; aarch64) Ink/0.15.0`。
 *
 * @param {string} userAgent Navigator 返回的 User-Agent。
 * @returns {{aiuiVersion: string, systemName: string, architecture: string, inkVersion: string}} 结构化运行环境信息。
 */
function parseRuntimeUserAgent(userAgent) {
    const source = typeof userAgent === 'string'
        ? userAgent.trim()
        : '';
    const platformMatch = source.match(UserAgentPattern.PLATFORM);
    return {
        aiuiVersion: readFirstMatch(source, UserAgentPattern.AIUI),
        systemName: platformMatch && platformMatch[1]
            ? platformMatch[1].trim()
            : initialStrings.unknown,
        architecture: platformMatch && platformMatch[2]
            ? platformMatch[2].trim()
            : initialStrings.unknown,
        inkVersion: readFirstMatch(source, UserAgentPattern.INK)
    };
}

/**
 * 汇总语言解析候选：首选语言排在最前，语言偏好列表依次跟随。
 *
 * @param {unknown} language `navigator.language` 原始值。
 * @param {unknown} languages `navigator.languages` 原始值。
 * @returns {string[]} 候选标签列表。
 */
function buildLocaleCandidates(language, languages) {
    const candidates = [];
    if (typeof language === 'string' && language.trim()) {
        candidates.push(language);
    }
    if (Array.isArray(languages)) {
        languages.forEach((item) => {
            if (typeof item === 'string' && item.trim()) {
                candidates.push(item);
            }
        });
    }
    return candidates;
}

/**
 * 汇总当前语言需要的全部静态标签，供一次性 setData。
 *
 * @param {object} strings 当前语言文案表。
 * @returns {object} 标签字段集合。
 */
function buildLabelData(strings) {
    return {
        readAtSuffix: strings.readAtSuffix,
        panelRuntimeLabel: strings.panelRuntime,
        panelLocaleLabel: strings.panelLocale,
        panelMountsLabel: strings.panelMounts,
        panelBatteryLabel: strings.panelBattery,
        systemKey: strings.keySystem,
        archKey: strings.keyArch,
        inkSkiaKey: strings.keyInkSkia,
        renderingKey: strings.keyRendering,
        languageKey: strings.keyLanguage,
        languagesKey: strings.keyLanguages,
        regionKey: strings.keyRegion,
        uiLocaleKey: strings.keyUiLocale,
        mountsNoteText: strings.mountsNote,
        batteryMethodText: strings.batteryMethod,
        hintReadonlyText: strings.hintReadonly,
        hintRefreshText: strings.hintRefresh
    };
}

/**
 * 格式化宿主提供的文本配置值。
 *
 * @param {unknown} value 原始值。
 * @param {object} strings 当前语言文案表。
 * @returns {string} 去除首尾空白后的文本，空值返回占位符。
 */
function formatTextValue(value, strings) {
    if (typeof value !== 'string') {
        return strings.unknown;
    }
    const trimmed = value.trim();
    return trimmed || strings.notSet;
}

/**
 * 格式化语言偏好列表。
 *
 * @param {unknown} languages `navigator.languages` 原始值。
 * @param {object} strings 当前语言文案表。
 * @returns {string} 以「·」连接的语言列表，空列表返回占位符。
 */
function formatLanguages(languages, strings) {
    if (!Array.isArray(languages)) {
        return strings.unknown;
    }
    const items = languages
        .filter((item) => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item);
    return items.length
        ? items.join(' · ')
        : strings.notSet;
}

/**
 * 读取能力入口属性的挂载状态。
 *
 * @param {string} field navigator 上的属性名。
 * @param {object} strings 当前语言文案表。
 * @returns {string} 当前语言的挂载状态文本。
 */
function getMountState(field, strings) {
    return readNavigatorField(field)
        ? strings.mounted
        : strings.notMounted;
}

/**
 * 补齐时间数字的两位前导零。
 *
 * @param {number} value 原始数值。
 * @returns {string} 两位文本。
 */
function padTime(value) {
    return value < 10 ? `0${value}` : String(value);
}

/**
 * 格式化本次读取时间。
 *
 * @returns {string} `HH:MM:SS` 文本。
 */
function formatReadTime() {
    const now = new Date();
    return [
        padTime(now.getHours()),
        padTime(now.getMinutes()),
        padTime(now.getSeconds())
    ].join(':');
}

/**
 * 将归一化电量格式化为百分比文本。
 *
 * @param {unknown} level `battery.level` 原始值。
 * @returns {string} 百分比文本，无法读取时返回占位符。
 */
function formatBatteryLevel(level) {
    if (typeof level !== 'number' || !Number.isFinite(level)) {
        return initialStrings.unknown;
    }
    return `${Math.round(Math.min(Math.max(level, 0), 1) * 100)}%`;
}

export default {
    data: Object.assign({
        status: PageStatus.INITIALIZING,
        statusTitle: initialStrings.statusReading,
        readAtText: '--:--:--',
        countdownText: '--',
        aiuiVersion: initialStrings.unknown,
        systemName: initialStrings.unknown,
        architecture: initialStrings.unknown,
        inkVersion: initialStrings.unknown,
        skiaVersion: initialStrings.unknown,
        renderingState: initialStrings.unknown,
        languageText: initialStrings.unknown,
        languagesText: initialStrings.unknown,
        regionText: initialStrings.unknown,
        uiLocaleText: DEFAULT_LOCALE,
        bluetoothState: initialStrings.notMounted,
        geolocationState: initialStrings.notMounted,
        mediaDevicesState: initialStrings.notMounted,
        storageState: initialStrings.notMounted,
        batteryLevelText: initialStrings.unknown,
        batteryStatusText: initialStrings.batteryUnavailable,
        userAgentText: initialStrings.unknown
    }, buildLabelData(initialStrings)),

    /**
     * 初始化页面并保存电池管理器引用。
     *
     * @returns {void}
     */
    onLoad() {
        this.strings = initialStrings;
        this.batteryManager = null;
        this.batteryListener = null;
        this.batteryRequestId = 0;
        this.autoRefreshIntervalSeconds = AutoRefreshConfig.INTERVAL_SECONDS;
        this.autoRefreshRemaining = 0;
        this.autoRefreshTimer = null;
    },

    /**
     * 页面显示时重新读取全部 Navigator 信息并启动自动刷新。
     *
     * @returns {void}
     */
    onShow() {
        this.refreshNavigatorInfo();
        this.startAutoRefresh();
    },

    /**
     * 页面隐藏时停止监听电池变化与自动刷新。
     *
     * @returns {void}
     */
    onHide() {
        this.detachBattery();
        this.stopAutoRefresh();
    },

    /**
     * 页面卸载时停止监听电池变化与自动刷新。
     *
     * @returns {void}
     */
    onUnload() {
        this.detachBattery();
        this.stopAutoRefresh();
    },

    /**
     * 长按镜腿触发语音/触控唤醒事件时，接管该事件并重新读取全部信息。
     *
     * 依据页面事件规范：默认不校验 `event.keyword`，事件触发即响应；
     * 调用 `event.preventDefault()` 拦截宿主默认的唤醒行为。
     *
     * @param {{preventDefault?: Function}} event 唤醒事件。
     * @returns {void}
     */
    onVoiceWakeup(event) {
        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }
        this.refreshNavigatorInfo();
    },

    /**
     * 按当前语言偏好解析界面语言，读取 navigator 的同步信息
     * 并刷新页面，最后异步读取电池。
     *
     * @returns {void}
     */
    refreshNavigatorInfo() {
        const language = readNavigatorField('language');
        const languages = readNavigatorField('languages');
        const locale = resolveLocale(
            buildLocaleCandidates(language, languages)
        );
        const strings = getStrings(locale);
        this.strings = strings;
        this.autoRefreshRemaining = this.autoRefreshIntervalSeconds;
        this.setData(Object.assign({
            status: PageStatus.INITIALIZING,
            statusTitle: strings.statusReading,
            countdownText: interpolate(strings.autoRefreshTemplate, {
                n: this.autoRefreshRemaining
            })
        }, buildLabelData(strings)));
        const userAgent = readUserAgent();
        const runtime = parseRuntimeUserAgent(userAgent);
        const versions = readNavigatorField('versions');
        const versionSource = versions && typeof versions === 'object'
            ? versions
            : {};
        const renderingEnabled = readNavigatorField('renderingEnabled');
        const serialNumber = readSerialNumber();
        const agentId = readNavigatorField('id');
        const snapshot = {
            locale,
            userAgent,
            id: typeof agentId === 'string' ? agentId : '',
            serialNumber: typeof serialNumber === 'string' ? serialNumber : '',
            language,
            languages: Array.isArray(languages) ? languages : [],
            region: readNavigatorField('region'),
            versions: {
                ink: versionSource.ink,
                skia: versionSource.skia
            },
            renderingEnabled,
            mounts: {
                bluetooth: Boolean(readNavigatorField('bluetooth')),
                geolocation: Boolean(readNavigatorField('geolocation')),
                mediaDevices: Boolean(readNavigatorField('mediaDevices')),
                storage: Boolean(readNavigatorField('storage'))
            }
        };
        this.setData({
            status: PageStatus.READY,
            statusTitle: strings.statusReady,
            readAtText: formatReadTime(),
            countdownText: interpolate(strings.autoRefreshTemplate, {
                n: this.autoRefreshRemaining
            }),
            aiuiVersion: runtime.aiuiVersion,
            systemName: runtime.systemName,
            architecture: runtime.architecture,
            userAgentText: userAgent || strings.unknown,
            inkVersion: formatTextValue(versionSource.ink, strings),
            skiaVersion: formatTextValue(versionSource.skia, strings),
            renderingState: renderingEnabled === true
                ? strings.renderingEnabled
                : renderingEnabled === false
                    ? strings.renderingDisabled
                    : strings.unknown,
            languageText: formatTextValue(snapshot.language, strings),
            languagesText: formatLanguages(snapshot.languages, strings),
            regionText: formatTextValue(snapshot.region, strings),
            uiLocaleText: locale,
            bluetoothState: getMountState('bluetooth', strings),
            geolocationState: getMountState('geolocation', strings),
            mediaDevicesState: getMountState('mediaDevices', strings),
            storageState: getMountState('storage', strings)
        });
        console.log('[navigator-info] locale:', locale);
        console.log('[navigator-info] snapshot:', snapshot);
        this.loadBattery();
    },

    /**
     * 启动每秒一次的自动刷新计时。
     *
     * 倒计时归零时触发一次完整读取并重置；定时器随页面隐藏或
     * 卸载释放，重复调用先清理旧定时器。
     *
     * @returns {void}
     */
    startAutoRefresh() {
        this.stopAutoRefresh();
        this.autoRefreshTimer = setInterval(() => {
            this.handleAutoRefreshTick();
        }, AutoRefreshConfig.TICK_MS);
    },

    /**
     * 处理一次倒计时：递减剩余秒数，归零时重新读取，否则更新倒计时文本。
     *
     * @returns {void}
     */
    handleAutoRefreshTick() {
        this.autoRefreshRemaining -= 1;
        if (this.autoRefreshRemaining <= 0) {
            this.refreshNavigatorInfo();
            return;
        }
        this.setData({
            countdownText: interpolate(
                this.strings.autoRefreshTemplate,
                { n: this.autoRefreshRemaining }
            )
        });
    },

    /**
     * 停止自动刷新并释放定时器。
     *
     * @returns {void}
     */
    stopAutoRefresh() {
        if (this.autoRefreshTimer) {
            clearInterval(this.autoRefreshTimer);
            this.autoRefreshTimer = null;
        }
    },

    /**
     * 异步读取电池管理器并监听电量与充电状态变化。
     *
     * 每轮读取使用递增的请求序号，丢弃页面隐藏或重新读取
     * 之后才返回的旧结果，避免旧状态覆盖新状态。
     *
     * @returns {void}
     */
    loadBattery() {
        this.detachBattery();
        this.batteryRequestId += 1;
        const requestId = this.batteryRequestId;
        if (typeof navigator.getBattery !== 'function') {
            this.applyBatteryUnavailable(this.strings.noBatteryApi);
            return;
        }
        try {
            navigator.getBattery().then((battery) => {
                if (requestId !== this.batteryRequestId) {
                    return;
                }
                this.batteryManager = battery;
                this.batteryListener = () => {
                    this.applyBatterySnapshot();
                };
                BatteryEventType.forEach((type) => {
                    battery.addEventListener(type, this.batteryListener);
                });
                this.applyBatterySnapshot();
            }).catch(() => {
                if (requestId !== this.batteryRequestId) {
                    return;
                }
                this.applyBatteryUnavailable(
                    this.strings.noBatteryCapability
                );
            });
        } catch (error) {
            this.applyBatteryUnavailable(this.strings.batteryCallFailed);
        }
    },

    /**
     * 将当前电量与充电状态刷新到页面。
     *
     * @returns {void}
     */
    applyBatterySnapshot() {
        const battery = this.batteryManager;
        const strings = this.strings;
        if (!battery || !strings) {
            return;
        }
        this.setData({
            batteryLevelText: formatBatteryLevel(battery.level),
            batteryStatusText: battery.charging === true
                ? strings.charging
                : strings.discharging
        });
    },

    /**
     * 显示电池不可用状态，原因仅输出到控制台日志。
     *
     * @param {string} reason 当前语言的不可用原因。
     * @returns {void}
     */
    applyBatteryUnavailable(reason) {
        this.setData({
            batteryLevelText: this.strings.unknown,
            batteryStatusText: this.strings.batteryUnavailable
        });
        console.log('[navigator-info] battery unavailable:', reason);
    },

    /**
     * 移除电池事件监听并释放引用，同时作废未完成的读取请求。
     *
     * @returns {void}
     */
    detachBattery() {
        this.batteryRequestId += 1;
        if (
            this.batteryManager
            && this.batteryListener
            && typeof this.batteryManager.removeEventListener === 'function'
        ) {
            BatteryEventType.forEach((type) => {
                this.batteryManager.removeEventListener(
                    type,
                    this.batteryListener
                );
            });
        }
        this.batteryManager = null;
        this.batteryListener = null;
    }
};
</script>

<page>
    <view class="info-screen">
        <view class="status-row">
            <view class="status-dot status-dot-{{status}}"></view>
            <text class="status-title">{{statusTitle}}</text>
            <view class="status-spacer"></view>
            <text class="read-at">{{readAtText}} {{readAtSuffix}} · {{countdownText}}</text>
        </view>

        <view class="panel runtime-panel">
            <text class="panel-label">{{panelRuntimeLabel}}</text>
            <view class="field-row">
                <view class="field-head">
                    <text class="field-key">AIUI</text>
                    <text class="field-source">navigator.userAgent</text>
                </view>
                <text class="field-value">{{aiuiVersion}}</text>
            </view>
            <view class="field-row">
                <view class="field-head">
                    <text class="field-key">{{systemKey}}</text>
                    <text class="field-source">navigator.userAgent</text>
                </view>
                <text class="field-value">{{systemName}}</text>
            </view>
            <view class="field-row">
                <view class="field-head">
                    <text class="field-key">{{archKey}}</text>
                    <text class="field-source">navigator.userAgent</text>
                </view>
                <text class="field-value">{{architecture}}</text>
            </view>
            <view class="field-row">
                <view class="field-head">
                    <text class="field-key">{{inkSkiaKey}}</text>
                    <text class="field-source">navigator.versions</text>
                </view>
                <text class="field-value">{{inkVersion}} · {{skiaVersion}}</text>
            </view>
            <view class="field-row">
                <view class="field-head">
                    <text class="field-key">{{renderingKey}}</text>
                    <text class="field-source">renderingEnabled</text>
                </view>
                <text class="field-value">{{renderingState}}</text>
            </view>
            <view class="field-row ua-row">
                <view class="field-head">
                    <text class="field-key">UA</text>
                    <text class="field-source">navigator.userAgent</text>
                </view>
                <text class="field-value ua-row-value">{{userAgentText}}</text>
            </view>
        </view>

        <view class="panel locale-panel">
            <text class="panel-label">{{panelLocaleLabel}}</text>
            <view class="field-row">
                <view class="field-head">
                    <text class="field-key">{{languageKey}}</text>
                    <text class="field-source">language</text>
                </view>
                <text class="field-value">{{languageText}}</text>
            </view>
            <view class="field-row">
                <view class="field-head">
                    <text class="field-key">{{languagesKey}}</text>
                    <text class="field-source">languages</text>
                </view>
                <text class="field-value field-value-small">{{languagesText}}</text>
            </view>
            <view class="field-row">
                <view class="field-head">
                    <text class="field-key">{{regionKey}}</text>
                    <text class="field-source">region</text>
                </view>
                <text class="field-value">{{regionText}}</text>
            </view>
            <view class="field-row">
                <view class="field-head">
                    <text class="field-key">{{uiLocaleKey}}</text>
                    <text class="field-source">resolveLocale()</text>
                </view>
                <text class="field-value">{{uiLocaleText}}</text>
            </view>
        </view>

        <view class="panel mounts-panel">
            <text class="panel-label">{{panelMountsLabel}}</text>
            <view class="mount-row">
                <view class="mount-item">
                    <text class="field-source">bluetooth</text>
                    <text class="mount-value">{{bluetoothState}}</text>
                </view>
                <view class="mount-item">
                    <text class="field-source">geolocation</text>
                    <text class="mount-value">{{geolocationState}}</text>
                </view>
            </view>
            <view class="mount-row">
                <view class="mount-item">
                    <text class="field-source">mediaDevices</text>
                    <text class="mount-value">{{mediaDevicesState}}</text>
                </view>
                <view class="mount-item">
                    <text class="field-source">storage</text>
                    <text class="mount-value">{{storageState}}</text>
                </view>
            </view>
            <text class="panel-note">{{mountsNoteText}}</text>
        </view>

        <view class="panel battery-panel">
            <view class="battery-label-row">
                <text class="panel-label">{{panelBatteryLabel}}</text>
                <text class="read-at">{{batteryMethodText}}</text>
            </view>
            <text class="battery-value">{{batteryLevelText}} · {{batteryStatusText}}</text>
        </view>

        <view class="hint-bar">
            <text class="hint">{{hintReadonlyText}}</text>
            <text class="hint">{{hintRefreshText}}</text>
        </view>
    </view>
</page>

<style>
.info-screen {
    position: relative;
    width: 480px;
    height: 352px;
    box-sizing: border-box;
    overflow: hidden;
    background-color: #000000;
    color: #00ff66;
    font-family: monospace;
}

.read-at,
.hint,
.panel-note,
.field-source {
    color: #4da86c;
}

.status-row {
    position: absolute;
    left: 18px;
    top: 12px;
    width: 444px;
    height: 18px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
}

.status-dot {
    width: 7px;
    height: 7px;
    border: 1px solid #00ff66;
    border-radius: 50%;
}

.status-dot-ready {
    background-color: #00ff66;
}

.status-dot-error {
    border-color: #4da86c;
    background-color: #4da86c;
}

.status-title {
    font-size: 14px;
    font-weight: bold;
}

.status-spacer {
    flex: 1;
}

.read-at {
    font-size: 10px;
}

.panel {
    position: absolute;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 9px;
    border: 1px solid #174526;
    background-color: #000000;
}

.runtime-panel {
    left: 18px;
    top: 40px;
    width: 444px;
    height: 114px;
}

.locale-panel {
    left: 18px;
    top: 166px;
    width: 218px;
    height: 85px;
}

.mounts-panel {
    right: 18px;
    top: 166px;
    width: 218px;
    height: 85px;
}

.battery-panel {
    left: 18px;
    top: 263px;
    width: 444px;
    height: 40px;
    padding: 5px 9px;
    gap: 3px;
}

.hint-bar {
    position: absolute;
    left: 18px;
    bottom: 8px;
    width: 444px;
    height: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.panel-label {
    color: #4da86c;
    font-size: 10px;
    line-height: 11px;
}

.panel-note {
    font-size: 9px;
    line-height: 11px;
}

.field-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    min-height: 13px;
}

.field-head {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    min-width: 0;
}

.field-source {
    font-size: 9px;
    line-height: 13px;
}

.field-key {
    color: #4da86c;
    font-size: 10px;
    line-height: 13px;
}

.field-value {
    font-size: 11px;
    line-height: 13px;
}

.field-value-small {
    font-size: 10px;
}

.mount-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    min-height: 13px;
}

.mount-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
}

.mount-value {
    font-size: 10px;
    line-height: 13px;
}

.battery-label-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
}

.battery-value {
    font-size: 12px;
    line-height: 13px;
    font-weight: bold;
}

.ua-row {
    min-height: 12px;
}

.ua-row-value {
    font-size: 9px;
    line-height: 12px;
}

.hint {
    font-size: 10px;
    line-height: 11px;
}
</style>
