# Visual Design

AIUI provides visual guidelines by display type. Choose the specification for your target device, then adapt theme tokens, layouts, and assets to deliver a consistent task experience.

## Display Types

| Type | Target Devices | Core Constraints |
| --- | --- | --- |
| [Monochrome](/AIUI/design/visual-monochrome) | Single-green displays on RokidGlasses1 / RokidGlasses2 | One green channel, reference canvas 480 × 352, hierarchy through monochrome opacity and outlines |
| [Full Color](/AIUI/design/visual-full-color) | Rokid Color, 乐奇全彩眼镜 | Width 448, maximum height 170, white text with color accents, transparent containers and clear outlines |

Both display types use a pure black page background, which appears transparent on the glasses. Full color adds hue distinctions while retaining the need to limit large fills, preserve readable text sizes, and verify against real backgrounds.

## Choose and Reuse Specifications

One agent can share business logic, Pages, and Widgets, while adapting colors to display capabilities and layouts to available space. Do not scale a monochrome type scale and complete page directly into the full-color area, or carry multi-hue states directly onto monochrome devices.

Prefer theme tokens, and inspect custom styles, images, and Canvas content separately. See the [Full-Color Glasses Adaptation Guide](/AIUI/guide/full-color) for the complete workflow.

## Guidelines and Design Sources

This directory provides visual specifications for developers. The repository-level `design/monochrome/` folder retains monochrome design sources and previews. See [Full Color](/AIUI/design/visual-full-color) for full-color dimensions, palettes, typography, and component baselines.

## Read Next

- [Monochrome](/AIUI/design/visual-monochrome)
- [Full Color](/AIUI/design/visual-full-color)
- [Full-Color Glasses Adaptation Guide](/AIUI/guide/full-color)
- [Full-Color Optimization Guide](/AIUI/guide/performance-full-color)
- [Interaction Design](/AIUI/design/interaction)
