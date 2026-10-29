# v0.20.0

AIUI 0.20.0 lets an agent on the glasses work with the current conversation. For example, after a user selects a product on the glasses, the agent can share its details with the conversation and send a message asking for an introduction. It can also send a card to the Rokid AI App so the user can open the product page later. This release also makes permission feedback, glasses interfaces, and computation modules easier to use.

## Help the Conversation Understand What Is Happening on the Glasses

When a user browses products on the glasses, the conversation does not automatically know which one they selected. An **Agent session** is the agent's way to communicate with the current conversation. The new session API can provide the selected product as **context**: background information the conversation can use when answering. The agent can then send a user message asking the conversation to describe that product.

For example, call these methods from an App or Page method:

```javascript
const agent = getApp().getAgent();
const selection = await agent.provideContext({
  key: 'selection',
  description: 'The product selected by the user',
  value: { selectedSku: 'DEMO' },
});
await agent.conversation.sendMessage({
  role: 'user',
  content: [{ type: 'text', text: 'Describe the currently selected product.' }],
});
```

`provideContext()` supplies background information; `sendMessage()` sends the message. Providing context alone does not send a message or start a response. The example only supplies a product identifier. To describe its name or price, also provide those details or let the conversation query an available service. When the user selects another product, call `selection.update({ selectedSku: 'SKU-002' })` to update the background. Call `selection.dispose()` when it is no longer needed. Successful publication acknowledges receipt but does not guarantee that the model has read the data. Application state does not automatically become context.

The session can also call available remote tools or read resources, such as a service's product inventory. Available operations depend on the current session. See [Agent Sessions](/AIUI/api/ai-agent-session) for details.

### Let the Conversation Call an Agent's Operations

An agent can also expose its own methods as tools for a model to call when needed. For example, when a user asks through the glasses, “What did I select?”, the agent can provide a method that reads the current selection. Use `ModelContext.defineAction()` to define the tool's name, purpose, and implementation. Whether the model can call it depends on tool support in the current session.

For example, define a tool in `app.js` that returns the selected product identifier:

```javascript
export default {
  selectedSku: 'DEMO',
  getSelection: ModelContext.defineAction({
    name: 'get_selection',
    description: 'Read the selected product',
    execute() {
      return { selectedSku: this.selectedSku };
    },
  }),
};
```

`selectedSku` is an initial example value; update it when the user selects another product.

## Send Results to the Rokid AI App

An agent on the glasses can use `sendCard()` to send a card to a conversation in the Rokid AI App. For example, after finding a product on the glasses, the user can view the card on their phone and open the product page. Cards currently support a title and a destination link; display of a description and `data` will be supported later.

```javascript
const conversation = getApp().getAgent().conversation;
const card = await conversation.sendCard({
  title: 'View product DEMO',
});
```

In runtime versions that support links, add `href: 'https://example.com/products/DEMO'` to the card definition so the user can tap the card to open that address. Some runtime versions return a `DataError` when `href` is provided. The returned `card` is a handle: call `card.update({ title: 'Product updated' })` to update the same card. An update replaces the entire card, so include the link and any other fields you want to keep.

Cards are shown to the user and are not automatically provided to the model. Use `provideContext()` separately for information the model needs. Each `sendCard()` creates a new card, and there is no removal API. Check `agent.capabilities.operations` for available operations; see [Agent Sessions](/AIUI/api/ai-agent-session).

## Give Clear Feedback About Permissions

For example, before a user starts a voice feature on the glasses, an agent can check microphone permission and show a message if access was denied. It can also check camera or location permission and update the interface when permission changes. A query does not open an authorization dialog or start recording, capture, or location access.

```javascript
const microphone = await navigator.permissions.query({ name: 'microphone' });
console.log(microphone.state); // 'granted', 'denied', or 'prompt'
microphone.addEventListener('change', () => {
  console.log('Microphone permission:', microphone.state);
});
```

`granted` means allowed, `denied` means refused, and `prompt` means the user has not decided. To use the microphone, call `getUserMedia()`, handle authorization failure, and declare `RECORD_AUDIO` in `app.json`. Camera and location access also require their own declarations and API calls. See [Permission State](/AIUI/api/permissions).

## Reuse WebAssembly Computational Modules

WebAssembly, or Wasm, is a format for computation modules that an application can load. An agent on the glasses can put existing computation logic in a Wasm module and call it from JavaScript, for example to process sensor data. This release expands module reuse, JavaScript function imports, and Memory, Table, and Global resources. Native and Web environments use the same supported API subset.

Place a `math.wasm` module exporting `add` in `assets/`, then load and reuse it from `app.js`:

```javascript
import math from './assets/math.wasm';

const { module, instance } = await WebAssembly.instantiate(math);
console.log(instance.exports.add(13, 29)); // 42

const another = await WebAssembly.instantiate(module);
console.log(another.exports.add(1, 2)); // 3
```

This release also supports synchronous Module/Instance construction, `i64` BigInt, and `compileStreaming()` / `instantiateStreaming()` for valid `application/wasm` network responses. See [WebAssembly](/AIUI/api/webassembly) for build instructions, resource quotas, and supported features.

## Adapt the Interface to Its Content

### Give Images a Consistent Color

Navigation and status icons on the glasses can share a consistent color. The new `tint-color` attribute colors SVG and raster images while preserving transparent regions.

```xml
<image
  src="/assets/plane.svg"
  tint-color="#adadad"
  mode="aspectFit"
/>
```

A2UI images also support `tintColor` and `contain`, `cover`, or `fill` for `fit`; explicit `mode` takes precedence. The `--image-svg-tint` theme color overrides explicit SVG tint. See [Image](/AIUI/components/image) and [A2UI](/AIUI/components/a2ui).

### Adjust the Status Bar for a Page Task

When displaying a long text on the glasses, request a hidden status bar to leave more room for the content, then restore the default preference when reading ends. Returned state distinguishes the request from actual visibility so the interface can adapt when control is unavailable.

```javascript
export default {
  async enterReading() {
    const state = await this.setPreferredStatusBarVisibility('hidden');
    console.log(state.supported, state.visible);
  },
  async leaveReading() {
    await this.resetPreferredStatusBarVisibility();
  },
};
```

Only the focused foreground `_blank` page can use this capability. A successfully processed preference does not guarantee matching visibility. See [Page](/AIUI/api/framework-page) for state queries and change notifications.

## Everyday Improvements

- **More Reliable Networking**: When the glasses make repeated requests or receive live messages, canceled requests release their resources. Fixed exhausted request slots, queue timeout accounting, and WebSocket reads blocked by writes.
- **Animation Continues Across Content Updates**: When text changes on the glasses, GIFs retain playback position and loop count and hold their final frame after finite loops. A2UI updates reuse same-type images to reduce reloads.
- **Easier Resource and Request Handling**: GET/HEAD Fetch requests can read package-root paths and package-scoped `file:///` URLs. New `Request.text()`, `json()`, `arrayBuffer()`, and `blob()` readers help inspect and convert request bodies. See [HTTPS](/AIUI/api/network-https).
- **More Consistent Complex Interfaces**: Fixed solid backgrounds, gradients, text clipping, A2UI Text/Button font sizes, and custom-component property initialization.
- **More Accurate Activation**: Pointer and navigation input share completed `tap` behavior. Drags, scrolling, cancellations, and non-primary gestures do not activate controls. Window dimensions remain live and read-only.

## When Upgrading

- **Split Long Synchronous Work**: Each instance has a default 2,000 ms synchronous JavaScript budget. Exceeding it interrupts scripts and requests instance closure; asynchronous waiting after yielding control is excluded. Batch computations and yield the event loop. See [JavaScript Compatibility](/AIUI/guide/runtime-js).
- **Retain Listener Callbacks**: Events support `capture`, `once`, `passive`, and `AbortSignal`. Removal requires the original callback and matching capture value; omitting it no longer clears all listeners. See [Events](/AIUI/framework/open-agent-format-page-events).
- **Use the Module Reuse Entry Point**: `WebAssembly.validate()` and `compile()` no longer accept compiled Modules. Use `instantiate(module)`. Shared memory, threads, SIMD, memory64, and WASI remain unavailable.

# v0.19.0

AIUI 0.19.0 adds network state awareness, while expanding streaming data processing, cryptography, drawing, styles, and animation. It also improves data updates, resource loading, and memory use on complex pages, and fixes navigation, lifecycle, template, and core API behavior.

## Development Capabilities

- **Clearer Component Loading**: Missing components now report path errors directly instead of misleading default-export errors. Resource loading is unified, and nested component path resolution is more consistent. Directory entry references should explicitly include `index`.

## APIs, Networking, and Speech

- **More Complete Streams**: Added `tee()`, BYOB byte stream readers, `ReadableStream.from()`, and asynchronous iteration. Improved backpressure, cancellation, and error propagation in `pipeTo()` and `pipeThrough()` for processing response streams.
- **Streaming Text Encoding**: Added `TextEncoderStream` and `TextDecoderStream` for continuous encoding and decoding across chunks. `TextEncoder.encodeInto()` writes into a supplied buffer and reports how much input it read and how many bytes it wrote.

  ```js
  const response = await fetch('/api/answer');
  const textStream = response.body.pipeThrough(new TextDecoderStream());
  for await (const text of textStream) {
    console.log(text);
  }
  ```

- **Expanded Web Crypto**: Added SHA digests and HMAC key generation, import, export, signing, and verification, with more complete `CryptoKey` metadata, binary view handling, and errors.
- **Network Changes**: Added `navigator.onLine`, `navigator.connection`, and `online`, `offline`, and connection `change` events so applications can read connectivity state and update interfaces or retry requests when it changes.
- **Speech Synthesis Option Fixes**: Fixed default constructor options for `SpeechSynthesisUtterance`.
- **More Accurate Capability Queries**: `wx.canIUse()` checks functions registered by the runtime, including function paths such as `request`. Unknown paths, parameter options, and functions added by application code return `false`. A positive result does not guarantee device availability or permission.

## Media and Drawing

- **Audio Playback and Subtitle Fixes**: Fixed assignments to `currentTime` not updating actual playback and preserved subtitle cue object identity.
- **Export Canvas and Bitmaps**: Added `Canvas.convertToBlob()` and `createImageBlob()` to encode drawings or bitmaps as PNG or JPEG for uploading, sharing, or saving images.

  ```js
  const canvas = new Canvas(160, 80);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2f80ed';
  ctx.fillRect(0, 0, 160, 80);

  const image = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality: 0.9,
  });
  console.log(image.type, image.size);
  ```

- **More Consistent Canvas Drawing**: Improved complex text measurement and drawing, and fixed `roundRect()` radii on the Web. Drawing a closed `ImageBitmap` now reports an error.

## Interfaces and Animation

- **Expanded Layout and Styles**: Added `text-overflow: ellipsis` and `calc()` support in sizing and spacing, and fixed `!important` priority and independent border edge rendering.
- **Concurrent Animations and Lifecycle Events**: Elements can run multiple CSS animations at once and receive `animationstart`, `animationiteration`, `animationend`, and `animationcancel` events. Unrelated style changes preserve playback progress, with more accurate replacement, delay, and style restoration after animations finish.
- **Text-Triggered Particles**: Text changes can trigger retained particle animations, with expanded 2D `transform` and `transform-origin` behavior.
- **CSS Random Values (Experimental)**: Added `random()` with bounds, an optional step, and named keys for values such as size, opacity, and animation duration. Within an element, calls with the same key, range, and step can share a result. Random bases remain stable during style recalculation; each triggered animation replay has its own context, so new instances do not change existing ones. The current subset supports numbers, lengths, percentages, and times, without sharing keys across elements.

  ```css
  .particle {
    width: random(--size, 2px, 5px, 1px);
    height: random(--size, 2px, 5px, 1px);
    opacity: random(0.6, 1);
    animation-duration: random(800ms, 1200ms, 100ms);
  }
  ```

- **Component Display and Input Fixes**: Fixed image and Lottie attribute resolution in projected content and vertical bar chart value labels. Text control input events expose the complete value through `event.detail.value`.

## Performance and Stability

- **Faster Updates and Loading**: Cached parsed single-file components, component definitions, and scope data. Optimized selector matching, data binding, and partial recomposition to reduce repeated work on large pages and continuously updated text.
- **Lower Animation and Drawing Memory Costs**: Reused rendering and animation buffers, reduced per-frame allocations in images, Lottie, maps, and charts, and bounded Canvas command, path, and text cache storage.
- **More Reliable Templates and Callbacks**: Fixed array `length` bindings, loop scopes, conditional branches, `hidden` bindings, and queries for loop instances. Fixed `setData()` callback re-entry and stack overflows from messages containing circular references.
- **Networking and Core API Fixes**: Fixed TLS selection from URI schemes, empty compressed response bodies, empty IDs in streamed tool calls, timer delay conversion, and `localStorage` string coercion. Improved `null` results for unread sensor properties, GPX root validation, and barcode format name recognition.

## Compatibility Notes

- **Ready Runs After the First Frame**: Page `onReady()` and component ready callbacks run after their respective first frame is presented. Returning to an existing page does not fire ready again.
- **Navigation Callbacks Reflect Actual Outcomes**: `wx` router APIs call `success` after loading a page successfully, or `fail` when a target is missing, loading fails, or no previous page exists, followed by `complete`. `wx.exitMiniProgram()` accepts omitted options.
- **Recording Format Checks**: Call `MediaRecorder.isTypeSupported()` as a static method instead of through a recorder instance.
- **Speech Recognition Permission Changes**: Removed the separate `SPEECH_RECOGNITION` permission. Microphone capture still requires declaring `RECORD_AUDIO` in `app.json` and obtaining platform authorization.

# v0.18.0

AIUI 0.18.0 lets you build Widgets and background tasks, and adds more familiar Web APIs together with richer audio, speech, animation, scrolling, and drawing capabilities. Apps also stay smoother and more stable on complex pages and during long-running sessions.

## Development Capabilities

- **Widget Development**: You can declare `1x1` and `1x2` Widgets in `app.json` and build their interfaces with a `<widget>` block in an `.ink` file. Widgets can update displayed data, reuse existing components and styles, and run code when they are created, shown, hidden, or destroyed.

  ```json
  {
    "pages": ["pages/index/index"],
    "widgets": [
      { "path": "widgets/weather/index", "family": "1x2" }
    ]
  }
  ```

  ```html
  <script def>
  { "widget": { "family": "1x2" } }
  </script>

  <script setup>
  export default {
    data: { temperature: 24 },
    refresh() {
      this.setData({ temperature: this.data.temperature + 1 });
    },
  };
  </script>

  <widget>
    <view bindtap="refresh">
      <text>{{temperature}}°C</text>
    </view>
  </widget>
  ```

- **Background Tasks (Agent Workers)**: You can run a background script with an agent to share state across pages or Widgets, or to keep tasks such as Bluetooth services active. Configuration now uses `agentWorkers` instead of the old `workers` field.
- **More Consistent Imports**: The same module path now resolves consistently from apps, pages, and background tasks, avoiding imports that work from one entry but fail from another.
- **Faster Data Updates**: Large pages, lists, and Widgets process only the data that actually changed, reducing waiting and unnecessary rendering work.
- **Controllable Scrolling**: You can read a list's current position and content size, jump or scroll smoothly with `scrollTo()` and `scrollBy()`, and react while scrolling or when scrolling finishes.

  ```js
  const list = page.querySelector('#results');
  const result = await list.scrollTo({
    top: list.scrollHeight,
    behavior: 'smooth',
  });
  console.log(result.interrupted);
  ```

## APIs, Networking, and Speech

- **More Familiar Web APIs**: Apps can now create real-time connections, process data as it arrives, upload files and forms, work with URLs, generate secure random values, and measure how long an operation takes. Relevant APIs include `WebSocket`, Streams, `File`, `FormData`, `URL`, Web Crypto, and User Timing.

  ```js
  const attachment = new File(['AIUI 0.18'], 'release.txt', {
    type: 'text/plain',
  });
  const form = new FormData();
  form.append('attachment', attachment);

  await fetch('/api/releases', {
    method: 'POST',
    body: form,
  });
  ```

- **GEO & Location**: Apps can use `navigator.geolocation` to get the current position or receive ongoing location updates. `GPXDocument` can read, create, and export GPX route data for activity tracking, navigation, and route display. Add `GEOLOCATION` to `permissions` in `app.json` before accessing location.

  ```js
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    console.log('Current position:', latitude, longitude);
  });

  const route = new GPXDocument();
  route.appendTrackPoint({ latitude: 30.2741, longitude: 120.1551 });
  route.appendTrackPoint({ latitude: 30.2792, longitude: 120.1618 });
  console.log(route.toString());
  ```

  See [Geolocation](/AIUI/api/geo-data-geolocation) and [GPXDocument](/AIUI/api/geo-data-gpx-document) for complete usage.

- **More Flexible Audio**: Web Audio can play or generate sounds, adjust volume, add filters, inspect waveforms and frequency data, and continuously play PCM audio data.

  ```js
  const context = new AudioContext();
  await context.resume();

  const oscillator = context.createOscillator();
  oscillator.frequency.value = 440;
  oscillator.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.2);
  ```

- **Analyse Microphone Audio**: `AudioContext.createMediaStreamSource()` can connect a microphone to Web Audio for live volume animations, waveform displays, and sound-controlled interfaces. Add `RECORD_AUDIO` to `permissions` in `app.json` before using the microphone.

  ```js
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const context = new AudioContext();
  const microphone = context.createMediaStreamSource(stream);
  const analyser = context.createAnalyser();

  microphone.connect(analyser);
  await context.resume();

  const waveform = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(waveform);
  ```

  See [Audio Processing (Web Audio)](/AIUI/api/media-web-audio#analyse-microphone-input) for complete usage.

- **Continuous Audio Recognition**: Apps can write recorded or existing audio to `SpeechRecognitionSession` in parts, receive updated recognition text as it becomes available, and finish or cancel the task at any time. `segmentation` now accepts an options object; after the host advertises a supported `vadSilenceDuration` range, applications can use `silenceDurationMs` to configure how many milliseconds of continuous silence end a VAD segment. Spoken output can also be cancelled directly.

  ```js
  const recognition = new SpeechRecognitionSession({
    lang: 'zh-CN',
    interimResults: true,
  });
  recognition.onresult = (event) => {
    const result = event.results[event.resultIndex][0];
    console.log(result.transcript);
  };

  const recordedAudioBlob = await fetch('/assets/question.wav')
    .then((response) => response.blob());
  const writer = recognition.audio.getWriter();
  await writer.write(recordedAudioBlob);
  await writer.close();
  ```

- **Open a Widget**: Use `window.open()` to open a declared Widget. Opening another Page through this API is not currently supported.

  ```js
  window.open('widgets/weather?city=hangzhou', '_widget');
  ```

## Interfaces and Animation

- **More Lottie Animations Work Correctly**: `<lottie-view>` can now display more common shape, image, text, gradient, path, and mask animations.
- **Animate More Styles**: Size, spacing, color, opacity, position, rotation, and scale can now change smoothly with CSS transitions or `@keyframes`.

  ```css
  .card {
    opacity: 0.7;
    translate: 0 0;
    transition: translate 180ms ease-out, opacity 180ms ease-out;
  }

  .card:focus {
    opacity: 1;
    translate: 0 -4px;
  }
  ```

- **Improved Canvas and Images**: Apps can read and change image pixels, create reusable bitmaps, and draw text spacing and moved, rotated, or scaled paths more accurately.

  ```js
  const canvas = page.querySelector('#preview');
  const ctx = canvas.getContext('2d');
  const pixels = ctx.createImageData(64, 64);
  pixels.data.set([255, 0, 0, 255]);
  ctx.putImageData(pixels, 0, 0);

  const bitmap = await createImageBitmap(pixels);
  ctx.drawImage(bitmap, 80, 0);
  ```

- **Images and Canvas in Widgets**: Widgets can display images or draw custom icons, charts, and changing content.
- **Improved Chinese, Japanese, and Korean Text**: Text size and wrapping are more accurate when these languages appear in horizontal layouts.

## Performance and Stability

- **Responsive During Complex Work**: Interfaces respond more quickly when animations, network requests, and background tasks run together. Live previews and WebSocket communication are smoother as well.
- **Lower Memory Use Over Time**: Reduced memory growth from repeated page changes, image and Canvas reuse, network requests, and audio or video recording.
- **More Reliable Media**: Recording stops reliably, Opus audio plays correctly, video completion state is more accurate, and images load correctly after a page is reopened.
- **Data Binding and Scrolling Fixes**: Fixed constant-value binding issues and incorrect values when reading dynamically set `scroll-left` or `scroll-top` positions.

# v0.17.0

AIUI 0.17.0 brings richer agent surfaces, media capabilities, persistent file storage, and improved rendering diagnostics. This release is especially useful for agents that combine wearable interaction, streaming content, and native host capabilities.

## Framework
- **Expanded Component Composition**: Added named slots and expanded component composition capabilities for more flexible built-in and custom component layouts.
- **Persistent Storage with OPFS**: Added OPFS support and reorganized storage APIs, including browser-compatible file and writable stream interfaces for persistent agent data.

  ```js
  const root = await navigator.storage.getDirectory();
  const file = await root.getFileHandle('session.json', { create: true });
  const writer = await file.createWritable();
  await writer.write(JSON.stringify({ completed: true }));
  await writer.close();
  ```

- **Improved XML Parsing**: Improved XML parsing, including entity decoding in attributes and text, and preserved logical operators when decoding XML entities.

## Components
- **video**: Added the `<video>` component with playback controls and wireframe rendering support.
- **table**: Added the native `<table>` component for rendering structured results.
- **streamdown**: Officially supported `<streamdown>` rendering. The currently supported Markdown syntax includes:
  - Paragraphs
  - Headings
  - Blockquotes
  - Ordered and unordered lists
  - Bold and italic text
  - Code snippets
  - Formulas
- **timed-text**: Added the `<timed-text>` component for synchronized speech transcripts and generated TTS audio experiences.
- **Markdown Primitives**: Added the `<p>`, `<header>`, `<blockquote>`, `<list>`, `<list-item>`, `<b>`, `<i>`, `<snippet>`, and `<formula>` components for paragraphs, headings, quotes, lists, list entries, bold text, italic text, code snippets, and formulas.
## API
- **Media Capture and Recording**: Added media capture and recording APIs, including photo capture, audio/video recording, Opus output, header callbacks, and semantic capture modes.

  ```js
  const media = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  const recorder = new MediaRecorder(media, { mimeType: 'audio/opus' });
  recorder.start();
  ```

- **Video Playback**: Added video playback support, including wireframe rendering and improved native video rendering performance.

  ```js
  const video = wx.createVideoContext('briefing');
  video.play();
  ```

- **Battery Status**: Added full W3C Battery Status API support.
- **Head Gesture Events**: Added built-in head gesture events and state tracking for hands-free interactions such as nod, shake, and gesture state changes.

  ```js
  export default {
    onLoad() {
      this.enableWorldAwareness();
    },
    onHeadGesture(event) {
      if (event.gesture === 'nod') this.confirm();
    },
  };
  ```

## Performance and Compatibility
- **Improved Rendering Diagnostics**: Added paint-only dirty tracking and Canvas performance metrics, together with render-path benchmarks to help diagnose rendering costs.
- **Audio Improvements**: Improved audio path resolution and media playback behavior, including MP3 support and preferred audio format hints.

# v0.16.0

## Framework
- **Page-Level Environment Awareness**: Introduced page-level environment awareness as the foundation for motion-aware and host-driven experiences. Pages can explicitly opt in with `enableWorldAwareness()` and receive higher-level interaction signals without wiring low-level device state by hand.

  ```js
  export default {
    onLoad() {
      this.enableWorldAwareness();
    },
    onOrientationStabilityChange(event) {
      if (event.stable) {
        console.log('imu is stable');
      }
    },
  };
  ```

## API
- **End-to-End Streaming Responses**: Added end-to-end streaming response support so agents can start rendering or reacting before a full payload finishes, which is especially useful for remote briefings, progressive text output, and other streaming UX patterns.

  ```js
  const response = await fetch(streamUrl);
  const reader = response.body.getReader();
  ```

- **Response Body Consumption Semantics**: Improved response body consumption behavior around pending reads and body locking, making incremental reads from `response.body` more predictable.
- **Web API Compatibility Improvements**: Improved compatibility across `fetch`, `Headers`, `ReadableStream`, and `TextDecoder`, reducing the gap between AIUI agents and browser-style networking code.
- **TextDecoder Streaming Mode**: Added `{ stream: true }` support to `TextDecoder` for incremental UTF-8 decoding across chunk boundaries, allowing agents to reconstruct streamed text without garbled intermediate output.

  ```js
  const decoder = new TextDecoder();
  const text = decoder.decode(chunk, { stream: true });
  ```

## Built-in Components and Examples
- **Audio Asset Path Resolution**: Improved audio asset path resolution, including leading-slash paths such as `/assets/foo.wav`, so packaged media can be referenced more naturally from agent code.

  ```js
  import { AudioPlayer } from 'audio';
  
  const player = new AudioPlayer('/assets/meditation-white-noise.wav');
  ```

- **Refreshed Audio Example**: Refreshed the built-in audio example to better demonstrate local playback flows, short cues, and looping ambience with packaged assets.
- **Environment Awareness Sample Pages**: Added dedicated [head gesture sample](../../samples/capabilities/pages/head-gesture/index.ink) and [orientation stability sample](../../samples/capabilities/pages/orientation-stability-change/index.ink) pages so developers can quickly validate environment awareness flows and see how sensor-driven state is surfaced in UI.
- **Richer Streaming HTTPS Example**: Added a more complete [streaming HTTPS sample page](../../samples/capabilities/pages/network_https/index.ink) that demonstrates remote content loading, streamed text assembly with `TextDecoder({ stream: true })`, and compatibility checks in one place.

# v0.15.0

## Routing and Networking
- **Duplicate Navigation Protection**: Fixed the issue where `wx.navigateTo` could still trigger a duplicate navigation when the target URL matched the current page.
- **Request Default Value Fixes**: Corrected the default parameter behavior of `wx.request`, with `responseType` defaulting to `text` and `dataType` defaulting to `json`.

## Components and Ecosystem
- **Custom Component Support**: Added support for developing and using custom components, improving component encapsulation and reuse.
- **Third-Party Package Integration**: Added support for importing third-party packages, improving project extensibility and ecosystem compatibility.

## Device and Perception
- **Absolute Orientation Sensor**: Added support for the absolute orientation sensor, enabling access to real-world device orientation information.

# v0.14.0

## Layout and Styling
- **Text and Flex Layout Improvements**: Expanded layout support with full `line-height` handling for both `px` values and unitless numbers, and added support for the `flex` property.
- **Background and Clipping Enhancements**: Added support for CSS `background` images and gradients, along with `clip-path`, `mask-image`, and `mask-mode`.

## Tooling and Runtime
- **TypeScript Workflow Support**: Improved TypeScript support across single-file components, pages, and module-based projects.
- **Locale and Region Awareness**: `navigator` now exposes `region` (Overseas or Mainland China) and `language` for runtime localization and regional adaptation.
- **Frame Scheduling Support**: Added `requestAnimationFrame` to take advantage of the highest available frame rate on the device.

## Media and Performance
- **Controllable Photo Preview**: `takePhoto` now allows disabling the system preview with `enableSystemPreview=false`.
- **Rendering and Audio Optimizations**: Improved performance for `canvas drawImage` and `Sound` playback to reduce overhead in graphics and audio scenarios.

## Stability Fixes
- **Storage Persistence Fix**: Fixed the issue where `localStorage` could still be used after a package version update.

# v0.1.1

## Runtime APIs
- **Device Serial Number**: Added `navigator.getDeviceSerialNumber()` to obtain the device SN.
- **Device Identification Info**: Added `navigator.userAgent` to return device and version information.
- **Streaming Audio Playback**: `AudioPlayer` now supports Opus streaming playback, allowing Ogg-container Opus audio streams to be appended by explicitly declaring `format: 'ogg_opus'`.

## UI Rendering
- **Fixed Positioning**: CSS now supports `position: fixed` for floating and fixed-layout scenarios.

## Components and Charts
- **scroll-view**: Fixed component rendering issues and improved display stability for scroll containers.
- **chart**: Fixed several issues in chart components and improved rendering and usability.

# v0.1.0

## Cross-Platform Runtime
- **Multi-Platform Support**: Supports loading and running across Android / iOS / macOS / Web environments, ensuring cross-platform consistency.

## AI Capabilities
- **Voice Interaction**: Supports ASR speech recognition and TTS voice playback.
- **Intelligent Conversation**: Supports LLM model invocation with contextual memory for multi-turn conversations.

## Device and Perception
- **Device Capabilities**: Supports Bluetooth connectivity and Barcode scanning.
- **IMU Perception**: Supports real-time data collection from accelerometers and gyroscopes, as well as posture change sensing.

## Business Components
- **calendar, card**: Added calendar and card business components to enhance scenario presentation capabilities.

## UI Rendering
- **Custom Fonts**: Supports importing and applying custom fonts through CSS for more personalized UI presentation.

## Multimedia Capabilities
- **Sound**: Designed specifically for sound effect playback with low-latency audio feedback.

## Scene Interaction
- **Navigation Mechanism**: Supports entry and switching logic for card-style pages.
- **Exit Mechanism**: Supports system-level interactions such as double-click exit and out-of-bounds exit.
- **Resource Loading**: Supports importing static resources such as images and audio (`Sound`) via ESM, ensuring correct path resolution.

# v0.0.0 (Internal Beta)

## Core Framework
- **Lifecycle Management**: Fully covers the lifecycle from initialization and rendering to destruction.
- **Application Model**: Supports App / Page-level loading and page navigation mechanisms.
- **Module Registration**: Fully supports ES Module and `export default` registration mechanisms.
- **.ink Components**: Supports running single-file components (SFC) with a complete component lifecycle.

## UI Rendering and Layout
- **Rendering Performance**: Provides high-performance rendering based on Skia.
- **Layout Capabilities**: Integrates the Taffy layout engine and provides comprehensive Flexbox layout support.
- **Style Animations**: Supports Transform, basic style properties, and animation effects.

## Component Library
- **Basic Components**: Provides basic rendering components such as view, text, and button.
- **Graphic Components**: Supports image, canvas, and simple chart components (including line charts and area charts).
    - *Known issue: PNG image animations are not yet effective on the Glasses side.*

## Runtime APIs
- **Network Communication**: Supports fetch, WebSocket, and SSE (Server-Sent Events).
- **Data Storage**: Supports localStorage and `wx.storage` storage APIs.
- **Multimedia Capabilities**: Integrates permission management and invocation for Recorder recording and Camera features.

## Development Tools and Engineering
- **.aix Packaging**: Supports project packaging, building, distribution, and loading.
- **Debugging and Editing**: Provides full-chain development tools including online debugging, code editing, and build export.

## Version Notes
- Initial internal beta release of AIUI.
- Established the foundational framework architecture and component specifications.
- Completed the initial integration of core runtime APIs.
