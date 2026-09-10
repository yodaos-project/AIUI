# Speak a Text Message

Create a `SpeechSynthesisUtterance`, set its text and language, and pass it to the global `speechSynthesis` object. Check availability first.

## Complete the Example

<!-- aiui-tutorial-step -->

Create a `SpeechSynthesisUtterance`, set its text and language, and pass it to the global `speechSynthesis` object. Check availability first.

```javascript
if (
  typeof speechSynthesis !== 'undefined' &&
  typeof SpeechSynthesisUtterance !== 'undefined'
) {
  const utterance = new SpeechSynthesisUtterance('Welcome to AIUI');
  utterance.lang = 'zh-CN';
  speechSynthesis.speak(utterance);
}
```

<!-- /aiui-tutorial-step -->

See [Speech Synthesis](/AIUI/api/ai-speech-synthesis) for voices, rate, and events.

