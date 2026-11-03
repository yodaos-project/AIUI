# Full Color

`Full Color` is the AIUI visual specification for Rokid Color (Chinese name: 乐奇全彩眼镜). It combines white text, color accents, and clear outlines on a see-through display so users can read results quickly within a limited field of view.

Before adapting an existing agent, read the [Full-Color Glasses Adaptation Guide](/AIUI/guide/framework/full-color). Continue using [Monochrome](/AIUI/design/visual-monochrome) for monochrome devices; keep the dimensions, type scales, and fill rules of each specification separate.

## Core Design Constraints

Dimensions below use logical design units; text sizes use dp. In WXSS, use logical `px` values consistent with the theme rather than hardware physical pixels.

| Item | Requirement |
| --- | --- |
| Full-screen reference | 480 × 352 |
| Card container reference | Width 480; height adapts to content |
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

### Recommended Palette

These colors come from the design reference and are optional recommendations, not built-in theme token defaults. A family and column number form the color name, for example `cyan5`. Choose or override colors explicitly; the existing theme defaults remain as listed above.

| Family | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cyan | `#10434B` | `#196670` | `#238B95` | `#2EB0BB` | `#39D6E0` | `#5DE0E6` | `#83EAEC` | `#AAF2F3` | `#D4F9F9` | `#EEFCFC` |
| Green | `#164617` | `#216822` | `#2E8B2E` | `#3DAE3B` | `#4ED149` | `#6FDA69` | `#91E38B` | `#B4EDAF` | `#D9F6D6` | `#F0FAEF` |
| Violet | `#2F1866` | `#41248A` | `#5333AE` | `#6743D1` | `#7B56F5` | `#9277F7` | `#AB98F9` | `#C6BAFB` | `#E2DCFD` | `#F4F3FE` |
| Red | `#701822` | `#94242D` | `#B83239` | `#DB4345` | `#FF5855` | `#FF7E77` | `#FFA299` | `#FFC3BB` | `#FFE2DD` | `#FFF5F3` |
| Gray | `#222725` | `#343B38` | `#464E4B` | `#58625E` | `#6B7571` | `#88928E` | `#A7B0AC` | `#C6CDCA` | `#E6EAE8` | `#F9F9F9` |
| Yellow | `#512A09` | `#7A440F` | `#A26316` | `#CB851E` | `#FFCC66` | `#F5C150` | `#F8D47A` | `#FAE5A6` | `#FDF3D2` | `#FEFBED` |

The transparent white scale uses `#FFFFFF` with the following alpha values:

| Token | white1a | white2a | white3a | white4a | white5a | white6a | white7a | white8a | white9a | white10a | white11a | white12a | white |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Alpha | `0.04` | `0.08` | `0.12` | `0.16` | `0.24` | `0.3` | `0.4` | `0.5` | `0.6` | `0.7` | `0.8` | `0.9` | `1` |

| Role | Reference colors |
| --- | --- |
| Primary / secondary / tertiary / quaternary neutral | `gray10` / `gray7` / `gray5` / `gray3` |
| Primary accent | `cyan5`; weaker variants `cyan3`, `cyan2` |
| Error | `red5`; weaker variants `red3`, `red2` |
| Success | `green5`; weaker variants `green3`, `green2` |
| Warning | `yellow5`; weaker variants `yellow3`, `yellow2` |
| Violet base | `violet5` |

These hierarchy levels are design references, not a guarantee of readability on a see-through display. Darker grays and weak semantic colors may be hard to see; reserve them for nonessential details unless verified on the target device. White alpha below 0.4 is unsuitable for essential visible foreground; internal card borders remain an exception at 0.3. Keep essential content clear, pair color with text, icons, or shape, and verify against real backgrounds.

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

These are the current theme defaults; `--app-width` remains 448px. The new design reference is 480, so override it as needed and adapt to the available container. Override card borders to meet this specification: the outermost layout card has no border, and internal cards use a 1px white border at 30% alpha. Keep internal card focus and selection at 100% alpha. For example, apply these classes to the corresponding `card` elements in the full-color layout:

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

Use 480 × 352 as the full-screen reference. The card container reference width is 480; its height adapts to content and available space. The width describes the container, not its inner content: include FOV clearance, padding, and borders in the available space.

Adapt layouts to the actual container width and height; do not fix card height to 352. Budget for margins, borders, padding, titles, and actions together. Split, paginate, or scroll overflow content instead of simply hiding it with `overflow: hidden`.

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
