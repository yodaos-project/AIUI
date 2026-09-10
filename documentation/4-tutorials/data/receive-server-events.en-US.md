# Receive Server-Sent Events

Use `EventSource` when a server only needs to push incremental updates to the page. Listen for messages and errors, then close the connection when leaving.

## Complete the Example

<!-- aiui-tutorial-step -->

Use `EventSource` when a server only needs to push incremental updates to the page. Listen for messages and errors, then close the connection when leaving.

```javascript
const source = new EventSource('https://api.example.com/agent/stream');

source.addEventListener('message', (event) => {
  console.log('Update:', event.data);
});

source.addEventListener('error', (error) => {
  console.error('Stream failed', error);
});

// Call source.close() when the page no longer needs updates.
```

<!-- /aiui-tutorial-step -->

SSE is one-way. Choose WebSocket for bidirectional communication. See [Event Source](/AIUI/api/network-event-source).
