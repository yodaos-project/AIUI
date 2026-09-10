# 加载并展示远程数据

这个教程使用 `fetch()` 加载远程数据，并分别呈现加载中、成功和失败状态。

## 请求数据

<!-- aiui-tutorial-step -->

在 `onLoad()` 中启动请求。先进入加载状态，再根据响应结果一次性更新页面数据。示例地址需要替换成你自己的 HTTPS 接口。

```html
<script setup>
export default {
  data: {
    loading: true,
    error: '',
    message: ''
  },

  async onLoad() {
    try {
      const response = await fetch('https://api.example.com/message');
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const result = await response.json();
      this.setData({
        loading: false,
        message: result.message || '请求成功'
      });
    } catch (error) {
      this.setData({
        loading: false,
        error: error instanceof Error ? error.message : '请求失败'
      });
    }
  }
};
</script>
```

<!-- /aiui-tutorial-step -->

## 呈现完整状态

<!-- aiui-tutorial-step -->

不要只实现成功画面。先判断加载状态，再显示错误信息，最后呈现接口返回的内容。

```html
<page>
  <view class="result">
    <text ink:if="{{ loading }}">正在加载...</text>
    <text ink:elif="{{ error }}">{{ error }}</text>
    <text ink:else>{{ message }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

真机请求可能经过眼镜与手机之间的蓝牙链路，因此还应在弱网和断网条件下验证错误状态。更多请求方式参见[网络 API](/AIUI/api/network)。
