# Check an Agent’s Source Files

Run a static check before packaging to find a page entry in `app.json` that points to a missing file. Use a version of the AIX CLI with the `check` command and an existing AIUI project.

## Run the Static Check

<!-- aiui-tutorial-step -->

Run the command from the project’s parent directory and replace `./hello-aiui` with your project directory. To practice reading a diagnostic, temporarily change one of the existing `pages` entries in `app.json` to `pages/missing/index`.

```bash
aix check ./hello-aiui
```

<!-- /aiui-tutorial-step -->

## Verify the Result

If the page entry points to a missing file, the output reports that path. Restore the actual page path, such as `pages/index/index`, without a file extension. Run the same command again and confirm that the error is gone. The command exits with a nonzero status when it reports errors.

See [Command-Line Tools](/AIUI/tools/cli) for installation instructions.
