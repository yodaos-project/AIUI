# Quick Start

Build a page for Rokid Glasses and check it in your browser. The local steps use Node.js 20 or later and npm.

## Build and Preview Your First Agent

Open a terminal in the directory where you keep your projects. Create the project, install the AIX CLI, and start the preview.

```bash
npm create @yodaos-pkg/aiui-agent@latest my-agent
cd my-agent
npm install -g @yodaos-pkg/aix-cli
aix preview .
```

Open the URL printed in the terminal. The starter page should display `Hello AIUI!`. Click the button labeled **点击我** to change the greeting briefly. If the preview opens a different page, check that you ran the command from `my-agent` and that `app.json` lists `pages/index/index`. Stop the preview with `Ctrl+C`.

To change the greeting, edit the `greeting` value under `data` in `pages/index/index.ink`. Restart the preview and check that the new text appears.

You can also [create a project in AIUI Studio](./quickstart.en-US.md), which runs in the browser.

## Next Steps

- [Build an interactive counter](../../4-tutorials/interface/build-interactive-counter.en-US.md) to practice updating page state.
- [Test on glasses with AIUI Studio](../debug/real_device_debug.en-US.md) or [install an AIX package with the CLI](../../4-tutorials/delivery/install-an-aix-on-glasses.en-US.md).
- [Package and publish your agent](../bundle/index.en-US.md).
- Choose an interaction model. Start with [a card in a conversation](./first-chat.en-US.md) or [an immersive page](./first-immersive.en-US.md).
- Learn [what AIUI provides](./intro.en-US.md) and [how an AIUI project is organized](../structure.en-US.md).
