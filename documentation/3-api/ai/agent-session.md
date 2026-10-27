# Agent 会话

通过 `getApp().getAgent()` 向当前 Agent 会话发布背景数据、发送用户消息、展示可更新的卡片，以及调用远端工具和读取资源。它不会创建模型或新对话。

## 发送用户消息

在 App 或 Page 的业务方法中发送文本消息。操作成功表示会话确认接收，不代表模型已经回复：

```javascript
async function askAboutProduct() {
  const agent = getApp().getAgent();
  try {
    await agent.conversation.sendMessage({
      role: 'user',
      content: [{ type: 'text', text: '请介绍商品 DEMO。' }],
    });
  } catch (error) {
    console.error(error.name, error.message);
  }
}
```

先读取 `agent.capabilities.operations` 可以判断当前会话支持的操作。例如，发送文本消息对应 `conversation.sendMessage`，同时要求 `capabilities.contentTypes` 包含 `text`。能力可能在连接过程中变化；请求本身仍应处理失败。

## 显式发布和移除上下文

应用状态和日志不会自动成为模型输入。把需要的背景数据发布为上下文条目，并保留返回的句柄：

```javascript
const agent = getApp().getAgent();
const selection = await agent.provideContext({
  key: 'selection',
  description: 'The product selected by the user',
  value: { selectedSku: 'DEMO' },
});

// 用户改选商品时替换这一条的值：
await selection.update({ selectedSku: 'SKU-002' });

// 业务结束时移除：
selection.dispose();
```

发布和更新不会发送用户消息或自动开始推理；成功只表示确认接收，不保证模型已经读取。多个条目汇总发布，更新按顺序发送。条目是模型只读背景，不是双向共享状态。

## 发送和更新卡片

卡片提供标题、说明和结构化展示数据，布局由会话界面呈现。它不定义 HTML、页面布局或按钮回调：

```javascript
const conversation = getApp().getAgent().conversation;
const card = await conversation.sendCard({
  title: '商品 DEMO',
  description: '库存 100 件',
  data: { sku: 'DEMO', available: 100 },
});
await card.update({
  title: '商品 DEMO',
  description: '库存 99 件',
  data: { sku: 'DEMO', available: 99 },
});
```

更新会替换整张卡片，省略 `description` 或 `data` 会清除对应字段。每次 `sendCard()` 新建一张卡片，目前没有删除接口。卡片不会自动成为模型输入；需要模型使用同一数据时另行 `provideContext()`。

## 使用远端工具和资源

远端工具名称和参数以当前服务提供的契约为准。下面假定服务已提供 `check_stock`：

```javascript
const agent = getApp().getAgent();
const result = await agent.callTool('check_stock', { sku: 'DEMO' });
if (result.isError) {
  console.error(result.content);
} else {
  console.log(result.structuredContent ?? result.content);
}

const page = await agent.listResources();
const resource = page.resources[0];
if (resource) console.log(await agent.readResource(resource.uri));
```

`isError` 是工具返回的业务失败，Promise 仍会完成；连接、授权和协议失败会拒绝。`page.nextCursor` 存在时，用 `listResources({ cursor: page.nextCursor })` 继续读取。资源内容可能是文本或 base64 二进制，不应当作脚本执行。

## 连接与生命周期

- 只在 App/Page 中使用。独立 Agent Worker 不提供 `getAgent()`。
- 每次业务流程开始时获取当前会话。连接重建后，旧会话、上下文条目和卡片句柄失效；不会自动把旧数据发布到新连接。
- 请求会等待连接就绪。默认超时 30 秒，包含排队和等待连接的时间；取消和超时无法撤回已经处理的写入。会修改数据的操作不要自动重试。
- 页面不再需要上下文时主动 `dispose()`，或用 `lifetime` 绑定生命周期。导航不会自动删除已发送卡片；卡片可能在 App 退出后继续保留在会话中，但旧句柄不再可用。
- 会话不能读取整个对话，也不会修改 `LanguageModelSession` 的私有历史。JSON payload 上限 1 MiB，最多 128 个待完成请求。

## API Reference

### App

#### `getAgent()`

返回当前 `AgentSession`。获取句柄不开始推理，也不创建新对话。

#### `environment`

只读、独立的公开环境对象，详见下方 `Environment`；内容不会自动发布给模型。

### `AgentSession`

#### `connectionState`

只读状态：`unavailable`（无服务）、`connecting`（连接中）、`ready`（可用）、`closed`（旧会话关闭）。

#### `capabilities`

只读快照，包含 `operations`、`contentTypes`，以及表示列表变更通知是否可用的 `toolListChanged` 和 `resourceListChanged`。

#### `invocation`

只读的最新调用信息或 `null`。包含 `invocationId`、`revision` 和区分输入、部分输入、结果或取消的 `type`。部分输入不是完整或已校验的参数。

#### `conversation`

只读的消息与卡片操作对象，提供下述发送方法。

#### `provideContext(source, options?)`

返回 `Promise<ContextEntry>`。同会话最多 128 条上下文；重复 key 以 `InvalidStateError` 拒绝。需要 `conversation.updateContext` 能力。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `source.key` | `string` | 是 | 1–128 个字母、数字、下划线、点或连字符；会话内唯一。 |
| `source.description` | `string` | 是 | 不得全为空白的说明。 |
| `source.value` | JSON 值 | 是 | 显式提供给模型的背景数据。 |
| `options.lifetime` | `AbortSignal` | 否 | 中止时自动移除条目；与请求 `signal` 分开。 |

`options` 还接受下方通用请求选项。

#### `callTool(name, input, options?)`

返回 `Promise<ToolResult>`；需要 `tools.call` 能力。`name` 是远端工具名，`input` 是 JSON 对象。结果含 `content`（文本条目数组），以及可选 `structuredContent`、`isError`、`uiMetadata`；`uiMetadata` 仅供界面使用。除通用请求选项外，可用 `options.onProgress(progress)` 接收 `value`、可选 `total` 和 `message`。

#### `listResources(options?)`

返回 `Promise<{ resources, nextCursor? }>`；需要 `resources.list` 能力。选项除通用字段外还接受 `cursor: string`。资源项含 `uri`、`name` 及可选 `description`、`mimeType`。

#### `readResource(uri, options?)`

返回 `Promise<ResourceContent[]>`；需要 `resources.read` 能力。每项含 `uri`、可选 `mimeType`，以及二选一的 `text` 或 base64 `blob`。

#### `connectionstatechange`

连接状态改变时触发，新的状态在只读 `event.detail` 中。

#### `capabilitieschange`

能力快照改变时触发，新的能力在 `event.detail` 中。

#### `toolinput`

收到完整调用输入时触发，`event.detail` 包含调用信息和 `input`。

#### `toolinputpartial`

收到部分输入时触发，`event.detail` 不应作为已完成的业务参数执行。

#### `toolresult`

收到调用结果时触发，结果在 `event.detail.result` 中。

#### `toolcancelled`

收到调用取消信息时触发，`event.detail` 可含 `reason`。

#### `toolschange`

远端工具列表变化通知；是否提供此通知见 `capabilities.toolListChanged`。

#### `resourceschange`

远端资源列表变化通知；是否提供此通知见 `capabilities.resourceListChanged`。

### `Conversation`

#### `sendMessage(message, options?)`

返回 `Promise<void>`，需要 `conversation.sendMessage` 和文本内容能力。目前 `message` 仅支持 `{ role: 'user', content: [{ type: 'text', text: string }] }`；完成表示确认处理，不表示推理已完成。

#### `sendCard(definition, options?)`

返回 `Promise<CardHandle>`，需要 `conversation.sendCard`。卡片定义与更新共用以下字段；通用请求选项不支持卡片 `lifetime`。

| 字段 | 类型 | 必填 | 说明 |
| --- | --- | --- | --- |
| `title` | `string` | 是 | 必须包含非空白文本。 |
| `description` | `string` | 否 | 展示说明；更新时省略会清空。 |
| `data` | JSON 对象 | 否 | 展示数据；更新时省略会清空。 |

### `ContextEntry`

#### `update(value, options?)`

返回 `Promise<void>`，完整替换该条目的 JSON 值，其他条目不变。支持通用请求选项。

#### `dispose()`

返回 `undefined`，立即移除本地条目并安排发布剩余条目；没有可等待的确认结果。移除最后一条会清空发布内容。

### `CardHandle`

#### `id`

只读、由运行时生成的卡片标识，限定在所属连接和 App 内。

#### `update(definition, options?)`

返回 `Promise<void>`，需要 `conversation.updateCard`。保留 id 并完整替换展示数据；完成表示确认处理，不保证画面已显示。

### 通用请求选项与错误

| 字段 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `signal` | `AbortSignal` | 无 | 取消单次请求，不移除已发送卡片或已建立的上下文。 |
| `timeoutMs` | `number` | `30000` | 1–120000 毫秒，包含等待连接和排队时间。 |

不支持的操作以 `NotSupportedError` 拒绝，关闭的会话以 `InvalidStateError` 拒绝。其他错误包括 `NotAllowedError`、`AbortError`、`TimeoutError`、`NetworkError`、`DataError`、`QuotaExceededError`。

### `Environment`

#### `theme`

可选、只读的环境主题名称；读取不会修改渲染主题。

#### `locale`

可选、只读的环境语言；不修改 `navigator.language`。

#### `displayMode`

可选、只读的当前显示模式名称。

#### `availableDisplayModes`

可选、只读的可用显示模式名称数组；不要直接修改。

#### `safeAreaInsets`

可选、只读的 `{ top, right, bottom, left }` 安全区域边距快照。

#### `change`

环境更新时触发，`event.detail` 是新快照。通过 `getApp().environment.addEventListener('change', listener)` 监听。
