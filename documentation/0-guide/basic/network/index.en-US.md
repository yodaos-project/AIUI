# Network

Use `fetch()` when a page needs one response from an HTTPS endpoint. In a page handler, replace the example URL with your service URL and check the HTTP status before reading the JSON.

```javascript
const response = await fetch('https://api.example.com/message');
if (!response.ok) {
  throw new Error(`Request failed: ${response.status}`);
}
const data = await response.json();
console.log(data);
```

Call this code from an async handler. Check that the console prints the expected JSON. Handle a rejected request in the page and show an error the user can act on. See [Load and display remote data](../../../4-tutorials/data/load-remote-data.en-US.md) for a full page example.

- [Choose a network API](../../../3-api/network.en-US.md) for HTTPS, server-sent events, or bidirectional communication.
- [Look up `fetch` and `wx.request`](../../../3-api/network/https.en-US.md) for parameters, return values, and streaming behavior.
- [Check how glasses connect to the internet](./usage.en-US.md) before testing or publishing your agent.
