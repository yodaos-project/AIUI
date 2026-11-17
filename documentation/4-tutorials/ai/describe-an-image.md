# 用语言模型描述一张图片

让模型用一句话描述项目内的一张图片。准备支持图片输入的语言模型，并把一张内容清楚的小图保存为 `assets/photo.png`。

## 在一条消息中传入问题和图片

<!-- aiui-tutorial-step -->

将完整示例保存为项目中的 `pages/index/index.ink`。导入 PNG 会得到一个 `Blob`。将它编码成 Data URL，与文本问题一起放进同一条 `user` 消息的 `content` 数组。

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
          { type: 'text', text: '用一句话描述图片中的主要物体。' },
          { type: 'image_url', image_url: { url } }
        ]
      }]);
      if (!this.unloaded) this.setData({ description });
    } catch {
      if (!this.unloaded) this.setData({ description: '图片识别请求失败' });
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
    <button bindtap="describe" disabled="{{ busy }}">描述图片</button>
    <text>{{ description }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「描述图片」，检查回复是否提到图中的主要物体。将文件替换为一张内容明显不同的图片，重载后再次请求，检查描述是否随图片变化。

会话方法参见 [LanguageModel](/AIUI/api/ai-language-model)。
