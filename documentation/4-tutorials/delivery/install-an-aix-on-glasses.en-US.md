# Install an AIX Package on Glasses

Install an existing `hello-aiui.aix` on Rokid glasses that support AIUI development mode. Have the AIX CLI and ADB installed, connect one pair of glasses over USB, authorize USB debugging, and enable Developer Mode.

## Install the Existing AIX Package

<!-- aiui-tutorial-step -->

Run `adb devices` and confirm that the glasses are listed as `device`. The CLI selects the device automatically when exactly one is online and authorized. If `aix device` reports that Developer Mode is disabled, run `aix device set-dev` first. Run the install command from the directory containing the package.

```bash
adb devices
aix install ./hello-aiui.aix
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Wait for the successful installation message and agent ID, then run `aix device` and check the installed list. If several devices are connected, append `--serial` and the target glasses’ serial number to the install command.

See [Command-Line Tools](/AIUI/tools/cli) for Developer Mode and device commands.
