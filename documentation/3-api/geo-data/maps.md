# 系统导航

`navigator.maps` 可以打开系统导航，并在导航中更改目的地或出行方式。适合需要引导用户前往某个地点的智能体。

## 开始导航

先检查当前环境是否支持步行导航，再传入完整地址：

```javascript
try {
  const capabilities = await navigator.maps.getCapabilities();
  if (!capabilities.supported || !capabilities.travelModes.includes('walking')) {
    console.log('当前设备不支持步行导航');
  } else {
    const session = await navigator.maps.navigate({
      destination: { type: 'address', address: '浙江省杭州市西湖区西湖风景名胜区' },
      travelMode: 'walking',
    });
    session.finished.then((result) => console.log('导航结束：', result.reason));
  }
} catch (error) {
  console.error('无法开始导航：', error.reason, error.message);
}
```

可用性因设备和运行环境而异。导航会使用当前位置，不需要先调用定位 API；如果系统请求授权，请由用户完成授权。

## 更改路线或结束导航

保留 `navigate()` 返回的 `session`，即可在用户改变计划时更新路线或结束导航：

```javascript
const session = navigator.maps.currentSession;
if (session) {
  try {
    await session.reroute({ travelMode: 'cycling' });
    // 用户选择结束导航时：
    await session.end();
    console.log((await session.finished).reason);
  } catch (error) {
    console.error('操作失败：', error.reason, error.message);
  }
}
```

改路线前可通过 `getCapabilities()` 检查相应出行方式。省略的选项沿用原值；更新失败时原路线保持不变。页面切换不会自动结束导航，因此只在用户需要时调用 `end()`。

## API Reference

### `navigator.maps`

#### `getCapabilities()`

返回 `Promise`，结果的 `supported` 表示导航是否可用，`travelModes` 列出支持的 `walking`、`cycling`、`driving`。不可用时为 `false` 和空数组。

#### `navigate(options)`

开始导航，成功后返回 `Promise<MapNavigationSession>`。两个字段均必填：

| 字段 | 说明 |
| --- | --- |
| `destination` | 完整地址 `{ type: 'address', address: '...' }`，或高德 POI `{ type: 'poi', provider: 'amap', id: '...' }`。 |
| `travelMode` | `walking`（步行）、`cycling`（骑行）或 `driving`（驾车）。 |

请求失败时 Promise 会拒绝，错误的 `reason` 可用于区分 `unsupported`、`busy`、`cancelled`、`destination-not-found` 等原因。同一时间只能有一个导航会话。

#### `currentSession`

当前会话，或 `null`。启动期间也可读取，并使用 `end()` 取消启动。

### `MapNavigationSession`

#### `reroute(options?)`

更改目的地和／或出行方式，返回 `Promise<void>`。只能在导航进行中、没有其他操作等待完成时调用；省略字段保留当前值。

#### `end()`

请求结束导航，返回 `Promise<void>`。可重复调用；已结束的会话不能重新开始。

#### `finished`

返回最终结果的 Promise。`result.reason` 为 `requested`、`user`、`arrived`、`interrupted` 或 `error`；错误结束时 `result.error` 包含错误，其他情况为 `null`。即使发生错误，此 Promise 也会正常完成。

#### `state`、`destination`、`travelMode` 和 `id`

只读的会话状态、当前目的地、出行方式和会话标识。`state` 可能是 `starting`、`active`、`rerouting`、`ending`、`unknown` 或 `ended`。

#### `statechange`、`error` 和 `end` 事件

使用 `addEventListener()` 或 `onstatechange`、`onerror`、`onend` 接收变化。错误事件提供 `event.error`；结束事件提供 `event.result`。
