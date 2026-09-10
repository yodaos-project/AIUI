# Visual Design

This directory brings the visual design language from the repository-level `design/` folder into the documentation system and organizes AIUI visual guidance by display type.

AIUI runs on hardware with very different display capabilities, so visual guidance is not a single page. It is a set of design-language documents grouped by display type.

## Structure

```text
visual/
├── index.en-US.md
└── monochrome.en-US.md
```

The current documentation structure mirrors the repository-level `design/` sources:

- `design/README.md` -> this page
- `design/monochrome/README.md` + `design/monochrome/design-system-green.md` -> `Monochrome`

## Display Types

| Type | Description | Status |
| --- | --- | --- |
| `Monochrome` | Single-color display rendered as one luminous channel over pure black | Active |
| `Full Color` | Full-RGB display capability | Planned |

Today only the `Monochrome` branch is active, targeting the single-green hardware used by Rokid Glasses.

## Active Spec

The current primary spec is `Monochrome`, which includes the active `Green` variant for RokidGlasses1 and RokidGlasses2:

- a single luminous green channel
- a pure black background
- a HUD-style interface built from outlines, translucent fills, and stable whitespace
- a Design Token layer used as the shared contract for host injection and app overrides

## How It Fits Into The Repository

| Audience | Entry Point |
| --- | --- |
| Human developers | This documentation directory |
| Source-of-truth maintainers | The repository-level `design/` folder |
| AI generation and assistant workflows | The synchronized design-spec copy used in docs and tooling |

The purpose of this directory is not to replace `design/`, but to expose the same design language through the public documentation structure so it is easier to navigate, reference, and expand later.

## Read Next

- [Monochrome](/AIUI/design/visual-monochrome)
