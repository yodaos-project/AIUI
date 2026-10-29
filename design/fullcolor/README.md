# AIUI Full-Color Display Design Language

This directory holds AIUI's full-color design specification for **Rokid Color**
and **乐奇全彩眼镜**. It follows the YAML token and Markdown format used by
the neighboring monochrome design source.

## Files

| File | Purpose |
| --- | --- |
| [design.md](./design.md) | Full-color design tokens, layout constraints, palettes, typography, component patterns, interaction states, theme mapping, and acceptance checklist. |

## Core Requirements

- Content and outer clearance fit within a width of 448 and maximum height of 170.
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
