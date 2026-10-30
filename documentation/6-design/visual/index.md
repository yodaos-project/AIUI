# 视觉设计

AIUI 按显示类型提供视觉规范。先根据目标设备选择规范，再用主题 Token、布局与资源调整实现一致的任务体验。

## 显示类型

| 类型 | 适用设备 | 核心约束 |
| --- | --- | --- |
| [Monochrome](/AIUI/design/visual-monochrome) | RokidGlasses1 / RokidGlasses2 的单绿色显示 | 单一绿色通道，参考画布 480 × 352，使用单色透明度与描边建立层级 |
| [Full Color](/AIUI/design/visual-full-color) | 乐奇全彩眼镜 | 宽 448、最高 352，白色文字与彩色强调，透明容器与清晰描边 |

两类显示都使用纯黑页面背景，黑色在眼镜上呈透明效果。全彩增加了色相表达能力，仍需限制大面积填充、保持可读字号，并在真实背景下验证。

## 选择与复用规范

同一个智能体可以复用业务逻辑、Page 与 Widget，再根据显示能力调整配色，根据可用空间调整布局。不应将单色的字号和整页布局直接缩放到全彩，也不应把全彩的多色状态直接搬到单色设备。

优先复用主题 Token，自定义样式、图片和 Canvas 需要单独检查。完整迁移流程见[全彩眼镜适配指南](/AIUI/guide/framework/full-color)。

## 规范与设计源

本目录提供开发者使用的视觉规范；仓库根目录 `design/monochrome/` 保留单色设计源文件与预览，`design/fullcolor/design.md` 提供 YAML Token 与 Markdown 说明组成的全彩设计源。全彩的尺寸、颜色、排版与组件基线见 [Full Color](/AIUI/design/visual-full-color)。

## 下一步阅读

- [Monochrome](/AIUI/design/visual-monochrome)
- [Full Color](/AIUI/design/visual-full-color)
- [全彩眼镜适配指南](/AIUI/guide/framework/full-color)
- [全彩优化指南](/AIUI/guide/performance-full-color)
- [交互设计](/AIUI/design/interaction)
