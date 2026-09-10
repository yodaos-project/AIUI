# 消息服务

暂存消息接口让服务端按当前账号和指定智能体暂存一条消息，供后续页面或进程通过 `getAIUICacheMessage` 一次性消费。它不属于 AIUI 侧 OpenAPI。

## 使用 npm 包

```js
import { CloudIntegration } from '@yodaos-pkg/cloud-integration'

const cloud = new CloudIntegration({
  accessToken: process.env.ACCOUNT_ACCESS_TOKEN,
  aiuiEndpoint: process.env.AIUI_ENDPOINT,
})

await cloud.saveTemporaryMessage('7665068936018264064', '/pages/agent/message', {
  customData: 'custom-data',
  content: '您有一条新的智能体消息',
})
```

`targetAgentId`、`path`、`data.customData` 和 `data.content` 都是必填非空字符串。SDK 会把 `targetAgentId` 映射为 HTTP 请求体中的 `agentId`。当前账号由认证上下文确定，不要传入 `accountId`，也不要把 `access_token` 放进 JSON 请求体。

## 使用 HTTP

```text
POST https://<aiui-host>/metis/openApi/v1/cacheAIUIMessage
```

```bash
curl --location 'https://<aiui-host>/metis/openApi/v1/cacheAIUIMessage' \
  --header 'Content-Type: application/json' \
  --header 'access_token: <ACCOUNT_ACCESS_TOKEN>' \
  --data '{
    "agentId": "7665068936018264064",
    "path": "/pages/agent/message",
    "customData": "custom-data",
    "content": "您有一条新的智能体消息"
  }'
```

## 缓存与响应语义

- 缓存按当前账号 ID 和 `agentId` 隔离，有效期为 10 分钟。
- 同一账号、同一智能体再次写入时，新消息覆盖旧消息；该接口不是消息队列。
- `getAIUICacheMessage` 获取消息后会原子删除缓存，不能假设可以重复读取。
- 成功响应使用通用结构，包含 `code`、`msg`、毫秒时间戳 `timestamp`、请求 `uuid` 和对象类型的 `data`。
- 仅 `code === 1` 表示业务成功。其他值应结合脱敏后的 `msg` 和 `uuid` 排查。

服务端应校验 `path`、`customData` 和 `content` 的长度、格式及业务路由，不要把不可信数据直接用于页面跳转或渲染。认证凭据只能来自环境变量或密钥管理系统。
