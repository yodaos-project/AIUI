# Save Text to a Local File

Write a text file to the current agent’s private file system and read it back to confirm the save.

## Write and Commit the File

<!-- aiui-tutorial-step -->

In an existing AIUI project, save the example as the home page at `pages/index/index.ink`. In a runtime with OPFS support, `getDirectory()` returns the agent’s private root directory. Use `truncate(0)` to clear the buffer before replacing an existing file. `close()` commits the write so you can read it back from the file handle.

```html
<script setup>
export default {
  data: { result: 'No note saved' },

  async saveNote() {
    try {
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle('note.txt', { create: true });
      const writer = await handle.createWritable();

      await writer.truncate(0);
      await writer.write('Bring a water bottle');
      await writer.close();

      const file = await handle.getFile();
      const text = new TextDecoder().decode(await file.arrayBuffer());
      this.setData({ result: `Saved: ${text}` });
    } catch (error) {
      this.setData({ result: `Save failed: ${error.message}` });
    }
  }
};
</script>

<page>
  <view>
    <button bindtap="saveNote">Save note</button>
    <text>{{ result }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Save note.” The page should show “Saved: Bring a water bottle.” Change the string passed to `write()` to “Water,” reload, and save again. Check that the result is “Saved: Water.” If the runtime lacks OPFS support, the page shows a save error.

See [OPFS](/AIUI/api/storage-opfs) for other file and directory operations.
