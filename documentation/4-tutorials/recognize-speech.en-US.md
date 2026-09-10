# Recognize a Speech Input

Use `SpeechRecognition` for a simple recognition interaction. Register result and error events before starting, then stop it when the page lifecycle ends.

## Complete the Example

<!-- aiui-tutorial-step -->

Use `SpeechRecognition` for a simple recognition interaction. Register result and error events before starting, then stop it when the page lifecycle ends.

```javascript
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
  const best = event.results[0][0];
  console.log(best.transcript, best.confidence);
};

recognition.onerror = (event) => {
  console.error(event.error, event.message);
};

recognition.start();
```

<!-- /aiui-tutorial-step -->

See [Speech Recognition](/AIUI/api/ai-speech-recognition) for streamed audio and capability negotiation.
