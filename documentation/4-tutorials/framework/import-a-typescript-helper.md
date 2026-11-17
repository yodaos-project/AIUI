# 在 Page 中导入 TypeScript 函数

把时长格式化函数放在独立的 TypeScript 模块中，并用它显示一段时长。

## 导出格式化函数

<!-- aiui-tutorial-step -->

在项目根目录创建 `utils/format-duration.ts`。函数接收非负整数秒数，返回分和秒组成的字符串。

```typescript
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}
```

<!-- /aiui-tutorial-step -->

## 在页面中调用模块函数

<!-- aiui-tutorial-step -->

将示例保存为项目首页 `pages/index/index.ink`。使用相对于当前文件的路径导入函数。AIUI 会在执行模块前移除类型语法。

```html
<script setup>
import { formatDuration } from '../../utils/format-duration.ts';

export default {
  data: { duration: formatDuration(65) }
};
</script>

<page>
  <text>{{ duration }}</text>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

打开预览，页面应显示 `1:05`。将页面传入的 `65` 改为 `125` 再重载，应显示 `2:05`。

TypeScript 模块与类型检查配置参见[模块](/AIUI/framework/open-agent-format-module)。
