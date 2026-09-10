# 构建一个交互式计数器

这个教程通过一个计数器介绍页面数据、Mustache 数据绑定、事件处理和 `setData()`。

## 添加页面状态

<!-- aiui-tutorial-step -->

在 `pages/index/index.ink` 的 `<script setup>` 中声明 `count`。事件处理函数通过 `setData()` 更新状态，AIUI 随后会刷新使用该状态的界面。

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

使用 `{{ count }}` 显示当前值，并用 `bindtap` 将两个按钮连接到页面方法。方法名需要和 `<script setup>` 中的定义一致。

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

让页面尺寸跟随宿主可用区域，并使用 Flexbox 排列内容。不要为眼镜界面写死根节点宽高。

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

在效果预览中连续点击按钮，确认显示值会随每次操作更新。数据绑定的完整规则参见[数据绑定](/AIUI/framework/wxml/data-binding)。
