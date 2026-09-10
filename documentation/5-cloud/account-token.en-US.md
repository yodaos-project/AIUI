# Get an account token

`getToken` is a server-side account endpoint for system agents. It retrieves the account information or account token associated with the supplied credential. It is not part of the AIUI OpenAPI and is unavailable to third-party agents.

## Use the npm package

The deployment environment provides the service origin; the SDK does not assume a universal host:

```js
import { CloudIntegration } from '@yodaos-pkg/cloud-integration'

const cloud = new CloudIntegration({
  accessToken: process.env.ACCOUNT_ACCESS_TOKEN,
  aiuiEndpoint: process.env.AIUI_ENDPOINT,
})

const result = await cloud.getToken()
```

The `application/json` response has a string schema, and the SDK returns the parsed string. The protocol does not define a JSON structure inside it, so treat it as opaque and do not invent or depend on undeclared fields.

## Use HTTP

```text
GET https://<aiui-host>/account/v1/token
```

```bash
curl --location 'https://<aiui-host>/account/v1/token' \
  --header 'access_token: <ACCOUNT_ACCESS_TOKEN>'
```

A successful response is `200 application/json` with a string schema. Invalid authentication returns `401`.

The account credential is a server-side secret. Read it from an environment variable or secret manager, and never put it in page code, client bundles, source control, request logs, or error messages. For a `401`, verify the credential source, expiration, and request environment.
