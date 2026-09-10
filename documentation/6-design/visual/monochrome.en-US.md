# Monochrome

`Monochrome` describes the AIUI design language for single-color display hardware.

These devices can render only one luminous channel over pure black, so they cannot rely on multi-color semantics for hierarchy, warning, highlighting, or data differentiation. Instead, hierarchy must be expressed through opacity, outlines, type weight, spacing, and layout structure.

## Target Devices

| Variant | Target Devices | Status |
| --- | --- | --- |
| `Green` | RokidGlasses1 / RokidGlasses2 | Active |

At the moment, `Green` is the only public monochrome spec.

## Why A Separate Monochrome System

Single-color display hardware differs substantially from full-color devices:

- It can use only one hue, so red, blue, or multi-color status signals are not available
- Shadows read poorly on transparent AR displays, so clear outlines and light fills work better
- Content must stay within a comfortable field of view and should scroll after the height cap
- Error states, muted hints, and highlighted states must all be expressed within the same hue

## Current Variant: Green

`Green` is the active monochrome visual spec in AIUI, targeting the single-green display hardware used by RokidGlasses1 and RokidGlasses2.

The core constraint of this spec is simple: the device can render only one luminous green channel over pure black. The interface therefore cannot rely on a second hue for status or emphasis, and instead builds a complete HUD visual language through opacity, outlines, whitespace, and typographic hierarchy.

## Green Design Constraints

- **Single-green display**: Only the green channel is available, with no red, blue, or other hue
- **Transparent display background**: The black base sits over the real world, so the interface floats rather than occludes
- **Comfortable field of view**: Content uses a fixed width and a capped height before it scrolls
- **No multi-color semantics**: Error states, muted hints, and highlighted states must all be expressed within the same green system

## Green Core Characteristics

- **One-hue opacity ladder**: Use four green opacity tiers, 100% / 60% / 40% / 8%, to build hierarchy
- **Outlines over shadows**: Structure and emphasis come from borders, fills, and whitespace rather than blurred shadows
- **Card-based floating panels**: All content is carried in fixed-width card surfaces
- **Token first**: Colors, type, spacing, borders, and component parameters should all be expressed through Design Tokens
- **Errors remain green**: Error hints do not switch to red, but use weaker borders and lighter fills inside the same hue

## Canvas And Layout

| Token | Meaning | Value |
| --- | --- | --- |
| `app-width` | Default canvas width | `480px` |
| `height-min` | Default minimum height | `120px` |
| `height-max` | Default maximum height | `352px` |

The recommended pattern is a fixed-width card panel. Once content exceeds the maximum height, it should move into a scroll layout rather than keep expanding vertically.

## Color System

| Token | Use | Value |
| --- | --- | --- |
| `primary` | Primary accent, titles, key data | `#40ff5e` |
| `primary-60` | Secondary text and default borders | `rgba(64,255,94,0.6)` |
| `primary-40` | Light fills, highlighted surfaces, muted separators | `rgba(64,255,94,0.4)` |
| `primary-08` | Input and error-container backgrounds | `rgba(64,255,94,0.08)` |
| `background` | Page background | `#000000` |
| `surface` | Card and container background | `#000000` |

In this system, color is not a multi-hue palette. It is a single-green value and opacity ladder.

## Typography Baseline

| Token | Font Family | Size | Weight | Use |
| --- | --- | --- | --- | --- |
| `display` | `monospace` | `24px` | `700` | Panel titles and major headings |
| `heading` | `monospace` | `18px` | `700` | Section headings |
| `body` | `sans-serif` | `15px` | `400` | Body copy |
| `body-sm` | `sans-serif` | `13px` | `400` | Dense information and table content |
| `label` | `sans-serif` | `13px` | `600` | Button labels and field labels |
| `caption` | `sans-serif` | `11px` | `400` | Meta information and timestamps |

The recommended baseline uses monospace for headings and sans-serif for body copy, which further amplifies hierarchy on a single-color display.

## Spacing, Radius, And Borders

### Spacing

- `xs`: `4px`
- `sm`: `8px`
- `md`: `12px`
- `lg`: `18px`
- `xl`: `24px`
- `xxl`: `32px`

### Radius

- `sm`: `12px`
- `md`: `12px`
- `full`: `9999px`

### Border Width

- `thin`: `1px`
- `default`: `2px`
- `strong`: `4px`

This system favors light fills, clear outlines, and stable whitespace, which fits transparent AR displays better than shadow-heavy styling.

## Component Baselines

| Component | Default Expression |
| --- | --- |
| `card` | Black surface + 2px default green outline + 12px radius |
| `card-highlight` | 40% green fill + accent green outline |
| `text-input` | 8% green background + 1px default outline |
| `textarea` | Same chassis as `text-input`, for long-form input |
| `button` | Emphasis through outline and label text instead of a solid filled button |
| `error-state` | 8% green fill + 40% green border + primary green text |
| `chart-container` | Reuses the same container treatment as `card` |

## Do

- Use cards and outlines to build structure
- Use the green opacity ladder to build hierarchy
- Switch to scrolling once content exceeds the height cap
- Reuse tokens instead of hardcoding styles in pages
- Use border weight, surface level, and type weight for emphasis

## Don't

- Do not introduce a second hue
- Do not rely on blurred shadows for depth
- Do not make error states red
- Do not let content expand beyond the comfortable field of view
- Do not depend on hover as the primary interaction feedback

## Preview And Source

- Design source: [design-system-green.md](https://github.com/jsar-project/AIUI/blob/main/design/monochrome/design-system-green.md)
- Visual preview: [preview-green.html](https://github.com/jsar-project/AIUI/blob/main/design/monochrome/preview-green.html)

If the monochrome line expands later, new color variants should be added under `Monochrome` instead of changing the semantic boundary of the current `Green` spec.
