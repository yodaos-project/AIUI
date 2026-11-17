# Inspect the Agent Definition of an AIX Package

Check which agent an AIX package identifies before installing it. You need the AIX CLI and a packaged `hello-aiui.aix`.

## Print the Effective Agent Definition

<!-- aiui-tutorial-step -->

Run `aix show` from the directory containing the archive. The command resolves the definition the same way installation does and prints the Agent Definition as JSON.

```bash
aix show ./hello-aiui.aix
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Find `agentName` and `agentId` in the output. Check the name and note the ID so you can compare it with the installation result.

See [Command-Line Tools](/AIUI/tools/cli) for installation and command options.
