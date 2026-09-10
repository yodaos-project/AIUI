# Use the Page Lifecycle

Initialize data in `onLoad()`, restore visible state in `onShow()`, and release page-owned resources in `onUnload()`.

## Complete the Example

<!-- aiui-tutorial-step -->

Initialize data in `onLoad()`, restore visible state in `onShow()`, and release page-owned resources in `onUnload()`.

```javascript
export default {
  data: { itemId: '' },

  onLoad(query) {
    this.setData({ itemId: query.id || '' });
  },

  onShow() {
    console.log('Page is visible');
  },

  onUnload() {
    console.log('Release page resources');
  }
};
```

<!-- /aiui-tutorial-step -->

See [Page Lifecycle](/AIUI/framework/open-agent-format-page-lifecycle) for lifecycle ordering.

