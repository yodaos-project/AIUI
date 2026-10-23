# Web API

AIUI provides common Web APIs so developers can handle networking, data, audio, and drawing tasks with familiar JavaScript patterns.

## WinterCG Compatibility

AIUI actively embraces and primarily supports the following proposal from **WinterCG (Web-interoperable Runtimes Community Group)**:

- **[Minimum Common Web API](https://min-common-api.proposal.wintertc.org/)**

Developers can use common APIs such as `fetch`, `URL`, `TextEncoder`, `TextDecoder`, and Web Crypto in AIUI. Check each API page for its exact support; existing Web code may still depend on browser capabilities that AIUI does not implement.

## Capability Distribution

To help developers find documentation faster by usage scenario, Web-standard capabilities are no longer grouped under a single subdirectory. Instead, they are organized into categories that are closer to actual business needs:

- **[Canvas](/AIUI/api/canvas)**: See Canvas 2D drawing APIs and image-processing capabilities.
- **[Window](/AIUI/api/window)**: Work with the Agent window, its dimensions, Widget opening, and Agent closing.
- **[Web Audio](/AIUI/api/media-web-audio)**: Generate sound, process PCM, adjust volume, and analyse audio.
- **[AI](/AIUI/api/ai)**: See the relationship between Web Speech capabilities and AI speech capabilities.
- **[Device](/AIUI/api/device)**: See perception-related capabilities such as `BarcodeDetector`.
- **[Network](/AIUI/api/network)**: See `fetch`, `URL`, WebSocket, and Streams capabilities.
- **[Encoding](/AIUI/api/encoding)**: See text encoding and decoding capabilities such as `TextEncoder` and `TextDecoder`.
- **[Crypto](/AIUI/api/crypto)**: See Web Crypto capabilities such as `crypto` and `SubtleCrypto`.
- **[Storage](/AIUI/api/storage)**: See local persistence through `localStorage` and OPFS.
- **[Console](/AIUI/api/console)**: See standard debugging output APIs.
- **[Performance](/AIUI/api/performance)**: See runtime performance monitoring capabilities.

## Recommended Reading

- **[URL](/AIUI/api/network-url)**: URL construction, parsing, and query parameter handling.
- **[Encoding](/AIUI/api/encoding)**: Text encoding and decoding.
- **[Crypto](/AIUI/api/crypto)**: Web Crypto capabilities.
- **[Storage API](/AIUI/api/storage-api)**: Detailed local storage APIs.
- **[Web Audio](/AIUI/api/media-web-audio)**: Web-standard audio processing APIs.
- **[Streams](/AIUI/api/network-streams)**: Read, write, and transform data in chunks.
- **[BarcodeDetector](/AIUI/api/device-barcode)**: Barcode detection API.


## Core Design Principles

AIUI's Web API implementation follows these principles:

1. **Standards first**: Follow WHATWG and W3C standards whenever possible.
2. **Clear use cases**: Each API page explains when to use the capability, its current behavior, and its limits.
3. **Use only what is needed**: Start with the simplest interface for the task, then choose advanced capabilities such as streams or audio processing when necessary.
