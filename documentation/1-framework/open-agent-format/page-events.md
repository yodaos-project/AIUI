# 事件

除了生命周期回调，AIUI 页面还支持页面级事件处理函数，用于响应按键和语音唤醒等输入事件。

页面级事件通常定义在页面导出的对象上，例如：

```javascript
export default {
  onKeyDown(event) {
    console.log('key down:', event.code);
  },

  onKeyUp(event) {
    console.log('key up:', event.code);
  },

  onVoiceWakeup(event) {
    console.log('voice wakeup:', event.keyword);
  }
}
```

## 事件回调表

| 回调函数 | 说明 | 触发时机 |
| :--- | :--- | :--- |
| `onKeyDown` | 监听页面级按键按下事件 | 用户按下按键时触发 |
| `onKeyUp` | 监听页面级按键抬起事件 | 用户松开按键时触发 |
| `onVoiceWakeup` | 监听页面级语音唤醒事件 | 语音唤醒命中时触发 |

## 拦截机制

部分页面级事件除了会通知页面，还会继续触发宿主内置的默认行为，例如返回、滚动或激活当前目标。

如果你希望页面接管这类行为，需要在对应事件回调中调用 `event.preventDefault()`。调用后，当前事件的默认行为将不再继续执行，后续逻辑由页面自行处理。

```javascript
export default {
  onKeyUp(event) {
    if (event.code === 'Backspace') {
      event.preventDefault();
      this.setData({ status: 'back action intercepted' });
    }
  }
}
```

使用拦截机制时可以参考下面的原则：

- 没有调用 `event.preventDefault()` 时，事件回调执行结束后，宿主会继续执行该事件的默认行为
- 调用了 `event.preventDefault()` 时，表示当前页面接管该事件，宿主默认行为不再执行
- 只有存在默认行为的事件才有“拦截”的意义，像 `onKeyDown` 这类更偏向即时通知的回调，通常用于监听输入本身
- 是否支持拦截以及默认行为的具体内容，取决于事件类型和宿主实现

## 各回调说明

### `onKeyDown(Object event)`

按键按下时触发，对应页面级 `keydown` 事件。适合处理方向键、确认键或设备按键的即时反馈逻辑。

```javascript
export default {
  onKeyDown(event) {
    if (event.code === 'Enter') {
      this.setData({ status: 'enter pressed' });
    }
  }
}
```

### `onKeyUp(Object event)`

按键抬起时触发，对应页面级 `keyup` 事件。可以通过 `event.code` 获取按键编码，也可以在需要时调用 `event.preventDefault()` 阻止默认行为。

```javascript
export default {
  onKeyUp(event) {
    if (event.code === 'Backspace') {
      event.preventDefault();
      this.setData({ status: 'back key intercepted' });
    }
  }
}
```

默认情况下，`keyup` 中部分按键带有内置行为：

- `Backspace`：返回上一级或请求关闭应用
- `ArrowUp` 和 `ArrowDown`：滚动根视图
- `Enter`：进入导航模式或激活当前目标

### `onVoiceWakeup(Object event)`

语音唤醒或触控唤醒时触发，对应页面级 `voicewakeup` 事件。

- **推荐用法**：默认**无需校验 `event.keyword`**，只要事件触发即直接响应并启动语音交互。
- **按需区分**：若需区分特定唤醒词或触控唤醒，可通过 `event.keyword` 判断。常见取值包括语音唤醒词（`'乐奇'`、`'Hi Rokid'`）以及触控唤醒事件（如 `'clickAiAssist'`）。
- 若需拦截宿主默认行为，可调用 `event.preventDefault()`。

```javascript
export default {
  onVoiceWakeup(event) {
    event.preventDefault();
    // 默认推荐直接响应，无需过滤 keyword
    this.setData({ status: 'voice wakeup received' });

    // 如需按唤醒来源特殊区分：
    // if (event.keyword === 'clickAiAssist') { /* 触控唤醒 */ }
    // if (event.keyword === '乐奇' || event.keyword === 'Hi Rokid') { /* 语音唤醒 */ }
  }
}
```

## Rokid Glasses

在 Rokid Glasses 上，页面级按键事件通常会通过 `event.code` 提供按键编码。常见的 `code` 包括 `Backspace`、`ArrowUp`、`ArrowDown`、`Enter`，部分宿主集成还会额外上报一个名为 `GlobalHook` 的设备侧按键编码。

### `Backspace`

`Backspace` 表示返回类操作。

- 在 `onKeyDown` 中，通常用于监听用户按下返回键的瞬时动作
- 在 `onKeyUp` 中，如果不拦截，默认会返回上一级，或者在没有可返回页面时请求关闭应用
- 如果你的页面需要接管返回逻辑，可以在 `onKeyUp` 中调用 `event.preventDefault()`

```javascript
export default {
  onKeyUp(event) {
    if (event.code === 'Backspace') {
      event.preventDefault();
      this.setData({ status: 'back action intercepted' });
    }
  }
}
```

### `ArrowUp`

`ArrowUp` 表示向上方向键。

- 在 `onKeyDown` 中，适合处理按下瞬间的焦点移动或状态反馈
- 在 `onKeyUp` 中，如果不拦截，默认会向上滚动根视图
- 常用于列表、菜单或可滚动内容的向上导航

```javascript
export default {
  onKeyDown(event) {
    if (event.code === 'ArrowUp') {
      this.setData({ status: 'arrow up pressed' });
    }
  }
}
```

### `ArrowDown`

`ArrowDown` 表示向下方向键。

- 在 `onKeyDown` 中，适合处理按下瞬间的焦点移动或状态反馈
- 在 `onKeyUp` 中，如果不拦截，默认会向下滚动根视图
- 常用于列表、菜单或可滚动内容的向下导航

```javascript
export default {
  onKeyDown(event) {
    if (event.code === 'ArrowDown') {
      this.setData({ status: 'arrow down pressed' });
    }
  }
}
```

### `Enter`

`Enter` 表示确认或激活当前目标。

- 在 `onKeyDown` 中，适合处理按下确认键时的即时交互反馈
- 在 `onKeyUp` 中，如果不拦截，默认会进入导航模式或激活当前目标
- 常用于按钮确认、列表项选中或进入某个交互流程

```javascript
export default {
  onKeyDown(event) {
    if (event.code === 'Enter') {
      this.setData({ status: 'enter pressed' });
    }
  }
}
```

### `GlobalHook`

`GlobalHook` 是 Rokid Glasses 设备上的特殊按键编码。

- 它表示眼镜镜腿按键触摸事件
- 它不是标准 Web 键值，而是设备侧额外提供的输入信号
- 可以像普通按键一样在 `onKeyDown`、`onKeyUp` 中处理
- 适合用来承载设备特有的快捷交互，例如呼出某个面板、切换模式或触发自定义动作

```javascript
export default {
  onKeyUp(event) {
    if (event.code === 'GlobalHook') {
      this.setData({ status: 'temple button touched' });
    }
  }
}
```

## 示例

```javascript
export default {
  onKeyUp(event) {
    switch (event.code) {
      case 'Backspace':
        event.preventDefault();
        this.setData({ status: 'back action intercepted' });
        break;
      case 'ArrowDown':
        this.setData({ status: 'arrow down received' });
        break;
      case 'Enter':
        this.setData({ status: 'enter received' });
        break;
      case 'GlobalHook':
        this.setData({ status: 'temple button touched' });
        break;
      default:
        break;
    }
  },

  onVoiceWakeup(event) {
    event.preventDefault();
    // 默认推荐直接放行并响应唤醒
    this.setData({ status: 'voice wakeup received' });
  }
}
```

## 推荐阅读

- [页面概览](/AIUI/framework/open-agent-format-page)
- [页面定义](/AIUI/framework/open-agent-format-page-definition)
- [生命周期](/AIUI/framework/open-agent-format-page-lifecycle)

## 动画事件

`bindanimationstart`、`bindanimationiteration`、`bindanimationend`、`bindanimationcancel` 接收 `AnimationEvent`。事件携带 `animationName`、以秒计的 `elapsedTime` 和 `pseudoElement`；也可在 `detail` 中读取这三个字段。事件冒泡到 Page / Widget，可使用 `catch` 或 `stopPropagation()` 截断。

动画回调中可以同步调用 `setData()`。节点移除或入口关闭时，活动动画先收到取消事件，再进入卸载 / 销毁回调。完整例子见[动画与变换](/AIUI/framework/wxss-animation)。
