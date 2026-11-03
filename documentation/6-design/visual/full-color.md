# Full Color

`Full Color` 是面向乐奇全彩眼镜（英文名：Rokid Color）的 AIUI 视觉规范。它在透明显示中使用白色文字、彩色强调与清晰描边，让用户在有限视野中快速读取结果。

开始迁移现有智能体前，请先阅读[全彩眼镜适配指南](/AIUI/guide/framework/full-color)。单色设备继续使用 [Monochrome](/AIUI/design/visual-monochrome)，不要将两套尺寸、字号与填充规则混用。

## 核心设计约束

以下尺寸使用设计逻辑单位；文字单位为 dp。WXSS 采用主题一致的逻辑 `px` 值编写，不直接使用硬件物理像素。

| 项目 | 要求 |
| --- | --- |
| 全屏参考尺寸 | 480 × 352 |
| 卡片容器参考尺寸 | 宽 480，高度随内容自适应 |
| 文字 | 14～24 dp |
| 图标 | 不小于 12 × 12 |
| 背景 | 主题背景始终为纯黑 `#000000`；卡片和控件优先透明 |
| 大面积填充 | 不使用大面积底色，用留白与描边建立结构 |
| 可见内容 alpha | 建议不低于 40% |
| 最外层卡片 | 所有状态均无边框；保留圆角 12 与现有间距 |
| 内部卡片 | 圆角 12，1px 白色内部描边，默认 alpha 30% |
| 选中或聚焦的内部卡片 | 白色描边 alpha 100%，保持 1px 的宽度 |
| 卡片内边距 | 内容到边框左右各 10，上下各 24 |
| FOV 边距 | 卡片到 FOV 边缘保留 10 |
| 分割线 | 宽 1，alpha 40% |

本页的“透明度 30%”指颜色的 alpha 值 `0.3`，即内部卡片默认边框使用 `rgba(255,255,255,0.3)`。内部卡片边框、透明容器和黑色背景不受可见前景 40% 建议下限约束；文字与图标保留该建议下限，分割线仍为 alpha 40%。

## 黑色与透视显示

纯黑在眼镜端显示为透明，不能当作遮住真实世界的不透明底板。不要用黑字表达内容，也不要用明暗度过低的深灰、深蓝等颜色承载关键文字、图标与线条。

黑色页面背景与透明卡片是基线。关键内容优先使用白色或清晰的亮色，并在浅色、复杂真实背景下验证。桌面预览中的黑底对比效果不等于眼镜上的可读性。

## 颜色系统

以下为内置全彩主题的主要默认值。语义色用于辅助状态表达，错误、成功与选中状态仍应有文字、图标或形状提示。

| Token | 用途 | 默认值 |
| --- | --- | --- |
| `--color-background` | 页面背景 | `#000000` |
| `--color-surface` / `--color-surface-highlight` | 容器与高亮容器背景 | `transparent` |
| `--color-text-primary` | 正文、关键文字 | `#ffffff` |
| `--color-text-secondary` | 次级文字 | `rgba(255,255,255,0.6)` |
| `--color-primary` | 主强调色 | `#66b3ff` |
| `--color-secondary` / `--border-color-success` | 辅助强调、成功 | `#80e6b0` |
| `--border-color-danger` | 错误提示 | `#ff8080` |
| `--border-color-warning` | 警告提示 | `#ffd966` |
| `--border-color-highlight` | 分类强调 | `#c4a6ff` |
| `--border-color-default` | 默认控件边框 | `rgba(255,255,255,0.6)` |
| `--border-color-muted` | 弱化边框、分割线 | `rgba(255,255,255,0.4)` |
| `--border-color-strong` | 选中与焦点边框 | `#ffffff` |

为单独的文字或边框设置颜色 alpha，不要对整个卡片设置 `opacity: 0.4`。父级透明度会同时削弱子内容，并可能让已经半透明的前景低于可读性基线。

### 推荐调色板

下表来自设计参考图，是可选的设计推荐，并非内置主题 Token 的默认值。色系加列号表示色名，例如 <span data-color-swatch="#39D6E0">cyan5</span>；使用时需显式选择或覆盖颜色，内置主题默认值仍以上表为准。

| 色系 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cyan | <span data-color-swatch="#10434B">cyan1</span> | <span data-color-swatch="#196670">cyan2</span> | <span data-color-swatch="#238B95">cyan3</span> | <span data-color-swatch="#2EB0BB">cyan4</span> | <span data-color-swatch="#39D6E0">cyan5</span> | <span data-color-swatch="#5DE0E6">cyan6</span> | <span data-color-swatch="#83EAEC">cyan7</span> | <span data-color-swatch="#AAF2F3">cyan8</span> | <span data-color-swatch="#D4F9F9">cyan9</span> | <span data-color-swatch="#EEFCFC">cyan10</span> |
| Green | <span data-color-swatch="#164617">green1</span> | <span data-color-swatch="#216822">green2</span> | <span data-color-swatch="#2E8B2E">green3</span> | <span data-color-swatch="#3DAE3B">green4</span> | <span data-color-swatch="#4ED149">green5</span> | <span data-color-swatch="#6FDA69">green6</span> | <span data-color-swatch="#91E38B">green7</span> | <span data-color-swatch="#B4EDAF">green8</span> | <span data-color-swatch="#D9F6D6">green9</span> | <span data-color-swatch="#F0FAEF">green10</span> |
| Violet | <span data-color-swatch="#2F1866">violet1</span> | <span data-color-swatch="#41248A">violet2</span> | <span data-color-swatch="#5333AE">violet3</span> | <span data-color-swatch="#6743D1">violet4</span> | <span data-color-swatch="#7B56F5">violet5</span> | <span data-color-swatch="#9277F7">violet6</span> | <span data-color-swatch="#AB98F9">violet7</span> | <span data-color-swatch="#C6BAFB">violet8</span> | <span data-color-swatch="#E2DCFD">violet9</span> | <span data-color-swatch="#F4F3FE">violet10</span> |
| Red | <span data-color-swatch="#701822">red1</span> | <span data-color-swatch="#94242D">red2</span> | <span data-color-swatch="#B83239">red3</span> | <span data-color-swatch="#DB4345">red4</span> | <span data-color-swatch="#FF5855">red5</span> | <span data-color-swatch="#FF7E77">red6</span> | <span data-color-swatch="#FFA299">red7</span> | <span data-color-swatch="#FFC3BB">red8</span> | <span data-color-swatch="#FFE2DD">red9</span> | <span data-color-swatch="#FFF5F3">red10</span> |
| Gray | <span data-color-swatch="#222725">gray1</span> | <span data-color-swatch="#343B38">gray2</span> | <span data-color-swatch="#464E4B">gray3</span> | <span data-color-swatch="#58625E">gray4</span> | <span data-color-swatch="#6B7571">gray5</span> | <span data-color-swatch="#88928E">gray6</span> | <span data-color-swatch="#A7B0AC">gray7</span> | <span data-color-swatch="#C6CDCA">gray8</span> | <span data-color-swatch="#E6EAE8">gray9</span> | <span data-color-swatch="#F9F9F9">gray10</span> |
| Yellow | <span data-color-swatch="#512A09">yellow1</span> | <span data-color-swatch="#7A440F">yellow2</span> | <span data-color-swatch="#A26316">yellow3</span> | <span data-color-swatch="#CB851E">yellow4</span> | <span data-color-swatch="#FFCC66">yellow5</span> | <span data-color-swatch="#F5C150">yellow6</span> | <span data-color-swatch="#F8D47A">yellow7</span> | <span data-color-swatch="#FAE5A6">yellow8</span> | <span data-color-swatch="#FDF3D2">yellow9</span> | <span data-color-swatch="#FEFBED">yellow10</span> |

透明白以白色为基色，alpha 如下：

| Token | 透明度 | 颜色 |
| --- | --- | --- |
| `white1a` | 0.04 | <span data-color-swatch="rgba(255,255,255,0.04)">white1a</span> |
| `white2a` | 0.08 | <span data-color-swatch="rgba(255,255,255,0.08)">white2a</span> |
| `white3a` | 0.12 | <span data-color-swatch="rgba(255,255,255,0.12)">white3a</span> |
| `white4a` | 0.16 | <span data-color-swatch="rgba(255,255,255,0.16)">white4a</span> |
| `white5a` | 0.24 | <span data-color-swatch="rgba(255,255,255,0.24)">white5a</span> |
| `white6a` | 0.3 | <span data-color-swatch="rgba(255,255,255,0.3)">white6a</span> |
| `white7a` | 0.4 | <span data-color-swatch="rgba(255,255,255,0.4)">white7a</span> |
| `white8a` | 0.5 | <span data-color-swatch="rgba(255,255,255,0.5)">white8a</span> |
| `white9a` | 0.6 | <span data-color-swatch="rgba(255,255,255,0.6)">white9a</span> |
| `white10a` | 0.7 | <span data-color-swatch="rgba(255,255,255,0.7)">white10a</span> |
| `white11a` | 0.8 | <span data-color-swatch="rgba(255,255,255,0.8)">white11a</span> |
| `white12a` | 0.9 | <span data-color-swatch="rgba(255,255,255,0.9)">white12a</span> |
| `white` | 1 | <span data-color-swatch="rgba(255,255,255,1)">white</span> |

| 用途 | 参考颜色 |
| --- | --- |
| 一级 / 二级 / 三级 / 四级中性色 | <span data-color-swatch="#F9F9F9">gray10</span> / <span data-color-swatch="#A7B0AC">gray7</span> / <span data-color-swatch="#6B7571">gray5</span> / <span data-color-swatch="#464E4B">gray3</span> |
| 主题色 | <span data-color-swatch="#39D6E0">cyan5</span>；弱化色 <span data-color-swatch="#238B95">cyan3</span>、<span data-color-swatch="#196670">cyan2</span> |
| 错误色 | <span data-color-swatch="#FF5855">red5</span>；弱化色 <span data-color-swatch="#B83239">red3</span>、<span data-color-swatch="#94242D">red2</span> |
| 成功色 | <span data-color-swatch="#4ED149">green5</span>；弱化色 <span data-color-swatch="#2E8B2E">green3</span>、<span data-color-swatch="#216822">green2</span> |
| 提示色 | <span data-color-swatch="#FFCC66">yellow5</span>；弱化色 <span data-color-swatch="#A26316">yellow3</span>、<span data-color-swatch="#7A440F">yellow2</span> |
| 紫色基础色 | <span data-color-swatch="#7B56F5">violet5</span> |

上述层级是设计参考，不保证在透视显示中都清晰可读。较深的灰色和弱化语义色可能难以辨认，未经目标设备验证时仅用于非关键信息。透明白 alpha 低于 0.4 不适合作为关键可见前景；内部卡片边框仍可按规范使用 0.3。关键内容保持清晰，并结合文字、图标或形状表达状态，在真实背景下验证。

## 排版与图标

| 层级 | 建议字号 | 主题对应值 |
| --- | --- | --- |
| 重点标题 | 24 | `--font-size-max`；`header` 默认使用 |
| 卡片标题 | 20 | `--card-title-font-size` |
| 正文与操作 | 16 | `text`、`p`、输入与按钮的默认字号 |
| 辅助信息 | 14 | `--card-footer-font-size`；字号下限 `--font-size-min` |
| 图标 | 默认 16，最小 12 × 12 | `--icon-size-min` |

这些 Token 与默认样式不是对所有自定义内容的自动校正。页面自行设置的字号、图片内文字、Canvas 标注都需要检查。内容放不下时先减少信息量，再做分步展示，保持字号与图标下限。

## 卡片、间距与焦点

| Token | 当前主题默认值（卡片边框需按下方覆盖） |
| --- | --- |
| `--app-width` | `448px` |
| `--card-margin` | `10px` |
| `--card-padding` | `10px`，水平内容间距 |
| `--card-padding-y` | `24px`，垂直内容间距 |
| `--card-radius` | `12px` |
| `--card-border-width` | `2px` |
| `--card-border-color` | 白色 alpha 60% |
| `--card-focus-border-color` | 白色 alpha 100% |
| `--card-divider-width` / `--card-divider-color` | `1px` / 白色 alpha 40% |

上表为当前主题默认值，其中 `--app-width` 仍为 448px；480 是新的设计参考宽度，需按实际容器覆盖并自适应。需覆盖卡片边框以符合本规范：最外层布局卡片无边框，内部卡片使用 1px、alpha 30% 的白色边框，聚焦与选中时仍为 alpha 100%。例如，在全彩布局中为对应的 `card` 元素添加以下类：

```css
@media (color) {
  :root {
    --app-width: 480px;
  }
  .outer-card {
    border: 0;
  }
  .inner-card {
    margin: 0;
    border: 1px solid rgba(255,255,255,0.3);
  }
  .inner-card:focus,
  .inner-card:host-focus,
  .inner-card.is-selected {
    border-color: #ffffff;
  }
}
```

全屏以 480 × 352 为参考；卡片容器以 480 为参考宽度，高度随内容和可用空间自适应。480 是容器宽度而非内部内容宽度，布局时将 FOV 边距、内边距与描边计入可用空间。

根据实际容器的宽高调整布局，不要给卡片固定 352 高度。把边距、边框、内边距、标题和操作一起计入可用空间；超出的内容应拆分、分页或滚动，不能只用 `overflow: hidden` 隐藏。

为可交互的内部卡片提供清晰的 `:focus` 与 `:host-focus` 样式，最外层布局卡片保持无边框。业务选中态需要单独维护，不能只依靠 hover 或颜色变化。焦点行为见[焦点系统](/AIUI/framework/open-agent-format-page-focus)。

## 组件与资源基线

- **卡片、按钮与输入框**：优先透明背景与白色文字；最外层卡片无边框，内部卡片使用上述描边，按钮与输入框保留现有边框要求，并提供清晰焦点反馈。
- **图片与图标**：优先轮廓清晰、主体明确的资源；装饰图使用透明背景，避免大块底色与暗色细节。
- **图表**：优先线条与空心轮廓，使用标签、单位和图例辅助颜色，避免大面积实心色块。
- **地图**：优先展示路线、位置与必要标注，避免大量面状填色占满视野。
- **错误与空态**：简洁说明当前状态和下一步操作，配合图标或描边，不只改变颜色。

## 交付检查

交付前确认内容区域、文字、图标、内外边距和焦点态符合本页数值；检查纯黑、暗色细节、透明度叠加与大面积填充。最后在目标眼镜上验证不同光照与真实背景下的阅读、确认、返回与滚动。

实现步骤见[全彩眼镜适配指南](/AIUI/guide/framework/full-color)，体验排查与优化见[全彩优化指南](/AIUI/guide/performance-full-color)。

## 设计源

完整的 design.md 格式设计源见 [design/fullcolor/design.md](https://github.com/yodaos-project/AIUI/blob/main/design/fullcolor/design.md)，包含 YAML Token 定义、组件模式、状态、主题映射与验收要求。修改规范时，请同步更新设计源与本页的中英文版本。

全彩效果预览见 [preview-color.html](https://github.com/yodaos-project/AIUI/blob/main/design/fullcolor/preview-color.html)。下载后可在浏览器直接打开，无需构建。
