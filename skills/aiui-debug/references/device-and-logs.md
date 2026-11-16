# Device and log evidence

Use the user's existing logs before collecting more. Device output may contain private data; avoid copying it into public examples or repositories. In answers quote only the minimum useful evidence, and redact secrets and identifiers.

## Capture a reproduction

Check `adb devices -l` when ADB is available. If multiple devices are connected, identify the intended one and use `adb -s <serial>` consistently. Treat unauthorized or offline devices as unavailable until the user resolves access. Do not assume a device is attached.

Start capture before the operation, reproduce it, and stop with Ctrl+C. A full log is useful when correlating system, host, and runtime events:

```bash
adb logcat -b all -v threadtime '*:V' > aiui-repro.log
```

For a narrow live view where the installed build uses this tag:

```bash
adb logcat -b main -v threadtime 'Ink:V' '*:S'
```

Keep a full capture when investigating host, system, or device behavior: the filtered command omits those logs and may omit runtime logs under other tags. Filtering at the reader cannot restore logs not produced by the app or suppressed before they reach logcat. Android runtime logging varies with SDK version and host initialization; determine the deployed build's behavior rather than assuming a tag, message or log level.

`-v time` changes formatting; `-b all` requests available buffers, not unlimited history. Buffers have independent retention, and high-volume output can overwrite relevant entries. Check each buffer's earliest timestamp and whether the capture covers the action. No matching message is not proof that a component never ran, a page never appeared, or an operation was never invoked. `I/Ink` may contain app console output of any semantic severity; inspect message content, not just logcat priority. Messages may be truncated by the app or capture; look for an independent complete occurrence before interpreting the missing suffix. A shared prefix across operations suggests a connection but does not establish identical underlying errors. An accepted request does not establish that it completed or was presented to the user.

For suspected focus or input issues, capture `adb shell dumpsys window`, `adb shell dumpsys input`, and `adb shell dumpsys activity activities` while the symptom is present, if available. A focused window is evidence about key focus, not proof of the destination of a touch. Correlate the actual input modality with the event and page, and inspect occlusion separately. Android Activity transitions may not reveal an AIUI route inside an existing host.

Do not clear shared log buffers to simplify collection. Avoid exposing serial numbers, local addresses, package payloads, tokens, or signed URLs. Logs may contain sensitive values even when an individual message looks routine.
