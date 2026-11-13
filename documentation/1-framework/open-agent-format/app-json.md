# app.json

`app.json` 是 AIUI 项目根目录中的应用配置文件。它告诉 AIUI 项目有哪些页面，以及在需要时有哪些 Widget、后台任务和权限声明。

如果把项目想成一个智能体应用，`app.json` 负责声明**有哪些入口和配置**；具体界面和处理逻辑则写在页面、Widget 等文件中。

## 从一个页面开始

下面是一个基础配置：

```json
{
  "pages": ["pages/index/index"],
  "window": {
    "navigationBarTitleText": "我的智能体"
  }
}
```

- `pages` 是页面路径列表。路径相对于项目根目录，不带文件扩展名；例如 `pages/index/index` 可以对应 `pages/index/index.ink`。
- `window` 设置应用级窗口默认值。这里的 `navigationBarTitleText` 是标题；实际显示效果取决于界面的呈现方式。

声明路径后，还需要创建对应页面文件。页面也可以使用同一路径下的多文件结构，具体见[页面概览](/AIUI/framework/open-agent-format-page)。

### 如何选择默认页面？

当没有指定其他打开入口时，默认进入 `pages` 的第一项。如果希望指定另一个默认页，可以使用 `entryPagePath`，其值必须是 `pages` 中已声明的路径：

```json
{
  "pages": ["pages/index/index", "pages/settings/index"],
  "entryPagePath": "pages/settings/index"
}
```

这个例子将设置页作为默认页面。实际打开页面时，也可能指定其他已声明的入口。

## 按需添加 Widget 和后台任务

Widget 和 Agent Worker 是可选的。需要小尺寸独立界面或后台任务时，可以在 `app.json` 中声明：

```json
{
  "pages": ["pages/index/index"],
  "widgets": [
    {
      "path": "widgets/weather/index",
      "family": "1x2",
      "placement": "overlay",
      "displayName": "天气",
      "description": "显示天气和温度。"
    }
  ],
  "agentWorkers": [
    {
      "name": "sync",
      "script": "workers/sync.js",
      "trigger": { "type": "open" },
      "lifetime": "instant"
    }
  ]
}
```

`widgets` 中的 `path` 对应 Widget 文件（例如 `widgets/weather/index.ink`）；`family` 是尺寸类别，当前支持 `1x1` 和 `1x2`，并需要与 Widget 文件中的声明一致。`placement` 表示展示方式：`persistent` 为常驻方式，也是省略时的默认值；`overlay` 可通过 `window.open(..., '_widget')` 打开。

`agentWorkers` 用于声明后台脚本的名称、路径、启动条件和运行时长。上例使用 `instant`，适合完成一次短任务；如果需要在页面或 Widget 打开期间持续运行，可了解 `foreground`。实际脚本仍需由开发者编写。

完整规则和文件示例请参阅 [Widget](/AIUI/framework/open-agent-format-widget)与 [Agent Worker](/AIUI/framework/open-agent-format-agent-worker)。

### 提供不同语言的 Widget 文案

`app.json` 需要提供默认的 `displayName` 和 `description`。如果还要提供英文，可以在项目根目录创建 `app.en-US.json`：

```json
{
  "locale": "en-US",
  "widgets": {
    "widgets/weather/index": {
      "displayName": "Weather",
      "description": "Shows the weather and temperature."
    }
  }
}
```

语言文件中的 `widgets` 以 Widget 的 `path` 为键，只覆盖 `displayName` 和 `description`，不修改 `family`、`placement` 等配置。运行时按用户语言偏好匹配；没有匹配项或字段缺失时，回退到 `app.json` 中的默认值。文件名使用 BCP 47 语言标签，例如 `app.en-US.json` 或 `app.zh-TW.json`。

## 声明应用需要的权限

如果应用需要位置、摄像头、麦克风或系统媒体库等能力，应在 `permissions` 中声明实际需要的权限。例如：

```json
{
  "pages": ["pages/index/index"],
  "permissions": ["GEOLOCATION", "CAMERA", "RECORD_AUDIO"]
}
```

权限名区分大小写。常见声明包括：

| 权限 | 用途 |
| --- | --- |
| `GEOLOCATION` | 获取位置或接收位置变化 |
| `CAMERA` | 使用摄像头采集图片或视频 |
| `RECORD_AUDIO` | 使用麦克风采集音频 |
| `READ_MEDIA_IMAGES` | 列出和读取媒体库图片 |
| `CREATE_MEDIA_IMAGES` | 向媒体库新增图片，不包括修改或覆盖已有资源 |
| `READ_MEDIA_AUDIO` | 列出和读取媒体库音频 |
| `CREATE_MEDIA_AUDIO` | 向媒体库新增音频，不包括修改或覆盖已有资源 |

网络功能建议声明 `INTERNET`；当前并非所有网络 API 都检查此声明，具体要求请查看相关 API 文档。

`permissions` 是应用声明，**不等于用户已经授权**。敏感能力可能还需要设备系统授权；即使已声明，用户拒绝或设备不支持时调用仍可能失败。请处理权限被拒绝和能力不可用的情况。未知的权限名称不会自动授予能力。

可以通过[权限状态](/AIUI/api/permissions)查询定位、相机和麦克风状态，不会弹出授权界面；申请访问时调用对应敏感 API，不存在通用的 `navigator.permissions.request()`。权限声明在应用启动时读取，修改文件不会更新正在运行的会话。相关能力可参考[地理定位](/AIUI/api/geo-data-geolocation)和[媒体采集](/AIUI/api/media-media-capture)。

## `app.json`、`app.js` 和 `AGENTS.md` 有什么区别？

| 文件 | 职责 |
| --- | --- |
| `AGENTS.md` | 描述智能体的身份、职责和行为指引 |
| `app.json` | 声明页面等入口、窗口配置和权限 |
| `app.js` | 编写应用级逻辑和共享数据 |

例如，`app.js` 可以在整个智能体初始化时执行代码：

```javascript
export default {
  onLaunch() {
    console.log('智能体已启动');
  },
  globalData: {
    city: '杭州'
  }
};
```

常见的应用级回调包括 `onLaunch`（初始化时）、`onShow`（启动或进入前台时）、`onHide`（进入后台时）和 `onError`（处理应用脚本错误）。它们与单个页面的生命周期不同；API 失败也应按该 API 的错误处理方式处理。

## 继续阅读

- [AGENTS.md](/AIUI/framework/config-agents)：了解智能体描述。
- [页面概览](/AIUI/framework/open-agent-format-page)和[页面定义](/AIUI/framework/open-agent-format-page-definition)：创建和配置页面。
- [Widget](/AIUI/framework/open-agent-format-widget)和 [Agent Worker](/AIUI/framework/open-agent-format-agent-worker)：了解可选入口的完整用法。
