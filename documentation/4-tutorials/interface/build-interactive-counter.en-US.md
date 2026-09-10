# Build an Interactive Counter

This tutorial uses a counter to introduce page data, Mustache data binding, event handlers, and `setData()`.

## Add Page State

<!-- aiui-tutorial-step -->

Declare `count` in the `<script setup>` section of `pages/index/index.ink`. The event handlers update state with `setData()`, and AIUI then refreshes the interface that uses that state.

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

## Bind Data and Events

<!-- aiui-tutorial-step -->

Use `{{ count }}` to display the current value and `bindtap` to connect both buttons to page methods. Each method name must match its definition in `<script setup>`.

```html
<page>
  <view class="counter">
    <text class="label">Current count</text>
    <text class="value">{{ count }}</text>
    <view class="actions">
      <button bindtap="decrease">Decrease</button>
      <button bindtap="increase">Increase</button>
    </view>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Lay Out the Interface

<!-- aiui-tutorial-step -->

Let the page follow the space available from its host and arrange the content with Flexbox. Avoid fixed dimensions on the root container of a glasses interface.

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

Click the buttons repeatedly in the preview and confirm that the displayed value changes after every action. See [Data Binding](/AIUI/framework/wxml/data-binding) for the complete binding rules.
