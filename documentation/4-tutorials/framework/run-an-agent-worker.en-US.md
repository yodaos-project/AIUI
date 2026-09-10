# Run an Agent Worker

Agent Workers are intended for background tasks without an interface. Declare the entry in `app.json` and handle each open event in the script's `onOpen()`.

## Complete the Example

<!-- aiui-tutorial-step -->

Agent Workers are intended for background tasks without an interface. Declare the entry in `app.json` and handle each open event in the script's `onOpen()`.

```javascript
export default {
  openCount: 0,

  onOpen(event) {
    this.openCount += 1;
    console.log('Worker opened', this.openCount, event.type);
  }
};
```

<!-- /aiui-tutorial-step -->

Agent Workers do not provide `fetch`, page routing, or interface rendering. See [Agent Worker](/AIUI/framework/open-agent-format-agent-worker).

