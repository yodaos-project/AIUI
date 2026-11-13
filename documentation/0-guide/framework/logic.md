# 逻辑开发

智能体的逻辑负责处理数据和操作。例如，用户点击按钮后，逻辑可以更新计数；查询天气后，逻辑可以把结果交给界面展示。

下面先从一个页面开始，再认识应用、Widget 和 Agent Worker 的逻辑。

## 从页面逻辑开始

在页面的 `.ink` 文件中，`<script setup>` 定义初始数据和处理函数。下面的例子每次点击按钮，数字都会加一：

```html
<script setup>
export default {
  data: {
    count: 0
  },

  handleIncrement() {
    this.setData({ count: this.data.count + 1 });
  }
};
</script>

<page>
  <view>当前数量：{{ count }}</view>
  <button bindtap="handleIncrement">加一</button>
</page>
```

`data` 保存页面数据；`bindtap` 把按钮与 `handleIncrement` 关联；`this.setData()` 更新数据，让绑定的界面随之更新。读取当前数据时使用 `this.data`，需要更新界面时使用 `setData()`。

## 在合适的时机执行代码

页面从打开到关闭会经历不同阶段，你可以按需定义生命周期函数：

- `onLoad(query)`：页面加载时调用，可读取打开页面时传入的参数；每个页面实例调用一次。
- `onShow()`：页面显示或重新显示时调用。
- `onReady()`：包含初始界面的首帧实际呈现后调用，每个页面实例调用一次。
- `onHide()`：页面隐藏时调用。
- `onUnload()`：页面卸载时调用，可用来清理不再需要的资源。

例如，可以在 `onLoad(query)` 中读取城市，在 `onUnload()` 中清理页面创建的监听器。详细时机见[页面生命周期](/AIUI/framework/open-agent-format-page-lifecycle)。

## 处理智能体级逻辑

根目录中的 `app.js` 可以定义整个智能体的逻辑。例如，`onLaunch()` 在智能体初始化时调用，`onShow()` 和 `onHide()` 分别响应显示和隐藏；`globalData` 可以保存应用级共享数据。

```javascript
// app.js
export default {
  globalData: { city: '杭州' },

  onLaunch() {
    console.log('智能体已启动');
  }
};
```

应用也支持错误处理等回调；完整配置和用法见 [app.json 与应用入口](/AIUI/framework/open-agent-format-app-json)。

## 为 Widget 和后台任务编写逻辑

**Widget** 是小尺寸独立界面。它也可以使用 `data` 和 `setData()`，但使用自己的生命周期函数：`onCreate()`、`onAttach()`、`onDetach()` 和 `onDestroy()`。其中显示和隐藏对应的 `onAttach()`、`onDetach()` 可能多次调用。完整示例见 [Widget 开发](/AIUI/framework/open-agent-format-widget)。

**Agent Worker** 是不显示界面的后台脚本，可以用于一次任务或多个页面、Widget 共用的任务。页面或 Widget 成功打开时会调用 `onOpen(event)`；如果在其中启动异步任务，需要通过 `event.waitUntil()` 登记。

```javascript
export default {
  onOpen(event) {
    event.waitUntil(this.prepare());
  },

  async prepare() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.ready = true;
  }
};
```

Worker 的配置、运行时长和可用能力与页面不同，详见 [Agent Worker 开发](/AIUI/framework/open-agent-format-agent-worker)。你可以先从页面逻辑开始，需要时再添加 Widget 或 Worker。

## 下一步

阅读[用户界面（UI）开发](./ui.md)，了解如何把数据、按钮和样式组织成用户看到的界面；也可以阅读[运行机制](../runtime/mechanism.md)，了解一次操作如何触发界面更新。
