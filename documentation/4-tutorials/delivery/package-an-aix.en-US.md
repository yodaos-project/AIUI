# Package an AIX File

Install the AIX CLI, then run `aix pack` outside the agent source directory. Set the output name with `-o` and inspect packaged files with `aix list`.

## Complete the Example

<!-- aiui-tutorial-step -->

Install the AIX CLI, then run `aix pack` outside the agent source directory. Set the output name with `-o` and inspect packaged files with `aix list`.

```bash
npm install -g @yodaos-pkg/aix-cli

aix pack ./hello-aiui -o hello-aiui.aix
aix list ./hello-aiui.aix
```

<!-- /aiui-tutorial-step -->

Add `.aixignore` at the source root to exclude local files. See [AIX CLI](/AIUI/guide/bundle/cli).

