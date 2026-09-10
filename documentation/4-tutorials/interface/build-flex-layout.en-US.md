# Lay Out a Page with Flexbox

AIUI pages should adapt to the space provided by the host. Use percentage sizing and Flexbox instead of locking the root to device-specific pixels.

## Complete the Example

<!-- aiui-tutorial-step -->

AIUI pages should adapt to the space provided by the host. Use percentage sizing and Flexbox instead of locking the root to device-specific pixels.

```css
.page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 20px;
  gap: 12px;
}

.content {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
}
```

<!-- /aiui-tutorial-step -->

Check the interface at multiple preview sizes in AIUI Studio.

