# Widget

Widget 是智能体提供的小尺寸独立界面，适合展示天气、播放状态、设备数据和订单进度等一眼即可理解的信息。它和 Page 使用相同的 `.ink` 语法、数据绑定、组件与样式，但拥有独立入口和更精简的生命周期。

## 声明 Widget

先在 `app.json` 的 `widgets` 数组中声明 Widget。每一项描述 Widget 的入口、名称、用途、尺寸类别和展示方式。

```json
{
  "pages": ["pages/index/index"],
  "widgets": [
    {
      "path": "widgets/clock/index",
      "family": "1x1",
      "placement": "persistent",
      "displayName": "时钟",
      "description": "显示当前时间。"
    },
    {
      "path": "widgets/weather/index",
      "family": "1x2",
      "placement": "overlay",
      "displayName": "天气",
      "description": "显示当前位置的天气和温度。"
    }
  ]
}
```

### `app.json.widgets` 字段

| 字段 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `path` | `string` | 是 | - | Widget 的项目相对路径，不包含 `.ink` 扩展名。路径必须对应实际存在的 `.ink` 文件。 |
| `family` | `"1x1" \| "1x2"` | 是 | - | Widget 占用的尺寸类别。还必须在 Widget 文件的 `<script def>` 中声明相同的值。 |
| `placement` | `"persistent" \| "overlay"` | 否 | `"persistent"` | Widget 的展示方式。该字段只在 `app.json` 中声明，不写入 Widget 文件。 |
| `displayName` | `string` | 是 | - | 面向用户显示的 Widget 名称，例如“天气”。多语言版本在对应的 `app.<locale>.json` 中声明。 |
| `description` | `string` | 是 | - | 对 Widget 展示内容或用途的简短说明。多语言版本在对应的 `app.<locale>.json` 中声明。 |

例如，`widgets/weather/index` 对应 `widgets/weather/index.ink`。`path` 应保持唯一；同一路径不要在 `widgets` 数组中重复声明。

`family` 是尺寸类别，而不是固定像素尺寸。Widget 应根据实际可用宽高进行自适应布局。

### Widget 元数据的多语言

`app.json` 必须包含每个 Widget 的默认 `displayName` 和 `description`。如果需要提供其他语言，不要在每个 Widget 中嵌套多语言对象，而是在应用根目录创建 `app.<locale>.json` 覆盖文件。例如：

```json
{
  "locale": "en-US",
  "widgets": {
    "widgets/weather/index": {
      "displayName": "Weather",
      "description": "Shows the weather and temperature for your current location."
    },
    "widgets/clock/index": {
      "displayName": "Clock",
      "description": "Shows the current time."
    }
  }
}
```

语言文件名使用 BCP 47 语言标签，例如 `app.en-US.json` 或 `app.zh-TW.json`。语言文件中的 `widgets` 是以 Widget `path` 为键的对象，只能覆盖 `displayName` 和 `description`，不能声明或修改 `family`、`placement` 等运行配置。

运行时会按照用户的语言偏好选择语言文件，并按 BCP 47 的逐级回退规则匹配；未匹配的语言、未声明的 Widget 或缺少的字段都会回退到 `app.json` 中的默认值。因此，`app.json` 必须始终能够独立完成应用配置和 Widget 元数据展示。

## 选择展示方式

`placement` 决定 Widget 是保持在固定位置，还是作为临时内容叠加在用户已配置的 Widget 之上。它不改变 Widget 的文件结构、数据绑定或生命周期 API。

### 常驻 Widget

将 `placement` 设置为 `persistent`，适合需要持续可见或位置稳定的内容，例如时钟和设备状态。

```json
{
  "path": "widgets/clock/index",
  "family": "1x1",
  "placement": "persistent"
}
```

常驻 Widget 添加到布局后会保留其位置，不会因为可叠加 Widget 的打开或关闭而被移除。省略 `placement` 时采用此行为，因此未声明该字段的现有 Widget 保持兼容。

### 可叠加 Widget

将 `placement` 设置为 `overlay`，表示 Widget 可以通过 `window.open(url, '_widget')` 叠加在用户已配置的 Widget 之上。可叠加 Widget 适合展示具有明确开始和结束状态的生命周期信息，例如打车订单、外卖订单和配送进度。状态结束后，Widget 可以调用 `window.close()` 退出当前叠加层。

```json
{
  "path": "widgets/weather/index",
  "family": "1x2",
  "placement": "overlay"
}
```

`overlay` 表示 Widget 通过打开和关闭操作进入或退出叠加层。Widget 显示和隐藏时，运行时会调用 `onAttach()` 或 `onDetach()`；不要用这两个回调保存只能初始化一次的状态，也不要假设关闭叠加层后一定会保留当前实例。

如果内容必须持续可见或不应由 `window.open()` 临时打开，请使用 `persistent`。如果内容具有明确的开始和结束状态，并能正确处理打开、状态更新、结束和关闭，请使用 `overlay`。

## 创建 Widget 界面

Widget 文件使用 `<widget>` 作为界面根节点。为兼容 0.18，`<script def>` 中仍需声明 `family`，并且必须与 `app.json` 保持一致。`placement` 以及后续展示调度字段只在 `app.json` 中声明，不写入 `.ink`。

```html
<script def>
{
  "widget": { "family": "1x2" },
  "usingComponents": {
    "weather-icon": "/components/weather-icon/index"
  }
}
</script>

<script setup>
export default {
  data: {
    city: '杭州',
    temperature: 24,
  },
  refresh() {
    this.setData({ temperature: this.data.temperature + 1 });
  },
};
</script>

<widget>
  <view class="weather" bindtap="refresh">
    <weather-icon />
    <text>{{city}}</text>
    <text>{{temperature}}°C</text>
  </view>
</widget>

<style>
.weather {
  display: flex;
  flex-direction: column;
  padding: 12px;
}
</style>
```

一个 `.ink` 文件不能同时包含 `<page>` 和 `<widget>`。如果文件中的 `family` 与 `app.json` 不一致，Widget 将无法加载。

## 更新显示内容

Widget 使用 `data` 保存界面数据，并通过 `setData()` 更新显示内容。可以更新顶层字段，也可以使用点路径更新嵌套字段。

```javascript
export default {
  data: {
    status: { label: '待机' },
    count: 0,
  },
  activate() {
    this.setData({
      count: this.data.count + 1,
      'status.label': '运行中',
    });
  },
};
```

## 处理 Widget 的状态变化

Widget 提供四个可选回调：

| 回调 | 适合执行的操作 |
| :--- | :--- |
| `onCreate()` | 初始化 Widget 数据和只需执行一次的资源 |
| `onAttach()` | 刷新即将展示的数据，恢复可见时需要的任务 |
| `onDetach()` | 暂停只在 Widget 显示时需要的任务 |
| `onDestroy()` | 取消请求、移除监听并释放资源 |

```javascript
export default {
  data: { updatedAt: 0 },
  refresh() {
    this.setData({ updatedAt: Date.now() });
  },
  onCreate() {
    console.log('Widget 已创建');
  },
  onAttach() {
    this.refreshTimer = setInterval(() => this.refresh(), 60_000);
  },
  onDetach() {
    clearInterval(this.refreshTimer);
  },
  onDestroy() {
    clearInterval(this.refreshTimer);
  },
};
```

`onAttach()` 和 `onDetach()` 可能多次调用，因此恢复和暂停逻辑应允许重复执行。

## Widget 与 Page 的区别

- Widget 不进入 Page 导航栈。
- Widget 使用 `onCreate()`、`onAttach()`、`onDetach()` 和 `onDestroy()`，不使用 Page 的 `onLoad()`、`onShow()`、`onReady()`、`onHide()` 和 `onUnload()`。
- Widget 不提供 `enableWorldAwareness()` 和 `finish()` 等 Page 专属能力。
- Widget 可以使用数据绑定、自定义组件、事件处理、图片和 Canvas。
- Widget 的 `family` 用于表达界面尺寸类别；布局仍应适应实际可用宽高。

## 继续阅读

- [Widget API](/AIUI/api/framework-widget)：查看 `data`、`setData()`、尺寸和状态属性
- [app.json](/AIUI/framework/open-agent-format-app-json)：查看应用入口配置
- [组件](/AIUI/framework/open-agent-format-custom-components)：在 Widget 中复用界面组件
- [Canvas](/AIUI/api/canvas)：在 Widget 中绘制图形
