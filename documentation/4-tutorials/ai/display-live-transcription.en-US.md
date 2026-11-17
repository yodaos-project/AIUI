# Show a Live Speech Transcript

Show the current sentence on the page as the user speaks. You need a microphone, recording permission, and a speech recognition service that supplies interim results.

## Declare Recording Permission

<!-- aiui-tutorial-step -->

Add `RECORD_AUDIO` to the `permissions` array in `app.json` and keep your existing settings. When you open the page, allow microphone access if prompted.

```json
{
  "permissions": ["RECORD_AUDIO"]
}
```

<!-- /aiui-tutorial-step -->

## Update the Text with the Latest Result

<!-- aiui-tutorial-step -->

Save the complete example as `pages/index/index.ink` in your project. Call `recognition.start()` from the tap handler. With `interimResults` enabled, the service can revise the same sentence several times. Use the last item in the accumulated results to replace the displayed text, and use `isFinal` to tell when that sentence is final.

```html
<script setup>
export default {
  data: { listening: false, transcript: '', status: '' },

  startListening() {
    if (this.recognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    this.recognition = recognition;

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      if (!result?.[0]) return;

      this.setData({
        transcript: result[0].transcript,
        status: result.isFinal ? 'Final' : 'Interim'
      });
    };

    recognition.onerror = (event) => {
      this.setData({ status: `Recognition failed: ${event.error}` });
    };

    recognition.onend = () => {
      this.recognition = null;
      this.setData({ listening: false });
    };

    this.setData({ listening: true, transcript: '', status: 'Speak now' });
    try {
      recognition.start();
    } catch {
      this.recognition = null;
      this.setData({ listening: false, status: 'Could not start recognition' });
    }
  },

  onUnload() {
    const recognition = this.recognition;
    if (!recognition) return;

    this.recognition = null;
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    recognition.abort();
  }
};
</script>

<page>
  <view>
    <button bindtap="startListening" disabled="{{ listening }}">Start recognition</button>
    <text>{{ transcript }}</text>
    <text>{{ status }}</text>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap “Start recognition” and say a long sentence slowly. Before you finish, look for text marked “Interim.” Revisions replace the previous text. When the service finalizes the sentence, the label changes to “Final.”

See [Speech Recognition](/AIUI/api/ai-speech-recognition) for events and return values.
