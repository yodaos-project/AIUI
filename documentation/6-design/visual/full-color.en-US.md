# Full Color

`Full Color` is the AIUI visual specification for Rokid Color (Chinese name: 乐奇全彩眼镜). It combines white text, color accents, and clear outlines on a see-through display so users can read results quickly within a limited field of view.

Before adapting an existing agent, read the [Full-Color Glasses Adaptation Guide](/AIUI/guide/framework/full-color). Continue using [Monochrome](/AIUI/design/visual-monochrome) for monochrome devices; keep the dimensions, type scales, and fill rules of each specification separate.

## Core Design Constraints

Dimensions below use logical design units; text sizes use dp. In WXSS, use logical `px` values consistent with the theme rather than hardware physical pixels.

| Item | Requirement |
| --- | --- |
| Content area | Width 448, maximum height 352; content and outer margins fit within this area |
| Text | 14–24 dp |
| Icons | At least 12 × 12 |
| Background | Theme background always pure black `#000000`; prefer transparent cards and controls |
| Large fills | Avoid large filled backgrounds; build structure with whitespace and outlines |
| Visible content alpha | At least 40% recommended |
| Outermost card | No border in any state; retain radius 12 and existing spacing |
| Internal cards | Radius 12, 1px white inside stroke at alpha 30% |
| Selected or focused internal cards | White stroke at alpha 100%, with width remaining 1px |
| Card padding | 10 horizontally and 24 vertically between content and border |
| FOV clearance | 10 between cards and FOV edges |
| Dividers | Width 1, alpha 40% |

“30% opacity” here means a color alpha of `0.3`, or `rgba(255,255,255,0.3)` for the default internal card border. Internal card borders are exempt from the recommended 40% foreground minimum, as are transparent containers and black backgrounds. Text and icons retain the recommended minimum; dividers remain at 40% alpha.

## Black and See-Through Rendering

Pure black appears transparent on the glasses. It cannot act as an opaque panel that blocks the real world. Do not use black text, or low-brightness dark gray, dark blue, and similar colors for essential text, icons, or lines.

A black page background and transparent cards form the baseline. Prefer white or clearly visible bright colors for essential content, and verify them against bright and complex real backgrounds. Contrast in a black desktop preview does not establish readability on the glasses.

## Color System

The following values are key defaults in the built-in full-color theme. Semantic colors support status communication; errors, success, and selection should retain text, icon, or shape cues.

| Token | Use | Default |
| --- | --- | --- |
| `--color-background` | Page background | `#000000` |
| `--color-surface` / `--color-surface-highlight` | Container and highlighted-container backgrounds | `transparent` |
| `--color-text-primary` | Body and essential text | `#ffffff` |
| `--color-text-secondary` | Secondary text | `rgba(255,255,255,0.6)` |
| `--color-primary` | Primary accent | `#66b3ff` |
| `--color-secondary` / `--border-color-success` | Secondary accent and success | `#80e6b0` |
| `--border-color-danger` | Error indication | `#ff8080` |
| `--border-color-warning` | Warning indication | `#ffd966` |
| `--border-color-highlight` | Category accent | `#c4a6ff` |
| `--border-color-default` | Default control borders | `rgba(255,255,255,0.6)` |
| `--border-color-muted` | Muted borders and dividers | `rgba(255,255,255,0.4)` |
| `--border-color-strong` | Selected and focused borders | `#ffffff` |

Set color alpha on individual text or borders instead of applying `opacity: 0.4` to an entire card. Parent opacity also weakens child content and can reduce an already translucent foreground below the readability baseline.

## Typography and Icons

| Level | Suggested Size | Theme Value |
| --- | --- | --- |
| Major heading | 24 | `--font-size-max`; used by `header` by default |
| Card title | 20 | `--card-title-font-size` |
| Body and actions | 16 | Default for `text`, `p`, inputs, and buttons |
| Supporting information | 14 | `--card-footer-font-size`; minimum size `--font-size-min` |
| Icons | Default 16, minimum 12 × 12 | `--icon-size-min` |

These tokens and defaults do not automatically correct all custom content. Check explicitly styled text, text embedded in images, and Canvas annotations. Reduce information and split the flow when content does not fit, while preserving minimum text and icon sizes.

## Cards, Spacing, and Focus

| Token | Current Theme Default (Override Card Borders Below) |
| --- | --- |
| `--app-width` | `448px` |
| `--card-margin` | `10px` |
| `--card-padding` | `10px`, horizontal content spacing |
| `--card-padding-y` | `24px`, vertical content spacing |
| `--card-radius` | `12px` |
| `--card-border-width` | `2px` |
| `--card-border-color` | White at alpha 60% |
| `--card-focus-border-color` | White at alpha 100% |
| `--card-divider-width` / `--card-divider-color` | `1px` / white at alpha 40% |

These are the current theme defaults. Override card borders to meet this specification: the outermost layout card has no border, and internal cards use a 1px white border at 30% alpha. Keep internal card focus and selection at 100% alpha. For example, apply these classes to the corresponding `card` elements in the full-color layout:

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

After the 10-unit FOV clearance, the borderless outermost card is at most 428 × 332. Its 10 horizontal and 24 vertical padding leave 408 × 284 for content. Internal card borders and padding also consume that shared space.

The maximum height of 352 is a content design constraint, not automatic clipping applied by the theme. Budget for margins, borders, padding, titles, and actions together. Split, paginate, or scroll overflow content instead of simply hiding it with `overflow: hidden`.

Apply visible `:focus` and `:host-focus` styling to interactive internal cards; keep the outermost layout card borderless. Maintain business selection state separately, and do not rely only on hover or color changes. See the [Focus System](/AIUI/framework/open-agent-format-page-focus).

## Component and Asset Baselines

- **Cards, buttons, and inputs**: Prefer transparent backgrounds and white text. Keep the outermost card borderless, use the internal card outline above, and retain existing button and input outlines. Make interactive focus visible.
- **Images and icons**: Prefer clear silhouettes and recognizable subjects. Use transparent backgrounds for decorative assets, and avoid large background blocks or dark details.
- **Charts**: Prefer lines and outline shapes. Support colors with labels, units, and legends; avoid large solid areas.
- **Maps**: Prioritize routes, positions, and essential labels instead of filling the field of view with colored surfaces.
- **Errors and empty states**: Explain the state and next action briefly, with icons or outlines as well as color.

## Delivery Checks

Check the content area, text, icons, padding, margins, and focus against the values above. Inspect black and dark details, compounded opacity, and large fills. Finally, verify reading, confirmation, back navigation, and scrolling on the target glasses under different lighting conditions and real backgrounds.

For implementation, see the [Full-Color Glasses Adaptation Guide](/AIUI/guide/framework/full-color). For troubleshooting and refinement, see the [Full-Color Optimization Guide](/AIUI/guide/performance-full-color).

## Design Source

The complete design.md-format source is [design/fullcolor/design.md](https://github.com/yodaos-project/AIUI/blob/main/design/fullcolor/design.md). It includes YAML token definitions, component patterns, states, theme mapping, and acceptance requirements. Keep the source and both language versions of this page aligned when changing the specification.

See [preview-color.html](https://github.com/yodaos-project/AIUI/blob/main/design/fullcolor/preview-color.html) for the full-color visual preview. Download it and open it directly in a browser; no build step is required.
