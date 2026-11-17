# Describe an Image with a Language Model

Ask the model to describe a bundled image in one sentence. Use a model that accepts image input and save a small, clear image as `assets/photo.png`.

## Send the Question and Image in One Message

<!-- aiui-tutorial-step -->

Save the complete example as `pages/index/index.ink` in your project. The PNG import gives you a `Blob`. Encode it as a data URL and add it to the same `user` message’s `content` array as the text question.

```html
<script setup>
import photo, { mimeType } from '../../assets/photo.png';

async function toDataUrl(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';

  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
  }

  return `data:${mimeType};base64,${btoa(binary)}`;
}

export default {
  data: { busy: false, description: '' },

  async describe() {
    if (this.data.busy) return;
    this.setData({ busy: true, description: '' });
    let session;

    try {
      session = await LanguageModel.create();
      if (this.unloaded) return;
      this.session = session;
      const url = await toDataUrl(photo);
      const description = await session.prompt([{
        role: 'user',
        content: [
          { type: 'text', text: 'Describe the main object in this image in one sentence.' },
          { type: 'image_url', image_url: { url } }
        ]
      }]);
      if (!this.unloaded) this.setData({ description });
    } catch {
      if (!this.unloaded) this.setData({ description: 'Image request failed' });
    } finally {
      session?.destroy();
      this.session = null;
      if (!this.unloaded) this.setData({ busy: false });
    }
  },

  onUnload() {
    this.unloaded = true;
    this.session?.destroy();
  }
};
</script>

<page>
  <view>
    <button bindtap="describe" disabled="{{ busy }}">Describe image</button>
    <text>{{ description }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Describe image” and check whether the response mentions the main object in your image. Replace the file with an image of a different object, reload, and check whether the description changes.

See [LanguageModel](/AIUI/api/ai-language-model) for session methods.
