# Identify the List Item the User Tapped

Use one tap handler for every button in a list and show the selected station on the page.

## Store the Station ID on Each Button

<!-- aiui-tutorial-step -->

In an existing AIUI project, save the example as the home page at `pages/index/index.ink`. Put `data-station-id` and `bindtap` on the same button. Read `event.currentTarget.dataset.stationId` to get that button’s station ID, even when the user taps the text inside it.

```html
<script setup>
export default {
  data: {
    stations: [
      { id: 'north', name: 'North Station' },
      { id: 'south', name: 'South Station' }
    ],
    selected: 'No station selected'
  },

  selectStation(event) {
    const id = event.currentTarget.dataset.stationId;
    const station = this.data.stations.find((item) => item.id === id);
    this.setData({ selected: station.name });
  }
};
</script>

<page>
  <view>
    <button
      ink:for="{{ stations }}"
      ink:key="id"
      data-station-id="{{ item.id }}"
      bindtap="selectStation"
    >
      <text>{{ item.name }}</text>
    </button>
    <text>{{ selected }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

In the preview, tap “South Station.” The label below the buttons should show “South Station.” Tap “North Station” to confirm that the label follows the selection.

See [Page events](/AIUI/framework/open-agent-format-page-events) for the event target rules.
