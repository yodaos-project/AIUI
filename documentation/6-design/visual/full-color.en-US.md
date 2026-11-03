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

These colors come from the design reference and are optional recommendations, not built-in theme token defaults. A family and column number form the color name, for example <span data-color-swatch="#39D6E0">cyan5</span>. Choose or override colors explicitly; the existing theme defaults remain as listed above.

| Family | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Cyan | <span data-color-swatch="#10434B">cyan1</span> | <span data-color-swatch="#196670">cyan2</span> | <span data-color-swatch="#238B95">cyan3</span> | <span data-color-swatch="#2EB0BB">cyan4</span> | <span data-color-swatch="#39D6E0">cyan5</span> | <span data-color-swatch="#5DE0E6">cyan6</span> | <span data-color-swatch="#83EAEC">cyan7</span> | <span data-color-swatch="#AAF2F3">cyan8</span> | <span data-color-swatch="#D4F9F9">cyan9</span> | <span data-color-swatch="#EEFCFC">cyan10</span> |
| Green | <span data-color-swatch="#164617">green1</span> | <span data-color-swatch="#216822">green2</span> | <span data-color-swatch="#2E8B2E">green3</span> | <span data-color-swatch="#3DAE3B">green4</span> | <span data-color-swatch="#4ED149">green5</span> | <span data-color-swatch="#6FDA69">green6</span> | <span data-color-swatch="#91E38B">green7</span> | <span data-color-swatch="#B4EDAF">green8</span> | <span data-color-swatch="#D9F6D6">green9</span> | <span data-color-swatch="#F0FAEF">green10</span> |
| Violet | <span data-color-swatch="#2F1866">violet1</span> | <span data-color-swatch="#41248A">violet2</span> | <span data-color-swatch="#5333AE">violet3</span> | <span data-color-swatch="#6743D1">violet4</span> | <span data-color-swatch="#7B56F5">violet5</span> | <span data-color-swatch="#9277F7">violet6</span> | <span data-color-swatch="#AB98F9">violet7</span> | <span data-color-swatch="#C6BAFB">violet8</span> | <span data-color-swatch="#E2DCFD">violet9</span> | <span data-color-swatch="#F4F3FE">violet10</span> |
| Red | <span data-color-swatch="#701822">red1</span> | <span data-color-swatch="#94242D">red2</span> | <span data-color-swatch="#B83239">red3</span> | <span data-color-swatch="#DB4345">red4</span> | <span data-color-swatch="#FF5855">red5</span> | <span data-color-swatch="#FF7E77">red6</span> | <span data-color-swatch="#FFA299">red7</span> | <span data-color-swatch="#FFC3BB">red8</span> | <span data-color-swatch="#FFE2DD">red9</span> | <span data-color-swatch="#FFF5F3">red10</span> |
| Gray | <span data-color-swatch="#222725">gray1</span> | <span data-color-swatch="#343B38">gray2</span> | <span data-color-swatch="#464E4B">gray3</span> | <span data-color-swatch="#58625E">gray4</span> | <span data-color-swatch="#6B7571">gray5</span> | <span data-color-swatch="#88928E">gray6</span> | <span data-color-swatch="#A7B0AC">gray7</span> | <span data-color-swatch="#C6CDCA">gray8</span> | <span data-color-swatch="#E6EAE8">gray9</span> | <span data-color-swatch="#F9F9F9">gray10</span> |
| Yellow | <span data-color-swatch="#512A09">yellow1</span> | <span data-color-swatch="#7A440F">yellow2</span> | <span data-color-swatch="#A26316">yellow3</span> | <span data-color-swatch="#CB851E">yellow4</span> | <span data-color-swatch="#FFCC66">yellow5</span> | <span data-color-swatch="#F5C150">yellow6</span> | <span data-color-swatch="#F8D47A">yellow7</span> | <span data-color-swatch="#FAE5A6">yellow8</span> | <span data-color-swatch="#FDF3D2">yellow9</span> | <span data-color-swatch="#FEFBED">yellow10</span> |

The transparent white scale uses white with the following alpha values:

| Token | Alpha | Color |
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

| Role | Reference colors |
| --- | --- |
| Primary / secondary / tertiary / quaternary neutral | <span data-color-swatch="#F9F9F9">gray10</span> / <span data-color-swatch="#A7B0AC">gray7</span> / <span data-color-swatch="#6B7571">gray5</span> / <span data-color-swatch="#464E4B">gray3</span> |
| Primary accent | <span data-color-swatch="#39D6E0">cyan5</span>; weaker variants <span data-color-swatch="#238B95">cyan3</span>, <span data-color-swatch="#196670">cyan2</span> |
| Error | <span data-color-swatch="#FF5855">red5</span>; weaker variants <span data-color-swatch="#B83239">red3</span>, <span data-color-swatch="#94242D">red2</span> |
| Success | <span data-color-swatch="#4ED149">green5</span>; weaker variants <span data-color-swatch="#2E8B2E">green3</span>, <span data-color-swatch="#216822">green2</span> |
| Warning | <span data-color-swatch="#FFCC66">yellow5</span>; weaker variants <span data-color-swatch="#A26316">yellow3</span>, <span data-color-swatch="#7A440F">yellow2</span> |
| Violet base | <span data-color-swatch="#7B56F5">violet5</span> |

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
