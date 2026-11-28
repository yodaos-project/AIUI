# 构建一个交互式计数器

沿用[创建第一个 AIUI 智能体](../getting-started/create-first-agent.md)中的项目。替换 `pages/index/index.ink` 中的三个区块，把欢迎页面改成交互计数器。

## 添加页面状态

<!-- aiui-tutorial-step -->

用下面的代码替换 `<script setup>` 区块。按钮的事件处理函数调用 `setData()` 修改 `count`，AIUI 随后更新绑定到 `count` 的文本。

```html
<script setup>
export default {
  data: {
    count: 0
  },

  decrease() {
    this.setData({ count: this.data.count - 1 });
  },

  increase() {
    this.setData({ count: this.data.count + 1 });
  }
};
</script>
```

<!-- /aiui-tutorial-step -->

## 绑定数据和事件

<!-- aiui-tutorial-step -->

替换整个 `<page>` 区块。使用 `{{ count }}` 显示当前值，并用 `bindtap` 将两个按钮连接到页面方法。方法名需要和 `<script setup>` 中的定义一致。

```html
<page>
  <view class="counter">
    <text class="label">当前计数</text>
    <text class="value">{{ count }}</text>
    <view class="actions">
      <button bindtap="decrease">减少</button>
      <button bindtap="increase">增加</button>
    </view>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 设置布局

<!-- aiui-tutorial-step -->

替换 `<style>` 中的 CSS，用 Flexbox 在可用空间内排列计数器。

```css
.counter {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  width: 100%;
  height: 100%;
}

.value {
  font-size: 36px;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 12px;
}
```

<!-- /aiui-tutorial-step -->

在项目目录启动预览，然后打开终端打印的地址。

```bash
aix preview .
```

计数从 `0` 开始。点击**增加**后应显示 `1`，再点击**减少**应回到 `0`。预览结束后，在终端按 `Ctrl+C` 停止服务。要了解显示值如何更新，参阅[数据绑定](/AIUI/framework/wxml/data-binding)。

接下来可以[使用 AIUI Studio 在眼镜上调试](../../0-guide/debug/real_device_debug.md)，或[用 AIX CLI 打包智能体](../delivery/package-an-aix.md)。
