# Decode a QR Code from an Image

Use `BarcodeDetector` to extract the text from a QR code image whose contents you know.

## Detect the QR Code in the PNG

<!-- aiui-tutorial-step -->

Save a clear QR code image as `assets/qr.png` in your AIUI project. Save the example as the home page at `pages/index/index.ink`. The PNG import in the `.ink` file produces a `Blob` that you can pass directly to `detect()`. Set `formats` to `['qr_code']` and read the decoded text from the result’s `rawValue`.

```html
<script setup>
import { BarcodeDetector } from 'barcode';
import qrImage from '../../assets/qr.png';

export default {
  data: { result: 'Ready to scan' },

  async decodeQr() {
    try {
      const formats = await BarcodeDetector.getSupportedFormats();
      if (!formats.includes('qr_code')) {
        this.setData({ result: 'QR detection unavailable' });
        return;
      }

      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const [code] = await detector.detect(qrImage);
      this.setData({ result: code ? code.rawValue : 'No QR code found' });
    } catch {
      this.setData({ result: 'Detection failed' });
    }
  }
};
</script>

<page>
  <view>
    <button bindtap="decodeQr">Read QR code</button>
    <text>{{ result }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Read QR code” and compare the displayed text with the known contents of the code. Replace `assets/qr.png` with a plain PNG and reload. The page should show “No QR code found.”

See [BarcodeDetector](/AIUI/api/device-barcode) for supported image types.
