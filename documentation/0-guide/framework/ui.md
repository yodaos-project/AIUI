# 用户界面 (UI) 开发

在 AIUI 中，视图层是把意图变得可见、可操作的那一层。Page 适合完整交互，Widget 适合快速查看与操作；两者都可以使用 WXML、WXSS、基础组件和事件系统。

## WXML（Page 与 Widget 结构）

WXML 是一种类似于 HTML 的标记语言，用于描述 Page 或 Widget 的结构。它支持数据绑定、条件渲染、列表渲染以及模板引用。

### 核心特性

- **数据绑定**: 使用 Mustache 语法 (`{{ }}`) 将逻辑层的数据绑定到视图层。
- **列表渲染**: 使用 `ink:for` 控制属性绑定一个数组，并使用 `item` 和 `index` 访问当前项。
- **条件渲染**: 使用 `ink:if`、`ink:elif`、`ink:else` 来根据条件决定是否渲染该代码块。
- **事件绑定**: 使用 `bindtap` 等属性绑定用户的交互事件。

### 示例代码

```html
<!-- index.wxml -->
<view class="container">
  <view class="header">
    <text class="title">{{title}}</text>
  </view>
  
  <view class="list">
    <view class="item" ink:for="{{items}}" ink:key="id" bindtap="handleItemClick">
      <text>{{index + 1}}. {{item.name}}</text>
      <text ink:if="{{item.status === 'active'}}" class="badge">进行中</text>
    </view>
  </view>
</view>
```

在 `.ink` 单文件中，Page 使用 `<page>` 根节点，Widget 使用 `<widget>` 根节点。同一个文件不能同时包含两者。

## WXSS（Page 与 Widget 样式）

WXSS 是一套样式语言，用于描述 WXML 的组件样式。它扩展了 CSS 的特性，以适应智能体开发的场景，并帮助把意图和状态转化为清晰的视觉反馈。

### 核心特性

- **尺寸单位**: 引入了 `rpx` (responsive pixel) 单位，可以根据屏幕宽度进行自适应。规定屏幕宽为 `480rpx`。
- **样式导入**: 使用 `@import` 语句可以导入外联样式表。
- **内联样式**: 支持 `style` 和 `class` 属性来控制组件样式。
- **选择器**: 支持常用的 CSS 选择器（`.class`, `#id`, `element`, `::after`, `::before` 等）。

### 示例代码

```css
/* index.wxss */
.container {
  padding: 20rpx;
  background-color: #f8f8f8;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
}

.item {
  display: flex;
  justify-content: space-between;
  padding: 30rpx;
  margin-top: 10rpx;
  background-color: #fff;
  border-radius: 8rpx;
}

.badge {
  color: #40FF5E;
  font-size: 24rpx;
}
```

## 渲染流程

1. **数据驱动**: 当逻辑层调用 `this.setData` 时，视图层会根据新数据进行差量更新，让意图变化能够被快速反馈到界面上。
2. **共享开发方式**: Page 和 Widget 使用相同的数据绑定、组件、事件和样式能力，但拥有各自的入口与生命周期。

Widget 的完整文件示例请参阅 [Widget 开发](/AIUI/framework/open-agent-format-widget)。

## 适配单色与全彩眼镜

完成基础界面后，可按[全彩眼镜适配指南](/AIUI/guide/framework/full-color)复用同一个智能体，并根据显示能力调整主题、资源和布局。具体设计数值见[全彩视觉规范](/AIUI/design/visual-full-color)，阅读与交互体验的进一步调整见[全彩优化指南](/AIUI/guide/performance-full-color)。
