# 通知下发

通知下发接口允许第三方系统向指定用户的 Rokid Glasses 推送智能体消息。通知可以仅展示文本，也可以在用户点击后打开已注册的 AIUI 页面并传递参数。

## 准备工作

调用接口前，需要准备以下信息：

- 智能体所属账号的 SK，可在 [Rokid 账号凭证页面](https://account-web.rokid.com/token) 获取。
- 目标用户的账号 ID，并确认该用户已绑定 Glasses 设备。
- 智能体 ID，用于标识通知来源。
- 推送方生成的唯一消息 ID，用于消息追踪和去重。

## 使用 npm 包

```js
import { CloudIntegration } from '@yodaos-pkg/cloud-integration'

const cloud = new CloudIntegration({
  token: process.env.ROKID_SK,
})

const response = await cloud.sendNotification({
  messageId: 'message-unique-id',
  accountId: 'target-account-id',
  message: {
    agentId: 'agent-id',
    content: '你有一条新的智能体通知。',
  },
})

console.log(response.data.success)
```

`sendNotification()` 在服务端返回 `code === 1` 且 `data.success === true` 时返回完整响应。参数错误会抛出 `CloudIntegrationValidationError`；网络、HTTP、响应解析和业务错误会抛出 `CloudIntegrationError`。

## 使用 HTTP 或 curl

不使用 Node.js 包时，可以直接向以下地址发送 JSON 请求：

```text
POST https://rcs.rokid.com/metis/callback/message
```

```bash
curl --location 'https://rcs.rokid.com/metis/callback/message' \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer ${ROKID_SK}" \
  --data '{
    "message_id": "message-unique-id",
    "account_id": "target-account-id",
    "message": {
      "agent_id": "agent-id",
      "content": "你有一条新的智能体通知。"
    }
  }'
```

请求头中的 `Authorization` 必须使用 `Bearer <SK>` 格式。单次请求只支持向一个用户推送一条消息。

## 通知跳转页面

在 `message` 中添加 `tool`，可以让通知点击后打开指定页面：

```js
await cloud.sendNotification({
  messageId: 'outfit-message-id',
  accountId: 'target-account-id',
  message: {
    agentId: 'agent-id',
    content: '查看穿搭建议',
    tool: {
      name: 'pages/cloth/index',
      parameters: {
        type: 'object',
        properties: {
          field: 'value',
        },
      },
    },
  },
})
```

`tool.name` 必须与 `app.json` 中注册的 AIUI 页面路径一致。`tool.parameters.type` 固定为 `object`，`properties` 中的键值会原样传递给目标页面，目标页面的输入 schema 应声明对应字段。

## 响应

成功响应示例：

```json
{
  "code": 1,
  "msg": "success",
  "timestamp": 1783343622284,
  "uuid": "e804768e6c6249ea96de06acf74f4fe1",
  "data": {
    "success": true
  }
}
```

当 `code` 不为 `1` 或 `data.success` 不为 `true` 时，应将本次推送视为失败，并结合 `msg` 和 `uuid` 排查问题。
