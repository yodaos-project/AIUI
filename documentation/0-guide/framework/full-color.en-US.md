# Full-Color Glasses Adaptation Guide

One AIUI agent can serve both monochrome and full-color glasses. Reuse the agent definition, business logic, Pages, Widgets, and data services, then adapt styles, assets, and information density to the display capability and available space.

This guide covers Rokid Color (Chinese name: 乐奇全彩眼镜). Follow the workflow here, then see the [Full-Color Visual Guidelines](/AIUI/design/visual-full-color) and [Full-Color Optimization Guide](/AIUI/guide/performance-full-color).

## What Full Color Enables

Full color lets you use different hues to support status, category, and data distinctions, such as chart series, task outcomes, and key values. Images and icons can also retain color information.

Full-color glasses still use a see-through display: pure black emits no light and appears transparent on the glasses. Use color to support reading, and retain text, icons, or outlines for critical states. Avoid large filled backgrounds across the field of view.

| Adaptation Area | Monochrome Green | Full-Color Glasses |
| --- | --- | --- |
| Target devices | RokidGlasses1 / RokidGlasses2 | Rokid Color |
| Full-screen reference | 480 × 352 | 480 × 352; card container reference width 480, adaptive height |
| Color | One green channel; hierarchy through opacity, outlines, and typography | White body text with color accents; retain text and shape cues |
| Text | Follow the monochrome type scale | 14–24 dp; do not carry over smaller monochrome text sizes |
| Cards | Monochrome outlines and light fills | Transparent containers, radius 12; borderless outermost card, internal cards with a 1px white inside stroke at 30% alpha, selected 100% |

Dimensions in the table are logical design units. WXSS examples use `px`; do not use the hardware's physical resolution directly as layout dimensions. Device names describe the scope; code should adapt to display capabilities. Full color does not imply identical cameras, sensors, or input methods, so verify those features on each target device.

## 1. Reuse the Existing Agent

Adding full-color support does not require a separate agent. Prefer shared functionality and display variants in one project, packaged into one AIX, with separate monochrome and full-color validation. Follow the [existing submission and publishing workflow](/AIUI/guide/bundle-publish).

Keep status text, task results, and interaction flows in shared logic. Keep palettes, icon assets, and compact layouts in the presentation layer. Consider a separate agent when the product positioning or core functionality itself needs to be independent.

## 2. Prefer Theme Tokens

The built-in full-color theme provides a black page background, white text, color accents, transparent cards, and default typography and component styles. Reuse tokens such as `--color-text-primary`, `--color-text-secondary`, `--color-primary`, and `--card-border-color` to reduce hardcoded green colors and fixed fills.

Theme defaults do not complete the adaptation automatically. Check inline styles, custom components, Canvas content, and images for fixed colors, small text, and large fills. The theme also does not automatically adapt arbitrary content to the container. See the [Full-Color Visual Guidelines](/AIUI/design/visual-full-color) for key tokens.

## 3. Handle Color and Layout Separately

AIUI runtime versions that support display capability queries accept `(color)` and `(monochrome)` in WXSS. Keep shared rules outside queries, then add color variants:

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

`color` is the number of bits per color component; `monochrome` is the number of bits per pixel in a monochrome framebuffer. Without a value, each query matches an output whose corresponding value is greater than 0. `(color)` indicates color support; it does not identify a model, dimensions, or other hardware features.

Use color queries for palettes, width and height queries for layout, and `target` for the presentation container. Do not infer full color from `_current`, `_blank`, or screen width. Adapt both full-screen and card layouts to the actual available dimensions. The example hides only an optional illustration; retain core results and actions.

Both color queries may fail to match when display capability information is unavailable. Older runtimes may also lack these queries. Outside the queries, retain readable text, theme colors, essential actions, and a base layout suitable for a small field of view.

## 4. Query Capabilities Only When Assets or Logic Need Them

Use WXSS when only colors change. To select images or a data presentation, a Page can use `window.matchMedia()`. Remove listeners when the Page unloads:

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

Keep `unknown` when neither query matches. A failure to match color must not automatically mean monochrome. Provide assets and text for `unknown` that do not depend on multiple hues. These queries run in the page window; Agent Workers do not provide `window`.

## 5. Reallocate Content Space

Use 480 × 352 as the full-screen reference. The card container reference width is 480, with height adapting to its content. Make both layouts responsive to the actual container rather than fixing card height to 352.

The 480 reference describes the card container, not its inner content width. Include FOV clearance, outer card padding, and internal card borders in the available space. The current full-color theme still defaults `--app-width` to 448px; override it as needed for the actual container and verify the layout.

Show a clear result and essential actions first. Use summaries with details, pagination, or an operable scroll region for longer text. Do not fit an entire page by shrinking text below 14 dp, clipping actions, or reducing the specified padding.

## 6. Validate Both Display Types

1. Check monochrome and full-color presentations with the same business data, including shared flows, empty states, loading, failures, and long text.
2. Verify that full-screen and adaptive-height card content is readable in its actual container and follows the spacing, text, icon, outline, and focus requirements.
3. Check colors and dimensions in images, charts, and Canvas content. Ensure critical states do not rely on color alone.
4. On the target glasses, verify voice input, confirmation, back navigation, scrolling, and readability against different real backgrounds and lighting conditions.
5. Repackage and update the glasses resources after changes, and confirm that the device is running the adapted version.

Simulation helps check layout and logic. Use [Real-Device Debugging](/AIUI/guide/debug-real_device_debug) to assess see-through rendering, color visibility, and device interaction. For further troubleshooting, see the [Full-Color Optimization Guide](/AIUI/guide/performance-full-color) and [FAQ](/AIUI/guide/faq).
