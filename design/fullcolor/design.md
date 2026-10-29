---
version: alpha
name: Rokid AIUI Full-Color Glasses Interface
target:
  devices: ["Rokid Color"]
  device-names:
    en-US: "Rokid Color"
    zh-CN: "乐奇全彩眼镜"
  display: "full-color transparent display"
  reference-canvas: "448x170"
  units: "logical px in WXSS; text sizes correspond to design dp"

description: >
  AIUI's full-color visual language for transparent glasses. White text,
  bright semantic accents, transparent containers, and clear inside strokes
  keep essential results readable in a compact field of view. Pure black
  emits no light and remains transparent to the physical environment.

constraints:
  - "Fit content and outer margins within a width of 448px and a maximum height of 170px."
  - "Keep text between 14dp and 24dp; do not shrink text to fit more content."
  - "Icons must be at least 12x12px."
  - "Do not use large filled backgrounds. Prefer transparent containers and outlines."
  - "Visible foreground alpha should be at least 0.4; transparent surfaces and the black background are exempt."
  - "Cards use a 12px radius and a 2px inside stroke at 0.6 alpha by default."
  - "Selected or focused card strokes use 1.0 alpha while retaining the same 2px width."
  - "Card content padding is 10px horizontally and 24px vertically."
  - "Keep 10px between cards and the FOV edges, included in the overall content area."
  - "Dividers use a 1px stroke at 0.4 alpha, matching muted outer borders."
  - "The theme background always remains pure black. Black cannot obscure the physical environment."
  - "Avoid low-brightness foreground colors; critical states also need text, icons, or shape cues."

colors:
  primary: "#66b3ff"
  primary-60: "rgba(102,179,255,0.6)"
  primary-40: "rgba(102,179,255,0.4)"
  secondary: "#80e6b0"
  background: "#000000"
  surface: transparent
  surface-highlight: transparent
  text-primary: "#ffffff"
  text-secondary: "rgba(255,255,255,0.6)"
  line-default: "rgba(255,255,255,0.6)"
  line-muted: "rgba(255,255,255,0.4)"
  line-strong: "#ffffff"
  success: "#80e6b0"
  danger: "#ff8080"
  warning: "#ffd966"
  highlight: "#c4a6ff"

opacity:
  foreground-min: 0.4
  secondary: 0.6
  default-stroke: 0.6
  selected-stroke: 1.0
  divider: 0.4

typography:
  display:
    fontFamily: "sans-serif"
    fontSize: 24px
    fontWeight: 600
  heading:
    fontFamily: "sans-serif"
    fontSize: 20px
    fontWeight: 600
  body:
    fontFamily: "sans-serif"
    fontSize: 16px
    fontWeight: 400
  label:
    fontFamily: "sans-serif"
    fontSize: 16px
    fontWeight: 500
  caption:
    fontFamily: "sans-serif"
    fontSize: 14px
    fontWeight: 400
  data:
    fontFamily: "monospace"
    fontSize: 24px
    fontWeight: 500

rounded:
  sm: 12px
  md: 12px

spacing:
  sm: 8px
  md: 12px
  lg: 18px
  xl: 24px
  fov-inset: 10px
  card-padding-x: 10px
  card-padding-y: 24px

border-width:
  thin: 1px
  default: 2px
  strong: 2px

icons:
  size-default: 16px
  size-min: 12px

components:
  app-canvas:
    description: "Content area including card margins; safeInsets describe those same margins, not additional padding."
    width: 448px
    maxHeight: 170px
    safeInsetX: "{spacing.fov-inset}"
    safeInsetY: "{spacing.fov-inset}"
    backgroundColor: "{colors.background}"

  card:
    description: "Outer border box fits inside the FOV clearance; children share its inner space."
    maxWidth: 428px
    maxHeight: 150px
    boxSizing: border-box
    margin: "{spacing.fov-inset}"
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.line-default}"
    borderWidth: "{border-width.default}"
    borderAlignment: inside
    rounded: "{rounded.md}"
    paddingX: "{spacing.card-padding-x}"
    paddingY: "{spacing.card-padding-y}"
    textColor: "{colors.text-primary}"
    titleTypography: "{typography.heading}"
    bodyTypography: "{typography.body}"
    footerTypography: "{typography.caption}"

  card-selected:
    description: "Keep geometry stable when business selection or focus is shown."
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.line-strong}"
    borderWidth: "{border-width.default}"
    borderAlignment: inside
    rounded: "{rounded.md}"

  divider:
    description: "Muted structural separator; do not weaken it below the foreground baseline."
    color: "{colors.line-muted}"
    strokeWidth: "{border-width.thin}"

  button:
    description: "Outlined action with a readable label and visible focus."
    backgroundColor: transparent
    borderColor: "{colors.line-default}"
    borderWidth: "{border-width.default}"
    focusBorderColor: "{colors.line-strong}"
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    paddingX: 16px
    paddingY: 10px

  text-input:
    description: "Transparent field; keep placeholder and entered text legible."
    backgroundColor: transparent
    borderColor: "{colors.line-default}"
    borderWidth: "{border-width.default}"
    textColor: "{colors.text-primary}"
    placeholderColor: "{colors.text-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    paddingX: 10px
    paddingY: 10px

  textarea:
    description: "Multi-line field following the input treatment; budget its height explicitly."
    backgroundColor: transparent
    borderColor: "{colors.line-default}"
    borderWidth: "{border-width.default}"
    textColor: "{colors.text-primary}"
    placeholderColor: "{colors.text-secondary}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    paddingX: 10px
    paddingY: 10px

  error-state:
    description: "Explicit error label and icon with an actionable recovery path."
    backgroundColor: transparent
    borderColor: "{colors.line-muted}"
    borderWidth: "{border-width.default}"
    textColor: "{colors.text-primary}"
    accentColor: "{colors.danger}"
    typography: "{typography.caption}"
    rounded: "{rounded.sm}"
    iconSize: 24px

  icon:
    description: "Clear silhouette without an opaque background block."
    size: "{icons.size-default}"
    minWidth: "{icons.size-min}"
    minHeight: "{icons.size-min}"
    color: "{colors.text-primary}"

  chart-container:
    description: "Prefer lines and outlines; labels and units share the available content area."
    backgroundColor: transparent
    fillStyle: outline-only
    strokeColor: "{colors.primary}"
    strokeWidth: "{border-width.default}"
    gridColor: "{colors.line-muted}"
    labelColor: "{colors.text-primary}"
    labelTypography: "{typography.caption}"

  map:
    description: "Routes, positions, and essential labels with minimal filled surfaces."
    backgroundColor: "{colors.background}"
    landColor: transparent
    waterColor: "{colors.primary-40}"
    roadColor: "{colors.text-primary}"
    buildingColor: transparent
    boundaryColor: "{colors.line-default}"
---

# Rokid AIUI Full-Color Glasses Interface

## Overview

This specification defines the full-color AIUI design language for **Rokid Color** (Chinese name: **乐奇全彩眼镜**). These are the English and Chinese names of the same device. Content fits within a logical width of **448** and maximum height of **170**, including its outer clearance.

The document follows the same YAML token and Markdown structure as the [monochrome specification](../monochrome/design-system-green.md). Its values are specific to full-color glasses: do not import monochrome dimensions, small text, low-alpha treatments, or border rules into this system.

The front matter describes design tokens and component patterns. Curly-brace references resolve within this document; they are not WXSS syntax or runtime configuration. The token mapping below identifies the corresponding theme variables. Typography weights are design recommendations rather than automatic runtime defaults.

## 1. Design Principles

- **Results first.** Show the main result and essential action before supporting detail.
- **Transparent surfaces.** Keep the theme background black and containers transparent; use outlines and whitespace instead of large color fills.
- **Readable foreground.** Prefer white text and bright accents that remain visible against changing real backgrounds.
- **Color with another cue.** Pair semantic colors with labels, icons, values, or shapes. Color alone must not carry a critical state.
- **Stable interaction.** Make focus and selection visible without changing card dimensions or moving surrounding content.

## 2. Canvas and Layout

| Item | Requirement |
| --- | --- |
| Overall content area | Width 448; maximum height 170 |
| Clearance to FOV edges | 10 on every side |
| Maximum card outer border box | 428 × 150 after the outer clearance |
| Card padding | 10 horizontally, 24 vertically |
| Card radius | 12 |
| Inside stroke | 2 |

Use logical `px` in WXSS consistently with the theme; text sizes correspond to design dp. Hardware physical pixel dimensions are not layout dimensions.

Include margins, borders, padding, headings, body content, and actions in the same height budget. In a standard card that fills the available area, a 150-high border box with 24 padding and a 2 border on each vertical side leaves **98** for all inner content. A 98-high chart therefore leaves no extra vertical space for a title or footer in that card.

The canvas safe insets and card outer margins describe the same 10-unit clearance. Apply that clearance once; do not add another canvas padding layer around an already-margined card.

The 170 maximum is a design constraint. Theme defaults do not automatically cap or paginate arbitrary content. Use a summary and details, pagination, or an operable scroll region when content exceeds the budget. Preserve essential actions and the minimum type size; do not solve overflow by clipping required content.

## 3. Color and Opacity

| Design Token | Value | Role |
| --- | --- | --- |
| `{colors.background}` | `#000000` | Transparent display floor |
| `{colors.surface}` | `transparent` | Cards and local containers |
| `{colors.text-primary}` | `#ffffff` | Essential text and values |
| `{colors.text-secondary}` | `rgba(255,255,255,0.6)` | Supporting text and placeholders |
| `{colors.primary}` | `#66b3ff` | Primary accent and chart outlines |
| `{colors.secondary}` / `{colors.success}` | `#80e6b0` | Secondary accent and success |
| `{colors.danger}` | `#ff8080` | Error accent |
| `{colors.warning}` | `#ffd966` | Warning accent |
| `{colors.highlight}` | `#c4a6ff` | Category emphasis |
| `{colors.line-default}` | White at alpha 60% | Default card and control outline |
| `{colors.line-muted}` | White at alpha 40% | Muted outline and divider |
| `{colors.line-strong}` | White at alpha 100% | Selected and focused outline |

Pure black emits no light and appears transparent on the glasses. It cannot form an opaque panel that hides the physical environment. Do not use black or low-brightness colors for essential foreground content.

An alpha of 40% means `0.4` opacity. Keep visible foreground at or above this recommended baseline. Default card strokes remain at 60%, selected strokes at 100%, and dividers and muted outlines at 40%. Transparent containers and the black display floor are intentional exceptions.

Set alpha on individual colors instead of dimming an entire parent container. Parent opacity can weaken text, icons, and already-translucent borders together. Do not add large colored surfaces to compensate for poor foreground readability.

## 4. Typography and Icons

| Token | Size | Recommended Weight | Use |
| --- | --- | --- | --- |
| `{typography.display}` | 24 | 600 | Main result or heading |
| `{typography.heading}` | 20 | 600 | Card title |
| `{typography.body}` | 16 | 400 | Body text and fields |
| `{typography.label}` | 16 | 500 | Actions and labels |
| `{typography.caption}` | 14 | 400 | Supporting information and units |
| `{typography.data}` | 24 | 500 | Key numeric value |

Keep all readable text between **14 and 24 dp**, including chart labels, placeholders, errors, metadata, and text embedded in images or Canvas. Use system `sans-serif` for UI text and optional `monospace` for data. Do not require a separate font download for essential content.

Icons default to **16 × 16** and must be at least **12 × 12**. Prefer clear silhouettes, avoid dark details or large background blocks, and pair unfamiliar icons with text. Minimum icon dimensions are visual requirements, not a definition of the interaction target size.

## 5. Components and States

### Card and Selection

Use a transparent card with a 12 radius and 2 inside stroke at 60% alpha. Keep the specified horizontal and vertical padding. Selected or focused cards raise stroke alpha to 100% while keeping geometry stable.

Focus represents the current interaction target; selection represents business state. Maintain them separately when the task needs both. Built-in cards provide focus styling through `:focus` and `:host-focus`; custom controls need equivalent visible feedback. Hover must not be the only way to discover an action or its state.

### Divider

Use a 1 stroke at 40% alpha, matching the muted outer-border tier. The default card border remains at 60%; a divider does not inherit the stronger selected-border alpha.

### Button and Input

Prefer transparent backgrounds, a clear 2 outline, and white readable text. Buttons use 10 vertical and 16 horizontal padding; text fields use 10 on both axes. Keep labels and placeholders readable, with explicit focus indication for custom interactions.

### Status, Error, and Empty State

Combine a short label with an icon or outline cue. Use semantic colors as supporting accents. Explain what happened and the next useful action. Disabled or unavailable states need explicit text or shape cues instead of fading essential content below the foreground baseline.

### Images, Charts, and Maps

- Prepare images for their displayed size, remove irrelevant backgrounds, and avoid small embedded text.
- Prefer chart lines and outlines over large solid areas. Retain labels, units, and a clear way to distinguish series beyond color alone.
- Keep routes, positions, and necessary map labels visible while reducing filled land and building regions.
- Review Canvas drawings and image pixels separately; CSS theme tokens do not automatically recolor or reflow them.

## 6. Motion and Interaction

Use motion to explain a change, indicate progress, or support an action. Keep the main result readable while animation runs. Avoid perpetual decorative motion, full-field flashes, large glows, and effects that compete with the physical scene.

Verify confirmation, back navigation, scrolling, and voice interaction on each target device. Full-color display support does not establish identical input mappings or other hardware capabilities. Pause unnecessary updates and media while hidden, and release listeners and resources when no longer needed.

## 7. Theme Token Mapping

| Design Token | Theme Variable |
| --- | --- |
| `{components.app-canvas.width}` | `--app-width` |
| `{colors.background}` | `--color-background` |
| `{colors.surface}` / `{colors.surface-highlight}` | `--color-surface` / `--color-surface-highlight` |
| `{colors.text-primary}` / `{colors.text-secondary}` | `--color-text-primary` / `--color-text-secondary` |
| `{colors.primary}` / `{colors.primary-60}` / `{colors.primary-40}` | `--color-primary` / `--color-primary-60` / `--color-primary-40` |
| `{colors.secondary}` | `--color-secondary` |
| `{colors.success}` / `{colors.danger}` / `{colors.warning}` / `{colors.highlight}` | `--border-color-success` / `--border-color-danger` / `--border-color-warning` / `--border-color-highlight` |
| `{colors.line-default}` / `{colors.line-muted}` / `{colors.line-strong}` | `--border-color-default` / `--border-color-muted` / `--border-color-strong` |
| `{components.card.borderColor}` / `{components.card-selected.borderColor}` | `--card-border-color` / `--card-focus-border-color` |
| `{spacing.fov-inset}` | `--card-margin` |
| `{spacing.card-padding-x}` / `{spacing.card-padding-y}` | `--card-padding` / `--card-padding-y` |
| `{rounded.md}` | `--card-radius` |
| `{border-width.default}` / `{border-width.thin}` | `--border-width-default` / `--border-width-thin` |
| `{typography.display.fontSize}` / `{typography.caption.fontSize}` | `--font-size-max` / `--font-size-min` |
| `{typography.heading.fontSize}` | `--card-title-font-size` |
| `{icons.size-min}` | `--icon-size-min` |

The theme supplies defaults. Custom typography, asset pixels, Canvas labels, maximum content height, and the meaning of selection still require explicit design and implementation checks.

## 8. Do's and Don'ts

### Do

- Keep content, card clearance, and actions inside the 448 × 170 budget.
- Use white readable text, a few bright accents, transparent containers, and clear outlines.
- Preserve 14–24 dp text, minimum 12 × 12 icons, and the specified card padding.
- Keep focus and selection visible through 100% stroke alpha.
- Split complex results into an actionable summary and accessible detail.
- Validate with long content, error states, bright backgrounds, and real device interaction.

### Don't

- Copy the monochrome canvas, smaller type scale, low-alpha fills, or border rules into full color.
- Use pure black as foreground content or rely on a black panel to block the real world.
- Use large solid backgrounds, dark critical details, or color-only status signals.
- Fade an entire card or hide overflow to make a dense page appear to fit.
- Stack a full-height chart, heading, long body, and footer into the same card budget.
- Treat a desktop black-background preview as proof of optical readability.

## 9. Acceptance Checklist

- [ ] Content and margins fit a width of 448 and a maximum height of 170.
- [ ] Cards retain 10 FOV clearance, 10 horizontal padding, and 24 vertical padding.
- [ ] Cards use a 12 radius and 2 inside stroke: 60% alpha by default, 100% when selected or focused.
- [ ] Dividers use 1 at 40% alpha, matching muted outlines.
- [ ] Text stays within 14–24 dp and icons are at least 12 × 12.
- [ ] Background is pure black, containers are transparent, and no large filled surface dominates the view.
- [ ] Essential foreground is bright enough, with at least the recommended 40% alpha and no unintended parent-opacity reduction.
- [ ] Critical states include text, icons, or shape cues alongside color.
- [ ] Long, empty, loading, failure, and retry states preserve readable content and reachable actions.
- [ ] Target-device checks cover real backgrounds, lighting, confirmation, back navigation, scrolling, and voice interaction.

## Related Documentation

- [Interactive HTML Preview](./preview-color.html)
- [Full-Color Visual Guidelines — English](../../documentation/6-design/visual/full-color.en-US.md)
- [Full-Color Visual Guidelines — Chinese](../../documentation/6-design/visual/full-color.md)
- [Adaptation Guide](../../documentation/0-guide/full-color.en-US.md)
- [Optimization Guide](../../documentation/0-guide/performance/full-color.en-US.md)
- [Monochrome Design Source](../monochrome/design-system-green.md)
