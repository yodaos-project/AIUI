# User Interface (UI) Development

The interface is what users see and operate. In a weather assistant, it can show a city, temperature, status message, and button so the user can see a result and continue to the details.

AIUI uses WXML for interface structure and WXSS for styling. You can write them in separate files or put them together with page logic in an `.ink` file.

## Start with a Weather Page

This example displays a city and temperature. Tapping the button updates a hint, showing how data and the interface work together. The data is fixed; the example does not fetch live weather.

```html
<script setup>
export default {
  data: {
    city: 'Hangzhou',
    temperature: 26,
    hint: 'Tap the button for a tip'
  },

  showHint() {
    this.setData({ hint: 'Check the weather before heading out' });
  }
};
</script>

<page>
  <view class="card">
    <text class="title">{{ city }} weather</text>
    <text>{{ temperature }}°C</text>
    <text>{{ hint }}</text>
    <button bindtap="showHint">Show tip</button>
  </view>
</page>

<style>
.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
}
</style>
```

The content inside `<page>` describes the interface: `view` groups content, `text` displays words, and `button` receives an action. Expressions such as `{{ city }}` bind page data to the interface. The button uses `bindtap` to call `showHint()` in the logic, which uses `setData()` to update the hint.

WXSS inside `<style>` controls layout and text styles. For example, `.card` sets the arrangement and padding, while `.title` styles the heading.

## What Can WXML Do?

Along with displaying and binding data, WXML can show content based on state, display lists, and bind user events:

- Use `{{ }}` to display data or set component attributes.
- Use `ink:if`, `ink:elif`, and `ink:else` to choose content based on a condition.
- Use `ink:for` to show a list and access the current item through `item` and `index`.
- Use attributes such as `bindtap` to connect event handlers.

For example, a weather page can show “Loading” during a request, then show the result. See the [WXML Introduction](/AIUI/framework/wxml-intro) for details.

## What Can WXSS Do?

WXSS sets colors, text, spacing, and layout using syntax similar to CSS. You can use class selectors, `class` and `style`, and `@import` to include a stylesheet.

WXSS supports the responsive `rpx` unit: it adapts to screen width, which is defined as `480rpx`. Verify the result in the actual container and on the target device. See the [WXSS Introduction](/AIUI/framework/wxss-intro) for more.

## Should I Use a Page or a Widget?

A Page is suited to a complete page interaction; a Widget is a small independent interface for viewing information or taking an action. Both can use data binding, components, events, and styles, but they have their own entry points and lifecycles.

In an `.ink` file, a Page uses a `<page>` root and a Widget uses `<widget>`; the same file cannot contain both. See [Widget Development](/AIUI/framework/open-agent-format-widget) for a complete example.

If the interface needs to support different displays, continue to [Full-Color Adaptation](./full-color.en-US.md) and check text, colors, and interaction on the target device.
