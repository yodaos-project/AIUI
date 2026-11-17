# 读取图片中的二维码

选一张内容已知的二维码图片，用 `BarcodeDetector` 读出其中的文本。

## 检测 PNG 中的二维码

<!-- aiui-tutorial-step -->

将一张清晰的二维码图片保存到 AIUI 项目的 `assets/qr.png`。将下列示例保存为首页 `pages/index/index.ink`。从 `.ink` 文件导入的 PNG 是 `Blob`，可以直接传给 `detect()`。将 `formats` 设为 `['qr_code']`，并从检测结果的 `rawValue` 读取原始文本。

```html
<script setup>
import { BarcodeDetector } from 'barcode';
import qrImage from '../../assets/qr.png';

export default {
  data: { result: '尚未识别' },

  async decodeQr() {
    try {
      const formats = await BarcodeDetector.getSupportedFormats();
      if (!formats.includes('qr_code')) {
        this.setData({ result: '当前环境不支持二维码识别' });
        return;
      }

      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const [code] = await detector.detect(qrImage);
      this.setData({ result: code ? code.rawValue : '未找到二维码' });
    } catch {
      this.setData({ result: '识别失败' });
    }
  }
};
</script>

<page>
  <view>
    <button bindtap="decodeQr">读取二维码</button>
    <text>{{ result }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## 验证效果

点击「读取二维码」，核对页面上的文字与二维码内容一致。将 `assets/qr.png` 换成一张普通 PNG 并重载，页面应显示「未找到二维码」。

支持的图像类型参见 [BarcodeDetector](/AIUI/api/device-barcode)。
