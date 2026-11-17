# Render Markdown on a Page

Render a short Markdown note with bold text and a list.

## Bind the Markdown String

<!-- aiui-tutorial-step -->

In an existing AIUI project, save the example as the home page at `pages/index/index.ink`. Pass the string to the `content` property of `streamdown`. The blank line separates the paragraph from the list.

```html
<script setup>
export default {
  data: {
    markdown: '**Before you leave**\n\n- Keys\n- Water bottle'
  }
};
</script>

<page>
  <streamdown content="{{ markdown }}"></streamdown>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Open the preview. “Before you leave” should appear in bold, with “Keys” and “Water bottle” as two list items below it.

See [Streamdown](/AIUI/components/streamdown) for the other component attributes.
