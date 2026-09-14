# 设备信息

这是一个独立、最小化的 Rokid AIUI 单页示例，集中展示 Navigator 提供的眼镜运行环境与配置信息。

## 展示内容

- 根据 `navigator.language` 与 `navigator.languages` 按 **IETF BCP 47**（RFC 4647 Lookup 语义）解析界面语言：先做子标签截断匹配（`zh-CN`、`zh-TW`、`en-US` 直接命中），再对中文做简繁推断——`zh-TW`、`zh-HK`、`zh-MO`、`zh-Hant*` 归入繁体 zh-TW，`zh`、`zh-CN`、`zh-SG`、`zh-Hans*` 归入简体 zh-CN；`en-GB` 等英语变体归入 en-US；全部未命中时回退 zh-CN。
- 内置 zh-CN（简体）、zh-TW（繁体，覆盖 zh-HK 等繁体地区）、en-US 三套文案（`lib/i18n.js`），界面全部标签与电池文案跟随语言切换；新增语言只需扩展文案表。
- 在“语言与区域”面板显示当前解析出的界面语言。
- 解析 `navigator.userAgent`，显示 AIUI 版本、系统名称和 CPU 架构。
- 显示 `navigator.versions.ink`、`navigator.versions.skia` 与 `navigator.renderingEnabled`。
- 标记 `navigator.bluetooth`、`navigator.geolocation`、`navigator.mediaDevices` 与 `navigator.storage` 是否挂载。
- 通过 `navigator.getBattery()` 读取电量百分比与充电状态并监听变化。
- `navigator.id` 与 `navigator.getDeviceSerialNumber()` 只写入控制台诊断日志，不在界面展示。
- 每个字段独立容错，读取失败时显示占位符，不影响其他字段。
- 每 5 秒自动重新读取全部信息，读取时间右侧实时显示倒计时（如“4s 后自动读取”），页面隐藏或卸载时停止。
- 长按镜腿触发 `onVoiceWakeup` 重新读取全部信息并重置倒计时（页面拦截默认唤醒行为），界面底部提供长按提示文案。
- 每个展示字段旁标注其读取来源（如 `navigator.userAgent`、`versions`、`renderingEnabled`、`language`、`getBattery()`），能力入口直接以字段名（`bluetooth`、`geolocation`、`mediaDevices`、`storage`）作为标签；页面无顶部标题栏。

## 真机测试方法

1. 启动项目，等待状态行显示“Navigator 信息读取完成”。
2. 核对 AIUI、系统、架构与 Ink / Skia 版本是否与当前固件一致。
3. 摘下眼镜充电或放电，观察电池面板的电量和充电状态是否自动变化。
4. 长按镜腿，观察读取时间更新、倒计时重置，确认信息为最新快照。
5. 静置 5 秒，观察倒计时归零后自动重新读取并回到 5s。
6. 在宿主设置中切换系统语言（如切到 English 或繁体中文）后重新进入或长按镜腿，观察整个界面切换为对应语言，且“界面语言”行显示解析结果。

## 真机部署（ADB DEVELOP 直传）

除 Craft / AIUI Studio 云端链路外，可使用 DEVELOP 流程通过 ADB 直接上传到已授权的眼镜（需眼镜开启开发者模式；仓库目录下的 `agent.develop.json` 为本示例的 Definition）：

```bash
# 1. 打包（agent.develop.json 已通过 .aixignore 排除，不会进入包内）
aix pack ./samples/navigator-info -o navigator-info.aix

# 2. Prepare（返回 "ready":true 才继续；ENTRYPOINT_DISABLED 时先开启开发者模式）
adb shell content call --uri content://com.rokid.aiui.develop --method prepare

# 3. Push（暂存目录必须恰好一个 .aix 和一个 .json）
adb push navigator-info.aix samples/navigator-info/agent.develop.json /sdcard/aiui/package/.staging/adb/

# 4. Apply（检查 result_data：errorCode 为空、agentId 一致、outcome ∈ CREATED/UPDATED/UNCHANGED/REPAIRED）
adb shell content call --uri content://com.rokid.aiui.develop --method apply

# 5. 查询上传状态（publishState 为 UPLOADED 表示手机已确认）
adb shell content call --uri content://com.rokid.aiui.develop --method status --arg <operationId>
```

上传成功后，通过语音命中智能体（如“乐奇，打开设备信息智能体”）即可在眼镜上运行；`adb logcat` 可捕获页面 `console.log` 输出的快照与语言解析日志（tag 含 `[navigator-info]`）。

## 项目边界

项目不包含写入设备配置、网络请求或本地存储逻辑，全部字段均为只读展示。
