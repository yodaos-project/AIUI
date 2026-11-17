# 将文字保存为本地文件

把一段文字写入当前智能体的私有文件空间，并读回内容确认保存成功。

## 写入并提交文件

<!-- aiui-tutorial-step -->

在已有 AIUI 项目中，将下列示例保存为首页 `pages/index/index.ink`。 在支持 OPFS 的运行环境中，`getDirectory()` 返回智能体的私有根目录。`truncate(0)` 清空写入缓冲区，覆盖旧文件时能去掉之前的内容。`close()` 提交写入，之后即可从文件句柄读回内容。

```html
<script setup>
export default {
  data: { result: '尚未保存' },

  async saveNote() {
    try {
      const root = await navigator.storage.getDirectory();
      const handle = await root.getFileHandle('note.txt', { create: true });
      const writer = await handle.createWritable();

      await writer.truncate(0);
      await writer.write('带上水杯');
      await writer.close();

      const file = await handle.getFile();
      const text = new TextDecoder().decode(await file.arrayBuffer());
      this.setData({ result: `已保存：${text}` });
    } catch (error) {
      this.setData({ result: `保存失败：${error.message}` });
    }
  }
};
</script>

<page>
  <view>
    <button bindtap="saveNote">保存便签</button>
    <text>{{ result }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「保存便签」，应看到「已保存：带上水杯」。将写入的文字改短为「水」，重载页面并再次保存，结果应显示「已保存：水」。如果运行环境不支持 OPFS，页面会显示保存错误。

文件和目录操作参见 [OPFS](/AIUI/api/storage-opfs)。
