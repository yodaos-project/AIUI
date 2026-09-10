# Craft

## I. What Is Craft

Craft is an integrated workspace for AIUI and Ink projects. It helps developers import projects, browse files, edit code, preview pages, and run simulations in one interface.

Craft is part of the AIUI development toolchain and does not replace the AIUI framework:

- AIUI provides page structure, the component system, and the development model for agent applications.
- Craft connects project import, file editing, page discovery, and runtime preview.

Access: [https://js.rokid.com/craft](https://js.rokid.com/craft)

## II. Initialize an AIUI Project

1.Enter the following commands in a terminal.

```plain
npm create @yodaos-pkg/aiui-agent@latest my-agent
```

```plain
cd my-agent  # Enter the my-agent folder
ls           # List files and subdirectories
```

![image.png](../image/craft.en-us/01.png)

2.Locate the project files.

![image.png](../image/craft.en-us/02.png)

## III. Import an AIUI Project into Craft (AIUI Web IDE)

1.Open Craft (AIUI Web IDE): [https://js.rokid.com/craft?lang=zh-CN](https://js.rokid.com/craft?lang=zh-CN)

![image.png](../image/craft.en-us/03.png)

2.Import AIUI from a local folder, a local `.aix` file, or a GitHub subdirectory.

![image.png](../image/craft.en-us/04.png)

## IV. Debug on the Craft Web

1.Click **Run Agent** to start Web debugging.

![image.png](../image/craft.en-us/05.png)

2.The Web IDE simulates the complete flow from wake-up and speech recognition through LLM processing to voice playback.
3.The right side provides buttons for simulated glasses actions, including back, single click, and forward/backward swipes.

![image.png](../image/craft.en-us/06.png)

## V. Develop with the AIUI Coding Agent in Craft

1.Craft provides a free LLM (DeepSeek V4 Pro) by default. Download and enable a Skill to assist development.

![image.png](../image/craft.en-us/07.png)

2.You can also replace it with your own model.

![image.png](../image/craft.en-us/08.png)

3.Start using it from the AIUI Code main page.

![image.png](../image/craft.en-us/09.png)

## VI. Create an AIUI Agent in AIUI Studio

Sign in to AIUI Studio (China): [https://aiui.rokid.com/space](https://aiui.rokid.com/space)

There are three ways to create an AIUI agent:

| Creation method | Use case | Result |
| :---: | :---: | :---: |
| Conversational creation | Build an agent from scratch | Enter AIUI CODING and generate a complete project with natural language |
| Local import | An AIUI project already exists locally | Authorize a system folder and import the code |
| GitHub import | Code is in a remote repository | Import a specified directory by repository URL, branch, or tag |

**Warning:** Choose only one method. New users are recommended to use conversational creation.

**Method 1: Create through AI Coding.** AIUI CODING is the main development interface. Download and enable the built-in `aiui-dev` Skill first.

![image.png](../image/craft.en-us/10.png)

You can continue to describe features, UI changes, or troubleshooting tasks in natural language. The AI reads the project context and edits project files directly.

**Method 2: Import a local AIUI project.**

1.Create the project in a terminal or command prompt using the commands above.

![image.png](../image/craft.en-us/11.png)

2.Locate the project files.

![image.png](../image/craft.en-us/12.png)

3.Click **Local Import** and select the corresponding folder.

![image.png](../image/craft.en-us/13.png)

**Method 3: Import from GitHub.**

AIUI Sample project: [https://github.com/jsar-project/AIUI/tree/main/samples](https://github.com/jsar-project/AIUI/tree/main/samples)

![image.png](../image/craft.en-us/14.png)

## VII. Bind the Craft AIUI Project to an AIUI Agent

1.In the Craft editor, open **Settings > Local Management** and bind the corresponding AIUI agent.

![image.png](../image/craft.en-us/15.png)

![image.png](../image/craft.en-us/16.png)

2.Package and upload the AIUI project to AIUI Studio.

![image.png](../image/craft.en-us/17.png)

3.Set permissions according to the project and enter its description on the right.

![image.png](../image/craft.en-us/18.png)

## VIII. Debug on Glasses

**Warning:** The AIUI project must be bound to an AIUI agent and packaged and uploaded before real-device debugging is available.

1.In the Rokid AI app, open **Settings > Developer** and update the glasses resource package.

![image.png](../image/craft.en-us/19.png)

2.After seeing “Agent resource package downloaded successfully,” invoke the agent by voice to experience the complete interaction flow.

Example: “Leqi, open the xxx agent.”

![image.png](../image/craft.en-us/20.png)

## IX. Publish and Submit for Review

1.In [AIUI Studio](https://aiui.rokid.com/), open **Build & Submit for Review**, fill in the basic information, permissions, and preview materials, then save and submit.

![image.png](../image/craft.en-us/21.png)

| Field | Requirement | Details |
| --- | --- | --- |
| Agent name | Required | No more than 20 characters; accurately describe the function and must be unique |
| Icon | Required | Replace the default icon |
| Version | Automatically generated and incremented | Cannot be edited by developers |
| Agent ID | System-generated | Keep it safe |
| App category | Required | Match the agent's actual function |
| Feature description | Required | No more than 500 characters; describe capabilities and use cases accurately |
| Opening message | Required | Recommended within 300 characters; guide first-time users without repeating the feature description |
| Agent icon | Required | Clear, correctly oriented, and related to the name and function |
| Permissions | Select as needed | Truthfully declare network, camera, microphone, and speaker use and explain the purpose |
| Rokid account permissions | Select as needed | Required when using Rokid account or other personal information |
| Preview materials | Required | Upload 3–5 files, including at least one image and one video |

2.After confirming that the materials and current version are correct, click **Submit for Review**.

Review statuses:

- **Under review:** Wait for platform review and check the status in the agent list.
- **Rejected:** Fix the code or materials according to the reason, then package, save, and resubmit.
- **Approved:** The agent becomes publishable and can be displayed and used in the Rokid AI App agent store.

Before submitting, confirm that the core real-device flow works, permissions match the code, descriptions are accurate, and preview files meet the required quantity and formats.
