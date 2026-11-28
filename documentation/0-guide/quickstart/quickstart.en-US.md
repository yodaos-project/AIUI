# AIUI Studio Global QuickStart

Create or import an agent in AIUI Studio, then open its first page in the browser preview. You need a Rokid account. If you already have a project, start with the matching import method below.

## I. What Is AIUI Studio?

AIUI Studio runs in your browser. Use it to edit an agent and preview its interface before testing it on glasses.

## II. Sign In to AIUI Studio

Open [AIUI Studio Global](https://aiui-global.rokid.com/) and sign in with your Rokid account. After sign-in, check that the workspace opens and shows your agents in the list on the left.

## III. Create an AIUI Project in AIUI Studio(Global)

Choose one method based on where your source code is.

| Starting point | What to choose |
| --- | --- |
| No project yet | **Create with Coding** |
| A project on your computer | Local import |
| A project on GitHub | GitHub import |

## Method 1: Create with Coding

Choose **Create with Coding**. The first time you use **AIUI CODING**, download and enable the built-in `aiui-dev` skill.

![AIUI CODING setup in the Studio workspace](../../image/quickstart.en-us/1.png)

## Method 2: Import form local folder (Create an AIUI Scaffold with npm)

If you already have a project, locate the folder containing `app.json`. To create one, use Node.js 20 or later and npm. Run this command from the directory where you keep your projects.

```bash
npm create @yodaos-pkg/aiui-agent@latest my-agent
```

Choose local import in Studio and select the `my-agent` folder or the root of your existing project. If the browser asks for folder access, grant access to that folder.

![Local project import in AIUI Studio](../../image/quickstart.en-us/4.png)

## Method 3: Import from Github

Choose GitHub import. Enter the repository URL, select the branch or tag, and point Studio to the folder that contains `app.json`. You can find projects to try in the [AIUI samples](https://github.com/yodaos-project/AIUI/tree/main/samples).

![GitHub project import in AIUI Studio](../../image/quickstart.en-us/5.png)

## IV. Generate and Modify Projects with AIUI CODING

In **AIUI CODING**, describe one change at a time. For a first project, ask it to show a count starting at 0 and add a button that increases the count by 1. Attach a relevant file when it helps identify what to change.

![Prompt input in AIUI CODING](../../image/quickstart.en-us/6.png)

Open **Code** to review the files AIUI CODING changed.

## V. AIUI Agent Web-Based Simulation and Debugging

Select **Preview** in the device simulation panel. Confirm the first page appears. If you built the counter, click its button and check that the count changes from 0 to 1.

![Agent page in the Studio browser preview](../../image/quickstart.en-us/9.png)

Use the preview controls to try the inputs your agent uses, such as voice or temple controls. Change the lighting setting and check whether text stays readable. If an action fails, check the console or network log.

## VI. Debug an AIUI Agent on a Real Device

Connect your Rokid Glasses to the Hi Rokid app, then load the version you just previewed.

1. In Studio, open **Build & Review**, package the AIX file, and wait for the upload to finish. Save the agent information so the app can download the new version.
2. In the Hi Rokid app, go to **Settings → Developer Options → AIUI** and tap **Update glasses resource**. Wait for **Agent resource package downloaded successfully**.
3. Ask the glasses to open the agent by name. Confirm the first screen includes your change and run the main interaction once.

![Glasses resource update in the Hi Rokid app](../../image/quickstart.en-us/11.png)

If you see the previous build, check that Studio uploaded and saved the latest version, then update the resource again. The [on-device test checklist](../debug/real_device_debug.en-US.md) covers additional checks.

## VII. View and Edit AIUI Agent Code

Open **Code** and select a file in the tree. Start with `app.json` to find the registered pages, then open the home page to inspect its interface. See [AIUI project structure](../structure.en-US.md) for the role of each file.

![Source files in the Studio Code tab](../../image/quickstart.en-us/13.png)

## VIII. Publish and Submit for Review in the Hi Rokid Agent Store

After the main workflow works on glasses, open **Build & Review**. Enter the agent name, category, feature description, and opening message. Replace the default icon, select the permissions the agent uses, and explain why it needs each one. Upload three to five preview files, including at least one image and one video.

Save the information, check the version, then select **Submit for Review**. Check the status in the agent list. If review is rejected, use the reason shown to make corrections before submitting again.

![Submission form in the Build & Review tab](../../image/quickstart.en-us/14.png)

For field limits, media formats, and the review criteria, see the [publishing requirements](../bundle/publish.en-US.md).
