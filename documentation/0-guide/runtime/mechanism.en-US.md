# Runtime Mechanism

A user opens an agent and sees a page. They tap a button, and the text changes. What happens behind the scenes? This page uses a simple example to explain how AIUI loads a page, handles an action, and updates the interface.

## What Makes Up a Page?

An AIUI project typically declares its pages in `app.json` and defines their data, interaction logic, interface structure, and styles in page files. The runtime opens a page according to the project configuration and combines its data with the interface structure to produce what the user sees.

Here's an `.ink` page. It starts with “Hello”; when the user taps the button, the text changes to “Welcome”.

```html
<script setup>
export default {
  data: {
    message: 'Hello'
  },

  showWelcome() {
    this.setData({ message: 'Welcome' });
  }
};
</script>

<page>
  <view>{{ message }}</view>
  <button bindtap="showWelcome">Tap me</button>
</page>
```

There are three key parts:

- `data` holds the page's data; `message` is the text initially displayed.
- `{{ message }}` binds the page data to the interface.
- `bindtap="showWelcome"` connects the button's tap action to the `showWelcome` function.

## From Opening a Page to Updating the Interface

Follow the user's action through the example:

1. **Open the page**: The runtime loads the page definition and initial data, then calls the relevant lifecycle functions defined by the page.
2. **Display content**: The runtime uses the page structure, styles, and data to produce the interface. The user sees “Hello” and a button.
3. **Handle the tap**: When the user taps the button, the runtime delivers the tap event to the bound `showWelcome` function.
4. **Update the data**: The function calls `this.setData()` to change `message` to “Welcome”.
5. **Update the interface**: The runtime updates the associated interface content using the new data, and the user sees the new text.

Page logic handles data and actions, while the interface structure describes what to display; the runtime connects them. You can think of these as “logic” and “view”, but they don't require you to start two separate programs.

Use `this.setData()` to update interface data. Changing `this.data` directly does not guarantee an interface update. Updating data and presenting a frame on screen are also different moments: don't assume the new frame has already appeared just because `setData()` was called.

## When Does a Page Load, Appear, and Close?

A page goes through stages from opening to closing. You can define lifecycle functions as needed to run code at the appropriate time:

- `onLoad(query)`: Called when the page loads. It can read parameters passed when opening the page and runs once per page instance.
- `onShow()`: Called when the page appears or reappears.
- `onReady()`: Called after the first frame containing the initial page view has actually been presented, once per page instance.
- `onHide()`: Called when the page is hidden.
- `onUnload()`: Called when the page is unloaded; use it to clean up resources that are no longer needed.

For example, a weather page could read a city in `onLoad(query)`, request the forecast, and call `setData()` when the result arrives. Handle request failures and consider showing a loading state while waiting.

## How Are Other Inputs and Tasks Handled?

A button tap is one kind of input. Pages can also handle other events, such as key input; available inputs depend on the device and application. When tasks such as network requests or timers finish, page logic can likewise update data and the interface.

If a project needs a shared background task without an interface, it can use an **Agent Worker**. It has its own uses and limitations and isn't required for every agent; see [Agent Worker Development](/AIUI/framework/open-agent-format-agent-worker).

## Continue Reading

- [Project Structure](../structure.en-US.md): Find pages and configuration files.
- [Data Binding](/AIUI/framework/wxml-data-binding): Use page data in an interface.
- [Page Lifecycle](/AIUI/framework/open-agent-format-page-lifecycle): Learn about page stages and callback timing.
- [Page Events](/AIUI/framework/open-agent-format-page-events): Handle key input and other events.
