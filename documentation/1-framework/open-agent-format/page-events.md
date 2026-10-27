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

## 注册和清理监听器

全局对象、Page 和 Entity 支持 DOM 风格的监听器。移除时保留回调身份和相同的 capture，或使用 signal 统一清理：

```javascript
const lifetime = new AbortController();
const onKeyDown = (event) => console.log(event.code);
addEventListener('keydown', onKeyDown, {
  capture: true,
  signal: lifetime.signal,
});

// 业务或页面结束时清理：
removeEventListener('keydown', onKeyDown, true);
lifetime.abort();
```

| 选项 | 默认值 | 行为 |
| --- | --- | --- |
| `capture` | `false` | 选择捕获监听器；第三个参数传 `true` 与此等价。 |
| `once` | `false` | 首次调用前移除监听器，包含回调中的嵌套派发。 |
| `passive` | `false` | 该监听器中的 `preventDefault()` 和 `returnValue = false` 不能取消事件。 |
| `signal` | 无 | 中止时移除监听器；已经中止的 signal 阻止注册。 |

回调可以是函数或包含 `handleEvent(event)` 的对象。类型、回调和 capture 相同的重复注册会被忽略；改变其他选项不会更新原监听器。移除必须使用原回调，省略或传入 `null` 不会清空该类型的全部监听器。

## 沿 Entity 树派发事件

查询返回的 Entity 是身份稳定的 `EventTarget`，`parentNode` 对应渲染后的实体树。事件依次经过祖先捕获、目标监听器，并在 `bubbles` 为 true 时经过祖先冒泡监听器。不冒泡的事件也会经过祖先捕获；独立 `EventTarget` 没有祖先传播路径。

`target` 表示起点，`currentTarget` 和 `eventPhase` 表示当前监听器的位置与阶段，`composedPath()` 返回传播路径副本。派发结束后，`currentTarget` 为 `null`，`eventPhase` 为 `Event.NONE`，路径为空；回调中修改节点树不改变本次路径。

`dispatchEvent()` 同步执行，只有事件被取消才返回 `false`。监听器异常会被报告而不阻止后续监听器；派发期间再次派发同一事件抛出 `InvalidStateError`。构造事件时接受 `bubbles`、`cancelable`、`composed`，调用方提供的目标或派发状态字段会被忽略；构造的事件不受信任。

`preventDefault()` 阻止可取消事件的默认行为，不停止传播；`stopPropagation()` 阻止继续向后续目标传播，`stopImmediatePropagation()` 还会停止当前目标的剩余监听器。

## 处理已完成的点击

鼠标主按钮点击、已完成触摸手势和导航激活产生 `tap`。位移超过 8 个逻辑像素的拖动、滚动、取消、未匹配的释放和非主按钮不会激活控件。

`bindtap` 和 `catchtap` 的 `target` 保持最初命中的后代或选中的导航节点，`currentTarget` 是绑定所在节点。捕获监听器先执行，再从目标向祖先交付。祖先 `catchtap` 在更靠近目标的处理器执行后运行，并停止继续向该祖先之外传播，不会撤销已经执行的回调。

`preventDefault()` 保留传播并阻止后续指针焦点更新。若传播到 Page，其 `addEventListener('tap', listener)` 最后执行；所有交付共享同一事件对象。

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
