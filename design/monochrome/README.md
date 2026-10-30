# AIUI Monochrome Display Design Language

This subdirectory holds AIUI's design language for **single-color display**
hardware — panels that reproduce a single luminous channel over pure black.
Because the channel hue varies by device, monochrome specs are further
identified by their color (e.g. `green`, `amber`).

## Variants

| Variant | Target devices | Status |
|---------|----------------|--------|
| [`green`](./design-system-green.md) | RokidGlasses1 / RokidGlasses2 | Active |

> The `green` variant is currently the only monochrome spec. Files use a
> `-green` suffix so the current spec stays stable as the monochrome line
> evolves alongside the [full-color design language](../fullcolor/).

## Files

| File | Purpose |
|------|---------|
| [`design-system-green.md`](./design-system-green.md) | Full token spec: colors, typography, spacing, radii, border widths, component chrome, and Do's & Don'ts. The diff-able source of truth. |
| [`preview-green.html`](./preview-green.html) | A self-contained, browsable visual showcase of every token and component. Open it directly in any browser — no build step. |

## Why a separate monochrome system?

Single-color displays can't lean on hue to express hierarchy, error states,
or data visualization. The `green` variant responds with:

- **One hue, four opacity tiers** — hierarchy is green opacity on black,
  never a second color.
- **Outlines, not shadows** — structure comes from clear borders and stable
  whitespace, because drop shadows read poorly on see-through displays.
- **Fixed canvas** — content is width-locked (480px) and height-capped
  (≤ 352px) to stay inside the user's comfortable field of view. The
  full screen reference size is 480 x 352.
- **Errors stay green** — error states use a muted border + faint fill rather
  than red, which the hardware cannot reproduce.

See the [Do's & Don'ts](./design-system-green.md#dos-and-donts) section of
the spec for the full set of rules.

## License

Apache License 2.0, inherited from the repository root.
