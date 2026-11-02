# Speech Recognition

Speech recognition (ASR) converts what the user says in real time into text. It is suitable for scenarios such as voice input, voice commands, and conversational interactions.

In AIUI, speech recognition is usually the first step in the voice interaction pipeline: first recognize what the user said, then pass the text to your business logic or a large language model for processing.

## Use Cases

- Voice input fields
- Voice Q&A
- Voice control commands
- Interaction flows that need to listen and process at the same time

## Basic Usage

Create a recognition instance with `SpeechRecognition`:

```javascript
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
  const best = event.results[0][0];
  console.log('识别结果:', best.transcript);
  console.log('置信度:', best.confidence);
};

recognition.onerror = (event) => {
  console.error('识别错误:', event.error, event.message);
};

recognition.start();
```

## Common Methods

- **`start()`**: Starts one recognition session.
- **`stop()`**: Requests to end recognition and produce the final result.
- **`abort()`**: Immediately aborts recognition.

## Best Practices

- Before starting recognition, make sure the UI is in an interactive state.
- Clearly show states such as "listening", "recognizing", and "completed" to the user.
- When recording audio for `SpeechRecognitionSession`, prefer Opus if both recording and recognition support it to reduce audio data size and transmission bandwidth. See the [Speech Recognition API reference](/AIUI/api/ai-speech-recognition) for format selection and a complete example.

## Continue Reading

- **[Speech Synthesis](/AIUI/guide/basic-ai-tts)**: See how to speak the result back to the user.
- **[Large Language Model](/AIUI/guide/basic-ai-llm)**: See how to pass the recognition result to a model for processing.
- **[Speech Recognition (API Reference)](/AIUI/api/ai-speech-recognition)**: See the complete API reference.
