# Full Color

`Full Color` 是面向乐奇全彩眼镜（英文名：Rokid Color）的 AIUI 视觉规范。它在透明显示中使用白色文字、彩色强调与清晰描边，让用户在有限视野中快速读取结果。

开始迁移现有智能体前，请先阅读[全彩眼镜适配指南](/AIUI/guide/full-color)。单色设备继续使用 [Monochrome](/AIUI/design/visual-monochrome)，不要将两套尺寸、字号与填充规则混用。

## 核心设计约束

以下尺寸使用设计逻辑单位；文字单位为 dp。WXSS 采用主题一致的逻辑 `px` 值编写，不直接使用硬件物理像素。

| 项目 | 要求 |
| --- | --- |
| 内容区域 | 宽 448，最高 352；内容与外边距整体位于区域内 |
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

上表为当前主题默认值。需覆盖卡片边框以符合本规范：最外层布局卡片无边框，内部卡片使用 1px、alpha 30% 的白色边框，聚焦与选中时仍为 alpha 100%。例如，在全彩布局中为对应的 `card` 元素添加以下类：

```css
@media (color) {
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

预留 10 的 FOV 边距后，无边框最外层卡片最多为 428 × 332；扣除左右 10、上下 24 的内边距，内容区域为 408 × 284。内部卡片的描边与内边距也需从这部分空间扣除。

最高 352 是内容设计约束，不是主题自动施加的高度裁剪。把卡片外边距、边框、内边距、标题和操作一起计入预算；超出的内容应拆分、分页或滚动，不能只用 `overflow: hidden` 隐藏。

为可交互的内部卡片提供清晰的 `:focus` 与 `:host-focus` 样式，最外层布局卡片保持无边框。业务选中态需要单独维护，不能只依靠 hover 或颜色变化。焦点行为见[焦点系统](/AIUI/framework/open-agent-format-page-focus)。

## 组件与资源基线

- **卡片、按钮与输入框**：优先透明背景与白色文字；最外层卡片无边框，内部卡片使用上述描边，按钮与输入框保留现有边框要求，并提供清晰焦点反馈。
- **图片与图标**：优先轮廓清晰、主体明确的资源；装饰图使用透明背景，避免大块底色与暗色细节。
- **图表**：优先线条与空心轮廓，使用标签、单位和图例辅助颜色，避免大面积实心色块。
- **地图**：优先展示路线、位置与必要标注，避免大量面状填色占满视野。
- **错误与空态**：简洁说明当前状态和下一步操作，配合图标或描边，不只改变颜色。

## 交付检查

交付前确认内容区域、文字、图标、内外边距和焦点态符合本页数值；检查纯黑、暗色细节、透明度叠加与大面积填充。最后在目标眼镜上验证不同光照与真实背景下的阅读、确认、返回与滚动。

实现步骤见[全彩眼镜适配指南](/AIUI/guide/full-color)，体验排查与优化见[全彩优化指南](/AIUI/guide/performance-full-color)。

## 设计源

完整的 design.md 格式设计源见 [design/fullcolor/design.md](https://github.com/yodaos-project/AIUI/blob/main/design/fullcolor/design.md)，包含 YAML Token 定义、组件模式、状态、主题映射与验收要求。修改规范时，请同步更新设计源与本页的中英文版本。

全彩效果预览见 [preview-color.html](https://github.com/yodaos-project/AIUI/blob/main/design/fullcolor/preview-color.html)。下载后可在浏览器直接打开，无需构建。
