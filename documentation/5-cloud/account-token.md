# 获取账号 Token

`getToken` 是供系统智能体服务端使用的账号接口，用于获取认证信息对应的账号信息或账号 Token。它不属于 AIUI 侧 OpenAPI，第三方智能体不能使用此接口。

## 使用 npm 包

服务地址由部署环境提供，SDK 不会假设一个通用 host：

```js
import { CloudIntegration } from '@yodaos-pkg/cloud-integration'

const cloud = new CloudIntegration({
  accessToken: process.env.ACCOUNT_ACCESS_TOKEN,
  aiuiEndpoint: process.env.AIUI_ENDPOINT,
})

const result = await cloud.getToken()
```

`application/json` 响应的 schema 是字符串，SDK 会返回解析后的字符串。协议没有定义字符串内部的 JSON 结构，因此应将其作为不透明值处理，不要臆造或依赖未声明字段。

## 使用 HTTP

```text
GET https://<aiui-host>/account/v1/token
```

```bash
curl --location 'https://<aiui-host>/account/v1/token' \
  --header 'access_token: <ACCOUNT_ACCESS_TOKEN>'
```

成功响应为 `200 application/json`，响应 schema 是字符串。认证信息非法时返回 `401`。

账号认证信息是服务端凭据。请从环境变量或密钥管理系统读取，不要写入页面代码、客户端包、源码、请求日志或错误信息。遇到 `401` 时，应检查凭据来源、有效期和请求环境。
