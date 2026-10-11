# 属性 (Properties)

WXSS 支持以下常用属性，具体范围与浏览器 CSS 不完全相同。

## 1. 布局与定位

### Flexbox 布局 (推荐)
Flex 是智能体界面开发的首选布局方式。

```css
.container {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  justify-content: center; /* 水平居中 */
  align-items: center;     /* 垂直居中 */
  height: 400rpx;
}

.item {
  flex: 1; /* 自动撑满剩余空间 */
}
```

### 定位 (Position)
用于精确控制元素在屏幕上的位置。

```css
.sticky-header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 100;
}

.absolute-icon {
  position: absolute;
  right: 20rpx;
  bottom: 20rpx;
}
```

## 2. 盒模型

### 尺寸与边距
控制元素的空间占用。

```css
.box {
  width: 200rpx;
  height: 200rpx;
  margin: 20rpx auto; /* 上下20rpx，左右自动居中 */
  padding: 30rpx;
  box-sizing: border-box; /* 宽度包含 padding 和 border */
}
```

### 边框与圆角
控制元素的边框视觉效果。

```css
.card {
  border: 1px solid #eee;
  border-radius: 12rpx; /* 圆角 */
  background-color: #fff;
}
```

## 3. 排版与文本

### 基础文字样式

```css
.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  text-align: center;
}
```

### 文本溢出处理
处理长文本的截断。

```css
.single-line-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 单行超出显示省略号 */
}
```

## 4. 视觉与装饰

### 阴影与透明度

```css
.button {
  box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  opacity: 0.9;
}
```

## 5. 动画与交互

### 过渡 (Transition)

```css
.btn-hover {
  transition: all 0.3s ease;
}

.btn-hover:active {
  transform: scale(0.95);
}
```

---

*完整的 CSS 属性字典及详细说明，请参考 [MDN CSS 属性参考](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Reference#属性)。*

## 单行省略与独立边框

```css
.title {
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card {
  border-top: 1px solid #444;
  border-right: 2px dashed #40ff5e;
  padding: calc(12px + 4rpx);
  color: #fff !important;
}
```

`text-overflow: ellipsis` 用于受限宽度的单行文字；不会自动实现多行截断。边框支持各边独立的宽度、样式和颜色，以及对应简写。`!important` 按优先级参与样式选择，也可阻止 keyframe 覆盖该属性。

尺寸与 margin / padding / gap / 定位可使用支持的 `calc()`；语法边界和随机数值见[函数](/AIUI/framework/wxss-function)。并发动画与事件见[动画与变换](/AIUI/framework/wxss-animation)。
