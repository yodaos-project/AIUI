# Real-Device Debugging with AIUI Studio

Install the version you saved in AIUI Studio and check that the agent opens on your glasses. You need the agent project in Studio and Rokid Glasses connected to the Hi Rokid app. To install from a local project through ADB, follow the [command-line device guide](/AIUI/guide/debug-cli_device_debug).

## 1. Package and Save the AIX

1. Open **Build & Review** and use the AIX packaging action.
2. Wait for the upload to finish. If it fails, use the error message to fix the problem, then package again.
3. Save the agent information. The app downloads the new build after Studio has packaged it and saved the version. Studio assigns the version number.

![AIX packaging in the Build & Review tab](../../image/quickstart.en-us/10.png)

## 2. Real-Device Debugging

1. In the Hi Rokid app, go to **Settings → Developer Options → AIUI**.
2. Tap **Update glasses resource** and wait for **Agent resource package downloaded successfully**.

![Glasses resource update in the mobile app](../../image/quickstart.en-us/11.png)

3. Ask the glasses to open your agent by name. Check that its first screen includes the change you made.

![Agent launch on Rokid Glasses](../../image/quickstart.en-us/12.png)

If the change is missing, confirm the latest build was uploaded and saved in Studio, then update the glasses resource again.

## 3. Developer Self-Test

Run the agent’s main task from start to finish on the glasses.

- Confirm the first screen loads and you can complete the task and return.
- Try the inputs your agent uses, such as voice, camera, or temple controls.
- Check text, icons, and status messages under different lighting conditions.
- Repeat the main task and check what the agent shows when it gets unexpected input or loses its network connection. Look for unhandled errors in the console or network log.

After these checks pass, [prepare the submission](../bundle/publish.en-US.md).
