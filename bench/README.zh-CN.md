# AIUI Coding Benchmark

[English](README.md)

`bench/` 用于衡量 AI 编码代理创建、修改、修复和迁移 AIUI 项目的能力，也用于回归测试 `aiui-dev` skill。只有 `required`、`regression` 检查全部通过，且 `constraints` 没有违规，任务才算 **resolved**。总体指标为通过任务数除以已评分任务数。

评分器检查项目源码、manifest 和部分处理函数的行为，不比较固定补丁，也不验证设备渲染。交给模型的公开输入只有任务描述和准备好的工作区；`task.json` 中的评分规则应对模型隐藏。

## 本地运行

需要 Node.js 20 或更新版本，不需要 `npm install` 或 Docker。以下命令都在 AIUI 仓库根目录执行。

### 检查测试框架

```sh
npm run bench:test
npm run --silent bench -- list
npm run --silent bench -- inspect 002-create-counter
```

`list` 和 `inspect` 只输出公开的任务信息。编写任务时，如需查看隐藏评分规则，直接打开对应的 `bench/tasks/<category>/<id>/task.json`。

### 手工或用外部 Agent 跑单个任务

```sh
npm run --silent bench -- prepare 002-create-counter --workspace /tmp/aiui-counter
# 修改 /tmp/aiui-counter，或只把该目录和打印出的任务描述交给 Agent。
npm run --silent bench -- grade 002-create-counter \
  --workspace /tmp/aiui-counter --output bench/results/counter.grade.json
npm run --silent bench -- summary bench/results/counter.grade.json
```

`prepare` 复制初始项目，目标目录已存在时会拒绝执行。每次尝试都使用新的目录。`grade ID` 不带 `--workspace` 时会给仓库内的初始 fixture 评分；初始状态通常应为未通过。

### 用 DeepSeek 跑单个任务

可以在本地环境设置 `DEEPSEEK_API_KEY`，也可以把密钥存在仓库外的文本文件中。不要把密钥写进任务 fixture 或结果文件。

```sh
npm run --silent bench -- infer 002-create-counter \
  --workspace /tmp/aiui-counter-infer \
  --api-key-file /path/to/deepseek.key \
  --model deepseek-flash \
  --output bench/results/counter.infer.json
npm run --silent bench -- summary bench/results/counter.infer.json
```

`infer` 会在工作区不存在时先准备项目，再调用模型并评分。工作区已存在时会复用它，因此新一轮运行应换新路径。工作区必须位于 AIUI 仓库外。`--model` 默认是 `deepseek-flash`；`--skill` 可选择其他 `aiui-dev` skill 目录；`--max-steps` 默认 30，可设为 1–100。结果文件包含调用轨迹、token 用量、skill 指纹、状态和评分，不保存 API key。

### 跑完整任务集

使用外部 Agent 时，先准备所有工作区，再分别执行，最后统一评分：

```sh
npm run --silent bench -- prepare-all --workspaces /tmp/aiui-bench-manual
# 根据输出的描述和工作区逐个运行 Agent。
npm run --silent bench -- grade-all \
  --workspaces /tmp/aiui-bench-manual --output-dir bench/results/manual
```

使用 DeepSeek 时，批量脚本会在独立工作区逐个调用 `infer`，生成 `summary.json`、`report.md`、每个任务的 infer 轨迹和工作区。先在环境变量中设置 `DEEPSEEK_API_KEY`：

```sh
node bench/scripts/run-all.js \
  --model deepseek-flash --max-steps 30 \
  --output-dir bench/results/local-run
```

每轮使用新的输出目录。某个任务未通过或 CLI 出错时，批量脚本仍继续执行，并在 `summary.json` 中记录全部任务；只要有未通过的任务，脚本就以非零状态退出。普通的 `summary` 命令可汇总 `grade` 和 `infer` 结果；只有状态为 `completed` 且评分通过的 infer 才计为 resolved。有 AIX CLI 时，还可以对工作区执行 `aix check <workspace> --format json` 和 `aix pack <workspace> --output <file.aix>`，检查源码与打包。

退出码：`grade` 和 `infer` 在任务通过时返回 0，未通过或未完成时返回 1，命令或 Provider 出错时返回 2；`grade-all` 只要有任务未通过就返回 1。`infer` 状态为 `completed`、`max_steps` 或 `error`；评分器自身出错时，结果中的 grading 可能是 `null`。

### 在 GitHub Actions 跑完整任务集

在仓库的 Actions secrets 中添加名为 `DEEPSEEK_API_KEY` 的密钥。进入仓库 **Actions** 页面，选择 **AIUI Coding Benchmark**，点击 **Run workflow**，勾选一个或两个模型，并设置最大步数。GitHub 的 `choice` 输入只能单选，因此每个支持的模型使用独立的勾选框。该 workflow 仅手动触发，先运行测试框架的测试，再对每个选中模型执行全部任务。要在页面看到 **Run workflow** 按钮，workflow 文件须位于仓库默认分支。

对应 workflow 运行页面的 **Summary** 会按模型分别展示通过数量、预估美元总费用，以及每个任务的结果和费用。下载 `aiui-bench-<run-id>-<attempt>` artifact，可获得各模型的 `summary.json`、`report.md`、infer 轨迹和生成的工作区。任一模型有任务未通过或出错，job 就会失败，但仍会上传 artifact。结果中不包含 API key。workflow 名称和报告格式不限定 Provider；目前 infer CLI 仅支持 DeepSeek 模型。

费用根据 API 每次请求返回的缓存命中、未命中和输出 token 数，以及请求发生时的 UTC 峰时／非峰时，按 [DeepSeek 官方美元价格](https://api-docs.deepseek.com/quick_start/pricing/)估算。`src/pricing.js` 中的单价快照日期为 2026-09-30；官方调价后须更新。若任务缺少用量信息或有 API 请求失败，费用显示为 `N/A`，报告和 `bench summary` 仍保留已知费用的小计；实际扣费以 Provider 账单为准。

## 新增任务

### 1. 确定 ID 并创建初始项目

创建 `bench/tasks/<category>/<id>/task.json` 和 `bench/tasks/<category>/<id>/workspace/`。类别为 `create`、`modify`、`fix`、`migrate`、`constraint`；难度为 `easy`、`medium`、`hard`。ID 要在所有类别中唯一，编号放在前面，例如 `020-create-greeting`。目录名、JSON 中的 `id` 和上级类别目录必须一致。

`workspace/` 中放最小 AIUI 初始项目，例如 `app.json` 和 `app.js`，但不要提前完成目标任务。不要放符号链接、密钥、评分文件或模型输出。描述应准确写明要实现和保留的行为，只引用 fixture 中真实存在的文件，并避免在运行时没有要求的情况下限定唯一实现方式。

### 2. 编写隐藏评分规则

下面是 Page 创建任务的最小 `task.json`。对应的 `workspace/` 可包含声明了 `pages/index/index` 的 `app.json` 和 `app.js`；求解者负责创建 `.ink` 文件。

```json
{
  "schemaVersion": 1,
  "id": "020-create-greeting",
  "category": "create",
  "difficulty": "easy",
  "description": "Create a Page at pages/index/index that displays Hello AIUI from bound data. Use AIUI APIs, not browser DOM APIs.",
  "aiuiVersion": "current",
  "workspace": "./workspace",
  "grading": {
    "required": [
      { "id": "route", "type": "route", "value": "pages/index/index" },
      { "id": "page", "type": "file", "path": "pages/index/index.ink" },
      { "id": "message", "type": "template", "path": "pages/index/index.ink", "tag": "text", "binding": "message" },
      { "id": "initial-message", "type": "behavior", "path": "pages/index/index.ink", "expect": { "message": "Hello AIUI" } }
    ],
    "regression": [],
    "constraints": [{ "id": "no-dom", "type": "noDom" }]
  }
}
```

`required` 验证新增行为；`regression` 保护初始 fixture 已有的行为；`constraints` 表达任务特有约束。共享 validator 的问题也会计入每个任务的约束违规。每条检查都需要稳定的 `id` 和已支持的 `type`。文件路径必须相对工作区，不能向上穿越。

| 检查类别 | 类型 | 验证内容 |
| --- | --- | --- |
| 文件与 manifest | `file`、`route`、`widget`、`worker`、`permission`、`manifestField`、`routeOrder` | 文件、声明、权限、顺序 |
| 模板与布局 | `template`、`widgetLayout`、`noDom` | 标签、文字、绑定、按钮标签、布局及 DOM 限制 |
| 处理函数行为 | `behavior`、`workerBehavior`、`locationBehavior`、`watchBehavior`、`storageBehavior`、`overlayBehavior`、`voiceBehavior` | 在确定性 mock 中调用处理函数后的状态 |

`behavior` 可使用 `path`、可选 `calls`（`method` 或可见按钮文字 `button`，以及可选 `arg`）、`expect` 和可选 `minPatches`。多文件 Page 的 `path` 指向 `.js` 逻辑文件；需要按按钮定位时，再用 `templatePath` 指向 `.wxml`。行为模拟器只支持部分 JavaScript/ESM 语法和显式 mock，不执行 TypeScript 或任意模块。特殊检查的字段请参考同类别已有任务。

### 3. 补充正反向测试

在 `bench/tests/` 中添加测试：准备初始 fixture，确认它未通过；写入有效解法，确认通过；再用错误变体证明关键约束或回归检查确实会失败。新增下一个编号时，更新 `bench/tests/expanded.test.js` 中固定的任务数量和连续编号断言。

```sh
npm run bench:test
npm run --silent bench -- inspect 020-create-greeting
npm run --silent bench -- grade 020-create-greeting
npm run --silent bench -- prepare 020-create-greeting --workspace /tmp/aiui-greeting
# 在 /tmp/aiui-greeting 写入解法后：
npm run --silent bench -- grade 020-create-greeting --workspace /tmp/aiui-greeting
```

第一次 `grade` 应未通过，写入解法后的第二次应通过。确认 `inspect` 和 `prepare` 不泄露评分规则。任务检查应可重复执行，不依赖网络、真实设备、密钥或固定补丁。如果需要新增检查类型，先在 `src/schema.js` 加入校验，在 `src/grader.js` 加入执行逻辑，并补测试。

## 当前任务

| 类别 | 任务 |
| --- | --- |
| create | `001-create-page`、`002-create-counter`、`003-create-widget`、`004-create-worker`、`012-create-multifile`、`016-create-storage`、`017-create-overlay` |
| modify | `005-modify-toggle`、`006-modify-second-page`、`013-modify-watch`、`018-modify-voice-wakeup` |
| fix | `007-fix-state`、`008-fix-event`、`014-fix-worker-open`、`015-fix-widget-lifecycle` |
| migrate | `009-migrate-worker`、`019-migrate-page` |
| constraint | `010-constraint-location`、`011-constraint-no-dom` |

现有 19 个任务覆盖单文件和多文件 Page、Widget、Worker、定位、存储、Overlay、语音事件、迁移与平台边界。validator 只检查已确认的 manifest/源码关系和 AIUI 规则，不会拒绝所有未知 API、事件或 WXSS 属性。设备权限、渲染、焦点、媒体、传感器和视觉质量需要额外运行时验证。比较多轮结果时，应固定模型、skill 版本和测试框架版本。

DeepSeek 请求格式和模型 ID 参见 [Chat Completions API](https://api-docs.deepseek.com/api/create-chat-completion/) 与 [Tool Calls 指南](https://api-docs.deepseek.com/guides/tool_calls/)。
