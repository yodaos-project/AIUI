# Packaging and Distribution

Package your project as an `.aix` file. Check the files in the package before you preview it, install it on glasses, or submit the agent for review.

With Node.js 20 or later and npm, open a terminal in the parent directory of the `my-agent` project. If your project has a different name, replace `my-agent` in the commands.

```bash
npm install -g @yodaos-pkg/aix-cli
aix pack ./my-agent -o my-agent.aix
aix list ./my-agent.aix
aix preview ./my-agent.aix
```

Check that the list includes `app.json` and the registered page files. Open the URL printed by the preview command and confirm the packaged agent shows the expected home page. Press `Ctrl+C` to stop the preview.

For device testing, [install the package on glasses](../../4-tutorials/delivery/install-an-aix-on-glasses.en-US.md). When the agent is ready for the store, [submit it through AIUI Studio](./publish.en-US.md).

See [What is AIX?](./aix.en-US.md) for the package format and the [CLI reference](../../7-tools/cli.en-US.md) for command options.
