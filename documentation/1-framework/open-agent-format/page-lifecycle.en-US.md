# Lifecycle

The lifecycle of an AIUI page follows a fixed calling order. When a page is opened for the first time, `onLoad` → `onShow` → `onReady` are triggered in sequence. When navigating to another page, the current page triggers `onHide`, and when switching back it triggers `onShow`. When the page is destroyed, `onUnload` is triggered.

## Lifecycle Callback Table

| Callback | Description | Trigger Timing |
| :--- | :--- | :--- |
| `onLoad` | Listens for page load | Triggered when the page loads, once per page instance |
| `onShow` | Listens for page display | Triggered when the page is displayed or brought to the foreground |
| `onReady` | Listens for the first render completion of the page | After the first frame containing the initial view is presented, once per page instance |
| `onHide` | Listens for the page being hidden | Triggered when the page is hidden or moved to the background |
| `onUnload` | Listens for page unload | Triggered when the page is unloaded |

## Lifecycle Demo

<page-lifecycle-demo></page-lifecycle-demo>

Sequence: creation `onLoad` → display `onShow` → first-frame presentation `onReady`; later `onHide` / `onShow` cycles end with `onUnload`.

## Callback Details

### onLoad(Object query)

Triggered when the page loads. A page is only called once, and you can get the parameters in the current page path through the parameter of `onLoad`.

### onShow()

Triggered when the page is displayed or brought to the foreground.

### onReady()

Runs once per instance after the first frame containing the initial view is actually presented. Template parsing or completed layout alone does not trigger `onReady`. Returning to an existing page and later `setData()` calls do not repeat it. Instances unloaded before presentation do not receive a late callback.

### onHide()

Triggered when the page is hidden or moved to the background.

### onUnload()

Triggered when the page is unloaded, for example when navigating to another page and destroying the current page.

## Recommended Reading

- [Page Overview](/AIUI/framework/open-agent-format-page)
- [Page Definition](/AIUI/framework/open-agent-format-page-definition)
- [Events](/AIUI/framework/open-agent-format-page-events)
