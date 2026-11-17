# Choose a Voice for a Spoken Line

Offer two voices for the same spoken line. Use a runtime whose speech synthesis service supports both voice IDs in the example.

## Set the Voice ID on the Utterance

<!-- aiui-tutorial-step -->

Save the complete example as `pages/index/index.ink` in your project. Each tap creates a new `SpeechSynthesisUtterance`. Assign the button’s voice ID to `utterance.voice` and call `speak()`.

```html
<script setup>
export default {
  previewVoice(event) {
    const utterance = new SpeechSynthesisUtterance('Welcome to the voice preview.');
    utterance.voice = event.currentTarget.dataset.voice;
    speechSynthesis.speak(utterance);
  }
};
</script>

<page>
  <view>
    <button data-voice="English_radiant_girl" bindtap="previewVoice">Preview Radiant Girl</button>
    <button data-voice="English_Trustworthy_Man" bindtap="previewVoice">Preview Trustworthy Man</button>
  </view>
</page>
```

<!-- /aiui-tutorial-step -->

## Verify the Result

Tap the first button and wait for it to finish, then tap the second. Listen for the same sentence in two distinct voices.

See [Speech Synthesis](/AIUI/api/ai-speech-synthesis) for the API and available features.
