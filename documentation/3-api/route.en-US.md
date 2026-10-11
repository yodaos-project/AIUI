# Routing

AIUI routing APIs open Widgets and support navigation, back navigation, redirects, and page-stack management within an application.

## Open a Widget

Use `window.open()` to open a Widget declared in `app.json`. Omit the `.ink` extension from the path. Query parameters can follow the path:

```javascript
window.open('widgets/weather/index?city=hangzhou', '_widget');
```

The `target` argument is optional and defaults to `_widget`:

```javascript
window.open('widgets/weather/index?city=hangzhou');
```

`window.open()` currently opens Widgets only. Opening another Page is not supported. The call returns immediately without returning a Widget instance or an opening result.

Query parameters reach the Widget’s `onCreate(options)` as strings; no parameters produces `{}`.

## Navigate to a Detail Page

For example, navigate from the home page to a detail page:

```javascript
wx.navigateTo({
  url: '/pages/detail/index?id=1'
});
```

Continue reading:

- **[WeChat Mini Program Compatible APIs](/AIUI/api/weixin-compatible-apis)**: See APIs such as `wx.navigateTo`, `wx.redirectTo`, and `wx.navigateBack`.
- **[App](/AIUI/api/framework-app)**: Learn about application-level configuration and lifecycle entry points.
- **[Page](/AIUI/api/framework-page)**: Learn how pages are defined and how page-level behavior works.
- **[Widget](/AIUI/api/framework-widget)**: Learn about Widget data, state, and dimension APIs.
- **[AgentWorker](/AIUI/api/framework-agent-worker)**: Learn about background-task events and instance APIs.

## Update state after navigation completes

```javascript
wx.navigateTo({
  url: '/pages/detail/index?id=1',
  success(result) { console.log(result.errMsg); },
  fail(result) { console.error(result.errMsg); },
  complete(result) { console.log('navigation finished', result.errMsg); },
});
```

`success` runs after navigation actually succeeds. A missing target page, script, or configuration invokes `fail` and preserves the stack. `complete` follows even if an earlier callback throws. Methods still return `undefined`; returning from the call does not establish successful navigation.

## API Reference

### `window`

#### `window.open(url, target?)`

Opens a declared Widget. The equivalent global function `open(url, target?)` is also available.

| Parameter | Type | Required | Description |
| --- | --- | --- | --- |
| `url` | `string` | Yes | Widget path with optional query parameters, such as `widgets/weather/index?city=hangzhou` |
| `target` | `'_widget'` | No | Opening target; defaults to `'_widget'`, which is currently the only supported value |

Returns `undefined`. A `TypeError` is thrown synchronously when `url` is not a string or is empty after trimming.

### `wx`

#### `wx.navigateTo(options)`

Keeps the current page and navigates to a regular page within the app. It cannot navigate to a tabBar page.

Required `options.url` accepts an absolute path or a path relative to the current page directory, plus URL query parameters. Successful navigation delivers parameters to `onLoad(query)`. An identical current path and query succeeds without adding a page. Optional `success`, `fail`, and `complete` callbacks receive `{ errMsg }`; returns `undefined`.

#### `wx.redirectTo(options)`

Closes the current page and navigates to a regular page within the app. It cannot navigate to a tabBar page.

Required `options.url` accepts an absolute path or a path relative to the current page directory, plus URL query parameters. Successful navigation delivers parameters to `onLoad(query)`. The old page unloads only after the target loads successfully. Optional `success`, `fail`, and `complete` callbacks receive `{ errMsg }`; returns `undefined`.

#### `wx.navigateBack(options?)`

Closes the current page and returns to the previous page or multiple previous pages.

`delta` defaults to `1`; values below `1` are treated as `1`. Values beyond stack depth return to the home page. No previous page means failure; the current page is not shown again.

`navigateBack` options are optional and also accept `success`, `fail`, and `complete`, receiving `{ errMsg }`; returns `undefined`.
