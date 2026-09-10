# Generate Text with a Language Model

Check `LanguageModel.availability()` first. Create a session and send a prompt only when the capability is available, then release session resources when finished.

## Complete the Example

<!-- aiui-tutorial-step -->

Check `LanguageModel.availability()` first. Create a session and send a prompt only when the capability is available, then release session resources when finished.

```javascript
const status = await LanguageModel.availability();

if (status === 'available') {
  const session = await LanguageModel.create();
  const answer = await session.prompt('Introduce AIUI in one sentence');
  console.log(answer);
} else {
  console.warn('Language model is unavailable');
}
```

<!-- /aiui-tutorial-step -->

See [Generative AI](/AIUI/api/ai) for availability across runtime environments.

