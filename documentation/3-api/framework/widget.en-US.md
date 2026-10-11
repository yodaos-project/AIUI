# Widget

The Widget API manages a Widget's data, dimensions, and display state. The runtime creates a Widget instance from its `app.json` declaration and `.ink` entry. Use these capabilities through `this` in the entry script.

## Update Widget Data

Provide initial content with `data` and update the interface with `setData()`. A dotted path updates one field inside a nested object.

```javascript
export default {
  data: {
    count: 0,
    status: { label: 'Idle' },
  },
  increment() {
    this.setData(
      {
        count: this.data.count + 1,
        'status.label': 'Updated',
      },
      () => console.log('Widget updated'),
    );
  },
};
```

The first argument to `setData()` must be an object. Top-level fields replace values with the same name. Dotted paths create intermediate objects when needed. The optional callback runs after the data is synchronized with the interface.

## Adapt to the Available Size

`family` describes the Widget size category. `hostWidth` and `hostHeight` provide the currently available dimensions in logical pixels. Read them in `onAttach()` when content decisions depend on the actual size.

```javascript
export default {
  data: { compact: false },
  onAttach() {
    this.setData({ compact: this.hostWidth < 240 });
  },
};
```

Prefer responsive WXSS layouts in most cases. Read exact dimensions only when the content logic requires them.

## Respond to Display State

```javascript
export default {
  onCreate() {
    console.log(this.widgetId, this.family);
  },
  onAttach() {
    console.log('Widget shown');
  },
  onDetach() {
    console.log('Widget hidden');
  },
  onDestroy() {
    console.log('Widget destroyed');
  },
};
```

`isAttached` reports whether the Widget is currently shown. `interactive` reports whether user input is currently allowed. These properties and the dimension properties are read-only.

## Current Limits

- Widgets use their own four callbacks and do not receive Page lifecycle callbacks.
- `onAttach()` and `onDetach()` may run more than once, so related work must be safe to repeat.
- `onDestroy()` is final; release resources that are no longer needed there.
- Widgets do not provide Page-only routing, world-awareness, or `finish()` features.

For declaration, file structure, and a complete example, see [Widget Development](/AIUI/framework/open-agent-format-widget). To open a declared Widget from current content, see `window.open()` in [Routing](/AIUI/api/route).

## Read opening parameters

Query parameters from `window.open('widgets/weather/index?city=hangzhou', '_widget')` are passed to `onCreate(options)`:

```javascript
export default {
  data: { city: '' },
  onCreate(options) {
    this.setData({ city: options.city ?? 'hangzhou' });
  },
};
```

Values are strings; no query parameters produces an empty object. The path must match a Widget declared in `app.json`.

## API Reference

### `Widget`

#### `widget.data`

`object` — Current Widget data; defaults to `{}` when omitted.

#### `widget.widgetId`

`string` — Stable identifier for the current Widget instance. Read-only except for `data`.

#### `widget.family`

`'1x1' | '1x2'` — Size category declared in `app.json` and the `.ink` file. Read-only except for `data`.

#### `widget.target`

`'_widget'` — Presentation target used by Widgets. Read-only except for `data`.

#### `widget.isAttached`

`boolean` — Whether the Widget is currently shown. Read-only except for `data`.

#### `widget.interactive`

`boolean` — Whether user input is currently allowed. Read-only except for `data`.

#### `widget.hostWidth`

`number` — Available width in logical pixels. Read-only except for `data`.

#### `widget.hostHeight`

`number` — Available height in logical pixels. Read-only except for `data`.

#### `widget.setData(patch, callback?)`

Updates Widget data and refreshes affected interface content.

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `patch` | `object` | Yes | Data to update; supports dotted paths such as `'status.label'` |
| `callback` | `function` | No | Runs after the data is synchronized with the interface |

Returns `undefined`. An error is thrown when `patch` is not an object.

#### `onCreate(options)`

Runs once after the Widget instance is created. `options` contains URL query parameters as strings, or `{}` when absent.

#### `onAttach()`

Runs when the Widget is shown or shown again.

#### `onDetach()`

Runs when the Widget is hidden or is about to be destroyed.

#### `onDestroy()`

Runs once at final destruction; release resources here.
