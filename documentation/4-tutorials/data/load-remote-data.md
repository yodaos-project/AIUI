# 加载并展示远程数据

用 `fetch()` 请求一条 JSON 消息。请求期间显示加载提示，请求结束后显示返回内容或错误。

## 请求数据

<!-- aiui-tutorial-step -->

将示例地址替换为你自己的 HTTPS 接口。接口返回一个 JSON 对象，其中 `message` 字段为字符串。页面在 `onLoad()` 中发起请求。

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

当 `loading` 为真时显示加载提示。请求结束后，有错误就显示错误，否则显示消息。

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

真机请求可能经过眼镜与手机之间的蓝牙链路，因此还应在弱网和断网条件下验证错误状态。查询 `fetch` 的参数、响应和错误时，参阅 [HTTPS 参考](../../3-api/network/https.md)。其他通信方式见[网络 API 选型](../../3-api/network.md)。
