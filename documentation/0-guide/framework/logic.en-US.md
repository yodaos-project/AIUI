# Logic Development

An agent's logic handles data and actions. For example, it can increase a count when someone taps a button, or provide weather results for an interface to display.

Let's start with page logic, then look at application, Widget, and Agent Worker logic.

## Start with Page Logic

In a page's `.ink` file, `<script setup>` defines initial data and handlers. This example increases the number each time the button is tapped:

```html
<script setup>
export default {
  data: {
    count: 0
  },

  handleIncrement() {
    this.setData({ count: this.data.count + 1 });
  }
};
</script>

<page>
  <view>Count: {{ count }}</view>
  <button bindtap="handleIncrement">Add one</button>
</page>
```

`data` holds page data; `bindtap` connects the button to `handleIncrement`; and `this.setData()` updates the data so the bound interface can update. Use `this.data` to read the current data and `setData()` to update the interface.

## Run Code at the Right Time

A page goes through stages from opening to closing. Define lifecycle functions when you need them:

- `onLoad(query)`: Called when the page loads; it can read parameters passed when opening the page and runs once per page instance.
- `onShow()`: Called when the page appears or reappears.
- `onReady()`: Called once per page instance after the first frame containing its initial view is presented.
- `onHide()`: Called when the page is hidden.
- `onUnload()`: Called when the page is unloaded; use it to clean up resources that are no longer needed.

For example, read a city in `onLoad(query)` and remove page-created listeners in `onUnload()`. See [Page Lifecycle](/AIUI/framework/open-agent-format-page-lifecycle) for timing details.

## Handle Agent-Level Logic

The root `app.js` can define logic for the whole agent. For example, `onLaunch()` is called when the agent initializes; `onShow()` and `onHide()` respond to visibility changes; and `globalData` can hold application-level shared data.

```javascript
// app.js
export default {
  globalData: { city: 'Hangzhou' },

  onLaunch() {
    console.log('Agent started');
  }
};
```

The application also supports callbacks for errors and other events. See [app.json and the application entry](/AIUI/framework/open-agent-format-app-json) for details.

## Write Widget and Background Task Logic

A **Widget** is a small independent interface. It can also use `data` and `setData()`, but has its own lifecycle functions: `onCreate()`, `onAttach()`, `onDetach()`, and `onDestroy()`. The visibility callbacks `onAttach()` and `onDetach()` may run more than once. See [Widget Development](/AIUI/framework/open-agent-format-widget) for a complete example.

An **Agent Worker** is a background script without an interface. It can perform a one-time task or a task shared by multiple Pages or Widgets. `onOpen(event)` is called when a Page or Widget opens successfully; register any asynchronous work started there with `event.waitUntil()`.

```javascript
export default {
  onOpen(event) {
    event.waitUntil(this.prepare());
  },

  async prepare() {
    await new Promise((resolve) => setTimeout(resolve, 100));
    this.ready = true;
  }
};
```

A Worker's configuration, lifetime, and available capabilities differ from a page's. See [Agent Worker Development](/AIUI/framework/open-agent-format-agent-worker). You can start with page logic and add a Widget or Worker when needed.

## Next Step

Read [UI Development](./ui.en-US.md) to see how data, buttons, and styles form the interface, or read [Runtime Mechanism](../runtime/mechanism.en-US.md) to follow an action through an interface update.
