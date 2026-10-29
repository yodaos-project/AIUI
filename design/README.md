# AIUI Visual Design Language

This directory holds AIUI's visual design language specs. Each spec is scoped
to a specific **display type**, because AIUI runs on hardware with very
different color reproduction capabilities.

## Layout

```text
design/
├── monochrome/          # single-color display specs (one channel on pure black)
│   ├── design-system-green.md
│   └── preview-green.html
└── fullcolor/           # full-color transparent glasses
    ├── README.md
    ├── design.md
    └── preview-color.html
```

Both display types have design sources here. Full-color tokens and guidelines
for Rokid Color and 乐奇全彩眼镜 live in [fullcolor/design.md](./fullcolor/design.md),
using YAML front matter and Markdown specification sections.

| Source | Display type | Status |
|--------|--------------|--------|
| [`monochrome/`](./monochrome/) | Single-color display (one channel on pure black) | Active — `green` hue variant available |
| [`fullcolor/`](./fullcolor/) | Full-color transparent glasses | Active — design.md specification available |

## Active Specs

The monochrome-green system — for RokidGlasses1 / RokidGlasses2, whose
hardware can only reproduce one luminous green channel over pure black —
lives at:

- [`monochrome/design-system-green.md`](./monochrome/design-system-green.md) — full token spec
- [`monochrome/preview-green.html`](./monochrome/preview-green.html) — browsable visual showcase

See [`monochrome/README.md`](./monochrome/README.md) for details.

The full-color system lives at:

- [`fullcolor/design.md`](./fullcolor/design.md) — tokens, component patterns, states, and acceptance requirements
- [`fullcolor/preview-color.html`](./fullcolor/preview-color.html) — self-contained, interactive visual showcase
- [`fullcolor/README.md`](./fullcolor/README.md) — scope and documentation links

Keep the full-color source aligned with the public visual guidelines in
[Chinese](../documentation/6-design/visual/full-color.md) and
[English](../documentation/6-design/visual/full-color.en-US.md).

## How it fits into the repository

| Audience | Where you meet the design language |
|----------|------------------------------------|
| AI agents (Claude Code, Cursor, Codex, …) | Bundled as `skills/aiui-dev/design-system-green.md` via `npx skills add` |
| Human developers | This directory, linked from the root [`README.md`](../README.md) |
| Sample authors | Mirror these tokens under [`samples/`](../samples/) |

The skill copy is intentionally identical to
`monochrome/design-system-green.md` here, so agents can align generated code
without fetching remote URLs. When you edit one, update the other to keep
them in sync.

## License

Apache License 2.0, inherited from the repository root.
