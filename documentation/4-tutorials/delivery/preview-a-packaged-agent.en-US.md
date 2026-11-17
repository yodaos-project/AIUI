# Preview an AIX Package in the Browser

Open a packaged agent in a browser and check that the artifact loads the expected home page. You need the AIX CLI and `hello-aiui.aix`.

## Start the Package Preview

<!-- aiui-tutorial-step -->

Run the command from the directory containing the archive. The CLI starts a local preview server and prints its URL. Leave the terminal running and open that address in a browser.

```bash
aix preview ./hello-aiui.aix
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Check that the browser displays the home page from the package. If it has a button or input, try one expected interaction. Press `Ctrl+C` in the CLI terminal when you finish.

See [Command-Line Tools](/AIUI/tools/cli) for installation and command options.
