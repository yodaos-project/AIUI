# Rokid Glasses Notifications

Use the Rokid account SK as a Bearer token to send an agent notification to one
Rokid Glasses user. The endpoint is
`POST https://rcs.rokid.com/metis/callback/message`.

With `@yodaos-pkg/cloud-integration`, configure the SK as `token` and call
`sendNotification()` with non-empty `messageId`, `accountId`,
`message.agentId`, and `message.content` values. The SDK converts camelCase to
the HTTP API's `message_id`, `account_id`, and `agent_id` fields.

```js
const cloud = new CloudIntegration({
  token: process.env.ROKID_SK,
})

await cloud.sendNotification({
  messageId: 'message-unique-id',
  accountId: 'target-account-id',
  message: {
    agentId: 'agent-id',
    content: 'Notification text shown on the Glasses.',
  },
})
```

The equivalent direct request is:

```bash
curl --location 'https://rcs.rokid.com/metis/callback/message' \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer ${ROKID_SK}" \
  --data '{
    "message_id": "message-unique-id",
    "account_id": "target-account-id",
    "message": {
      "agent_id": "agent-id",
      "content": "Notification text shown on the Glasses."
    }
  }'
```

For page navigation, add `message.tool`. Its `name` must exactly match a route
registered in `app.json`. `parameters.type` must be `"object"`, and
`parameters.properties` must be an object whose values are passed through to
the destination page.

```bash
curl --location 'https://rcs.rokid.com/metis/callback/message' \
  --header 'Content-Type: application/json' \
  --header "Authorization: Bearer ${ROKID_SK}" \
  --data '{
    "message_id": "outfit-message-id",
    "account_id": "target-account-id",
    "message": {
      "agent_id": "agent-id",
      "content": "View outfit suggestions",
      "tool": {
        "name": "pages/cloth/index",
        "parameters": {
          "type": "object",
          "properties": {
            "field": "value"
          }
        }
      }
    }
  }'
```

The method resolves with the complete server response only when `code === 1`
and `data.success === true`. Invalid input raises
`CloudIntegrationValidationError`; transport, HTTP, JSON parsing, and business
failures raise `CloudIntegrationError`. Use redacted payload and UUID data for
diagnosis, and never log the SK or Authorization header.

Retry only clearly recoverable network or temporary server failures. Reuse the
same `messageId` for every attempt. Do not retry validation failures or retry
without a bound when the server outcome is unknown.
