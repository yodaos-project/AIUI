# 取消正在进行的请求

为一个耗时的读取请求提供「取消」按钮，让用户可以停止等待。

## 将取消信号传给 fetch

<!-- aiui-tutorial-step -->

在已有 AIUI 项目中，将下列示例保存为首页 `pages/index/index.ink`。 将示例 URL 换成一个几秒后才响应的 HTTPS GET 接口。每次请求都创建一个新的 `AbortController`，把它的 `signal` 传给 `fetch()`。点击「取消」时，调用同一个控制器的 `abort()`。

```html
<script setup>
export default {
  data: { pending: false, status: '等待发起请求' },

  async startRequest() {
    if (this.requestController) return;

    const controller = new AbortController();
    this.requestController = controller;
    this.setData({ pending: true, status: '等待响应' });

    try {
      const response = await fetch('https://api.example.com/slow', {
        signal: controller.signal
      });
      if (this.requestController !== controller) return;
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      this.setData({ status: '已收到响应' });
    } catch {
      if (this.requestController === controller) {
        this.setData({
          status: controller.signal.aborted ? '请求已取消' : '请求失败'
        });
      }
    } finally {
      if (this.requestController === controller) {
        this.requestController = null;
        this.setData({ pending: false });
      }
    }
  },

  cancelRequest() {
    this.requestController?.abort();
  },

  onUnload() {
    const controller = this.requestController;
    this.requestController = null;
    controller?.abort();
  }
};
</script>

<page>
  <view>
    <button bindtap="startRequest" disabled="{{ pending }}">发送请求</button>
    <button bindtap="cancelRequest" disabled="{{ !pending }}">取消</button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

在效果预览中点击「发送请求」，在接口响应前点击「取消」。页面应显示「请求已取消」。再次发送并等待，应显示「已收到响应」。

更多选项参见 [HTTPS 请求](/AIUI/api/network-https)。
