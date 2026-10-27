# Code Composition and Directory Structure

An AIUI agent can contain full Pages, compact Widgets, and Agent Worker background tasks with no interface. Pages can use either a traditional multi-file layout or a compact `.ink` single-file layout. Widgets use `.ink` files.

## Project Root

- `AGENTS.md`: Describes the agent's identity, capabilities, instructions, and behavioral boundaries.
- `app.json`: Declares Pages, Widgets, Agent Workers, and global window configuration.
- `app.js`: Handles application-level lifecycle callbacks and shared logic.
- `app.wxss`: Defines global styles that Pages and Widgets can reuse.

## Page Directory (`pages/`)

A Page carries a complete interaction flow and participates in page navigation. It can use either layout:

- Single file: `pages/home/index.ink`
- Multiple files: `.wxml`, `.wxss`, `.js`, and `.json` files at the same path

When both layouts exist for the same path, the `.ink` file is loaded first.

## Widget Directory (`widgets/`)

A Widget is an independent compact interface for information such as weather, device status, or quick actions. Each Widget uses one `.ink` file and declares its path and size category in `app.json.widgets`:

```json
{
  "widgets": [
    { "path": "widgets/weather/index", "family": "1x2" }
  ]
}
```

`family` currently supports `1x1` and `1x2`. Each declared path must have a matching `.ink` file.

## Agent Worker Directory (`workers/`)

An Agent Worker is a background script with no interface. Use it to maintain one shared task while multiple Pages or Widgets are open, such as synchronizing data or keeping a shared connection alive. Its entry is a `.js` or `.ts` file declared in `app.json.agentWorkers`:

```json
{
  "agentWorkers": [
    {
      "name": "sync",
      "script": "workers/sync.js",
      "trigger": { "type": "open" },
      "lifetime": "instant"
    }
  ]
}
```

## Typical Directory Structure

```text
agent-app/
├── AGENTS.md
├── app.json
├── app.js
├── app.wxss
├── pages/
│   └── home/
│       └── index.ink
├── widgets/
│   └── weather/
│       └── index.ink
├── workers/
│   └── sync.js
├── components/
│   └── status-card/
│       └── index.ink
└── assets/
    └── weather.png
```

These directory names are conventions rather than fixed requirements, but their relative paths must match `app.json`. Widgets and Agent Workers are optional, so omit their configuration and directories when they are not needed.

## `.ink` Single-file Structure

An `.ink` file usually contains:

- `<script def>`: Page or Widget configuration.
- `<script setup>`: Data, lifecycle callbacks, and event handlers.
- `<page>` or `<widget>`: Interface structure; one file can use only one of these root elements.
- `<style>`: Styles for the current entry.

```html
<script setup>
export default {
  data: { message: 'Hello AIUI' },
  handleTap() {
    this.setData({ message: 'Updated' });
  },
};
</script>

<page>
  <text bindtap="handleTap">{{message}}</text>
</page>

<style>
text {
  font-size: 32rpx;
}
</style>
```

## Continue Reading

- [Assets](/AIUI/framework/open-agent-format-assets)
- [Widget Development](/AIUI/framework/open-agent-format-widget)
- [Agent Worker Development](/AIUI/framework/open-agent-format-agent-worker)
- [app.json](/AIUI/framework/open-agent-format-app-json)
