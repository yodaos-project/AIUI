# 用摄像头拍一张照片

在支持拍照的设备上打开全屏 Page，使用系统取景界面拍一张照片，确认收到照片数据。

## 声明摄像头权限

<!-- aiui-tutorial-step -->

在 `app.json` 的 `permissions` 数组中加入 `CAMERA`，保留项目原有配置。运行时按系统提示允许访问摄像头。

```json
{
  "permissions": ["CAMERA"]
}
```

<!-- /aiui-tutorial-step -->

## 从视频轨道拍摄照片

<!-- aiui-tutorial-step -->

将示例保存为项目首页 `pages/index/index.ink`。通过 `getUserMedia()` 获取一条视频轨道，再用 `ImageCapture.takePhoto()` 得到编码后的 `Blob`。使用完毕后停止流中的所有轨道。

```html
<script setup>
export default {
  data: { capturing: false, status: '' },

  async takePhoto() {
    if (this.data.capturing) return;
    this.setData({ capturing: true, status: '正在拍照' });
    let stream;

    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.unloaded) return;

      this.cameraStream = stream;
      const [track] = stream.getVideoTracks();
      if (!track) throw new Error('No camera track');

      const capture = new ImageCapture(track);
      const photo = await capture.takePhoto({
        mode: 'default',
        enableSystemPreview: true
      });

      if (!this.unloaded) {
        this.setData({ status: `已拍摄 ${photo.size} B (${photo.type})` });
      }
    } catch {
      if (!this.unloaded) this.setData({ status: '未能拍摄照片' });
    } finally {
      stream?.getTracks().forEach((track) => track.stop());
      this.cameraStream = null;
      if (!this.unloaded) this.setData({ capturing: false });
    }
  },

  onUnload() {
    this.unloaded = true;
    this.cameraStream?.getTracks().forEach((track) => track.stop());
  }
};
</script>

<page>
  <view>
    <button bindtap="takePhoto" disabled="{{ capturing }}">拍照</button>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「拍照」，在系统取景界面确认拍摄。返回页面后，应显示照片的字节数和图像类型。再拍一次，确认释放摄像头后可以重新打开。

取景和拍照设置参见[媒体采集](/AIUI/api/media-media-capture)。
