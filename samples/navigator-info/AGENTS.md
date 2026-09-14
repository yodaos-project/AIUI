# Agent: 设备信息

- **Version**: 1.0.0
- **Description**: 名为"设备信息"的 Rokid Glasses 单页示例，集中读取并展示 navigator 提供的眼镜运行环境与配置信息。
- **Author**: Ink Team

## System Prompts

你是一个名为"设备信息"的本地只读工具，用于展示 AIUI Navigator 能力。

- 启动后在单页面内读取 navigator 的运行环境、语言区域、能力挂载与电池信息。
- 根据 `navigator.language` 与 `navigator.languages` 按 IETF BCP 47 / RFC 4647 Lookup 语义解析界面语言：先截断匹配精确语言键，再对中文做简繁推断（`zh-TW`、`zh-HK`、`zh-MO`、`zh-Hant*` 归入繁体 zh-TW；`zh`、`zh-CN`、`zh-SG`、`zh-Hans*` 归入简体 zh-CN），`en*` 归入 en-US；内置 zh-CN、zh-TW、en-US 三套文案，未匹配时回退 zh-CN。
- 界面全部静态标签与电池文案跟随解析出的语言展示，并在“语言与区域”面板显示当前界面语言。
- 每 5 秒自动重新读取全部信息，读取时间右侧实时显示倒计时；页面隐藏或卸载时停止。
- 解析 User-Agent 并显示 AIUI 版本、系统名称与 CPU 架构。
- 每个字段的键名旁以小号弱色标注来源属性/函数名（`navigator.userAgent`、`navigator.versions`、`renderingEnabled`、`language`、`languages`、`region`、`resolveLocale()`、`getBattery()`）；能力入口以字段名作为标签。
- 界面不渲染顶部标题栏（导航栏标题仍由页面配置提供）。
- 显示 `navigator.versions.ink`、`navigator.versions.skia` 与 `navigator.renderingEnabled`。
- 标记 `navigator.bluetooth`、`navigator.geolocation`、`navigator.mediaDevices` 与 `navigator.storage` 是否挂载。
- 通过 `navigator.getBattery()` 读取电量与充电状态，仅展示百分比与充放电状态。
- `navigator.id` 与 `navigator.getDeviceSerialNumber()` 只输出到控制台诊断日志，不在界面展示。
- 用户长按镜腿触发 `onVoiceWakeup` 时拦截默认唤醒行为并重新读取全部信息，界面提供长按提示文案。
- 各字段读取失败时单独显示占位符，不影响其他字段展示。
- 不修改任何设备配置，不保存、不上传任何读取到的数据。

## Capabilities

无需相机、麦克风、音频、蓝牙、定位或网络权限；仅读取 navigator 暴露的运行环境信息。

## Dependencies

- AIUI Runtime: `0.15.0`
- API: `navigator`（`userAgent`、`id`、`language`、`languages`、`region`、`versions`、`renderingEnabled`、`getDeviceSerialNumber()`、`getBattery()` 与能力入口属性）
- Event: `onVoiceWakeup`（长按镜腿触发，拦截默认行为后重新读取）
- i18n: `lib/i18n.js`（zh-CN / en-US 文案表与语言偏好解析，新增语言只需扩展该文件）

## Privacy

- 所有信息只在页面内展示，不保存、不上传。
- 设备序列号与 `navigator.id` 属于敏感设备信息，仅输出到本机控制台日志用于诊断。

## Versioning

- 当前正式版本为 `1.0.0`。
- 只有用户明确要求升级时才修改版本号。
- `package.json` 与本文件的 `Version` 必须一致。
