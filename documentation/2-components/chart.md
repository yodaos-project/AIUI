# Chart 图表

`chart` 用于把数组数据展示成折线图、面积图、柱状图、散点图、饼图、雷达图或漏斗图。你只需要准备数据并指定图表类型，不需要自己用 Canvas 绘制。

## 绘制第一个图表

下面的折线图读取每条数据中的 `value`：

```xml
<chart
  class="trend-chart"
  type="line"
  series="value"
  data="{{chartData}}"
></chart>
```

```javascript
export default {
  data: {
    chartData: [
      { label: '周一', value: 120 },
      { label: '周二', value: 168 },
      { label: '周三', value: 142 },
      { label: '周四', value: 196 }
    ]
  }
};
```

```css
.trend-chart {
  width: 350px;
  height: 180px;
}
```

`data` 接收数组，`series="value"` 表示使用每一项中的 `value` 字段。图表尺寸通过 CSS 设置，不需要使用图表专属的宽高属性。

## 选择图表类型

| 想展示的内容 | 推荐类型 | `type` 值 |
| --- | --- | --- |
| 一段时间内的变化 | 折线图或面积图 | `line`、`area` |
| 不同类别之间的大小 | 柱状图 | `bar` |
| 两组数值之间的分布 | 散点图 | `scatter` |
| 各部分所占比例 | 饼图 | `pie` |
| 多个能力维度 | 雷达图 | `radar` |
| 流程各阶段的数量变化 | 漏斗图 | `funnel` |

只需修改 `type` 就能切换基础图表类型：

```xml
<chart type="bar" series="value" data="{{chartData}}"></chart>
```

## 显示多组数据

当一张图需要同时显示多组数据时，将 `series` 设置为 JSON 数组。每一项至少需要一个 `yName`，表示数值字段；`xName` 表示横轴字段。

```xml
<chart
  type="line"
  data="{{weatherData}}"
  series='[
    {"xName":"day","yName":"high","color":"#ff6b6b","smooth":true},
    {"xName":"day","yName":"low","color":"#4dabf7","smooth":true}
  ]'
></chart>
```

```javascript
export default {
  data: {
    weatherData: [
      { day: '周一', high: 26, low: 18 },
      { day: '周二', high: 28, low: 19 },
      { day: '周三', high: 25, low: 17 }
    ]
  }
};
```

每组数据还可以使用 `dataSource` 提供独立的数据数组，并通过 `width` 设置线宽。

## 显示横向柱状图和数值

柱状图默认从下向上绘制。设置 `direction="horizontal"` 后，可以更清楚地展示较长的分类名称。

```xml
<chart
  type="bar"
  direction="horizontal"
  series="value"
  data="{{ranking}}"
  show-value-labels="true"
></chart>
```

`show-value-labels` 会把数值显示在图形附近。`value-label-format` 可以控制显示格式，例如用 `percent` 显示百分比，或用 `compact` 缩写较大的数字。

## 配置坐标轴

`x-axis` 和 `y-axis` 接收 JSON 对象。常用设置包括标题、最小值、最大值、标签和网格线。

```xml
<chart
  type="line"
  data="{{chartData}}"
  series='[{"xName":"label","yName":"value"}]'
  x-axis='{"title":"日期","showGridLines":false}'
  y-axis='{"title":"请求数","minimum":0,"showGridLines":true}'
></chart>
```

如果不设置坐标轴，组件会根据数据使用默认显示方式。新手通常不需要从一开始就配置坐标轴。

## 常用属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | String | `line` | `line`、`area`、`bar`、`scatter`、`pie`、`radar` 或 `funnel`。 |
| `data` | Array | `[]` | 图表使用的数据数组。 |
| `series` | String / JSON Array | `value` | 数值字段名，或多组数据配置。 |
| `color` | String | 主题色 | 单组数据的主要颜色。 |
| `animate` | Boolean | `false` | 首次绘制和数据变化时是否显示动画。 |
| `smooth` | Boolean | `true` | 折线图和面积图是否使用平滑曲线。 |
| `show-average` | Boolean | `false` | 折线图和面积图是否显示平均值虚线。也可写成 `showAverage`。 |
| `direction` | String | `vertical` | 柱状图方向，可设为 `vertical` 或 `horizontal`。 |
| `show-value-labels` | Boolean | `false` | 是否在图形附近显示数值。也可写成 `showValueLabels`。 |
| `value-label-format` | String | - | 数值文字格式，可选 `number`、`grouped`、`percent`、`compact`、`integer` 或 `datetime`。也可写成 `valueLabelFormat`。 |
| `value-label-color` | String | 主题文字色 | 数值文字颜色。也可写成 `valueLabelColor`。 |
| `x-axis` | JSON Object | 默认横轴 | 横轴设置。也可写成 `xAxis`。 |
| `y-axis` | JSON Object | 默认纵轴 | 纵轴设置。也可写成 `yAxis`。 |

## 不同图表的附加属性

这些属性只在对应图表中生效。不需要时可以忽略。

| 图表 | 属性 | 默认值 | 说明 |
| --- | --- | --- | --- |
| 散点图、雷达图 | `point-size` | `4` | 数据点大小。也可写成 `pointSize`。 |
| 散点图、雷达图 | `point-color` | 主题色 | 数据点颜色。也可写成 `pointColor`。 |
| 饼图 | `show-percentage` | `false` | 是否显示百分比。也可写成 `showPercentage`。 |
| 饼图 | `max-disk-diameter` | - | 饼图圆盘的最大直径。也可写成 `maxDiskDiameter`。 |
| 饼图 | `min-radius` | - | 饼图的最小半径。也可写成 `minRadius`。 |
| 雷达图、漏斗图 | `label-key` | - | 数据中作为名称的字段。也可写成 `labelKey`。 |
| 漏斗图 | `value-key` | - | 数据中作为数值的字段。也可写成 `valueKey`。 |
| 雷达图 | `levels` | 主题默认值 | 网格层数。 |
| 雷达图 | `show-points` | 主题默认值 | 是否显示数据点。也可写成 `showPoints`。 |
| 雷达图 | `max` | 自动计算 | 雷达图数值上限。 |
| 漏斗图 | `show-conversion` | `true` | 是否显示阶段转化率。也可写成 `showConversion`。 |
| 漏斗图 | `funnel-conversion-key` | - | 数据中已计算好的转化率字段。也可写成 `funnelConversionKey`。 |
| 漏斗图 | `funnel-conversion-title` | `转化率` | 转化率标题。也可写成 `funnelConversionTitle`。 |

图表还会读取主题中的颜色、线条和文字设置。通常建议先使用默认主题，只有在视觉设计需要时再覆盖 `color`、`label-color`、`grid-color`、`fill-color` 等颜色属性。

## `series` 配置

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `yName` | String | 是 | 数值字段名，也可写成 `yKey`。 |
| `xName` | String | 否 | 横轴字段名，也可写成 `xKey`。 |
| `dataSource` | Array | 否 | 这一组数据单独使用的数据数组。 |
| `color` | String | 否 | 这一组数据的颜色。 |
| `width` | Number | 否 | 折线宽度。 |
| `smooth` | Boolean | 否 | 这一组折线是否平滑。 |

## 坐标轴配置

`x-axis` 和 `y-axis` 都支持以下常用字段：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `minimum` / `maximum` | Number | 坐标轴的最小值和最大值。`y-axis` 也可以使用 `min`、`max`。 |
| `showAxisLine` | Boolean | 是否显示坐标轴线。 |
| `showGridLines` | Boolean | 是否显示网格线。 |
| `showLabels` | Boolean | 是否显示标签。 |
| `showTicks` | Boolean | 是否显示刻度。 |
| `tickCount` | Number | 期望显示的刻度数量。 |
| `tickLength` | Number | 刻度线长度。 |
| `title` | String | 坐标轴标题。 |
| `labelFormat` | String | 标签格式，也可写成 `format`。 |
| `opposedPosition` | Boolean | 是否把坐标轴显示在另一侧。 |

`y-axis` 还支持 `interval` 和 `stripLines`；`x-axis` 还支持 `valueType` 和 `intervalType`。

## 柱状图数值标签

竖向柱状图也支持 `show-value-labels="true"`，可配合 `value-label-format` 和 `value-label-color` 显示数值。标签跟随柱形位置与数据动画，不会改变柱形本身的颜色。
