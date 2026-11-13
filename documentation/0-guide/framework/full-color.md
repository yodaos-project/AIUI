# 全彩眼镜适配指南

已经做了一个单色眼镜智能体，想让它也适合全彩眼镜使用？你通常可以保留已有的智能体定义、业务逻辑和数据服务，再根据显示能力和可用空间调整界面。

本指南面向乐奇全彩眼镜（Rokid Color），带你依次检查颜色、布局和真机效果。需要查阅具体设计要求时，可以参考[全彩视觉规范](/AIUI/design/visual-full-color)；遇到体验问题时，可以参考[全彩优化指南](/AIUI/guide/performance-full-color)。

## 开始前：全彩显示有什么不同？

全彩界面可以用颜色辅助区分状态和内容。例如，天气卡片可以用不同颜色强调气温或天气状态；图片与图标也可以保留彩色信息。

全彩眼镜仍是透视显示：纯黑不发光，在眼镜上呈透明效果。颜色应辅助阅读，关键状态还要有文字、图标或描边反馈；不要用大面积底色覆盖视野。

| 适配项 | 单色 Green | 全彩眼镜 |
| --- | --- | --- |
| 目标设备 | RokidGlasses1 / RokidGlasses2 | 乐奇全彩眼镜 |
| 全屏参考画布 | 480 × 352 | 480 × 352；卡片容器参考宽 480，高度自适应 |
| 颜色 | 单一绿色通道，通过透明度、描边与排版区分层级 | 白色正文与彩色强调，保留文字和形状提示 |
| 文字 | 使用单色规范的字号层级 | 14～24 dp，不直接照搬单色的小字号 |
| 卡片 | 单色描边与轻填充 | 透明容器、12 圆角；最外层无边框，内部卡片为 1px 白色内描边，默认 alpha 30%，选中 100% |

表中尺寸为设计逻辑尺寸。WXSS 示例使用 `px`；不要把硬件物理分辨率直接作为布局尺寸。设备名称用于说明适用范围，代码应按显示能力适配。全彩显示能力也不代表摄像头、传感器或交互方式完全相同，相关功能仍需在目标设备验证。

## 第一步：复用已有项目

增加全彩适配时，通常不需要重新创建智能体。可以在同一个项目中保留共用功能，为不同显示能力准备相应样式，打包为同一个 AIX，然后分别在单色和全彩设备上验证。提审与发布仍按[现有流程](/AIUI/guide/bundle-publish)完成。

把状态文案、任务结果和交互流程放在共用逻辑中，把配色、图标资源与紧凑布局放在展示层中。仅当产品定位或核心功能本身需要独立时，再考虑拆分智能体。

## 第二步：先使用主题颜色

主题 Token 可以理解为一组可复用的样式变量。内置全彩主题提供黑色页面背景、白色文字、彩色强调、透明卡片、字号与组件默认样式。页面优先复用 `--color-text-primary`、`--color-text-secondary`、`--color-primary`、`--card-border-color` 等 Token，减少写死单绿色和固定填充色。

使用主题后，还需要检查页面内联样式、自定义组件、Canvas 和图片：其中可能仍有写死的颜色、过小的文字或大面积填充。主题也不会自动调整所有内容以适应容器。关键 Token 见[全彩视觉规范](/AIUI/design/visual-full-color)。

## 第三步：分别调整颜色和布局

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

@media (max-height: 352px) {
  .optional-illustration {
    display: none;
  }
}
```

`color` 表示每个颜色分量的位数，`monochrome` 表示单色帧缓冲每像素的位数；不带数值时匹配对应值大于 0 的输出。`(color)` 只说明支持彩色，不能用来推断型号、尺寸或其他硬件能力。

颜色查询用于配色，宽高查询用于布局，`target` 用于区分展示容器。不要用 `_current`、`_blank` 或屏幕宽度判断是否为全彩；全屏和卡片都应根据实际可用尺寸适配。上例只隐藏非必要插图，核心结果与操作必须保留。

如果当前环境没有可用的显示能力信息，颜色查询可能都不匹配；旧版运行时也可能不支持这些查询。查询外应保留可读的文字、主题色、关键操作与适合小视野的基础布局。

## 第四步：需要切换资源时查询显示能力

如果只需要调整颜色，上面的 WXSS 规则即可。需要根据显示能力选择图片或数据展示方式时，可以在 Page 中使用 `window.matchMedia()`，并在卸载页面时移除监听：

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

## 第五步：检查内容空间

全屏参考尺寸为 480 × 352；卡片容器参考宽度为 480，高度随内容自适应。请根据实际容器宽高使用自适应布局，而非将卡片高度固定为 352。

480 是卡片容器参考宽度，不是内部内容宽度。FOV 边距、最外层卡片内边距和内部卡片描边都要计入可用空间。当前全彩主题的 `--app-width` 默认仍为 448px，需按实际容器覆盖，并验证布局。

先展示用户最需要的结果和操作。内容较长时，可以先显示摘要，再提供详情、分页或可操作的滚动区域。不要为了塞入全部内容，将文字缩小到 14 dp 以下、裁掉操作，或减少规定的内边距。

## 第六步：在两类设备上验证

1. 使用相同业务数据检查单色与全彩展示，确认共用流程、空态、加载态、失败态和长文本均可用。
2. 检查全屏与自适应高度的卡片在实际容器内是否可读，边距、字号、图标、描边与焦点反馈是否符合规范。
3. 检查图片、图表和 Canvas 的颜色与尺寸；确认关键状态没有仅靠颜色表达。
4. 在目标眼镜上验证语音、确认、返回与滚动，以及不同真实背景、光照下的可读性。
5. 修改后重新打包并更新眼镜资源，确认运行的是本次适配版本。

模拟调试可以检查布局与逻辑，透视显示、颜色可见性和设备交互仍以[真机调试](/AIUI/guide/debug-real_device_debug)结果为准。进一步排查见[全彩优化指南](/AIUI/guide/performance-full-color)和[常见问题](/AIUI/guide/faq)。
