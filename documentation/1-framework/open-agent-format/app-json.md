# app.json

在 AIUI 对 Open Agent Format 的扩展中，`app.json` 用来定义应用级入口和全局配置。它决定一个智能体应用从哪里开始运行，也决定 Page、Widget、Agent Worker 和全局窗口行为如何组织。

不过，一个完整的应用级定义通常不只有 `app.json`，还会同时配合应用级逻辑入口一起使用。你可以把它理解成：

- `app.json`：定义 Page、Widget、Agent Worker 和全局配置
- `app.js`：定义应用级逻辑和全局生命周期

## `app.json` 负责什么

`app.json` 主要用于声明：

- 应用包含哪些页面
- 应用包含哪些 Widget
- 需要随智能体运行的后台任务
- 应用从哪个页面开始启动
- 全局窗口样式
- 跨页面共享的基础配置

一个典型示例如下：

```json
{
  "pages": [
    "pages/index/index",
    "pages/logs/logs"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "AIUI Agent",
    "navigationBarTextStyle": "black"
  }
}
```

这里最重要的部分是：

- `pages`：声明页面路径列表
- `window`：声明全局窗口配置

## 声明 Widget 和后台任务

除了 Page，`app.json` 还可以声明 Widget 与 Agent Worker：

```json
{
  "pages": ["pages/index/index"],
  "widgets": [
    {
      "path": "widgets/weather/index",
      "family": "1x2",
      "placement": "overlay",
      "displayName": "天气",
      "description": "显示当前位置的天气和温度。"
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

- `widgets`：声明独立 Widget 的入口、名称、描述、尺寸类别与展示方式。`placement` 可为常驻的 `persistent` 或可通过 `window.open(..., '_widget')` 打开的 `overlay`（可叠加 Widget），省略时默认为 `persistent`。
- `agentWorkers`：声明后台脚本的名称、入口文件、启动条件和运行时长。

具体配置和示例请参阅 [Widget](/AIUI/framework/open-agent-format-widget) 与 [Agent Worker](/AIUI/framework/open-agent-format-agent-worker)。

### Widget 文案的多语言

`app.json` 是完整的默认配置，并提供每个 Widget 的默认 `displayName` 和 `description`。需要其他语言时，在应用根目录添加 `app.<locale>.json`，只覆盖 Widget 文案：

```json
{
  "locale": "en-US",
  "widgets": {
    "widgets/weather/index": {
      "displayName": "Weather",
      "description": "Shows the weather and temperature for your current location."
    }
  }
}
```

语言文件的 `widgets` 使用 Widget 的 `path` 作为键，只能覆盖 `displayName` 和 `description`，不能修改 `family`、`placement` 或其他运行配置。运行时根据用户语言偏好选择语言文件，并在未匹配或字段缺失时回退到 `app.json`。语言文件名使用 BCP 47 标签，例如 `app.en-US.json` 和 `app.zh-TW.json`。

## 声明权限

当应用需要访问定位、摄像头、麦克风或系统媒体库等敏感能力时，请在 `app.json` 的 `permissions` 数组中声明对应权限：

```json
{
  "pages": ["pages/index/index"],
  "permissions": [
    "GEOLOCATION",
    "CAMERA",
    "RECORD_AUDIO"
  ]
}
```

权限名区分大小写。请只声明应用实际需要的权限；未声明运行时所要求的权限时，对应 API 会失败。无法识别的字符串不会授予任何能力。

当前可声明的权限如下：

| 权限 | 说明 | 当前行为 |
| :--- | :--- | :--- |
| `GEOLOCATION` | 获取当前位置或持续接收位置变化 | `navigator.geolocation` 会检查该权限；参阅[地理定位](/AIUI/api/geo-data-geolocation) |
| `CAMERA` | 访问摄像头以及采集图片或视频 | 摄像头和视频采集 API 会检查该权限 |
| `RECORD_AUDIO` | 访问麦克风并采集音频 | 麦克风和音频采集 API 会检查该权限；参阅[媒体采集](/AIUI/api/media-media-capture) |
| `READ_MEDIA_IMAGES` | 列出和读取系统媒体库中的图片 | 媒体库的图片读取操作会检查该权限 |
| `CREATE_MEDIA_IMAGES` | 向系统媒体库新增图片 | 媒体库的图片保存操作会检查该权限；不包含修改或覆盖已有资源 |
| `READ_MEDIA_AUDIO` | 列出和读取系统媒体库中的音频 | 媒体库的音频读取操作会检查该权限 |
| `CREATE_MEDIA_AUDIO` | 向系统媒体库新增音频 | 媒体库的音频保存操作会检查该权限；不包含修改或覆盖已有资源 |

`permissions` 是应用清单中的能力声明，不能替代设备操作系统的授权。定位、摄像头、麦克风和媒体库等能力还可能要求用户授予系统权限；即使已在 `app.json` 中声明，系统拒绝授权或设备不支持时，API 仍会失败。应用应处理权限被拒绝和能力不可用的情况。

## 它和 `AGENTS.md` 的关系

如果说 `AGENTS.md` 定义的是“这个智能体是谁、具备什么能力”，那么 `app.json` 定义的就是“这个智能体应用从哪里开始，以及界面如何组织”。

两者关注点不同：

- `AGENTS.md`：智能体身份、说明、系统指令、能力边界
- `app.json`：应用入口、页面集合、全局界面配置

## 应用级逻辑：`app.js`

除了 `app.json`，AIUI 应用通常还会有一个 `app.js` 作为应用级逻辑入口。它用于注册应用本身，并承载全局生命周期和全局数据。

示例：

```javascript
export default {
  onLaunch(options) {
    // 智能体初始化
  },
  onShow(options) {
    // 智能体显示
  },
  onHide() {
    // 智能体隐藏
  },
  globalData: {
    // 全局数据
  }
}
```

你可以把 `app.js` 理解成“应用级逻辑层”，它更关注整个应用在启动、显示、隐藏过程中的行为，而不是某个具体页面的行为。

## 应用级生命周期

`app.js` 中常见的全局生命周期包括：

| 回调函数 | 说明 | 触发时机 |
| :--- | :--- | :--- |
| `onLaunch` | 监听智能体初始化 | 智能体初始化完成时，全局只触发一次 |
| `onShow` | 监听智能体显示 | 智能体启动，或从后台进入前台时 |
| `onHide` | 监听智能体隐藏 | 智能体从前台进入后台时 |
| `onError` | 错误监听函数 | 智能体发生脚本错误或 API 调用失败时 |

这些回调和页面级生命周期不同，它们描述的是整个应用，而不是单个页面。

## 在 Open Agent Format 里的位置

从 Open Agent Format 视角看，`app.json` 和 `app.js` 共同补上了“应用级定义”这一层：

- `AGENTS.md`：描述智能体
- `app.json`：定义 Page、Widget、Agent Worker 和全局配置
- `app.js`：定义应用级逻辑和全局生命周期
- `pages/`：定义具体页面与交互界面

这也是 AIUI 相比纯描述型 Agent Format 更进一步的地方：它不仅描述智能体，还定义智能体如何以可运行的应用形态存在。

## 推荐阅读

- [AGENTS.md](/AIUI/framework/config-agents)
- [页面概览](/AIUI/framework/open-agent-format-page)
- [页面定义](/AIUI/framework/open-agent-format-page-definition)
- [Widget](/AIUI/framework/open-agent-format-widget)
- [Agent Worker](/AIUI/framework/open-agent-format-agent-worker)
