# 读取用户点击的列表项

让列表里的每个按钮复用同一个点击处理函数，并在页面上显示被选中的站点。

## 将站点 ID 放在按钮上

<!-- aiui-tutorial-step -->

在已有 AIUI 项目中，将下列示例保存为首页 `pages/index/index.ink`。 将 `data-station-id` 和 `bindtap` 放在同一个按钮上。读取 `event.currentTarget.dataset.stationId` 就能取到该按钮的站点 ID，即使用户点中的是按钮里的文字。

```html
<script setup>
export default {
  data: {
    stations: [
      { id: 'north', name: '北站' },
      { id: 'south', name: '南站' }
    ],
    selected: '尚未选择'
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

## 验证效果

在效果预览中点击「南站」，按钮下方应显示「南站」。再点击「北站」，确认显示随选择更新。

事件目标的规则参见 [Page 事件](/AIUI/framework/open-agent-format-page-events)。
