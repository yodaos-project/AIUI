# Package an AIX File

Build `hello-aiui.aix` and check that it contains the app manifest and page files. Start with the project from [Create Your First AIUI Agent](../getting-started/create-first-agent.en-US.md) and use Node.js 20 or later.

## Complete the Example

<!-- aiui-tutorial-step -->

Run these commands from the directory that contains the `hello-aiui` folder. The `-o` option writes the package to that directory.

```bash
npm install -g @yodaos-pkg/aix-cli

aix pack ./hello-aiui -o hello-aiui.aix
aix list ./hello-aiui.aix
```

<!-- /aiui-tutorial-step -->

Check that the list includes `app.json` and `pages/index/index.ink`.

Add `.aixignore` at the source root to exclude local files. See [AIX CLI](../../7-tools/cli.en-US.md).

Next, [preview the packaged agent](./preview-a-packaged-agent.en-US.md) or [install it on glasses](./install-an-aix-on-glasses.en-US.md).
