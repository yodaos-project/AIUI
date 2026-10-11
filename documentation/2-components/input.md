# Input 单行输入框

`input` 用于接收单行文本，并在获得焦点后显示输入光标。

## 输入并同步文本

```xml
<input value="{{query}}" placeholder="搜索" maxLength="100" bindinput="handleInput" />
```

```javascript
export default {
  data: { query: '' },
  handleInput(event) {
    this.setData({ query: event.detail.value });
  },
};
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | String | `""` | 当前文本。 |
| `placeholder` | String | `""` | 输入框为空且未聚焦时显示的提示。 |
| `disabled` | Boolean | `false` | 是否忽略键盘输入。 |
| `maxLength` | Number | - | 允许输入的最大字符数。 |

占位文字颜色依次读取 `--input-placeholder-color`、`--color-text-secondary`，未设置时使用内置灰色。

## 事件

| 事件 | 事件数据 | 说明 |
| --- | --- | --- |
| `bindinput` | `{ detail: { value: string } }` | 每次文本变化时触发。 |

`event.detail.value` 是变化后的完整输入文本，而不是本次按键的增量字符；新增、删除和连续输入都应直接使用该值更新数据。
