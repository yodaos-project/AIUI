# Barcode (BarcodeDetector)

Provides Web-standard interfaces for barcode recognition. The Barcode Detection API can detect linear and two-dimensional barcodes in images.

## Get Supported Formats

```javascript
BarcodeDetector.getSupportedFormats().then((supportedFormats) => {
  console.log('支持的条码格式:', supportedFormats);
});
```

## Create a Detector and Detect Barcodes

```javascript
// Create a detector that only detects QR codes and Code 128
const barcodeDetector = new BarcodeDetector({
  formats: ['qr_code', 'code_128']
});

// Get image data (ImageData) and detect
// Assume we obtained imageData from a Canvas
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

## Concepts and Usage

Through supported barcode formats, barcode recognition in Web applications unlocks a wide range of use cases. For example, QR codes can be used for online payments, Web navigation, or establishing social media connections; Aztec codes can be used to scan boarding passes; shopping applications can use EAN or UPC barcodes to compare prices of physical goods.

Detection is performed through the `detect()` method, which accepts an image object. Supported image object types are listed below:

- [x] `ImageData`
- [x] `Blob`
- [x] `ImageBitmap`
- [ ] `OffscreenCanvas`
- [ ] `VideoFrame`
- [ ] ~~`HTMLImageElement`~~ (not supported in the current environment)
- [ ] ~~`SVGImageElement`~~ (not supported in the current environment)
- [ ] ~~`HTMLVideoElement`~~ (not supported in the current environment)
- [ ] ~~`HTMLCanvasElement`~~ (not supported in the current environment)

Optional parameters can be passed to the `BarcodeDetector` constructor to hint which barcode formats should be detected.

## Supported Barcode Formats

The Barcode Detection API supports the following barcode formats:

- `aztec`: A square two-dimensional matrix defined by iso24778, with a square bullseye pattern in the center similar to an Aztec pyramid. It does not require a surrounding quiet zone.
- `code_128`: A linear (one-dimensional), bidirectionally decodable, self-checking barcode defined by iso15417 that can encode all 128 ASCII characters.
- `code_39`: A linear (one-dimensional), self-checking barcode defined by iso16388. It is a discrete and variable-length barcode type.
- `code_93`: A variable-length linear, continuous symbology defined by bc5. It offers greater information density than Code 39, which is visually similar to Code 128.
- `codabar`: A linear barcode representing characters 0-9, A-D, and the symbols `- . $ / +`.
- `data_matrix`: A two-dimensional barcode defined by iso16022, composed of black and white modules arranged in square or rectangular patterns.
- `ean_13`: A linear barcode based on the UPC-A standard and defined in iso15420.
- `ean_8`: A linear barcode defined in iso15420 and derived from EAN-13.
- `itf`: A continuous, self-checking, bidirectionally decodable barcode. It always encodes 14 digits.
- `pdf417`: A continuous two-dimensional barcode symbology with multiple rows and columns. It is bidirectionally decodable and uses the iso15438 standard.
- `qr_code`: A two-dimensional barcode using the iso18004 standard. The encoded information can be text, a URL, or other data.
- `upc_a`: One of the most common linear barcode types. Defined in iso15420, it represents a format widely used on retail products and can encode 12 digits.
- `upc_e`: A variant of UPC-A defined in iso15420 that compresses unnecessary zeros to produce a more compact barcode.
- `unknown`: A value used by the platform to indicate that it does not know or has not specified which barcode format is being detected or supported.

You can check which formats are supported by the user agent (browser/runtime) through `getSupportedFormats()`.

## Use canonical format names

Prefer Web format names returned by `getSupportedFormats()`, such as `qr_code`, `code_128`, and `ean_13`. Detection results use canonical names in `format`; do not assume all platform or library aliases are supported.

## API Reference

### Interface

#### BarcodeDetector

The `BarcodeDetector` interface allows detecting linear and two-dimensional barcodes in images.

#### Constructor

```javascript
new BarcodeDetector()
new BarcodeDetector(barcodeDetectorOptions)
```
- `barcodeDetectorOptions` (optional): An object containing a `formats` property. `formats` is an array of supported format strings listed above.

#### Static Methods

- `BarcodeDetector.getSupportedFormats()`
  Returns a `Promise` that resolves to an array of barcode format strings supported by the runtime.

#### Instance Methods

- `BarcodeDetector.detect(imageSource)`
  Returns a `Promise` that resolves to an array of detected barcode objects. Each barcode object contains the following properties:
  - `boundingBox`: A `DOMRectReadOnly` object representing the bounding box around the detected barcode.
  - `cornerPoints`: An array of four objects, each containing `x` and `y` properties that represent the polygon vertex coordinates of the four barcode corners.
  - `format`: A string representing the detected barcode format.
  - `rawValue`: The decoded string data extracted from the barcode.
