# Build an Interactive Counter

Start with the project from [Create Your First AIUI Agent](../getting-started/create-first-agent.en-US.md). Replace the three sections of `pages/index/index.ink` to turn the welcome screen into a counter.

## Add Page State

<!-- aiui-tutorial-step -->

Replace `<script setup>` with the code below. Each button handler calls `setData()` to change `count`. AIUI updates the text bound to `count`.

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

Replace the entire `<page>` section. Use `{{ count }}` to display the current value and `bindtap` to connect both buttons to page methods. Each method name must match its definition in `<script setup>`.

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

Replace the CSS inside `<style>`. Flexbox arranges the counter within the available space.

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

Start the preview from the project directory and open the URL printed in the terminal.

```bash
aix preview .
```

The counter starts at `0`. Click **Increase** to see `1`, then click **Decrease** to return to `0`. Press `Ctrl+C` in the terminal to stop the preview. See [data binding](/AIUI/framework/wxml/data-binding) for the complete binding rules.

Next, [test on glasses with AIUI Studio](../../0-guide/debug/real_device_debug.en-US.md) or [package your agent with the AIX CLI](../delivery/package-an-aix.en-US.md).
