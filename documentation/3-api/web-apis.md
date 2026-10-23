# Web API

AIUI 提供一组常见的 Web API，让开发者可以用熟悉的 JavaScript 方式处理网络、数据、音频和绘图任务。

## WinterCG 兼容性

AIUI 积极拥护并主要支持 **WinterCG (Web-interoperable Runtimes Community Group)** 提出的：

- **[Minimum Common Web API](https://min-common-api.proposal.wintertc.org/)**

开发者可以在 AIUI 中使用 `fetch`、`URL`、`TextEncoder`、`TextDecoder`、Web Crypto 等通用 API。具体支持范围以各 API 页面为准；已有 Web 代码仍可能依赖 AIUI 尚未实现的浏览器能力。

## 能力分布

为了让开发者按使用场景更快找到文档，Web 标准能力不再集中挂在一个子目录下，而是并入各自更贴近业务的分类中：

- **[画布](/AIUI/api/canvas)**：查看 Canvas 2D 绘图接口与图像处理能力。
- **[窗口](/AIUI/api/window)**：查看智能体窗口、窗口尺寸、打开 Widget 以及关闭智能体的能力。
- **[Web Audio](/AIUI/api/media-web-audio)**：生成声音、处理 PCM、调节音量和分析音频。
- **[AI](/AIUI/api/ai)**：查看 Web Speech 相关能力与 AI 语音能力的关系。
- **[设备](/AIUI/api/device)**：查看 `BarcodeDetector` 等感知类能力。
- **[网络](/AIUI/api/network)**：查看 `fetch`、`URL`、WebSocket 和 Streams 等能力。
- **[编码](/AIUI/api/encoding)**：查看 `TextEncoder`、`TextDecoder` 等文本编码与解码能力。
- **[加密](/AIUI/api/crypto)**：查看 `crypto`、`SubtleCrypto` 等 Web Crypto 能力。
- **[数据存储](/AIUI/api/storage)**：查看 `localStorage` 与 OPFS 本地持久化能力。
- **[控制台](/AIUI/api/console)**：查看标准调试输出接口。
- **[性能](/AIUI/api/performance)**：查看运行性能监控能力。

## 推荐阅读

- **[URL](/AIUI/api/network-url)**：URL 构造、解析与查询参数处理。
- **[Encoding](/AIUI/api/encoding)**：文本编码与解码。
- **[Crypto](/AIUI/api/crypto)**：Web Crypto 能力。
- **[Storage API](/AIUI/api/storage-api)**：本地存储详细接口。
- **[Web Audio](/AIUI/api/media-web-audio)**：Web 标准音频处理接口。
- **[数据流](/AIUI/api/network-streams)**：分段读取、写入和转换数据。
- **[BarcodeDetector](/AIUI/api/device-barcode)**：条码检测接口。


## 核心设计理念

AIUI 的 Web API 实现遵循以下原则：

1. **标准优先**：尽可能遵循 WHATWG 和 W3C 标准。
2. **场景清晰**：每个 API 页面说明适用场景、当前行为和限制。
3. **按需使用**：优先选择完成任务所需的最简单接口，再使用流、音频处理等进阶能力。
