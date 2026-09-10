# 持久化用户设置

`localStorage` 只保存字符串。写入对象前使用 `JSON.stringify()`，读取时为缺失值提供默认结果。

## 完成示例

<!-- aiui-tutorial-step -->

`localStorage` 只保存字符串。写入对象前使用 `JSON.stringify()`，读取时为缺失值提供默认结果。

```javascript
const settings = {
  language: 'zh-CN',
  speechEnabled: true
};

localStorage.setItem('settings', JSON.stringify(settings));

const saved = localStorage.getItem('settings');
const restored = saved ? JSON.parse(saved) : {};
console.log(restored);
```

<!-- /aiui-tutorial-step -->

删除和清空数据的方式参见 [localStorage](/AIUI/api/storage-api)。

