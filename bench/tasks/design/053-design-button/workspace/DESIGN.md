# Monochrome-green design task reference

Pinned excerpt of AIUI `design/monochrome/design-system-green.md` (beta).
Target: RokidGlasses1 / RokidGlasses2, transparent single-green display.
This local excerpt provides all tokens needed for these tasks; no network access is needed.

- Pure-black floor: #000000 (transparent on hardware, not an opaque mask).
- Maximum emphasis: #40ff5e.
- Primary readable text / active line: rgba(64,255,94,0.72).
- Secondary text / normal interactive boundary: rgba(64,255,94,0.48).
- Divider: rgba(64,255,94,0.24).
- Selected local fill: rgba(64,255,94,0.12).
- Subtle local fill: rgba(64,255,94,0.06).
- Canvas: 480x352px; safe inset 16px horizontal, 12px vertical.
- Display: 22px/500 sans-serif. Body: 14px/400 sans-serif.
- Readable secondary body-sm: 12px/400 sans-serif (48% green or brighter).
- Data: 13px/500 monospace. Action label: uppercase 11px/500 sans-serif.
- Default button: transparent fill, 1px solid 48% green boundary,
  4px radius, minimum height 32px, 72% green text.
- Open list row: transparent fill, minimum height 40px, 8px vertical padding,
  optional 1px 24% divider; avoid a filled card wrapper for every row.
- Error: explicit ERROR label plus triangle glyph and dashed strong boundary.
  Use 6% green fill, 1px dashed 72% green border, 4px radius, 8px padding,
  and readable 12px/400 sans-serif primary text.
- Color alone cannot encode status; use a label plus shape or line treatment.

The task description selects the properties to implement. These source checks
use the supplied class hooks and literal longhands in flat class rules, not a
full CSS cascade or device renderer. Keep content bound and interactions working.
