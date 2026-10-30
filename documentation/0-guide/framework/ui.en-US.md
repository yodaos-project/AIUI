# User Interface (UI) Development

In AIUI, the view layer makes intent visible and interactive. Pages carry complete interactions, while Widgets support at-a-glance information and quick actions. Both can use WXML, WXSS, built-in components, and the event system.

## WXML (Page and Widget Structure)

WXML is a markup language similar to HTML and describes Page or Widget structure. It supports data binding, conditional rendering, list rendering, and template references.

### Core Features

- **Data binding**: Use Mustache syntax (`{{ }}`) to bind data from the logic layer to the view layer.
- **List rendering**: Use `ink:for` to bind an array to a control property, and use `item` and `index` to access the current item.
- **Conditional rendering**: Use `ink:if`, `ink:elif`, and `ink:else` to decide whether a code block should be rendered based on a condition.
- **Event binding**: Use attributes such as `bindtap` to bind user interaction events.

### Example Code

```html
<!-- index.wxml -->
<view class="container">
  <view class="header">
    <text class="title">{{title}}</text>
  </view>
  
  <view class="list">
    <view class="item" ink:for="{{items}}" ink:key="id" bindtap="handleItemClick">
      <text>{{index + 1}}. {{item.name}}</text>
      <text ink:if="{{item.status === 'active'}}" class="badge">Active</text>
    </view>
  </view>
</view>
```

In an `.ink` single-file entry, a Page uses the `<page>` root element and a Widget uses `<widget>`. One file cannot contain both.

## WXSS (Page and Widget Styles)

WXSS is a style language used to describe component styles in WXML. It extends CSS features to better fit agent development scenarios and helps turn intent and state into clear visual feedback.

### Core Features

- **Sizing unit**: Introduces the `rpx` (responsive pixel) unit, which can adapt based on screen width. The screen width is defined as `480rpx`.
- **Style import**: Use the `@import` statement to import external stylesheets.
- **Inline styles**: Supports the `style` and `class` attributes to control component styles.
- **Selectors**: Supports common CSS selectors such as `.class`, `#id`, `element`, `::after`, and `::before`.

### Example Code

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

## Rendering Flow

1. **Data-driven updates**: When the logic layer calls `this.setData`, the view layer performs incremental updates based on the new data, so intent changes can be reflected quickly.
2. **Shared development model**: Pages and Widgets use the same data binding, components, events, and styles, but have separate entries and lifecycle callbacks.

For a complete Widget file, see [Widget Development](/AIUI/framework/open-agent-format-widget).

## Adapt to Monochrome and Full-Color Glasses

After building the basic interface, follow the [Full-Color Glasses Adaptation Guide](/AIUI/guide/framework/full-color) to reuse the same agent and adjust themes, assets, and layout to display capabilities. See the [Full-Color Visual Guidelines](/AIUI/design/visual-full-color) for design values and the [Full-Color Optimization Guide](/AIUI/guide/performance-full-color) to refine reading and interaction.
