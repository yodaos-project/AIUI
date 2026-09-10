# v0.18.0

AIUI 0.18.0 支持开发 Widget 和后台任务，并带来更多常用 Web API，以及更丰富的音频、语音、动画、滚动和绘图能力。应用在复杂页面和长时间运行时也会更加流畅、稳定。

## 开发能力

- **Widget 开发支持**：可以在 `app.json` 中声明 `1x1`、`1x2` Widget，并在 `.ink` 文件中使用 `<widget>` 编写界面。Widget 可以更新显示数据、复用已有组件和样式，并在创建、显示、隐藏和销毁时执行相应代码。

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

- **后台任务（Agent Worker）**：可以创建随智能体运行的后台脚本，用于在多个页面或 Widget 之间共享状态，或持续处理蓝牙等任务。配置字段现统一使用 `agentWorkers`，不再使用旧的 `workers` 字段。
- **模块导入更一致**：同一个模块路径可以从应用、页面和后台任务中得到一致结果，减少“在一个页面能导入、换个入口却找不到”的问题。
- **数据更新更高效**：大型页面、列表和 Widget 更新数据时，只处理真正发生变化的部分，减少等待和不必要的重新渲染。
- **可控制滚动位置**：可以读取列表当前的滚动位置和内容尺寸，并通过 `scrollTo()`、`scrollBy()` 跳转或平滑滚动；还可以在滚动中和滚动结束时执行操作。

  ```js
  const list = page.querySelector('#results');
  const result = await list.scrollTo({
    top: list.scrollHeight,
    behavior: 'smooth',
  });
  console.log(result.interrupted);
  ```

## API、网络与语音

- **更多常用 Web API**：现在可以建立实时连接、边接收边处理数据、上传文件和表单、处理 URL、生成安全随机值，以及测量一段操作所花费的时间。相关接口包括 `WebSocket`、Streams、`File`、`FormData`、`URL`、Web Crypto 和 User Timing。

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

- **地理与位置**：可以通过 `navigator.geolocation` 获取当前位置或持续接收位置变化；还可以使用 `GPXDocument` 读取、创建和导出 GPX 路线数据，用于运动记录、导航和地图路线展示。使用定位前，需要在 `app.json` 的 `permissions` 中添加 `GEOLOCATION`。

  ```js
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    console.log('当前位置：', latitude, longitude);
  });

  const route = new GPXDocument();
  route.appendTrackPoint({ latitude: 30.2741, longitude: 120.1551 });
  route.appendTrackPoint({ latitude: 30.2792, longitude: 120.1618 });
  console.log(route.toString());
  ```

  完整用法请查看 [Geolocation](/AIUI/api/geo-data-geolocation) 和 [GPXDocument](/AIUI/api/geo-data-gpx-document)。

- **更灵活的音频处理**：通过 Web Audio 可以播放或生成声音、调节音量、添加滤波效果、读取波形和频谱，并连续播放 PCM 音频数据。

  ```js
  const context = new AudioContext();
  await context.resume();

  const oscillator = context.createOscillator();
  oscillator.frequency.value = 440;
  oscillator.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.2);
  ```

- **分析麦克风声音**：可以通过 `AudioContext.createMediaStreamSource()` 把麦克风接入 Web Audio，用来制作实时音量动画、绘制波形，或根据声音控制界面。使用前需要在 `app.json` 中添加 `RECORD_AUDIO` 权限。

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

  完整用法请查看[音频处理（Web Audio）](/AIUI/api/media-web-audio#分析麦克风输入)。

- **持续识别音频内容**：可以把录制或已有的音频逐段写入 `SpeechRecognitionSession`，持续收到最新识别文字，并随时结束或取消任务；语音播报也支持直接取消。

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

- **作为蓝牙外设提供数据**：可以通过 `navigator.bluetoothPeripheral.openGattServer()` 让设备被附近的 BLE 设备发现，并定义可读取、写入或订阅变化的数据服务。

  ```json
  {
    "agentWorkers": [
      {
        "name": "bluetooth",
        "script": "workers/bluetooth.js",
        "trigger": { "type": "open" },
        "lifetime": "foreground",
        "capabilities": ["bluetooth-peripheral"]
      }
    ]
  }
  ```

  ```js
  const serviceUuid = '12345678-1234-5678-1234-56789abcdef0';
  const valueUuid = '12345678-1234-5678-1234-56789abcdef1';

  export default {
    server: null,
    onOpen(event) {
      event.waitUntil(this.publish());
    },
    async publish() {
      if (this.server?.state === 'open') return;

      this.server = await navigator.bluetoothPeripheral.openGattServer({
        services: [{
          uuid: serviceUuid,
          characteristics: [{
            uuid: valueUuid,
            properties: { read: true, notify: true },
          }],
        }],
      });

      const value = this.server
        .getService(serviceUuid)
        .getCharacteristic(valueUuid);
      value.addEventListener('readrequest', (event) => {
        event.respondWith(new Uint8Array([1]));
      });

      await this.server.startAdvertising({
        name: 'AIUI Sensor',
        serviceUUIDs: [serviceUuid],
      });
    },
  };
  ```

- **打开 Widget**：可以使用 `window.open()` 打开已声明的 Widget。当前还不支持通过该 API 打开其他 Page。

  ```js
  window.open('widgets/weather?city=hangzhou', '_widget');
  ```

## 界面与动画

- **支持更多 Lottie 动画**：`<lottie-view>` 现在可以正确显示更多常见的形状、图片、文字、渐变、路径和遮罩动画。
- **更多样式可以添加动画**：尺寸、间距、颜色、透明度、位置、旋转和缩放等样式都可以使用 CSS transition 或 `@keyframes` 平滑变化。

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

- **Canvas 与图像能力增强**：可以读取和修改图片像素、创建可复用的位图，并更准确地绘制文字间距和经过移动、旋转或缩放的路径。

  ```js
  const canvas = page.querySelector('#preview');
  const ctx = canvas.getContext('2d');
  const pixels = ctx.createImageData(64, 64);
  pixels.data.set([255, 0, 0, 255]);
  ctx.putImageData(pixels, 0, 0);

  const bitmap = await createImageBitmap(pixels);
  ctx.drawImage(bitmap, 80, 0);
  ```

- **Widget 支持图片和 Canvas**：可以在 Widget 中展示图片，或自行绘制图标、图表和动态内容。
- **中日韩文本布局改进**：中文、日文和韩文在横向排列时的尺寸计算和换行更加准确。

## 性能与稳定性

- **复杂任务下仍保持流畅**：动画、网络请求和后台任务同时运行时，界面响应更及时；实时预览和 WebSocket 通信也更加顺畅。
- **长时间运行更省内存**：减少页面反复切换、图片和 Canvas 重复使用、网络请求以及录音录像带来的内存增长。
- **音视频更加可靠**：录制可以稳定停止，Opus 音频播放更正常，视频结束状态更准确，页面重新打开后图片也能正常加载。
- **数据绑定与滚动修复**：修复固定值绑定异常，以及动态设置 `scroll-left`、`scroll-top` 后读取结果不正确的问题。

# v0.17.0

AIUI 0.17.0 带来了更丰富的智能体界面、媒体能力、持久化文件存储与更完善的渲染诊断。此次发布尤其适合结合可穿戴交互、流式内容与原生宿主能力的智能体。

## 框架
- **组件组合能力增强**：新增具名插槽，并扩展组件组合能力，使内置组件与自定义组件的布局更加灵活。
- **OPFS 持久化存储**：新增 OPFS 支持并重新组织存储 API，提供兼容浏览器的文件与可写流接口，用于持久化智能体数据。

  ```js
  const root = await navigator.storage.getDirectory();
  const file = await root.getFileHandle('session.json', { create: true });
  const writer = await file.createWritable();
  await writer.write(JSON.stringify({ completed: true }));
  await writer.close();
  ```

- **XML 解析改进**：改进 XML 解析，包括属性与文本中的实体解码，并在解码 XML 实体时保留逻辑运算符。

## 组件
- **video**：新增 `<video>` 组件，支持播放控制与线框渲染。
- **table**：新增原生 `<table>` 组件，用于呈现结构化结果。
- **streamdown**：正式支持 `<streamdown>` 渲染，当前支持以下 Markdown 语法：
  - 段落
  - 标题
  - 引用块
  - 有序列表与无序列表
  - 粗体与斜体文本
  - 代码片段
  - 公式
- **timed-text**：新增 `<timed-text>` 组件，适用于同步语音转写文本与生成式 TTS 音频体验。
- **Markdown 基础组件**：新增 `<p>`、`<header>`、`<blockquote>`、`<list>`、`<list-item>`、`<b>`、`<i>`、`<snippet>` 与 `<formula>` 组件，分别用于段落、标题、引用、列表、列表项、粗体、斜体、代码片段与公式内容。
## API
- **媒体采集与录制**：新增媒体采集与录制 API，支持拍照、音视频录制、Opus 输出、`header` 回调与语义化采集模式。

  ```js
  const media = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
  const recorder = new MediaRecorder(media, { mimeType: 'audio/opus' });
  recorder.start();
  ```

- **视频播放**：新增视频播放支持，包括线框渲染与原生视频渲染性能优化。

  ```js
  const video = wx.createVideoContext('briefing');
  video.play();
  ```

- **电池状态**：新增完整的 W3C Battery Status API 支持。
- **头部手势事件**：新增内置头部手势事件与状态跟踪，支持点头、摇头与手势状态变化等免手交互。

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

## 性能与兼容性
- **渲染诊断增强**：新增仅绘制阶段的脏区跟踪与 Canvas 性能指标，并补充渲染路径基准测试，帮助诊断渲染成本。
- **音频优化**：改进音频路径解析与媒体播放行为，包括 MP3 支持和首选音频格式提示。

# v0.16.0

## 框架
- **页面级环境感知**：引入页面级环境感知能力，作为运动感知与宿主驱动体验的基础。页面可通过显式调用 `enableWorldAwareness()` 开启能力，并直接接收更高层的交互信号，而无需手动拼装底层设备状态。

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
- **端到端流式响应**：新增端到端流式响应支持，智能体可在完整载荷返回前提前渲染或响应，适用于远程播报、渐进式文本输出等流式体验。

  ```js
  const response = await fetch(streamUrl);
  const reader = response.body.getReader();
  ```

- **响应体读取语义优化**：改进了挂起读取与 body locking 相关的响应体消费语义，使基于 `response.body` 的增量读取行为更加稳定和可预期。
- **Web API 兼容性增强**：增强 `fetch`、`Headers`、`ReadableStream` 与 `TextDecoder` 等 Web API 兼容性，进一步缩小 AIUI 智能体与浏览器式网络代码之间的差异。
- **TextDecoder 流式解码**：为 `TextDecoder` 增加 `{ stream: true }` 流式模式，支持跨 chunk 边界的增量 UTF-8 解码，避免流式文本处理中出现中间乱码。

  ```js
  const decoder = new TextDecoder();
  const text = decoder.decode(chunk, { stream: true });
  ```

## 内置组件与示例
- **音频资源路径解析优化**：改进音频资源路径解析，支持 `/assets/foo.wav` 这类以 `/` 开头的路径，使打包资源在智能体代码中的引用更加自然。

  ```js
  import { AudioPlayer } from 'audio';
  
  const player = new AudioPlayer('/assets/meditation-white-noise.wav');
  ```

- **音频示例更新**：刷新内置音频示例，更清晰地展示本地播放、短提示音与循环环境音等打包资源播放流程。
- **环境感知示例页**：新增[头部手势示例](../../samples/capabilities/pages/head-gesture/index.ink)与[方向稳定性示例](../../samples/capabilities/pages/orientation-stability-change/index.ink)页面，帮助开发者快速验证环境感知流程，并观察传感器驱动状态如何映射到 UI。
- **流式 HTTPS 示例增强**：新增更完整的[流式 HTTPS 示例页](../../samples/capabilities/pages/network_https/index.ink)，覆盖远程内容加载、结合 `TextDecoder({ stream: true })` 的文本拼接，以及相关兼容性检查。

# v0.15.0

## 路由与网络
- **重复跳转保护**：修复 `wx.navigateTo` 在目标 URL 与当前页面一致时仍重复跳转的问题。
- **请求默认值修正**：修复 `wx.request` 默认参数行为，`responseType` 默认值为 `text`，`dataType` 默认值为 `json`。

## 组件与生态
- **自定义组件支持**：支持开发与使用自定义组件，增强组件封装与复用能力。
- **第三方包接入**：支持引入第三方包，提升工程扩展性与生态兼容能力。

## 设备与感知
- **绝对方向传感器**：新增对绝对方向传感器的支持，可用于获取设备在真实空间中的方向信息。

# v0.14.0

## 布局与样式
- **文本与弹性布局增强**：补齐 `line-height` 能力，支持 `px` 和纯数字写法，并新增 `flex` 属性支持。
- **背景与裁剪能力扩展**：支持 CSS `background` 图片与渐变，同时补充 `clip-path`、`mask-image` 和 `mask-mode` 等样式能力。

## 开发与运行时
- **TypeScript 工程支持**：完善 TypeScript 使用体验，覆盖单文件组件、页面与模块等典型场景。
- **设备环境信息补充**：支持通过 `navigator` 获取 `region`（海外或中国大陆）与 `language`，便于按地域和语言做运行时适配。
- **帧调度能力接入**：支持 `requestAnimationFrame`，以获得设备可提供的最高可用帧率。

## 多媒体与性能
- **拍照预览可控**：`takePhoto` 新增 `enableSystemPreview=false` 配置，可按需关闭系统预览。
- **渲染与音频性能优化**：优化 `canvas drawImage` 与 `Sound` 播放表现，提升图像绘制和音频播放效率。

## 稳定性修复
- **存储行为修正**：修复更新包版本后 `localStorage` 仍可延续使用的问题。

# v0.1.1

## 运行时 API
- **设备序列号**：增加 `navigator.getDeviceSerialNumber()`，用于获取设备 SN 号。
- **设备标识信息**：增加 `navigator.userAgent`，返回设备与版本信息。
- **音频流式播放**：`AudioPlayer` 增加对 Opus 流式播放的支持，可通过显式声明 `format: 'ogg_opus'` 追加 Ogg 容器封装的 Opus 音频流。

## UI 渲染
- **固定定位**：CSS 新增支持 `position: fixed`，满足悬浮与固定布局场景。

## 组件与图表
- **scroll-view**：修复组件渲染问题，提升滚动容器显示稳定性。
- **chart**：修复若干图表组件问题，优化渲染与使用体验。

# v0.1.0

## 跨平台运行
- **多平台支持**：支持 Android / iOS / macOS / Web 多平台环境的加载与运行，确保跨端一致性。

## AI 能力
- **语音交互**：支持 ASR 语音识别与 TTS 语音播报。
- **智能对话**：支持 LLM 模型调用，具备多轮对话的上下文保持能力。

## 设备与感知
- **设备能力**：支持 Bluetooth 蓝牙连接与 Barcode 扫码功能。
- **IMU 感知**：支持加速度计与陀螺仪的实时数据采集与姿态变化感知。

## 业务组件
- **calendar、card**：新增日历与卡片业务组件，增强场景展示能力。

## UI 渲染
- **自定义字体**：支持通过 CSS 导入与应用自定义字体，提升界面个性化表现。

## 多媒体能力
- **Sound**：专为播放音效设计，支持低延迟的音频反馈。

## 场景交互
- **导航机制**：支持卡片式页面的进入与切换逻辑。
- **退出机制**：支持双击退出或越界退出等系统级交互。
- **资源加载**：支持通过 ESM 方式导入图片、音频（Sound）等静态资源，确保路径解析正确。

# v0.0.0（内测版本）

## 核心框架
- **生命周期管理**：完整覆盖从初始化、渲染到销毁的生命周期流程。
- **应用模型**：支持 App / Page 级加载与页面跳转机制。
- **模块注册**：全面支持 ES Module 与 export default 注册机制。
- **.ink 组件**：支持单文件组件（SFC）运行，提供完整的组件生命周期。

## UI 渲染与布局
- **渲染性能**：基于 Skia 提供高性能渲染效果。
- **布局能力**：集成 Taffy 布局引擎，提供完善的 Flexbox 布局支持。
- **样式动画**：支持 Transform、基础样式属性及动画效果。

## 组件库
- **基础组件**：提供 view、text、button 等基础渲染组件。
- **图形组件**：支持 image、canvas、简单的 chart（包括折线图和区域图）。
    - *已知问题：PNG 图片动画在 Glasses 端暂未生效。*

## 运行时 API
- **网络通信**：支持 fetch、WebSocket 以及 SSE（Server-Sent Events）。
- **数据存储**：支持 localStorage 与 wx.storage 存储接口。
- **多媒体能力**：接入 Recorder 录音、Camera 相机等权限管理与调用。

## 开发工具与工程化
- **.aix 打包**：支持工程的打包构建与分发加载。
- **调试编辑**：提供在线调试、代码编辑以及构建导出等全链路开发工具。

## 版本说明
- AIUI 初始内测版本发布。
- 建立基础框架架构与组件规范。
- 完成核心运行时 API 的初步接入。
