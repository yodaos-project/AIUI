# v0.20.0

AIUI 0.20.0 让眼镜上的智能体可以与当前对话协作。例如，用户在眼镜上选中一件商品后，智能体可以把商品信息提供给对话，再发送一条“介绍这件商品”的消息；还可以在 Rokid AI App 中发送卡片，让用户稍后打开商品页面。本次更新也让权限提示、眼镜界面和计算模块更容易使用。

## 让对话了解眼镜上正在做的事

用户在眼镜上浏览商品时，对话不会自动知道用户选中了哪一件。**Agent 会话**是智能体与当前对话沟通的入口；新的会话 API 可以把选中商品作为**上下文**（即回答问题时可参考的背景信息）提供给当前对话。然后，智能体可以发送一条用户消息，请对话介绍这件商品。

例如，在 App 或 Page 的业务方法中：

```javascript
const agent = getApp().getAgent();
const selection = await agent.provideContext({
  key: 'selection',
  description: 'The product selected by the user',
  value: { selectedSku: 'DEMO' },
});
await agent.conversation.sendMessage({
  role: 'user',
  content: [{ type: 'text', text: '请介绍当前选中的商品。' }],
});
```

`provideContext()` 负责提供背景信息，`sendMessage()` 负责发送消息；前者不会自动发消息或开始回答。示例只提供了商品编号，如果需要介绍名称、价格等信息，还应提供相关数据或让对话查询可用服务。用户更换商品时，可调用 `selection.update({ selectedSku: 'SKU-002' })` 更新背景；不再需要时调用 `selection.dispose()` 移除。提供成功表示会话已确认接收，不保证模型已经读取。应用状态不会自动成为上下文。

会话还可以调用可用的远端工具或读取资源，例如查询服务提供的商品库存。具体能力取决于当前会话；完整用法见 [Agent 会话](/AIUI/api/ai-agent-session)。

### 让对话调用智能体提供的操作

智能体也可以把自己的方法提供为工具，让模型在需要时调用。例如，用户通过眼镜询问“我选中了什么？”，智能体可以提供一个读取当前选择的方法。用 `ModelContext.defineAction()` 定义工具及其名称、用途和执行方法；模型是否能调用它取决于当前会话是否支持工具调用。

例如，在 `app.js` 中定义一个返回当前商品编号的工具：

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

这里的 `selectedSku` 是示例初始值；实际应用应在用户更换商品时更新它。

## 把结果发送到 Rokid AI App

眼镜上的智能体可以通过 `sendCard()` 在 Rokid AI App 的会话中发送卡片。例如，用户在眼镜上找到商品后，可以在手机上查看卡片并打开商品页面。当前卡片支持标题和跳转链接；描述和 `data` 的展示将在后续支持。

```javascript
const conversation = getApp().getAgent().conversation;
const card = await conversation.sendCard({
  title: '查看商品 DEMO',
});
```

在支持链接的运行时中，可在卡片定义里增加 `href: 'https://example.com/products/DEMO'`，用户点击卡片即可打开该地址；部分运行时版本传入 `href` 会返回 `DataError`。上面的 `card` 是返回的卡片句柄，可用 `card.update({ title: '商品已更新' })` 更新同一张卡片。更新会完整替换卡片内容，需要保留的链接等字段应再次提供。

卡片展示给用户，不会自动提供给模型；模型需要的信息应另行通过 `provideContext()` 提供。每次 `sendCard()` 都会新建一张卡片，目前没有删除接口。使用前可检查 `agent.capabilities.operations`，详见 [Agent 会话](/AIUI/api/ai-agent-session)。

## 感知权限状态，给用户明确反馈

例如，用户准备在眼镜上使用语音功能时，智能体可以先检查麦克风权限；如果已被拒绝，就在界面上给出提示。也可以查询相机或定位权限，并在权限变化时更新界面。查询不会弹出授权界面，也不会开始录音、拍照或定位。

```javascript
const microphone = await navigator.permissions.query({ name: 'microphone' });
console.log(microphone.state); // 'granted'、'denied' 或 'prompt'
microphone.addEventListener('change', () => {
  console.log('麦克风权限：', microphone.state);
});
```

`granted` 表示允许，`denied` 表示拒绝，`prompt` 表示尚未决定。真正使用麦克风时仍需调用 `getUserMedia()`，并处理授权失败；还需在 `app.json` 中声明 `RECORD_AUDIO`。相机和定位也需要各自声明权限并调用相应 API，详见[权限状态](/AIUI/api/permissions)。

## 在应用中复用 WebAssembly 计算模块

WebAssembly（简称 Wasm）是一种可供应用加载的计算模块格式。眼镜智能体可以把已有的计算逻辑放进 Wasm 模块，再从 JavaScript 调用，例如处理传感器数据。本次更新支持更完整的模块复用、JavaScript 函数导入，以及 Memory、Table、Global 资源；原生和 Web 环境使用相同的受支持 API 子集。

将导出 `add` 函数的 `math.wasm` 放入 `assets/` 后，可在 `app.js` 中加载并复用：

```javascript
import math from './assets/math.wasm';

const { module, instance } = await WebAssembly.instantiate(math);
console.log(instance.exports.add(13, 29)); // 42

const another = await WebAssembly.instantiate(module);
console.log(another.exports.add(1, 2)); // 3
```

同时支持同步 Module/Instance 构造、`i64` BigInt，以及从有效 `application/wasm` 网络响应加载的 `compileStreaming()` / `instantiateStreaming()`。构建方式、资源配额和支持范围见 [WebAssembly](/AIUI/api/webassembly)。

## 让界面更贴合内容

### 为图片统一着色

眼镜页面上的导航图标、提示图标可以使用相同的颜色。新增的 `tint-color` 可为 SVG 和栅格图片着色，并保留原图的透明区域。

```xml
<image
  src="/assets/plane.svg"
  tint-color="#adadad"
  mode="aspectFit"
/>
```

A2UI 图片也支持 `tintColor`，以及 `contain`、`cover`、`fill` 三种 `fit`；显式 `mode` 优先。SVG 的 `--image-svg-tint` 主题颜色优先于显式着色，规则见 [Image](/AIUI/components/image) 和 [A2UI](/AIUI/components/a2ui)。

### 按页面任务调整状态栏

在眼镜上阅读长文本时，可以请求隐藏状态栏，为内容留出更多空间；结束阅读后再恢复默认偏好。返回状态区分请求的偏好与实际可见性，便于应用在无法控制时继续正常显示。

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

仅当前聚焦的前台 `_blank` 页面可使用此能力；偏好处理成功不保证实际显隐相同。查询状态和变化通知见 [Page](/AIUI/api/framework-page)。

## 日常体验改进

- **网络与长连接更稳定**：眼镜上连续查询或接收实时消息时，取消请求会及时释放资源；修复请求名额耗尽、排队超时和 WebSocket 读写相互阻塞的问题。
- **动画在内容更新后继续播放**：眼镜页面更新文字时，GIF 可以保留播放位置和循环次数；有限循环结束后保留末帧。A2UI 更新复用相同类型的图片，减少重复加载。
- **资源和请求处理更方便**：GET/HEAD Fetch 可读取包根路径及包内 `file:///` URL；`Request` 新增 `text()`、`json()`、`arrayBuffer()` 和 `blob()`，方便检查和转换请求体。详见 [HTTPS](/AIUI/api/network-https)。
- **复杂界面显示更一致**：修复纯色背景、渐变、文本裁切、A2UI 文字和按钮字号，以及自定义组件属性初始化等问题。
- **点击反馈更准确**：指针和导航使用一致的完整 `tap` 行为，拖动、滚动、取消和非主键手势不会激活控件；窗口尺寸保持实时、只读。

## 升级时需要注意

- **拆分长时间同步计算**：每个实例默认有 2,000 ms 同步 JavaScript 执行预算；超时会中断脚本并请求关闭实例，交还控制权后的异步等待不计入。批量计算应分批并让出事件循环，详见 [JavaScript 兼容性](/AIUI/guide/runtime-js)。
- **保留监听器的回调引用**：事件支持 `capture`、`once`、`passive` 和 `AbortSignal`。移除时须传入原回调及相同的 capture；省略回调不再清空全部监听器，详见[事件](/AIUI/framework/open-agent-format-page-events)。
- **使用正确的模块复用入口**：`WebAssembly.validate()` 和 `compile()` 不再接收已编译 Module，请使用 `instantiate(module)`。共享内存、线程、SIMD、memory64 和 WASI 仍不可用。

# v0.19.0

AIUI 0.19.0 新增网络状态感知，并完善流式数据处理、加密、绘图、样式与动画能力。此次更新也优化了复杂页面的数据更新、资源加载和内存使用，并修复导航、生命周期、模板与基础 API 的行为。

## 开发能力

- **组件加载更明确**：组件不存在时直接报告路径错误，避免误报为默认导出错误；统一资源加载，并完善嵌套组件的路径解析。引用目录入口时应显式写出 `index`。

## API、网络与语音

- **流式数据处理更完整**：Streams 新增 `tee()`、BYOB 字节流读取、`ReadableStream.from()` 和异步迭代，完善 `pipeTo()`、`pipeThrough()` 的背压、取消和错误传播，方便把响应流接入后续处理。
- **流式文本编码**：新增 `TextEncoderStream`、`TextDecoderStream`，支持跨分片连续编码和解码；`TextEncoder.encodeInto()` 可以写入指定缓冲区，并返回实际读取和写入的数量。

  ```js
  const response = await fetch('/api/answer');
  const textStream = response.body.pipeThrough(new TextDecoderStream());
  for await (const text of textStream) {
    console.log(text);
  }
  ```

- **Web Crypto 能力补齐**：支持 SHA 摘要与 HMAC 密钥生成、导入、导出、签名和验证，并完善 `CryptoKey` 元数据、二进制切片与错误处理。
- **感知网络变化**：新增 `navigator.onLine`、`navigator.connection` 以及 `online`、`offline` 和连接 `change` 事件，可读取网络状态并在连接变化时调整界面或重试请求。
- **语音合成参数修复**：修复 `SpeechSynthesisUtterance` 构造参数的默认值。
- **能力查询更准确**：`wx.canIUse()` 按运行时注册的函数判断能力，支持 `request` 等函数路径；未知路径、参数选项和应用自行添加的函数返回 `false`。查询结果不代表设备可用或已获得权限。

## 多媒体与绘图

- **音频播放与字幕修复**：修复设置 `currentTime` 未同步实际播放位置的问题，并保持字幕 cue 对象身份稳定。
- **导出 Canvas 与位图**：新增 `Canvas.convertToBlob()` 和 `createImageBlob()`，可把绘图或位图编码为 PNG、JPEG，用于上传、分享或保存图片。

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

- **Canvas 绘制更一致**：改进复杂文本的测量与绘制，修复 Web 端 `roundRect()` 圆角处理；绘制已关闭的 `ImageBitmap` 现在会报告错误。

## 界面与动画

- **布局与样式补齐**：新增 `text-overflow: ellipsis`，支持在尺寸和间距中使用 `calc()`；修复 `!important` 优先级与四边独立边框的绘制。
- **并发动画与生命周期**：同一元素可以同时运行多个 CSS 动画，支持 `animationstart`、`animationiteration`、`animationend`、`animationcancel` 事件；无关样式更新保留播放进度，动画替换、延迟和结束后的样式恢复更加准确。
- **文字与粒子联动**：支持由文字变化触发保留的粒子动画，并扩展二维 `transform` 与 `transform-origin` 行为。
- **CSS 随机值（实验性）**：新增 `random()`，支持指定上下界、可选步长和命名 key，为尺寸、透明度、动画时长等生成随机值。同一元素内，相同 key、范围和步长可共享结果；样式重算保持随机基值稳定，每个触发式动画重放实例拥有独立上下文，新实例不会改变已有实例。当前支持数值、长度、百分比和时间值的有限子集，不支持跨元素共享 key。

  ```css
  .particle {
    width: random(--size, 2px, 5px, 1px);
    height: random(--size, 2px, 5px, 1px);
    opacity: random(0.6, 1);
    animation-duration: random(800ms, 1200ms, 100ms);
  }
  ```

- **组件显示与输入修复**：修复投影内容中的图片、Lottie 属性解析和垂直柱状图数值标签；文本控件的输入事件通过 `event.detail.value` 提供完整内容。

## 性能与稳定性

- **数据更新与加载更高效**：缓存解析后的单文件组件、组件定义和作用域数据，优化选择器匹配、数据绑定和局部重组，减少大型页面及文本持续更新时的重复工作。
- **动画与绘图减少内存开销**：复用渲染和动画缓冲区，减少图片、Lottie、地图和图表的逐帧分配，并限制 Canvas 指令、路径和文字缓存的占用。
- **模板与回调更可靠**：修复数组 `length` 绑定、循环作用域、条件分支、`hidden` 绑定及循环节点查询；修复 `setData()` 回调重入和循环引用消息导致的栈溢出。
- **网络与基础 API 修复**：修复 URI 协议与 TLS 判断、空压缩响应体处理、流式工具调用的空 ID、定时器延迟转换和 `localStorage` 字符串转换；完善传感器未取得读数时返回 `null`、GPX 根节点校验和条码格式名称识别。

## 兼容性说明

- **首帧之后触发 ready**：Page 的 `onReady()` 和组件的 ready 生命周期在各自首帧实际呈现后触发；返回已有页面时不会重复触发。
- **导航回调反映实际结果**：`wx` 路由 API 在页面成功加载后调用 `success`；目标缺失、加载失败或没有上一页时调用 `fail`，并在结束时调用 `complete`。`wx.exitMiniProgram()` 支持省略参数。
- **录制格式检测**：`MediaRecorder.isTypeSupported()` 统一作为静态方法调用，不再通过录制实例调用。
- **语音识别权限调整**：移除独立的 `SPEECH_RECOGNITION` 权限；采集麦克风音频仍需在 `app.json` 中声明 `RECORD_AUDIO`，并满足系统授权要求。

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

  完整用法请查看[音频处理](/AIUI/api/media-web-audio#分析麦克风输入)。

- **持续识别音频内容**：可以把录制或已有的音频逐段写入 `SpeechRecognitionSession`，持续收到最新识别文字，并随时结束或取消任务。`segmentation` 支持对象形式；宿主通过 `vadSilenceDuration` 声明支持范围后，应用可以用 `silenceDurationMs` 配置 VAD 判定句段结束所需的连续静音毫秒数。语音播报也支持直接取消。

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
