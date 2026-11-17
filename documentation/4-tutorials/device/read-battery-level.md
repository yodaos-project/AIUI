# 显示当前电量百分比

在用户点击按钮时读取一次当前电量，并将其显示为百分比。

## 将电量换算成百分比

<!-- aiui-tutorial-step -->

在已有 AIUI 项目中，将下列示例保存为首页 `pages/index/index.ink`。 `navigator.getBattery()` 返回电池管理器。`level` 的范围是 `0` 到 `1`，乘以 `100` 后即可转换成百分比。运行环境缺少电池能力时，页面会显示提示。

```html
<script setup>
export default {
  data: { result: '尚未读取电量' },

  async readBattery() {
    try {
      const battery = await navigator.getBattery();
      this.setData({ result: `${Math.round(battery.level * 100)}%` });
    } catch {
      this.setData({ result: '当前环境无法读取电量' });
    }
  }
};
</script>

<page>
  <view>
    <button bindtap="readBattery">读取电量</button>
    <text>{{ result }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

在支持电池能力的设备或预览环境中点击「读取电量」。页面应显示一个介于 `0%` 与 `100%` 之间的值。

其他电池属性和事件参见 [BatteryManager](/AIUI/api/device-battery-manager)。
