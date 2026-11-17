# 逐段显示 HTTP 文本响应

让服务端返回的文字在响应结束前出现在页面上。使用支持 `response.textStream()` 的 AIUI 运行环境，并准备一个会分几次发送 UTF-8 纯文本、各次之间有明显间隔的 HTTPS GET 接口。

## 追加每段收到的文字

<!-- aiui-tutorial-step -->

将示例保存为项目首页 `pages/index/index.ink`。将示例 URL 换成你的流式接口。遍历 `response.textStream()`，把每段文字追加到页面。流会处理跨分段的 UTF-8 字符，循环结束后更新完成状态。

```html
<script setup>
export default {
  data: { loading: false, status: '', text: '' },

  async readResponse() {
    if (this.controller) return;

    const controller = new AbortController();
    this.controller = controller;
    this.setData({ loading: true, status: '正在读取', text: '' });

    try {
      const response = await fetch('https://api.example.com/stream', {
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      let text = '';
      for await (const chunk of response.textStream()) {
        if (controller.signal.aborted) return;
        text += chunk;
        this.setData({ text });
      }
      if (!controller.signal.aborted) this.setData({ status: '读取完成' });
    } catch {
      if (!controller.signal.aborted) this.setData({ status: '读取失败' });
    } finally {
      this.controller = null;
      if (!controller.signal.aborted) this.setData({ loading: false });
    }
  },

  onUnload() {
    this.controller?.abort();
  }
};
</script>

<page>
  <view>
    <button bindtap="readResponse" disabled="{{ loading }}">读取文本</button>
    <text>{{ status }}</text>
    <text>{{ text }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「读取文本」，在「读取完成」出现前应能看到首段文字。等接口发完，核对页面显示的是完整响应。

流读取接口参见[数据流](/AIUI/api/network-streams)。
