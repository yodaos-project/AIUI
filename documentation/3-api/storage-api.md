# localStorage

AIUI 提供了一套遵循 Web Storage API 标准的本地存储接口。开发者最常用的是 `localStorage`，可以用它在用户设备上持久化存储数据。

## 存储与读取数据

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
// 存储数据
localStorage.setItem('username', 'Rokid Agent');
localStorage.setItem('version', '1.0.0');

// 读取数据
const name = localStorage.getItem('username');
console.log(name); // "Rokid Agent"

// 读取不存在的键
const theme = localStorage.getItem('theme');
console.log(theme); // null
```

**wx**

```javascript api-style=wx
wx.setStorageSync('username', 'Rokid Agent');
wx.setStorageSync('version', '1.0.0');

const name = wx.getStorageSync('username');
console.log(name); // "Rokid Agent"

const theme = wx.getStorageSync('theme');
console.log(theme); // undefined
```

<!-- /aiui-api-style -->

## 移除与清空数据

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
// 移除特定项
localStorage.removeItem('version');

// 清空所有存储
localStorage.clear();
```

**wx**

```javascript api-style=wx
wx.removeStorageSync('version');
wx.clearStorageSync();
```

<!-- /aiui-api-style -->

## 存储对象数据

由于 `Storage` 仅支持存储字符串，存储对象前需要进行序列化。

```javascript
const user = { id: 1, name: 'Admin' };

// 序列化后存储
localStorage.setItem('userInfo', JSON.stringify(user));

// 读取并反序列化
const savedUser = JSON.parse(localStorage.getItem('userInfo'));
console.log(savedUser.name); // "Admin"
```

## 注意事项

- **数据类型**: `setItem` 的 `key` 与 `value` 会按 JavaScript 规则转换为字符串。建议在存储复杂对象前手动调用 `JSON.stringify()`。
- **隔离性**: 存储空间是按智能体（Agent）隔离的，不同智能体之间无法访问彼此的存储数据。

完整的 wx 兼容接口见[微信小程序兼容 API](/AIUI/api/weixin-compatible-apis)。

## API Reference

### `Storage`

#### `localStorage.getItem(key)`

将 key 转为字符串，返回对应字符串值；不存在时为 `null`。

#### `localStorage.setItem(key, value)`

将 key 和 value 按 JavaScript 字符串转换后保存；例如 `null` 保存为 `'null'`。对象应先 `JSON.stringify()`，否则通常保存为 `'[object Object]'`。返回 `undefined`。

#### `localStorage.removeItem(key)`

将 key 转为字符串并删除，不存在时不报错。返回 `undefined`。

#### `localStorage.clear()`

清空当前 Agent 的存储，返回 `undefined`。
