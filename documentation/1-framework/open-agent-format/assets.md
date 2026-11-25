# 资源（Assets）

AIUI 智能体可以使用包内资源和网络资源。图片、视频、Lottie 组件和 `AudioPlayer` 都通过 `src` 指定资源地址；资源可以放在约定的 `assets/` 目录，也可以按功能放在项目中的其他目录。

AIUI 不强制使用 `assets/` 目录，也不限制资源的目录结构。无论资源放在哪里，都可以使用受支持的相对路径、从应用资源根目录开始的路径，或者网络 URL 来引用。相对路径的具体解析基准取决于资源入口，下文会分别说明。

## 一种可选的组织方式

如果希望集中管理静态资源，可以把不同类型的文件放在 `assets/` 中，例如：

```text
agent-app/
├── app.json
├── app.js
├── pages/
│   └── home/
│       └── index.ink
└── assets/
    ├── logo.png
    ├── intro.mp4
    ├── notification.ogg
    ├── loading.json
    ├── fonts/
    │   └── DemoFont-Regular.woff2
    └── images/
        └── lottie-icon.png
```

这只是一种推荐方式，不是运行要求。资源也可以放在 Page、Widget 或功能模块附近；只要引用路径能够正确解析，目录名称和层级不会影响资源加载。

## 使用自定义字体

字体也可以随应用一起打包。你可以把字体文件放在 `assets/fonts/`，在 `app.json` 中登记后，就能在页面中使用。文件放置、配置和预览步骤见[自定义字体](./assets/custom-fonts.md)。

## 使用相对路径

在 Page 或 Widget 中，相对路径从当前入口文件所在目录开始解析。对于上面的 `pages/home/index.ink`，需要向上两级才能访问项目根目录中的 `assets/`：

```xml
<image src="../../assets/logo.png"></image>
<video src="../../assets/intro.mp4"></video>
<lottie-view src="../../assets/loading.json"></lottie-view>
```

路径中的 `.` 表示当前目录，`..` 表示上一级目录。路径不能越过应用资源根目录。

可复用组件中的不同资源类型目前不一定使用相同的相对路径基准。组件需要加载共享资源时，推荐使用 `/assets/...` 包根路径，避免组件被不同 Page 引用时产生歧义。

## 使用包根路径

以 `/` 开头的路径从当前应用的资源根目录解析。它不是设备操作系统中的绝对文件路径，也不能用于读取应用包之外的文件。

```xml
<image src="/assets/logo.png"></image>
<video src="/assets/intro.mp4"></video>
<lottie-view src="/assets/loading.json"></lottie-view>
```

当多个 Page、Widget 或组件需要引用同一个资源时，包根路径通常比多层 `../` 更容易维护。

## 加载网络资源

支持网络资源的组件可以直接使用完整的 HTTP 或 HTTPS URL：

```xml
<image src="https://cdn.example.com/logo.png"></image>
<video src="https://cdn.example.com/intro.mp4"></video>
<lottie-view src="https://cdn.example.com/loading.json"></lottie-view>
```

网络 URL 必须包含 `http://` 或 `https://`。以 `//cdn.example.com/file` 开头的协议相对 URL，以及把域名写成普通相对路径的形式，不属于支持的网络地址写法。

图片和 Lottie 文件会先完整加载，再进行解码或解析。视频支持渐进读取，因此不需要等待整个文件下载完成才开始处理；具体可播放格式请查看 [`<video>`](/AIUI/components/video) 文档。

## 可移植的地址支持

图片、视频、Lottie 和 `AudioPlayer` 都支持常用的相对路径、包根路径和 HTTP/HTTPS URL：

| 地址或输入形式                     | 图片   | 视频   | Lottie | `AudioPlayer` |
| ---------------------------------- | ------ | ------ | ------ | ------------- |
| 相对路径，例如 `../../assets/file` | 支持   | 支持   | 支持   | 支持          |
| 包根路径，例如 `/assets/file`      | 支持   | 支持   | 支持   | 支持          |
| `http://` 或 `https://` URL        | 支持   | 支持   | 支持   | 支持          |

为了让应用在不同运行端保持一致，不应依赖 `data:`、`blob:` 或直接传入资源文本等平台特有输入。组件还可能对文件内容和编码格式有额外限制；地址能够解析，并不表示对应文件一定可以解码或播放。

## 加载 Lottie 的外部图片

Lottie JSON 可以引用外部图片。相对图片地址以 Lottie 文件自身的位置为基准，而不是以当前 Page 为基准。

例如，`/assets/loading.json` 中包含下面的资源声明：

```json
{
  "assets": [
    {
      "id": "icon",
      "u": "images/",
      "p": "lottie-icon.png"
    }
  ]
}
```

运行时会从 `/assets/images/lottie-icon.png` 加载图片。远程 Lottie 文件同样会相对于其 URL 所在目录解析外部图片。为了避免部署后路径失效，应将 JSON 文件和它引用的图片保持原有相对目录关系。

`.lottie` 归档也可以作为 `lottie-view` 的资源，其中的动画 JSON 和内嵌图片由运行时从归档中读取。

## 在 WXSS 中使用图片

WXSS 的 `background-image` 可以通过 `url()` 引用图片，并遵循相同的包内图片加载规则：

```css
.hero {
  background-image: url('/assets/logo.png');
  background-repeat: no-repeat;
  background-position: center;
}
```

当样式属于可复用组件时，推荐使用清晰的包根路径，避免组件移动后相对路径发生变化。

## 通过 ES Modules 导入资源

组件的 `src` 与 JavaScript 的资源模块导入是两种不同的使用方式。`src` 把地址交给对应组件加载；ES Module 导入则在模块执行时产生 `Blob`、`ImageData` 或 `Sound` 等 JavaScript 对象。

```javascript
import icon, { mimeType, path } from '../../assets/logo.png';

console.log(icon instanceof Blob);
console.log(mimeType);
console.log(path);
```

模块导入路径相对于发起 `import` 的 JavaScript 或 TypeScript 文件解析，并且只用于包内资源。支持的扩展名和类型化导入方式请查看[模块](/AIUI/framework/open-agent-format-module)。

## 缓存和生命周期

运行时会对部分已加载或已解析的资源进行缓存，并合并部分重复的加载请求。缓存范围和容量属于运行时实现细节，应用不应依赖某个资源永久驻留缓存。

当 `src` 改变或组件被移除时，旧的异步加载结果不会替换当前资源。页面或 Widget 销毁后，运行时会释放与其生命周期关联的加载状态；脚本自行创建的播放器、Object URL 或持续任务仍应在相应生命周期回调中停止或释放。

## 推荐实践

- 如果希望统一管理共享静态文件，可以使用 `assets/`，并按媒体类型或功能继续分目录。
- 跨页面共享的资源优先使用 `/assets/...`，页面私有资源可以使用相对路径。
- 网络地址始终写出完整的 `https://` URL，并为加载失败准备降级界面。
- 不要把 `/assets/...` 当作设备文件系统路径，也不要依赖应用包之外的本地文件。
- 移动 Page、Widget、组件或 Lottie 文件后，检查它们引用的所有相对资源路径。

## 相关文档

- [项目结构](/AIUI/guide/structure)
- [模块](/AIUI/framework/open-agent-format-module)
- [`<image>`](/AIUI/components/image)
- [`<video>`](/AIUI/components/video)
- [`<lottie-view>`](/AIUI/components/lottie-view)
- [音频播放](/AIUI/api/media-audio-player)
