import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CloudIntegration,
  CloudIntegrationError,
  CloudIntegrationValidationError,
} from './index.js'

const successPayload = {
  code: 1,
  msg: 'success',
  timestamp: 1783343622284,
  uuid: 'request-id',
  data: { success: true },
}

function mockFetch(payload = successPayload, options = {}) {
  return async (url, request) => {
    options.url = url
    options.request = request
    return {
      ok: true,
      status: 200,
      async text() { return String(payload) },
      async json() { return payload },
    }
  }
}

test('sends a basic notification with the expected request', async () => {
  const captured = {}
  const client = new CloudIntegration({ token: 'secret', fetch: mockFetch(successPayload, captured) })
  const result = await client.sendNotification({
    messageId: 'message-1',
    accountId: 'account-1',
    message: { agentId: 'agent-1', content: 'hello' },
  })

  assert.deepEqual(result, successPayload)
  assert.match(captured.request.headers.Authorization, /^Bearer secret$/)
  assert.deepEqual(JSON.parse(captured.request.body), {
    message_id: 'message-1',
    account_id: 'account-1',
    message: { agent_id: 'agent-1', content: 'hello' },
  })
})

test('preserves tool parameters and supports a custom endpoint', async () => {
  const captured = {}
  const client = new CloudIntegration({ endpoint: 'https://example.test/message', token: 'secret', fetch: mockFetch(successPayload, captured) })
  await client.sendNotification({
    messageId: 'message-1',
    accountId: 'account-1',
    message: {
      agentId: 'agent-1',
      content: 'hello',
      tool: { name: 'pages/cloth/index', parameters: { type: 'object', properties: { field: 'value' } } },
    },
  })

  assert.equal(captured.url, 'https://example.test/message')
  assert.deepEqual(JSON.parse(captured.request.body).message.tool, {
    name: 'pages/cloth/index',
    parameters: { type: 'object', properties: { field: 'value' } },
  })
})

test('validates required fields', () => {
  assert.throws(() => new CloudIntegration(), CloudIntegrationValidationError)
  const notificationClient = new CloudIntegration({ token: 'secret', fetch: mockFetch() })
  const accountClient = new CloudIntegration({ accessToken: 'secret', fetch: mockFetch() })
  assert.rejects(notificationClient.sendNotification(), CloudIntegrationValidationError)
  assert.rejects(accountClient.getToken(), CloudIntegrationValidationError)
  assert.rejects(accountClient.saveTemporaryMessage(), CloudIntegrationValidationError)
})

test('gets the account token as an opaque string', async () => {
  const captured = {}
  const client = new CloudIntegration({
    accessToken: 'account-secret',
    aiuiEndpoint: 'https://aiui.example/',
    fetch: mockFetch('opaque-account-information', captured),
  })

  assert.equal(await client.getToken(), 'opaque-account-information')
  assert.equal(captured.url, 'https://aiui.example/account/v1/token')
  assert.equal(captured.request.headers.access_token, 'account-secret')
})

test('caches an AIUI message with the expected request', async () => {
  const captured = {}
  const payload = { code: 1, msg: 'success', timestamp: 1, uuid: 'request-id', data: {} }
  const client = new CloudIntegration({
    accessToken: 'account-secret',
    aiuiEndpoint: 'https://aiui.example',
    fetch: mockFetch(payload, captured),
  })
  const data = {
    customData: 'custom-data',
    content: 'new message',
  }

  assert.deepEqual(await client.saveTemporaryMessage('agent-1', '/pages/agent/message', data), payload)
  assert.equal(captured.url, 'https://aiui.example/metis/openApi/v1/cacheAIUIMessage')
  assert.equal(captured.request.headers.access_token, 'account-secret')
  assert.deepEqual(JSON.parse(captured.request.body), {
    agentId: 'agent-1',
    path: '/pages/agent/message',
    ...data,
  })
})

test('rejects cache message business failures', async () => {
  const client = new CloudIntegration({
    accessToken: 'account-secret',
    aiuiEndpoint: 'https://aiui.example',
    fetch: mockFetch({ code: 0, msg: 'denied' }),
  })
  await assert.rejects(
    client.saveTemporaryMessage('agent-1', '/page', { customData: 'data', content: 'message' }),
    /denied/,
  )
})

test('throws for transport, HTTP, JSON, and business failures', async (t) => {
  const input = { messageId: 'm', accountId: 'a', message: { agentId: 'g', content: 'c' } }
  await t.test('transport', async () => assert.rejects(
    new CloudIntegration({ token: 'secret', fetch: async () => { throw new Error('offline') } }).sendNotification(input),
    error => error instanceof CloudIntegrationError && error.message === 'notification request failed' && !error.message.includes('secret'),
  ))
  await t.test('HTTP', async () => assert.rejects(
    new CloudIntegration({ token: 'secret', fetch: async () => ({ ok: false, status: 500, async json() { return { code: 0, msg: 'bad' } } }) }).sendNotification(input),
    /HTTP 500/,
  ))
  await t.test('JSON', async () => assert.rejects(
    new CloudIntegration({ token: 'secret', fetch: async () => ({ ok: true, async json() { throw new Error('bad json') } }) }).sendNotification(input),
    /not valid JSON/,
  ))
  await t.test('business', async () => assert.rejects(
    new CloudIntegration({ token: 'secret', fetch: async () => ({ ok: true, async json() { return { code: 0, msg: 'denied' } } }) }).sendNotification(input),
    /denied/,
  ))
})
