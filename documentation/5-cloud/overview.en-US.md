# Cloud Overview

AIUI Cloud provides server-side integration capabilities that connect third-party systems with Rokid cloud services and Glasses devices. Business services, scheduled jobs, and external agents can use it to turn cloud events into information that users can receive and act on through their Glasses.

Cloud integration currently covers three capabilities: system agents can read an account token, servers can cache a one-time message by account and agent, and third-party systems can notify a specific user or open a registered AIUI page when the notification is selected.

## Integration options

AIUI Cloud supports two ways to call the service:

- Use the `@yodaos-pkg/cloud-integration` npm package for a structured API in a Node.js service.
- Call the cloud endpoint directly with HTTP or `curl` from other languages, automation scripts, or environments where installing an npm package is not suitable.

Both options follow the same endpoint contracts. Account endpoints use `access_token`, while notification delivery uses a Rokid account SK. These are distinct server-side credentials and must not be mixed.

## Install the npm package

`@yodaos-pkg/cloud-integration` requires Node.js 20 or later and uses the runtime's built-in `fetch`:

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

Configure only the credentials required by the methods you call. Both the SK and account credential are sensitive. Store them in server-side environment variables or a secret manager, and never include them in AIUI page code, client bundles, source control, or logs.

## Install the Cloud Integration Skill

The `aiui-cloud-integration` Skill gives AI coding assistants integration context for npm, HTTP, `curl`, page navigation, and error handling. Add it with:

```bash
npx skills add https://github.com/jsar-project/AIUI/tree/main/skills/aiui-cloud-integration
```

The Skill assists development and code generation. It does not replace the SK or send notifications automatically.

## Next step

- [Get an account token](./account-token.en-US.md) covers the official-platform-agent account endpoint.
- [Messaging](./messaging.en-US.md) covers temporary messages that expire after 10 minutes, replace earlier values, and are consumed once.
- [Sending notifications](./notifications.en-US.md) covers text and page-navigation notifications for Rokid Glasses users.
