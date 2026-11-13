# Full-Color Glasses Adaptation Guide

Already have an agent for monochrome glasses and want it to work well on full-color glasses too? You can usually keep the agent description, application logic, and data services, then adapt the interface to the display capability and available space.

This guide covers Rokid Color (Chinese name: 乐奇全彩眼镜) and walks through color, layout, and device testing. For specific design requirements, see the [Full-Color Visual Guidelines](/AIUI/design/visual-full-color); for experience improvements, see the [Full-Color Optimization Guide](/AIUI/guide/performance-full-color).

## Before You Start: What Changes with Full Color?

Full color can help distinguish states and content. For example, a weather card can use colors to highlight temperature or conditions, while images and icons can retain their color.

Full-color glasses still use a see-through display: pure black emits no light and appears transparent on the glasses. Use color to support reading, and retain text, icons, or outlines for critical states. Avoid large filled backgrounds across the field of view.

| Adaptation Area | Monochrome Green | Full-Color Glasses |
| --- | --- | --- |
| Target devices | RokidGlasses1 / RokidGlasses2 | Rokid Color |
| Full-screen reference | 480 × 352 | 480 × 352; card container reference width 480, adaptive height |
| Color | One green channel; hierarchy through opacity, outlines, and typography | White body text with color accents; retain text and shape cues |
| Text | Follow the monochrome type scale | 14–24 dp; do not carry over smaller monochrome text sizes |
| Cards | Monochrome outlines and light fills | Transparent containers, radius 12; borderless outermost card, internal cards with a 1px white inside stroke at 30% alpha, selected 100% |

Dimensions in the table are logical design units. WXSS examples use `px`; do not use the hardware's physical resolution directly as layout dimensions. Device names describe the scope; code should adapt to display capabilities. Full color does not imply identical cameras, sensors, or input methods, so verify those features on each target device.

## Step 1: Reuse Your Project

Adding full-color support usually does not require a new agent. Keep shared functionality in one project, provide styles for the different display capabilities, package one AIX, and test separately on monochrome and full-color devices. Follow the [existing submission and publishing workflow](/AIUI/guide/bundle-publish).

Keep status text, task results, and interaction flows in shared logic. Keep palettes, icon assets, and compact layouts in the presentation layer. Consider a separate agent when the product positioning or core functionality itself needs to be independent.

## Step 2: Start with Theme Colors

Theme tokens are reusable style variables. The built-in full-color theme provides a black page background, white text, color accents, transparent cards, and default typography and component styles. Reuse tokens such as `--color-text-primary`, `--color-text-secondary`, `--color-primary`, and `--card-border-color` to reduce hardcoded green colors and fixed fills.

After applying the theme, check inline styles, custom components, Canvas content, and images: they may still contain hardcoded colors, text that is too small, or large filled areas. The theme also does not automatically fit all content to its container. See the [Full-Color Visual Guidelines](/AIUI/design/visual-full-color) for key tokens.

## Step 3: Adjust Color and Layout Separately

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

## Step 4: Query Display Capabilities When Choosing Assets

The WXSS rules above are enough when only colors change. To select images or a data presentation based on display capability, a Page can use `window.matchMedia()`. Remove listeners when the Page unloads:

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

## Step 5: Check Content Space

Use 480 × 352 as the full-screen reference. The card container reference width is 480, with height adapting to its content. Make both layouts responsive to the actual container rather than fixing card height to 352.

The 480 reference describes the card container, not its inner content width. Include FOV clearance, outer card padding, and internal card borders in the available space. The current full-color theme still defaults `--app-width` to 448px; override it as needed for the actual container and verify the layout.

Show the result and actions the user needs most first. For longer content, provide a summary followed by details, pagination, or an operable scroll region. Do not fit everything by shrinking text below 14 dp, clipping actions, or reducing the specified padding.

## Step 6: Test Both Display Types

1. Check monochrome and full-color presentations with the same business data, including shared flows, empty states, loading, failures, and long text.
2. Verify that full-screen and adaptive-height card content is readable in its actual container and follows the spacing, text, icon, outline, and focus requirements.
3. Check colors and dimensions in images, charts, and Canvas content. Ensure critical states do not rely on color alone.
4. On the target glasses, verify voice input, confirmation, back navigation, scrolling, and readability against different real backgrounds and lighting conditions.
5. Repackage and update the glasses resources after changes, and confirm that the device is running the adapted version.

Simulation helps check layout and logic. Use [Real-Device Debugging](/AIUI/guide/debug-real_device_debug) to assess see-through rendering, color visibility, and device interaction. For further troubleshooting, see the [Full-Color Optimization Guide](/AIUI/guide/performance-full-color) and [FAQ](/AIUI/guide/faq).
