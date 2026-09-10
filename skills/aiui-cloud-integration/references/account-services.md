# AIUI Account Services

This server endpoint uses an account-center credential in the `access_token`
header. It is not an AIUI-side OpenAPI method. With the npm package, configure
`accessToken` and an explicit `aiuiEndpoint`; the contract does not specify a
universal AIUI host.

## Get the account token

`getToken` is available only to system agents:

```js
const cloud = new CloudIntegration({
  accessToken: process.env.ACCOUNT_ACCESS_TOKEN,
  aiuiEndpoint: process.env.AIUI_ENDPOINT,
})

const value = await cloud.getToken()
```

Use `curl` when the integration does not run on Node.js:

```bash
curl --location "${AIUI_ENDPOINT}/account/v1/token" \
  --header "access_token: ${ACCOUNT_ACCESS_TOKEN}"
```

The HTTP method is `GET`, with the `access_token` header. A successful response
has a string schema. Treat the body as opaque; do not invent JSON fields.
Invalid authentication returns `401`.
