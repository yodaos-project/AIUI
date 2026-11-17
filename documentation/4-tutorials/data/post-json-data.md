# 用 POST 发送一条 JSON 数据

点击按钮，把一条练习便签提交给 HTTPS 接口。准备一个接收 `POST` 和 `application/json` 的测试接口，提交成功时应返回 2xx 状态。

## 将对象转换为请求体

<!-- aiui-tutorial-step -->

将示例保存为项目首页 `pages/index/index.ink`。将示例 URL 换成你的测试接口。`JSON.stringify()` 生成请求体，`Content-Type` 告诉服务端如何读取它。用 `response.ok` 判断接口是否返回 2xx。

```html
<script setup>
export default {
  data: { sending: false, status: '' },

  async sendNote() {
    if (this.data.sending) return;
    this.setData({ sending: true, status: '正在发送' });

    try {
      const response = await fetch('https://api.example.com/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: '带上水杯' })
      });
      const status = response.ok
        ? `接口已接收便签 (HTTP ${response.status})`
        : `接口拒绝了请求 (HTTP ${response.status})`;
      if (!this.unloaded) this.setData({ status });
    } catch {
      if (!this.unloaded) this.setData({ status: '未收到响应，请检查连接' });
    } finally {
      if (!this.unloaded) this.setData({ sending: false });
    }
  },

  onUnload() {
    this.unloaded = true;
  }
};
</script>

<page>
  <view>
    <button bindtap="sendNote" disabled="{{ sending }}">发送便签</button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「发送便签」，确认页面显示 2xx 状态码。再从测试接口的请求日志中核对 JSON 的 `note` 字段。

更多请求体类型参见 [HTTPS](/AIUI/api/network-https)。
