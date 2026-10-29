# 全彩眼镜适配指南

同一个 AIUI 智能体可以面向单色和全彩眼镜开发。适配全彩时，优先复用智能体定义、业务逻辑、Page、Widget 和数据服务，再按显示能力与可用空间调整样式、资源和信息密度。

本文面向乐奇全彩眼镜（英文名：Rokid Color）。先完成本页的适配流程，再参阅[全彩视觉规范](/AIUI/design/visual-full-color)和[全彩优化指南](/AIUI/guide/performance-full-color)。

## 全彩带来了什么

全彩允许用不同色相辅助表达状态、分类和数据，例如用颜色区分图表系列、标记任务结果、强调关键数值。图片与图标也可以保留彩色信息。

全彩眼镜仍是透视显示：纯黑不发光，在眼镜上呈透明效果。颜色应辅助阅读，关键状态还要有文字、图标或描边反馈；不要用大面积底色覆盖视野。

| 适配项 | 单色 Green | 全彩眼镜 |
| --- | --- | --- |
| 目标设备 | RokidGlasses1 / RokidGlasses2 | 乐奇全彩眼镜 |
| 内容区域 | 参考画布宽 480、最高 352 | 宽 448、最高 170 |
| 颜色 | 单一绿色通道，通过透明度、描边与排版区分层级 | 白色正文与彩色强调，保留文字和形状提示 |
| 文字 | 使用单色规范的字号层级 | 14～24 dp，不直接照搬单色的小字号 |
| 卡片 | 单色描边与轻填充 | 透明容器、12 圆角、2 内描边；默认 alpha 60%，选中 100% |

表中尺寸为设计逻辑尺寸。WXSS 示例使用 `px`；不要把硬件物理分辨率直接作为布局尺寸。设备名称用于说明适用范围，代码应按显示能力适配。全彩显示能力也不代表摄像头、传感器或交互方式完全相同，相关功能仍需在目标设备验证。

## 1. 复用现有智能体

仅因增加全彩适配，无需单独创建一个智能体。建议在同一个项目中维护共用功能和显示分支，打包为同一个 AIX，并分别完成单色与全彩验证。提审与发布仍按[现有流程](/AIUI/guide/bundle-publish)完成。

把状态文案、任务结果和交互流程放在共用逻辑中，把配色、图标资源与紧凑布局放在展示层中。仅当产品定位或核心功能本身需要独立时，再考虑拆分智能体。

## 2. 优先使用主题 Token

内置全彩主题提供黑色页面背景、白色文字、彩色强调、透明卡片、字号与组件默认样式。页面优先复用 `--color-text-primary`、`--color-text-secondary`、`--color-primary`、`--card-border-color` 等 Token，减少写死单绿色和固定填充色。

主题默认值不会自动完成适配。检查页面内联样式、自定义组件、Canvas 和图片中的固定颜色、小字与大面积填充；主题也不会自动把任意内容限制在 170 高度内。关键 Token 见[全彩视觉规范](/AIUI/design/visual-full-color)。

## 3. 分别处理颜色与布局

在支持显示能力查询的 AIUI 运行时中，WXSS 可以使用 `(color)` 和 `(monochrome)`。把共用规则放在查询外，再添加颜色分支：

```css
:root {
  --result-accent: var(--color-primary);
}

.result-state {
  color: var(--result-accent);
}

@media (color) {
  :root {
    --result-accent: var(--border-color-success);
  }
}

@media (monochrome) {
  :root {
    --result-accent: var(--color-primary);
  }
}

@media (max-height: 170px) {
  .optional-illustration {
    display: none;
  }
}
```

`color` 表示每个颜色分量的位数，`monochrome` 表示单色帧缓冲每像素的位数；不带数值时匹配对应值大于 0 的输出。`(color)` 只说明支持彩色，不能用来推断型号、尺寸或其他硬件能力。

颜色查询用于配色，宽高查询用于布局，`target` 用于区分展示容器。不要用 `_current`、`_blank` 或屏幕宽度判断是否为全彩；切换到 `_blank` 后仍需遵守全彩内容区域约束。上例只隐藏非必要插图，核心结果与操作必须保留。

如果当前环境没有可用的显示能力信息，颜色查询可能都不匹配；旧版运行时也可能不支持这些查询。查询外应保留可读的文字、主题色、关键操作与适合小视野的基础布局。

## 4. 仅在资源或逻辑需要时查询能力

仅调整颜色时使用 WXSS 即可。需要选择图片或数据展示方式时，可以在 Page 中使用 `window.matchMedia()`，并在卸载时移除监听：

```javascript
export default {
  data: {
    displayMode: 'unknown'
  },

  onLoad() {
    if (typeof window.matchMedia !== 'function') return;

    this.colorQuery = window.matchMedia('(color)');
    this.monoQuery = window.matchMedia('(monochrome)');
    this.updateDisplayMode = () => {
      const displayMode = this.colorQuery.matches ? 'color'
        : this.monoQuery.matches ? 'monochrome' : 'unknown';
      this.setData({ displayMode });
    };
    this.colorQuery.addEventListener('change', this.updateDisplayMode);
    this.monoQuery.addEventListener('change', this.updateDisplayMode);
    this.updateDisplayMode();
  },

  onUnload() {
    this.colorQuery?.removeEventListener('change', this.updateDisplayMode);
    this.monoQuery?.removeEventListener('change', this.updateDisplayMode);
  }
};
```

两项查询都不匹配时保留 `unknown`，不要把“没有匹配到彩色”直接当成单色。为 `unknown` 准备不依赖多色语义的资源和文案。上述查询在页面窗口中使用，Agent Worker 不提供 `window`。

## 5. 重新分配内容空间

按 448 宽、最高 170 的整体内容区域安排信息，卡片与 FOV 边缘的 10 间距也应包含在区域内。不要把 448 当成卡片内容宽度后继续向外叠加边距。

一个占满区域的卡片，预留左右与上下各 10 的外边距后，边框外盒最多为 428 × 150。卡片内部还需预留左右 10、上下 24 的内容间距与 2 的描边；标题、正文、图表和操作必须共同使用剩余空间。

先展示一个明确结果和必要操作。长文本使用摘要与详情、分页或可操作的滚动区域；不要通过缩小到 14 dp 以下、裁掉操作或减少规定内边距来塞入整页内容。

## 6. 完成双端验证

1. 使用相同业务数据检查单色与全彩展示，确认共用流程、空态、加载态、失败态和长文本均可用。
2. 检查全彩内容是否在 448 × 170 内，边距、字号、图标、描边与焦点反馈是否符合规范。
3. 检查图片、图表和 Canvas 的颜色与尺寸；确认关键状态没有仅靠颜色表达。
4. 在目标眼镜上验证语音、确认、返回与滚动，以及不同真实背景、光照下的可读性。
5. 修改后重新打包并更新眼镜资源，确认运行的是本次适配版本。

模拟调试可以检查布局与逻辑，透视显示、颜色可见性和设备交互仍以[真机调试](/AIUI/guide/debug-real_device_debug)结果为准。进一步排查见[全彩优化指南](/AIUI/guide/performance-full-color)和[常见问题](/AIUI/guide/faq)。
