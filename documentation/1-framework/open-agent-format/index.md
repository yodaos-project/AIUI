# AIX 格式

一个智能体不仅有指令，还可能包含页面、图片和其他资源。开发时，我们希望这些内容易于组织；分享或安装时，也希望把它们一起交给兼容的运行环境。

**AIX（AI eXecutable）是一种面向 AI 智能体的可移植包格式。** 它在 Open Agent Format 的基础上扩展，让智能体资源与交互界面可以一起被打包、检查和分发。

## 先了解 Open Agent Format

Open Agent Format（OAF） 使用文件和目录组织智能体。一个最基本的 OAF 智能体可以只有根目录中的 `AGENTS.md`：这个文件描述智能体的身份和指令。项目还可以按需包含技能、MCP 配置或子智能体等资源。

OAF 关注如何描述和组织智能体，不限定必须使用某一种运行环境，也不规定具体的交互界面。AIX **继承并扩展 OAF**：可以保留这些智能体文件，同时增加应用配置、页面、页面输入描述和可分发的包。

AIX 保留 OAF 指令和资源，不会因为包里包含这些文件就自动安装技能、启动服务或执行其中的指令。

## AIX 为智能体增加了什么？

在 AIUI 中，AIX 可以把智能体的描述和界面放在同一个可分发的 `.aix` 文件中：

- **应用配置**：`app.json` 声明页面等入口和应用配置。
- **交互界面**：页面和 Widget 可以展示内容、接收用户操作。
- **页面输入**：页面可以描述自己需要的数据，供打开页面时使用；AIX 也可以根据页面信息生成供智能体调用的工具描述。
- **资源和元数据**：包可以携带图片、代码及其他资源，并包含用于检查包内容的元数据。

你仍然需要编写业务逻辑、接入所需服务，并在实际运行环境中验证。AIX 是**包格式**，不是模型或运行时本身。

## 开发项目和 `.aix` 包有什么区别？

开发时，你通常在项目目录中编辑文件。例如：

```text
my-agent/
├── AGENTS.md
├── app.json
├── app.js
├── package.json
└── pages/
    └── index/
        └── index.ink
```

`AGENTS.md` 描述智能体，`app.json` 声明页面，`app.js` 和页面文件实现逻辑与界面。项目也可以按需添加 Widget、Agent Worker、组件和图片资源。具体目录和示例见[项目结构](/AIUI/guide/structure)。

准备分发时，可以把项目打包为一个 **`.aix` 文件**。它是基于 ZIP 的归档，方便兼容的工具检查和读取。生成的 AIX 包必须包含 `app.json` 和用于标识本次构建的 `VERSION`；工具还可以生成 `META-INF/aix/` 下的包元数据。项目中的 `AGENTS.md` 和其他 OAF 资源可以一并保留在包中。

`VERSION` 标识一次构建，不是 AIX 格式版本。开发源码目录通常不需要手动创建它。

## 从项目到可分发的智能体

可以按照下面的顺序开始：

1. **描述智能体**：编写 `AGENTS.md`，说明它的职责、能力和指令。
2. **创建界面**：在 `app.json` 中声明页面，编写页面的内容和交互。
3. **预览和验证**：在开发环境中检查效果，并在目标设备上测试。
4. **打包**：生成 `.aix` 文件，再通过兼容工具检查、安装或分发。

一个 `.aix` 文件能够被读取，并不意味着其中的服务或设备能力在所有环境中都可用。正式使用时，还需要检查运行环境、权限和所需服务；需要验证包的完整性或可信性时，请按照规范进行检查。**格式有效不等于签名可信。**

## 继续阅读

- [AIX Format Spec](https://yodaos-project.github.io/aix/spec?lang=en)：了解完整格式、包结构和验证规则。
- [项目结构](/AIUI/guide/structure)：认识 AIUI 项目的常见文件和目录。
- [AGENTS.md](/AIUI/framework/config-agents)和 [app.json](/AIUI/framework/open-agent-format-app-json)：了解智能体描述与应用配置。
- [页面](/AIUI/framework/open-agent-format-page)、[Widget](/AIUI/framework/open-agent-format-widget)和 [Agent Worker](/AIUI/framework/open-agent-format-agent-worker)：了解项目中的界面和后台任务。
- [组件](/AIUI/framework/open-agent-format-custom-components)、[模块](/AIUI/framework/open-agent-format-module)、[资源](/AIUI/framework/open-agent-format-assets)和 [Package](/AIUI/framework/open-agent-format-packages)：组织和复用项目内容。
- [打包与发布](/AIUI/guide/bundle-publish)：了解智能体的提审与发布流程。
