# Interaction Design

Interaction design for AR agents needs to account for user behavior in three-dimensional space.

## Interaction Modes
Rokid Glasses interaction mainly falls into the following modes:
- **Voice input interaction**: Natural language interaction combined with Rokid voice capabilities is the core interaction mode for agents.
- **Temple touch and tap interaction**:
  - **Slide**: Used for list scrolling, page switching, or parameter adjustment.
  - **Click / tap**: Used to confirm selections or trigger specific actions.
- **Head tracking**: Balances following and spatial anchoring to adjust viewpoint and information placement.
- **Head gestures**: Use nods and shakes for simple hands-free actions such as confirmation or rejection.

## Design Head Gesture Interactions

After enabling world awareness on a page, use `onHeadGesture` to receive recognized nods (`nod`) and shakes (`shake`), and `onHeadGestureStateChange` to show tracking state. See [Page Events: Head Gestures](/AIUI/framework/open-agent-format-page-events#head-gestures) for usage and event fields.

- Tell users which gestures are available and what they do, and give concise feedback when recognition succeeds or is cancelled.
- Avoid treating ordinary head movement as authorization for a high-impact action; provide additional confirmation for important actions.
- Keep an alternative such as touch, buttons, or voice for users who cannot use head gestures or when recognition fails.
- Choose the default `normal` mode or `micro` mode for smaller movements, and validate accidental triggers and recognition on the target device.

## Design Guidelines
1. **Timely feedback**: Every interaction should provide clear visual or sound feedback.
2. **Safe area**: Ensure that core interactive elements stay within the user's comfortable field of view (FOV).
