# 常见问题

本页汇总 AIUI 开发过程中经常遇到的问题。开始开发前，建议先阅读[快速开始](/AIUI/guide/quickstart)；如果问题与某项具体能力有关，请同时查阅对应的组件或 API 文档。

## 我应该从哪里开始学习 AIUI？

第一次使用 AIUI 时，建议按以下顺序阅读：

1. 阅读[介绍](/AIUI/guide/quickstart-intro)，了解 AIUI 的适用场景。
2. 完成[快速入门](/AIUI/guide/quickstart-quickstart)，熟悉开发、调试与发布流程。
3. 根据产品形态选择[对话式 AIUI](/AIUI/guide/quickstart-first-chat)或[沉浸式 AIUI](/AIUI/guide/quickstart-first-immersive)。
4. 阅读[项目结构](/AIUI/guide/structure)，了解项目文件如何组织。

## 对话式 AIUI 和沉浸式 AIUI 有什么区别？

对话式 AIUI 适合在聊天流程中展示轻量、上下文相关的交互内容；沉浸式 AIUI 适合需要独立页面、持续操作或更完整视觉布局的任务。两者可以在同一个智能体中配合使用，具体选择取决于任务需要的交互深度。

## 在哪里查找组件和 API 的用法？

- 界面元素及其属性请查阅[组件](/AIUI/components)。
- JavaScript、设备、网络、媒体和 AI 能力请查阅 [API](/AIUI/api)。
- 智能体的组织方式和运行机制请查阅[智能体框架](/AIUI/guide/framework)与[智能体运行时](/AIUI/guide/runtime)。

## 遇到运行或显示问题时如何排查？

先确认项目结构和相关 API 用法是否符合当前文档，再使用[网页端模拟调试](/AIUI/guide/debug-web_debug)快速检查逻辑和界面。涉及设备能力、平台差异或真实运行环境的问题，应继续使用[真机调试](/AIUI/guide/debug-real_device_debug)验证。

## 如何打包和发布智能体？

请先了解 [AIX](/AIUI/guide/bundle-aix) 包格式，再根据[提审与发布](/AIUI/guide/bundle-publish)完成发布流程。需要在本地处理包文件时，可参考[命令行工具](/AIUI/guide/bundle-cli)。

## 全彩眼镜需要单独创建智能体吗？

仅做全彩适配无需单独创建智能体。建议在同一个项目、同一个 AIX 中复用业务逻辑、Page、Widget 和数据服务，按显示能力切换配色与资源，按可用空间调整布局。只有产品定位或核心功能需要独立时，再考虑拆分。具体步骤见[全彩眼镜适配指南](/AIUI/guide/full-color)。

## 全彩规范适用于哪款设备？

当前全彩规范面向乐奇全彩眼镜，英文名为 Rokid Color，二者是同一设备的中英文名称。内容区域宽 448、最高 170。RokidGlasses1 / RokidGlasses2 的单绿色显示继续参考 [Monochrome](/AIUI/design/visual-monochrome)。设备相关 API 与交互仍需分别验证，不要因为支持全彩就假定其他硬件能力一致。

## 适配全彩只需要换颜色吗？

还需要检查内容空间、字号、图标、内外边距、焦点态和资源。全彩文字为 14～24 dp，图标不小于 12 × 12；单色页面中的小字号、大面积填充和长页面不能直接照搬。内置主题提供默认样式，但不会自动修正自定义布局、图片或 Canvas。数值要求见[全彩视觉规范](/AIUI/design/visual-full-color)。

## 如何判断当前是全彩还是单色？

在支持的运行时中，样式使用 `@media (color)` / `@media (monochrome)`，页面逻辑使用 `window.matchMedia()`。不要用设备名称、屏幕宽度或 `target` 代替显示能力判断。两项查询都不匹配时保留未知状态，不能直接当作单色；旧版运行时需保留基础展示。示例见[全彩眼镜适配指南](/AIUI/guide/full-color)。

## 为什么黑底、深色文字或半透明内容在眼镜上看不清？

纯黑在眼镜上显示为透明，不能遮住真实世界；过暗的颜色也不适合承载关键内容。优先使用白色正文与清晰亮色，可见内容 alpha 建议不低于 40%，避免对整个卡片叠加透明度。默认卡片描边为 60%，选中 100%，分割线 40%。请在不同真实背景和光照下验证，优化方法见[全彩优化指南](/AIUI/guide/performance-full-color)。

## 内容超过 170 高度，或者切到沉浸式后，应该怎么处理？

优先拆分摘要与详情、分页或使用可操作的滚动区域，保留关键操作。`_blank` 表示展示容器变化，不会取消全彩 448 宽、最高 170 的内容约束。不要依靠缩小字号、减少规定边距或裁剪内容解决溢出；在真机上检查阅读、滚动、焦点与返回路径。
