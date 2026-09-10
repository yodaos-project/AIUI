# 使用 Page 生命周期

使用 `onLoad()` 初始化数据，用 `onShow()` 恢复可见页面状态，并在 `onUnload()` 中释放页面持有的资源。

## 完成示例

<!-- aiui-tutorial-step -->

使用 `onLoad()` 初始化数据，用 `onShow()` 恢复可见页面状态，并在 `onUnload()` 中释放页面持有的资源。

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

生命周期顺序参见 [Page 生命周期](/AIUI/framework/open-agent-format-page-lifecycle)。

