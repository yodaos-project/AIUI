# Code and Project Structure

When you create an AIUI agent, you get a project containing configuration, interfaces, and code. This page introduces the files and folders you're likely to encounter, so you know where to start when you want to make a change.

You don't need to memorize every name at once. Start with a basic project, then explore the other parts when you need them.

## Start with a Basic Project

A project created with the scaffolding tool contains files like these:

```text
my-agent/
├── AGENTS.md
├── app.json
├── app.js
├── package.json
└── pages/
    └── index/
        └── index.ink
```

Each file has a purpose:

- **`AGENTS.md`** describes the agent's identity, capabilities, instructions, and boundaries.
- **`app.json`** declares the project's pages and global settings such as window configuration.
- **`app.js`** handles application-level logic, such as what happens when the agent starts.
- **`package.json`** contains information about the project and its dependencies.
- **`pages/index/index.ink`** defines a page the user sees and its interactions.

For example, to adjust a weather assistant's responsibilities, start with `AGENTS.md`. To change what appears on a page, look for the corresponding page in `pages/`.

## Where Do Pages Go?

A **Page** holds an interface and the user's interactions with it. Projects usually keep pages in `pages/` and declare their paths in `app.json`.

A page can use one `.ink` file or several files at the same path: `.wxml`, `.wxss`, `.js`, and `.json`. If both forms exist at the same path, AIUI loads the `.ink` file first.

A single `.ink` file is a convenient place to start: it can hold the page's logic, content, and styles together.

### Get to Know an `.ink` File

An `.ink` file can contain these parts:

- `<script def>`: Configuration for the Page or Widget.
- `<script setup>`: Data and interaction logic, such as what happens after a user action.
- `<page>` or `<widget>`: The interface structure. A file can use only one of these root elements.
- `<style>`: Interface styles, such as text size.

Here's a simple page: it displays a message, and tapping the text changes it to “Updated”.

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

This example doesn't need a separate `<script def>` section. For now, focus on what the page displays and what happens when you tap it.

## What Other Files and Folders Might You See?

As you add features, a project can also contain:

- **`widgets/`**: Stores Widgets, which are small independent interfaces, such as a weather or device-status view. Widgets use `.ink` files and must be declared in `app.json`; see [Widget Development](/AIUI/framework/open-agent-format-widget) for configuration.
- **`workers/`**: Stores Agent Workers, which are background scripts without an interface. They can perform a one-time task or maintain a shared task while Pages or Widgets are open; see [Agent Worker Development](/AIUI/framework/open-agent-format-agent-worker) for details.
- **`components/`**: Stores reusable interface components, such as a status card.
- **`assets/`**: Stores resources such as images and audio.
- **`app.wxss`**: Defines styles shared by Pages and Widgets.

Here's an example project containing these parts:

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

Widgets and Agent Workers are optional; you can omit their folders and configuration when you don't need them. Folder names can be adapted to your project, but paths declared in `app.json` must match the actual file locations.

## Where to Go Next

- Ready to create a project? Start with the [AIUI Studio quick start](./quickstart/quickstart.en-US.md).
- Want to learn about project configuration? Read [app.json](/AIUI/framework/open-agent-format-app-json).
- Want to learn about images and audio files? Read [Assets](/AIUI/framework/open-agent-format-assets).
- Want to add a small interface or a background task? Read [Widget Development](/AIUI/framework/open-agent-format-widget) and [Agent Worker Development](/AIUI/framework/open-agent-format-agent-worker).
