# localStorage

AIUI provides a set of local storage APIs that follow the Web Storage API standard. The most commonly used one is `localStorage`, which you can use to persist data on the user's device.

## Store And Read Data

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
// Store data
localStorage.setItem('username', 'Rokid Agent');
localStorage.setItem('version', '1.0.0');

// Read data
const name = localStorage.getItem('username');
console.log(name); // "Rokid Agent"

// Read a missing key
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

## Remove And Clear Data

<!-- aiui-api-style default=web -->

**Web**

```javascript api-style=web
// Remove a specific item
localStorage.removeItem('version');

// Clear all storage
localStorage.clear();
```

**wx**

```javascript api-style=wx
wx.removeStorageSync('version');
wx.clearStorageSync();
```

<!-- /aiui-api-style -->

## Store Object Data

Since `Storage` only supports storing strings, you need to serialize objects before storing them.

```javascript
const user = { id: 1, name: 'Admin' };

// Serialize before storing
localStorage.setItem('userInfo', JSON.stringify(user));

// Read and deserialize
const savedUser = JSON.parse(localStorage.getItem('userInfo'));
console.log(savedUser.name); // "Admin"
```

## Notes

- **Data type**: The `value` argument of `setItem` must be a string. If you pass another type, the system automatically converts it to a string. For complex objects, call `JSON.stringify()` manually before storing.
- **Isolation**: Storage is isolated per agent. Different agents cannot access each other's stored data.

See [WeChat Mini Program Compatible APIs](/AIUI/api/weixin-compatible-apis) for the complete wx compatibility list.

## API Reference

### `Storage`

#### `localStorage.getItem(key)`

Converts key to a string and returns its string value, or `null` if absent.

#### `localStorage.setItem(key, value)`

Converts key and value using JavaScript string conversion before storing; for example, `null` becomes `'null'`. Serialize objects with `JSON.stringify()` first, otherwise they commonly become `'[object Object]'`. Returns `undefined`.

#### `localStorage.removeItem(key)`

Converts key to a string and removes the entry; missing entries do not error. Returns `undefined`.

#### `localStorage.clear()`

Clears storage for the current Agent; returns `undefined`.
