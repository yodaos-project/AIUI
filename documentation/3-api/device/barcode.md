# 条码 (BarcodeDetector)

提供基于 Web 标准的条码识别相关接口。条码检测 API（Barcode Detection API）能够在图像中检测线性和二维条形码。

## 获取支持的格式

```javascript
BarcodeDetector.getSupportedFormats().then((supportedFormats) => {
  console.log('支持的条码格式:', supportedFormats);
});
```

## 创建检测器并检测条码

```javascript
// 创建一个仅检测二维码 (QR Code) 和 Code 128 的检测器
const barcodeDetector = new BarcodeDetector({
  formats: ['qr_code', 'code_128']
});

// 获取图像数据 (ImageData) 并检测
// 假设我们在 Canvas 中获取了 imageData
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

barcodeDetector
  .detect(imageData)
  .then((barcodes) => {
    barcodes.forEach((barcode) => {
      console.log('检测到格式:', barcode.format);
      console.log('解码数据:', barcode.rawValue);
      console.log('边界框:', barcode.boundingBox);
      console.log('角点坐标:', barcode.cornerPoints);
    });
  })
  .catch((err) => {
    console.error('条码检测失败:', err);
  });
```

## 概念和用法

通过支持的条形码格式，Web 应用中的条形码识别可以解锁各种用例。例如：二维码可用于在线支付、Web 导航或建立社交媒体连接；Aztec 码可用于扫描登机牌；购物应用可以使用 EAN 或 UPC 条形码比较实体物品的价格。

检测是通过 `detect()` 方法实现的，该方法接受一个图像对象。图像对象的支持情况如下：

- [x] `ImageData`
- [x] `Blob`
- [x] `ImageBitmap`
- [ ] `OffscreenCanvas`
- [ ] `VideoFrame`
- [ ] ~~`HTMLImageElement`~~ (当前环境不支持此类)
- [ ] ~~`SVGImageElement`~~ (当前环境不支持此类)
- [ ] ~~`HTMLVideoElement`~~ (当前环境不支持此类)
- [ ] ~~`HTMLCanvasElement`~~ (当前环境不支持此类)

可以将可选参数传递给 `BarcodeDetector` 构造函数，以提供有关要检测哪些条形码格式的提示。

## 支持的条码格式

条码检测 API 支持以下条形码格式：

- `aztec`: 遵循 iso24778 的方形二维矩阵，中心有一个方形靶心图案，类似于阿兹特克金字塔。不需要周围有空白区。
- `code_128`: 遵循 iso15417 的线性（一维）、可双向解码、自检的条形码，能够编码所有 128 个 ASCII 字符。
- `code_39`: 遵循 iso16388 的线性（一维）、自检条形码。它是一种离散且可变长度的条形码类型。
- `code_93`: 遵循 bc5 的可变长度线性、连续符号。它提供比 Code 128 和视觉上相似的 Code 39 更大的信息密度。
- `codabar`: 表示字符 0-9、A-D 和符号 `- . $ / +` 的线性条形码。
- `data_matrix`: 遵循 iso16022 的由黑白模块组成的二维条形码，排列成正方形或长方形图案。
- `ean_13`: 基于 UPC-A 标准并在 iso15420 中定义的线性条形码。
- `ean_8`: 在 iso15420 中定义并源自 EAN-13 的线性条形码。
- `itf`: 一种连续、自检、可双向解码的条形码。它始终编码 14 位数字。
- `pdf417`: 一种具有多行和多列的连续二维条形码符号格式。它可双向解码并使用 iso15438 标准。
- `qr_code`: 使用 iso18004 标准的二维条形码。编码的信息可以是文本、URL 或其他数据。
- `upc_a`: 最常见的线性条形码类型之一。在 iso15420 中定义，代表零售商品中广泛使用的格式。它可以编码 12 位数字。
- `upc_e`: 在 iso15420 中定义的 UPC-A 的变体，压缩掉不必要的零以获得更紧凑的条形码。
- `unknown`: 平台使用此值表示它不知道或未指定正在检测或支持哪种条形码格式。

可以通过 `getSupportedFormats()` 方法检查用户代理（浏览器/运行环境）支持的格式。

## 使用规范格式名

优先使用 `getSupportedFormats()` 返回的 Web 格式名，例如 `qr_code`、`code_128`、`ean_13`。结果中的 `format` 使用规范名称；不能假设检测器支持所有平台或库的格式别名。

## API Reference

### 接口

#### BarcodeDetector

`BarcodeDetector` 接口允许在图像中检测线性和二维条形码。

#### 构造函数

```javascript
new BarcodeDetector()
new BarcodeDetector(barcodeDetectorOptions)
```
- `barcodeDetectorOptions` (可选): 一个包含 `formats` 属性的对象。`formats` 是一个包含上述支持格式字符串的数组。

#### 静态方法

- `BarcodeDetector.getSupportedFormats()`
  返回一个 `Promise`，解析为一个包含运行环境所支持的条形码格式字符串的数组。

#### 实例方法

- `BarcodeDetector.detect(imageSource)`
  返回一个 `Promise`，解析为一个包含检测到的条形码对象的数组。每个条形码对象包含以下属性：
  - `boundingBox`: 一个 `DOMRectReadOnly` 对象，表示包含检测到的条形码的边界框。
  - `cornerPoints`: 一个包含四个对象的数组，每个对象有 `x` 和 `y` 属性，代表条形码四个角的多边形顶点坐标。
  - `format`: 检测到的条形码格式的字符串。
  - `rawValue`: 从条形码中解码出的字符串数据。
