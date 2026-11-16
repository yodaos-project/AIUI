# Common diagnostic paths

Use these as leads, not a checklist of presumed causes. Follow the observed path through the user's source and relevant version of the runtime. A log line can originate in the agent, the host, the runtime, or Android; identify its actual owner.

## Startup and page navigation

Check app manifest and route registration, package extraction, script errors, initial route, and Page lifecycle. Distinguish a request to open, `onLoad` / `onShow`, a first presented frame, and visible usable content. An existing Page can be shown again without another `onLoad`. For Widgets use their own lifecycle. A host Activity remaining in front does not rule out internal page navigation.

## Input and no visible response

Identify the physical input and follow it through host delivery, page key or template event, handler, business operation, state update, and rendered result. Separate key focus from touch hit testing. Check overlays, disabled controls, propagation, handlers and default actions only as relevant to the evidence. For AIUI Page key events, inspect the documented `event.code` and default behavior for the deployed runtime; do not assume browser `event.key` semantics. A handler running or focus moving does not prove a save succeeded; an error branch may intentionally skip the UI update. Conversely, a missing debug message alone does not prove an event was lost.

## Storage and persistence

Find the precise read/write operation and the reported cause. Check synchronous exceptions and async failure callbacks, serialization, app storage scope, permissions, quota, filesystem and runtime/host compatibility as relevant. A runtime error wrapper may be used by multiple APIs; without application source or call-specific evidence, do not infer which API the agent called. Trace what the app does after a failure and whether it masks the result. Search for related failures elsewhere in the same capture and distinguish confirmed shared causes from truncated or ambiguous messages. Compare runtime versions and known fixes with evidence rather than attributing all storage errors to one cause. When a candidate runtime fix exists, verify that the deployed host's actual bundled build contains it before promising the fix will work. Verify writes, readback and persistence across app restarts on the target; avoid clearing user data as a diagnostic shortcut.

## Network and cloud

Identify the actual request, destination, transport, timing and response or failure. Network connected/validated is not proof that a particular endpoint, DNS lookup, certificate, proxy, authentication or WebSocket works. Check declared permissions, host capability availability, transport route and server response without disclosing credentials. Reproduce using an authorized safe request; do not retry operations with side effects unless safe.

## Media and device capabilities

Trace declaration, authorization, availability, request, callback and actual output for the specific camera, microphone, audio, Bluetooth or other capability. Distinguish recognition or request acceptance from successful processing, playback or persistence. Compare simulator and device behavior without assuming either represents the other. Match codec, resource path and lifecycle to the runtime and device in use.

## Rendering and layout

Distinguish script/load failures, layout, first-frame presentation, and subsequent state updates. Inspect viewport, display mode, component and style support, resource loading, visibility, and clipping against the actual target. A renderer's initialization message alone does not prove the requested frame was presented. Validate a change on the intended surface when possible.
