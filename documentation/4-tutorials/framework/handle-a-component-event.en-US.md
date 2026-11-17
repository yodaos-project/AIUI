# Handle a Component Event on a Page

Have a custom component send a message when the user confirms, then display it on the Page that uses the component.

## Dispatch the Event in the Component

<!-- aiui-tutorial-step -->

In an existing AIUI project, create `components/confirm-button.ink`. When the user taps the button, `triggerEvent()` dispatches a custom event named `confirm` with a message.

```html
<script def>
{
  "component": true
}
</script>

<script setup>
export default {
  methods: {
    confirm() {
      this.triggerEvent('confirm', { message: 'Confirmed' });
    }
  }
};
</script>

<template>
  <button bindtap="confirm">Confirm</button>
</template>
```

<!-- /aiui-tutorial-step -->

## Read the Message on the Page

<!-- aiui-tutorial-step -->

In an existing AIUI project, save the example as the home page at `pages/index/index.ink`. Register the component with `usingComponents` and bind its event to `handleConfirm` with `bindconfirm`. The message from the component is available as `event.detail.message`.

```html
<script def>
{
  "usingComponents": {
    "confirm-button": "components/confirm-button"
  }
}
</script>

<script setup>
export default {
  data: { status: 'Waiting for confirmation' },

  handleConfirm(event) {
    this.setData({ status: event.detail.message });
  }
};
</script>

<page>
  <view>
    <confirm-button bindconfirm="handleConfirm"></confirm-button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Open the preview and tap “Confirm.” The page text should change from “Waiting for confirmation” to “Confirmed.”

See [Component](/AIUI/api/framework-component) for custom event options.
