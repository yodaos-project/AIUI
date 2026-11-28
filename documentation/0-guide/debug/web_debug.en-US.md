# AIUI Agent Web Simulation Debugging

Open an existing AIUI project in Studio to check its first screen and interactions in the browser. If you do not have a project, sign in with a Rokid account and choose **Create with Coding**. Enable the built-in `aiui-dev` skill if prompted, and ask AIUI CODING to create a page with a button.

## 1. Web Simulation Debugging

Open the device simulation panel and select **Preview**. Wait for the first screen to appear. Use the available input, temple controls, and lighting settings that apply to your agent.

![Browser preview and simulation controls in AIUI Studio](../../image/quickstart.en-us/9.png)

## 2. Developer Self-Test

Use the preview to check that you can complete the main task and return. Repeat the task and check the console and network log if an action fails. Try different lighting settings to see whether text and status messages stay readable.

Before submitting for review, check startup, voice, gestures, network behavior, and device capabilities that the agent uses on glasses. Follow [Studio device testing](./real_device_debug.en-US.md) or [command-line device testing](/AIUI/guide/debug-cli_device_debug).
