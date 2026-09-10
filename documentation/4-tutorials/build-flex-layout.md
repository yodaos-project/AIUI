# 使用 Flexbox 布局页面

AIUI 页面应根据宿主提供的空间自适应。使用百分比尺寸和 Flexbox，避免把根节点锁定到某一款设备的像素尺寸。

## 完成示例

<!-- aiui-tutorial-step -->

AIUI 页面应根据宿主提供的空间自适应。使用百分比尺寸和 Flexbox，避免把根节点锁定到某一款设备的像素尺寸。

```css
.page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20px;
  gap: 12px;
}

.content {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}
```

<!-- /aiui-tutorial-step -->

在 AIUI Studio 中使用不同预览尺寸检查内容是否仍然完整。

