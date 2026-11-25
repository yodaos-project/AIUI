# Assets

An AIUI agent can use bundled assets and network assets. Image, video, and Lottie components and `AudioPlayer` specify an asset location through `src`. Assets may live in the conventional `assets/` directory or in another project directory organized by feature.

AIUI does not require an `assets/` directory or prescribe an asset directory structure. Wherever an asset lives, it can be referenced with a supported relative path, a path starting at the application resource root, or a network URL. The exact base for a relative path depends on the asset entry point, as described below.

## An Optional Organization Pattern

To manage static assets in one place, a project can keep different file types under `assets/`, for example:

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

This is a recommendation, not a runtime requirement. Assets may instead live next to the Page, Widget, or feature module that owns them. Directory names and nesting do not affect loading as long as each reference resolves to the correct path.

## Use Custom Fonts

Fonts can ship with the application. You can keep font files in `assets/fonts/` and register them in `app.json` to use them on a page. See [Custom Fonts](./assets/custom-fonts.en-US.md) for the file layout, configuration, and preview steps.

## Use Relative Paths

In a Page or Widget, a relative path is resolved from the directory containing the current entry file. From `pages/home/index.ink` in the example above, move up two directories to reach the root-level `assets/` directory:

```xml
<image src="../../assets/logo.png"></image>
<video src="../../assets/intro.mp4"></video>
<lottie-view src="../../assets/loading.json"></lottie-view>
```

In a path, `.` means the current directory and `..` means its parent. A path cannot escape the application resource root.

Different asset types in a reusable component do not currently always use the same relative-path base. Use an `/assets/...` application-root path for shared component assets to avoid ambiguity when several Pages consume the component.

## Use Application-Root Paths

A path beginning with `/` is resolved from the current application's resource root. It is not an absolute path in the device operating system and cannot read a file outside the application package.

```xml
<image src="/assets/logo.png"></image>
<video src="/assets/intro.mp4"></video>
<lottie-view src="/assets/loading.json"></lottie-view>
```

Application-root paths are usually easier to maintain than several levels of `../` when multiple Pages, Widgets, or components share an asset.

## Load Network Assets

Components that support network assets can use a complete HTTP or HTTPS URL directly:

```xml
<image src="https://cdn.example.com/logo.png"></image>
<video src="https://cdn.example.com/intro.mp4"></video>
<lottie-view src="https://cdn.example.com/loading.json"></lottie-view>
```

A network URL must include `http://` or `https://`. Protocol-relative URLs beginning with `//cdn.example.com/file`, and hostnames written as ordinary relative paths, are not supported network URL forms.

Image and Lottie files are loaded completely before they are decoded or parsed. Video supports progressive reads, so processing does not need to wait for the entire file to download. See the [`<video>`](/AIUI/components/video) documentation for supported playback formats.

## Portable Address Support

Images, videos, Lottie animations, and `AudioPlayer` all support the common relative, application-root, and HTTP/HTTPS forms:

| Address or input form                         | Image         | Video         | Lottie        | `AudioPlayer` |
| --------------------------------------------- | ------------- | ------------- | ------------- | ------------- |
| Relative path, such as `../../assets/file`    | Supported     | Supported     | Supported     | Supported     |
| Application-root path, such as `/assets/file` | Supported     | Supported     | Supported     | Supported     |
| `http://` or `https://` URL                   | Supported     | Supported     | Supported     | Supported     |

For consistent behavior across runtimes, do not rely on platform-specific inputs such as `data:`, `blob:`, or raw asset text. A component may also impose additional requirements on file content and encoding; resolving an address does not guarantee that the file can be decoded or played.

## Load External Images from Lottie

A Lottie JSON file may refer to external images. A relative image location is resolved from the Lottie file itself, not from the current Page.

For example, `/assets/loading.json` may contain this asset declaration:

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

The runtime loads the image from `/assets/images/lottie-icon.png`. An external image in a remote Lottie file is similarly resolved from the directory containing that file's URL. Preserve the relative directory relationship between a JSON file and its images when deploying them.

A `.lottie` archive can also be used as a `lottie-view` asset. The runtime reads its animation JSON and embedded images from the archive.

## Use Images in WXSS

WXSS `background-image` can refer to an image with `url()` and follows the same bundled-image loading rules:

```css
.hero {
  background-image: url('/assets/logo.png');
  background-repeat: no-repeat;
  background-position: center;
}
```

For styles owned by a reusable component, prefer a clear application-root path when moving the component could otherwise change a relative path.

## Import Assets through ES Modules

A component `src` and a JavaScript asset-module import are different ways to consume an asset. A `src` hands an address to the corresponding component loader. An ES Module import produces a JavaScript object such as a `Blob`, `ImageData`, or `Sound` when the module runs.

```javascript
import icon, { mimeType, path } from '../../assets/logo.png';

console.log(icon instanceof Blob);
console.log(mimeType);
console.log(path);
```

An import path is resolved relative to the JavaScript or TypeScript file containing the `import`, and asset-module imports apply only to bundled assets. See [Modules](/AIUI/framework/open-agent-format-module) for supported extensions and typed imports.

## Caching and Lifecycle

The runtime caches some loaded or parsed assets and coalesces some duplicate loading requests. Cache scope and capacity are implementation details; an application must not rely on an asset remaining cached indefinitely.

When `src` changes or a component is removed, a stale asynchronous result does not replace the current asset. The runtime releases loading state associated with a Page or Widget after it is destroyed. A player, object URL, or persistent task created by application code should still be stopped or released in the corresponding lifecycle callback.

## Recommended Practices

- To manage shared static files in one place, consider using `assets/` with subdirectories by media type or feature.
- Prefer `/assets/...` for assets shared across pages; use relative paths for assets owned by one page.
- Write a complete `https://` URL for network assets and provide fallback UI for loading failures.
- Do not treat `/assets/...` as a device file-system path or depend on local files outside the application package.
- After moving a Page, Widget, component, or Lottie file, check every relative asset location it uses.

## Related Documentation

- [Project Structure](/AIUI/guide/structure)
- [Modules](/AIUI/framework/open-agent-format-module)
- [`<image>`](/AIUI/components/image)
- [`<video>`](/AIUI/components/video)
- [`<lottie-view>`](/AIUI/components/lottie-view)
- [Audio Playback](/AIUI/api/media-audio-player)
