# Widget

Widget API 用于管理 Widget 自己的数据、尺寸和显示状态。Widget 实例由运行时根据 `app.json` 和 `.ink` 入口创建，开发者通过入口脚本中的 `this` 使用这些能力。

## 更新 Widget 数据

使用 `data` 提供初始内容，使用 `setData()` 更新界面。点路径可以只更新嵌套对象中的一个字段。

```javascript
export default {
  data: {
    count: 0,
    status: { label: '待机' },
  },
  increment() {
    this.setData(
      {
        count: this.data.count + 1,
        'status.label': '已更新',
      },
      () => console.log('Widget 已更新'),
    );
  },
};
```

`setData()` 的第一个参数必须是对象。顶层字段会替换同名值；点路径会在需要时创建中间对象。可选回调会在数据同步到界面后执行。

## 根据可用尺寸调整布局

`family` 表示 Widget 的尺寸类别，`hostWidth` 和 `hostHeight` 表示当前实际可用的逻辑像素尺寸。需要动态计算内容时，可以在 `onAttach()` 中读取它们。

```javascript
export default {
  data: { compact: false },
  onAttach() {
    this.setData({ compact: this.hostWidth < 240 });
  },
};
```

一般情况下应优先使用 WXSS 自适应布局，只在内容逻辑确实依赖具体尺寸时读取宽高。

## 响应显示状态

```javascript
export default {
  onCreate() {
    console.log(this.widgetId, this.family);
  },
  onAttach() {
    console.log('Widget 开始显示');
  },
  onDetach() {
    console.log('Widget 暂时隐藏');
  },
  onDestroy() {
    console.log('Widget 已销毁');
  },
};
```

`isAttached` 表示 Widget 当前是否处于显示状态，`interactive` 表示当前是否允许用户输入。这两个属性以及尺寸属性均为只读。

## 使用限制

- Widget 使用自己的四个回调，不会调用 Page 生命周期。
- `onAttach()` 与 `onDetach()` 可能多次出现，相关逻辑应允许重复执行。
- `onDestroy()` 表示最终销毁，应在此处释放不再需要的资源。
- Widget 不提供 Page 专属的路由、环境感知和 `finish()` 能力。

Widget 的声明、文件结构和完整示例请参阅 [Widget 开发](/AIUI/framework/open-agent-format-widget)。需要从当前内容打开已声明的 Widget 时，请参阅[路由](/AIUI/api/route)中的 `window.open()`。

## 读取打开参数

`window.open('widgets/weather/index?city=hangzhou', '_widget')` 的查询参数会传给 `onCreate(options)`：

```javascript
export default {
  data: { city: '' },
  onCreate(options) {
    this.setData({ city: options.city ?? 'hangzhou' });
  },
};
```

参数值是字符串，没有查询参数时得到空对象。路径必须与 `app.json` 中声明的 Widget 路径一致。

## API Reference

### `Widget`

#### `widget.data`

`object` — 当前 Widget 数据；未提供时默认为 `{}`。

#### `widget.widgetId`

`string` — 当前 Widget 实例的稳定标识。只读。

#### `widget.family`

`'1x1' | '1x2'` — 在 `app.json` 和 `.ink` 文件中声明的尺寸类别。只读。

#### `widget.target`

`'_widget'` — Widget 固定使用的展示目标。只读。

#### `widget.isAttached`

`boolean` — 当前是否处于显示状态。只读。

#### `widget.interactive`

`boolean` — 当前是否允许用户输入。只读。

#### `widget.hostWidth`

`number` — 当前可用宽度，单位为逻辑像素。只读。

#### `widget.hostHeight`

`number` — 当前可用高度，单位为逻辑像素。只读。

#### `widget.setData(patch, callback?)`

更新 Widget 数据并刷新受到影响的界面内容。

| 参数 | 类型 | 必填 | 说明 |
| :--- | :--- | :--- | :--- |
| `patch` | `object` | 是 | 要更新的数据；支持点路径，例如 `'status.label'` |
| `callback` | `function` | 否 | 数据同步到界面后执行的回调 |

返回值为 `undefined`。如果 `patch` 不是对象，将抛出错误。

#### `onCreate(options)`

每个 Widget 实例创建后调用一次。`options` 包含打开 URL 的查询参数，值为字符串；没有参数时为 `{}`。

#### `onAttach()`

Widget 开始显示或重新显示时调用。

#### `onDetach()`

Widget 隐藏或准备销毁前调用。

#### `onDestroy()`

最终销毁时调用一次，释放资源。
