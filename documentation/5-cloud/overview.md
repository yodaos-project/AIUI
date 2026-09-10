# Cloud 能力概览

AIUI Cloud 为第三方系统提供连接 Rokid 云服务和 Glasses 设备的服务端集成能力。它适合由业务服务、定时任务或外部 Agent 发起调用，将云端事件转化为用户在 Glasses 上可以接收和处理的信息。

当前云端集成覆盖三类能力：系统智能体可读取账号 Token；服务端可按账号和智能体暂存一次性消息；第三方系统可向指定用户推送通知，并在用户点击后打开已注册的 AIUI 页面。

## 集成方式

AIUI Cloud 支持以下两种调用方式：

- 使用 `@yodaos-pkg/cloud-integration` npm 包，在 Node.js 服务中通过结构化 API 发起请求。
- 直接使用 HTTP 或 `curl` 调用云端接口，适用于其他语言、自动化脚本或不方便安装 npm 包的环境。

两种方式遵循相同的接口契约。账号接口使用 `access_token`，通知下发使用 Rokid 账号 SK；它们是不同的服务端凭据，不应混用。

## 安装 npm 包

`@yodaos-pkg/cloud-integration` 面向 Node.js 20 及以上环境，并使用运行时内置的 `fetch`：

```bash
npm install @yodaos-pkg/cloud-integration
```

```js
import { CloudIntegration } from '@yodaos-pkg/cloud-integration'

const cloud = new CloudIntegration({
  token: process.env.ROKID_SK,
  accessToken: process.env.ACCOUNT_ACCESS_TOKEN,
  aiuiEndpoint: process.env.AIUI_ENDPOINT,
})
```

只需要配置实际调用的方法所需的凭据。SK 和账号认证信息都是敏感凭据，请将它们保存在服务端环境变量或密钥管理服务中，不要写入 AIUI 页面代码、客户端包、源码仓库或日志。

## 安装 Cloud Integration Skill

`aiui-cloud-integration` Skill 为 AI 编码助手提供 npm、HTTP、`curl`、页面跳转和错误处理的集成上下文。可以通过以下命令添加：

```bash
npx skills add https://github.com/jsar-project/AIUI/tree/main/skills/aiui-cloud-integration
```

Skill 用于辅助开发和生成集成代码，不会代替 SK，也不会自动发送通知。

## 下一步

- [获取账号 Token](./account-token.md)：系统智能体的账号接口。
- [消息服务](./messaging.md)：暂存保留 10 分钟、覆盖写入且只能消费一次的消息。
- [通知下发](./notifications.md)：向 Rokid Glasses 用户推送文本或页面跳转通知。
