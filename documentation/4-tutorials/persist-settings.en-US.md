# Persist User Settings

`localStorage` stores strings only. Use `JSON.stringify()` before saving an object and provide a default when no saved value exists.

## Complete the Example

<!-- aiui-tutorial-step -->

`localStorage` stores strings only. Use `JSON.stringify()` before saving an object and provide a default when no saved value exists.

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

See [localStorage](/AIUI/api/storage-api) for removing and clearing data.

