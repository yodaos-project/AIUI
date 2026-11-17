# Import a TypeScript Helper into a Page

Put a duration formatter in its own TypeScript module and use it to display a duration.

## Export the Formatter

<!-- aiui-tutorial-step -->

Create `utils/format-duration.ts` at the project root. The function takes a nonnegative whole number of seconds and returns a string with minutes and seconds.

```typescript
export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}
```

<!-- /aiui-tutorial-step -->

## Call the Module Function from the Page

<!-- aiui-tutorial-step -->

Save the example as the project home page at `pages/index/index.ink`. Import the function using a path relative to the page file. AIUI removes the type syntax before running the module.

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

## Verify the Result

Open the preview and check for `1:05`. Change `65` to `125` in the page and reload. The display should now read `2:05`.

See [Modules](/AIUI/framework/open-agent-format-module) for TypeScript module and type-checking setup.
