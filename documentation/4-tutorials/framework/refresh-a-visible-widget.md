# 在 Widget 可见时刷新时钟

让一个时钟 Widget 在显示期间每秒更新，隐藏后暂停定时器。

## 注册时钟 Widget

<!-- aiui-tutorial-step -->

将以下 Widget 加入 `app.json` 的 `widgets` 数组，保留项目原有的 Page 和其他配置。`overlay` 允许从页面打开这个 Widget。

```json
{
  "widgets": [
    {
      "path": "widgets/clock/index",
      "family": "1x1",
      "placement": "overlay",
      "displayName": "时钟",
      "description": "显示当前时间。"
    }
  ]
}
```

<!-- /aiui-tutorial-step -->

## 随显示状态管理定时器

<!-- aiui-tutorial-step -->

创建 `widgets/clock/index.ink`。`onAttach()` 先显示当前时间，再开始按秒刷新。`onDetach()` 停止定时器，`onDestroy()` 也会清理。再次显示时从当前系统时间恢复。

```html
<script def>
{
  "widget": { "family": "1x1" }
}
</script>

<script setup>
function currentTime() {
  return new Date().toTimeString().slice(0, 8);
}

export default {
  data: { time: currentTime() },

  refresh() {
    this.setData({ time: currentTime() });
  },

  onAttach() {
    this.stopClock();
    this.refresh();
    this.timer = setInterval(() => this.refresh(), 1000);
  },

  stopClock() {
    if (this.timer == null) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onDetach() {
    this.stopClock();
  },

  onDestroy() {
    this.stopClock();
  },

  closeClock() {
    window.close();
  }
};
</script>

<widget>
  <view>
    <text>{{ time }}</text>
    <button bindtap="closeClock">关闭时钟</button>
  </view>
</widget>
```

<!-- /aiui-tutorial-step -->

## 从首页打开时钟

<!-- aiui-tutorial-step -->

将示例保存为项目首页 `pages/index/index.ink`。点击按钮时用 `_widget` 打开已注册的叠加 Widget。

```html
<script setup>
export default {
  openClock() {
    window.open('widgets/clock/index', '_widget');
  }
};
</script>

<page>
  <button bindtap="openClock">打开时钟</button>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

在支持叠加 Widget 的环境中点击「打开时钟」，确认秒数逐秒变化。关闭时钟，等几秒后重新打开，显示应直接跳到当前时间，并继续逐秒刷新。

生命周期参见 [Widget API](/AIUI/api/framework-widget)。
