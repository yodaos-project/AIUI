# Toggle a Setting with a Switch

Show whether reminders are on or off as soon as the user toggles a switch.

## Bind the Switch State

<!-- aiui-tutorial-step -->

In an existing AIUI project, save the example as the home page at `pages/index/index.ink`. Bind `checked` to the current state. The `bindchange` handler receives the new boolean value in `event.detail.value`.

```html
<script setup>
export default {
  data: { remindersEnabled: false },

  updateReminders(event) {
    this.setData({ remindersEnabled: event.detail.value });
  }
};
</script>

<page>
  <view>
    <text>{{ remindersEnabled ? 'Reminders on' : 'Reminders off' }}</text>
    <switch checked="{{ remindersEnabled }}" bindchange="updateReminders" />
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Open the preview. It starts with “Reminders off.” Toggle once to see “Reminders on,” then toggle again to return to “Reminders off.”

See [Switch](/AIUI/components/switch) for the other switch attributes.
