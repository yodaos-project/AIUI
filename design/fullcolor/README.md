# AIUI Full-Color Display Design Language

This directory holds AIUI's full-color design specification for **Rokid Color**
(Chinese name: **乐奇全彩眼镜**). It follows the YAML token and Markdown format
used by the neighboring monochrome design source.

## Files

| File | Purpose |
| --- | --- |
| [design.md](./design.md) | Full-color design tokens, layout constraints, palettes, typography, component patterns, interaction states, theme mapping, and acceptance checklist. |
| [preview-color.html](./preview-color.html) | Self-contained browser preview of the palette, typography, 448 × 352 layouts, cards, focus, controls, and outline chart. Open directly in a browser; no build step or network dependency. |

## Preview

Open [preview-color.html](./preview-color.html) directly in a browser. Switch
between route, task, and error examples, compare default and selected outlines,
and try the controls with a keyboard. Each glasses frame remains 448 × 352
logical pixels; narrow windows scroll the examples horizontally.

The optional scene background approximates black-as-transparent through screen
blending. It is a composition aid; verify optical readability and color on the
target glasses.

## Core Requirements

- Content and outer clearance fit within a width of 448 and maximum height of 352.
- Text uses 14–24 dp; icons are at least 12 × 12.
- Keep the theme background pure black and containers transparent. Black emits no light and cannot hide the physical environment.
- Avoid large filled backgrounds and low-brightness critical foreground colors.
- Cards use radius 12, inside stroke 2, default stroke alpha 60%, and selected/focused stroke alpha 100%.
- Card padding is 10 horizontally and 24 vertically; FOV clearance is 10.
- Dividers use width 1 and alpha 40%; visible foreground alpha should remain at least 40%.

These values belong to full-color glasses. Use the separate
[monochrome source](../monochrome/design-system-green.md) for single-green devices.

## Documentation Alignment

Keep [design.md](./design.md) aligned with the public visual guidelines in
[Chinese](../../documentation/6-design/visual/full-color.md) and
[English](../../documentation/6-design/visual/full-color.en-US.md).
Implementation workflows live in the [Adaptation Guide](../../documentation/0-guide/full-color.en-US.md)
and [Optimization Guide](../../documentation/0-guide/performance/full-color.en-US.md).

## License

Apache License 2.0, inherited from the repository root.
