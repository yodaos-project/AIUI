# 在 Page 之间导航

先在 `app.json` 中注册目标 Page，再通过 `wx.navigateTo()` 保留当前页面并打开目标路径。查询参数会传给目标页面。

## 完成示例

<!-- aiui-tutorial-step -->

先在 `app.json` 中注册目标 Page，再通过 `wx.navigateTo()` 保留当前页面并打开目标路径。查询参数会传给目标页面。

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

返回、重定向等操作参见[路由 API](/AIUI/api/route)。

