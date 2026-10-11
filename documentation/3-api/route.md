# 路由

AIUI 的路由能力用于打开 Widget，以及在应用内完成页面跳转、返回、重定向与页面栈管理。

## 打开 Widget

使用 `window.open()` 打开在 `app.json` 中声明的 Widget。路径不包含 `.ink` 扩展名，可以在路径后携带查询参数：

```javascript
window.open('widgets/weather/index?city=hangzhou', '_widget');
```

`target` 可以省略，默认值为 `_widget`：

```javascript
window.open('widgets/weather/index?city=hangzhou');
```

当前只能通过 `window.open()` 打开 Widget，暂不支持打开其他 Page。调用会立即返回，不会返回 Widget 实例或打开结果。

查询参数会传入 Widget 的 `onCreate(options)`，值为字符串，没有查询参数时为 `{}`。

## 跳转到详情页

例如，从首页跳转到详情页：

```javascript
wx.navigateTo({
  url: '/pages/detail/index?id=1'
});
```

继续阅读：

- **[微信小程序兼容 API](/AIUI/api/weixin-compatible-apis)**：查看 `wx.navigateTo`、`wx.redirectTo`、`wx.navigateBack` 等接口。
- **[App](/AIUI/api/framework-app)**：了解应用级配置与生命周期入口。
- **[Page](/AIUI/api/framework-page)**：了解页面的定义方式与页面级行为。
- **[Widget](/AIUI/api/framework-widget)**：了解 Widget 数据、状态和尺寸 API。
- **[AgentWorker](/AIUI/api/framework-agent-worker)**：了解后台任务的事件和实例 API。

## 在完成导航后更新状态

```javascript
wx.navigateTo({
  url: '/pages/detail/index?id=1',
  success(result) { console.log(result.errMsg); },
  fail(result) { console.error(result.errMsg); },
  complete(result) { console.log('navigation finished', result.errMsg); },
});
```

`success` 在导航实际成功后调用；目标页面、脚本或配置缺失时调用 `fail`，页面栈保持原状。随后调用 `complete`，即使前面的回调抛错也会执行。返回值仍为 `undefined`，不要把调用返回当作导航成功。

## API Reference

### `window`

#### `window.open(url, target?)`

打开一个已声明的 Widget。也可以使用等价的全局函数 `open(url, target?)`。

| 参数 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `url` | `string` | 是 | Widget 路径以及可选的查询参数，例如 `widgets/weather/index?city=hangzhou` |
| `target` | `'_widget'` | 否 | 打开目标，默认值为 `'_widget'`；当前仅支持该值 |

返回 `undefined`。如果 `url` 不是字符串或去除首尾空格后为空，会同步抛出 `TypeError`。

### `wx`

#### `wx.navigateTo(options)`

保留当前页面并跳转到应用内的普通页面，不能跳转到 tabBar 页面。

`options.url` 为必填字符串，支持绝对路径或相对当前页面目录的路径，以及 URL 查询参数。成功后参数传给目标 `onLoad(query)`。`navigateTo` 的目标路径及查询参数与当前页相同时成功，不新增页面。可选 `success`、`fail`、`complete` 回调接收 `{ errMsg }`，返回 `undefined`。

#### `wx.redirectTo(options)`

关闭当前页面并跳转到应用内的普通页面，不能跳转到 tabBar 页面。

`options.url` 为必填字符串，支持绝对路径或相对当前页面目录的路径，以及 URL 查询参数。成功后参数传给目标 `onLoad(query)`。仅在目标成功加载后卸载旧页。可选 `success`、`fail`、`complete` 回调接收 `{ errMsg }`，返回 `undefined`。

#### `wx.navigateBack(options?)`

关闭当前页面并返回上一页面或多级页面。

`delta` 默认为 `1`，小于 `1` 时按 `1` 处理；超过栈深时回到首页。没有可返回页面时失败，不会重新显示当前页。

`navigateBack` 的 `options` 可省略，也支持 `success`、`fail`、`complete`，回调收到 `{ errMsg }`；返回 `undefined`。
