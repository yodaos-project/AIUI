# Exclude Local Files from an AIX Package

Keep local notes in the source project when you package the agent. Use a computer with the AIX CLI and a project named `hello-aiui`. Create a practice file at `notes/draft.txt` inside the project.

## Add a Packaging Ignore Rule

<!-- aiui-tutorial-step -->

Add this rule to `.aixignore` at the project root. The leading `/` anchors the rule to the root and the trailing `/` matches a directory.

```text
/notes/
```

<!-- /aiui-tutorial-step -->

## Repack and List the Archive Contents

<!-- aiui-tutorial-step -->

Run these commands from the project’s parent directory. The new package is written outside the source directory.

```bash
aix pack ./hello-aiui -o hello-aiui-clean.aix
aix list ./hello-aiui-clean.aix
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Check that `aix list` still includes `app.json` and the page files and that `notes/draft.txt` is absent. Confirm that the original note is still in the source project.

See [Command-Line Tools](/AIUI/tools/cli) for installation and command options.
