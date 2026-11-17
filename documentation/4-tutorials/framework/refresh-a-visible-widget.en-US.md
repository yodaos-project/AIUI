# Refresh a Clock While Its Widget Is Visible

Update a clock Widget once per second while it is visible and stop the timer when it is hidden.

## Register the Clock Widget

<!-- aiui-tutorial-step -->

Add the following Widget to the `widgets` array in `app.json` and keep the project’s existing pages and settings. The `overlay` placement lets the page open this Widget.

```json
{
  "widgets": [
    {
      "path": "widgets/clock/index",
      "family": "1x1",
      "placement": "overlay",
      "displayName": "Clock",
      "description": "Shows the current time."
    }
  ]
}
```

<!-- /aiui-tutorial-step -->

## Manage the Timer as Visibility Changes

<!-- aiui-tutorial-step -->

Create `widgets/clock/index.ink`. In `onAttach()`, show the current time immediately, then refresh it every second. Stop the timer in `onDetach()` and clean it up in `onDestroy()` as well. When the Widget appears again, it starts from the current system time.

```html
<script def>
{
  "widget": { "family": "1x1" }
}
</script>

<script setup>
function currentTime() {
  return new Date().toTimeString().slice(0, 8);
}

export default {
  data: { time: currentTime() },

  refresh() {
    this.setData({ time: currentTime() });
  },

  onAttach() {
    this.stopClock();
    this.refresh();
    this.timer = setInterval(() => this.refresh(), 1000);
  },

  stopClock() {
    if (this.timer == null) return;
    clearInterval(this.timer);
    this.timer = null;
  },

  onDetach() {
    this.stopClock();
  },

  onDestroy() {
    this.stopClock();
  },

  closeClock() {
    window.close();
  }
};
</script>

<widget>
  <view>
    <text>{{ time }}</text>
    <button bindtap="closeClock">Close clock</button>
  </view>
</widget>
```

<!-- /aiui-tutorial-step -->

## Open the Clock from the Home Page

<!-- aiui-tutorial-step -->

Save the example as the project home page at `pages/index/index.ink`. Use `_widget` to open the registered overlay Widget when the button is tapped.

```html
<script setup>
export default {
  openClock() {
    window.open('widgets/clock/index', '_widget');
  }
};
</script>

<page>
  <button bindtap="openClock">Open clock</button>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

In an environment that supports overlay Widgets, tap “Open clock” and check that the seconds advance. Close the clock, wait a few seconds, and reopen it. It should show the current time immediately and resume ticking.

See the [Widget API](/AIUI/api/framework-widget) for lifecycle callbacks.
