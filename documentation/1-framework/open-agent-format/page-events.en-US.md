# Events

In addition to lifecycle callbacks, AIUI pages also support page-level event handlers for responding to input events such as key presses and voice wakeup.

Page-level events are usually defined on the object exported by the page, for example:

```javascript
export default {
  onKeyDown(event) {
    console.log('key down:', event.code);
  },

  onKeyUp(event) {
    console.log('key up:', event.code);
  },

  onVoiceWakeup(event) {
    console.log('voice wakeup:', event.keyword);
  }
}
```

## Event Callback Table

| Callback | Description | Trigger Timing |
| :--- | :--- | :--- |
| `onKeyDown` | Listens for page-level key-down events | Triggered when the user presses a key |
| `onKeyUp` | Listens for page-level key-up events | Triggered when the user releases a key |
| `onVoiceWakeup` | Listens for page-level voice wakeup events | Triggered when voice wakeup is matched |

## Interception Mechanism

Some page-level events not only notify the page, but also continue to trigger the host's built-in default behavior, such as going back, scrolling, or activating the current target.

If you want the page to take over this kind of behavior, call `event.preventDefault()` inside the corresponding event callback. After it is called, the default behavior of the current event will no longer continue, and the remaining logic will be handled by the page itself.

```javascript
export default {
  onKeyUp(event) {
    if (event.code === 'Backspace') {
      event.preventDefault();
      this.setData({ status: 'back action intercepted' });
    }
  }
}
```

When using the interception mechanism, you can follow these principles:

- If `event.preventDefault()` is not called, the host continues to execute the default behavior of the event after the callback finishes
- If `event.preventDefault()` is called, the current page takes over the event and the host's default behavior will no longer run
- Only events with default behavior are meaningful to intercept. Callbacks such as `onKeyDown`, which are more about immediate notification, are typically used to listen to the input itself
- Whether interception is supported and what the exact default behavior is depend on the event type and host implementation

## Callback Details

### `onKeyDown(Object event)`

Triggered when a key is pressed, corresponding to the page-level `keydown` event. It is suitable for immediate feedback logic for directional keys, confirm keys, or device buttons.

```javascript
export default {
  onKeyDown(event) {
    if (event.code === 'Enter') {
      this.setData({ status: 'enter pressed' });
    }
  }
}
```

### `onKeyUp(Object event)`

Triggered when a key is released, corresponding to the page-level `keyup` event. You can get the key code through `event.code`, and you can also call `event.preventDefault()` when needed to prevent the default behavior.

```javascript
export default {
  onKeyUp(event) {
    if (event.code === 'Backspace') {
      event.preventDefault();
      this.setData({ status: 'back key intercepted' });
    }
  }
}
```

By default, some keys in `keyup` have built-in behavior:

- `Backspace`: Go back to the previous level or request to close the app
- `ArrowUp` and `ArrowDown`: Scroll the root view
- `Enter`: Enter navigation mode or activate the current target

### `onVoiceWakeup(Object event)`

Triggered when voice wakeup or touch wakeup occurs, corresponding to the page-level `voicewakeup` event.

- **Recommended usage**: It is **not necessary to check `event.keyword`** by default; simply respond and start voice interaction whenever the event fires.
- **Conditional handling**: If you need to distinguish specific wake words or touch wakeup events, inspect `event.keyword`. Common values include voice wake words (`'乐奇'`, `'Hi Rokid'`) and touch wakeup events (such as `'clickAiAssist'`).
- To intercept the host's default behavior, call `event.preventDefault()`.

```javascript
export default {
  onVoiceWakeup(event) {
    event.preventDefault();
    // Recommended: respond directly without filtering keyword
    this.setData({ status: 'voice wakeup received' });

    // If you need to distinguish by wakeup source:
    // if (event.keyword === 'clickAiAssist') { /* Touch wakeup */ }
    // if (event.keyword === '乐奇' || event.keyword === 'Hi Rokid') { /* Voice wakeup */ }
  }
}
```

## Rokid Glasses

On Rokid Glasses, page-level key events usually provide key codes through `event.code`. Common `code` values include `Backspace`, `ArrowUp`, `ArrowDown`, and `Enter`. Some host integrations also report an additional device-side key code named `GlobalHook`.

### `Backspace`

`Backspace` represents a back action.

- In `onKeyDown`, it is usually used to listen for the instant when the user presses the back key
- In `onKeyUp`, if it is not intercepted, the default behavior is to go back one level or request to close the app when there is no page to return to
- If your page needs to take over the back logic, you can call `event.preventDefault()` in `onKeyUp`

```javascript
export default {
  onKeyUp(event) {
    if (event.code === 'Backspace') {
      event.preventDefault();
      this.setData({ status: 'back action intercepted' });
    }
  }
}
```

### `ArrowUp`

`ArrowUp` represents the up directional key.

- In `onKeyDown`, it is suitable for handling instant focus movement or state feedback on key press
- In `onKeyUp`, if it is not intercepted, the default behavior is to scroll the root view upward
- It is commonly used for upward navigation in lists, menus, or scrollable content

```javascript
export default {
  onKeyDown(event) {
    if (event.code === 'ArrowUp') {
      this.setData({ status: 'arrow up pressed' });
    }
  }
}
```

### `ArrowDown`

`ArrowDown` represents the down directional key.

- In `onKeyDown`, it is suitable for handling instant focus movement or state feedback on key press
- In `onKeyUp`, if it is not intercepted, the default behavior is to scroll the root view downward
- It is commonly used for downward navigation in lists, menus, or scrollable content

```javascript
export default {
  onKeyDown(event) {
    if (event.code === 'ArrowDown') {
      this.setData({ status: 'arrow down pressed' });
    }
  }
}
```

### `Enter`

`Enter` represents confirming or activating the current target.

- In `onKeyDown`, it is suitable for handling immediate interaction feedback when the confirm key is pressed
- In `onKeyUp`, if it is not intercepted, the default behavior is to enter navigation mode or activate the current target
- It is commonly used for button confirmation, list item selection, or entering a specific interaction flow

```javascript
export default {
  onKeyDown(event) {
    if (event.code === 'Enter') {
      this.setData({ status: 'enter pressed' });
    }
  }
}
```

### `GlobalHook`

`GlobalHook` is a special key code on Rokid Glasses devices.

- It represents a touch event from the button on the glasses temple
- It is not a standard Web key value, but an additional input signal provided by the device
- It can be handled in `onKeyDown` and `onKeyUp` like a normal key
- It is suitable for device-specific shortcut interactions, such as opening a panel, switching modes, or triggering a custom action

```javascript
export default {
  onKeyUp(event) {
    if (event.code === 'GlobalHook') {
      this.setData({ status: 'temple button touched' });
    }
  }
}
```

## Example

```javascript
export default {
  onKeyUp(event) {
    switch (event.code) {
      case 'Backspace':
        event.preventDefault();
        this.setData({ status: 'back action intercepted' });
        break;
      case 'ArrowDown':
        this.setData({ status: 'arrow down received' });
        break;
      case 'Enter':
        this.setData({ status: 'enter received' });
        break;
      case 'GlobalHook':
        this.setData({ status: 'temple button touched' });
        break;
      default:
        break;
    }
  },

  onVoiceWakeup(event) {
    event.preventDefault();
    // Recommended: respond directly to wakeup
    this.setData({ status: 'voice wakeup received' });
  }
}
```

## Recommended Reading

- [Page Overview](/AIUI/framework/open-agent-format-page)
- [Page Definition](/AIUI/framework/open-agent-format-page-definition)
- [Lifecycle](/AIUI/framework/open-agent-format-page-lifecycle)

## Animation events

`bindanimationstart`, `bindanimationiteration`, `bindanimationend`, and `bindanimationcancel` receive an `AnimationEvent`. Fields are `animationName`, `elapsedTime` in seconds, and `pseudoElement`; `detail` mirrors them. Events bubble to the Page / Widget; use `catch` or `stopPropagation()` to stop propagation.

Animation callbacks can call `setData()` synchronously. Removing a node or closing an entry cancels active animations before unload / destruction callbacks. See [Animations and transforms](/AIUI/framework/wxss-animation) for complete examples.
