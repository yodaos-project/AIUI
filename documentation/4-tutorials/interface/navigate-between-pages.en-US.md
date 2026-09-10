# Navigate Between Pages

Register the destination Page in `app.json`, then use `wx.navigateTo()` to keep the current page and open the destination. Query parameters are passed to the target.

## Complete the Example

<!-- aiui-tutorial-step -->

Register the destination Page in `app.json`, then use `wx.navigateTo()` to keep the current page and open the destination. Query parameters are passed to the target.

```javascript
wx.navigateTo({
  url: '/pages/detail/index?id=42',
  success() {
    console.log('Detail page opened');
  },
  fail(error) {
    console.error('Navigation failed', error);
  }
});
```

<!-- /aiui-tutorial-step -->

See [Routing APIs](/AIUI/api/route) for back navigation and redirects.

