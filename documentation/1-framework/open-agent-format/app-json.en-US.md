# app.json

`app.json` is the application configuration file at the root of an AIUI project. It tells AIUI which pages the project contains and, when needed, which Widgets, background tasks, and permissions it declares.

Think of `app.json` as declaring **entry points and settings**. The actual interfaces and behavior are written in page, Widget, and other project files.

## Start with One Page

Here's a basic configuration:

```json
{
  "pages": ["pages/index/index"],
  "window": {
    "navigationBarTitleText": "My Agent"
  }
}
```

- `pages` lists page paths relative to the project root, without file extensions. For example, `pages/index/index` can correspond to `pages/index/index.ink`.
- `window` sets application-level window defaults. Here `navigationBarTitleText` supplies a title; how it appears depends on the interface presentation.

After declaring the path, create the corresponding page file. A page can also use multiple files at the same path; see [Page Overview](/AIUI/framework/open-agent-format-page).

### How Is the Default Page Chosen?

When another opening entry is not specified, the first item in `pages` is the default. To choose another default page, set `entryPagePath` to a path already declared in `pages`:

```json
{
  "pages": ["pages/index/index", "pages/settings/index"],
  "entryPagePath": "pages/settings/index"
}
```

This makes the settings page the default. Another declared entry may also be specified when opening the application.

## Add Widgets and Background Tasks When Needed

Widgets and Agent Workers are optional. Declare them in `app.json` when you need a small independent interface or a background task:

```json
{
  "pages": ["pages/index/index"],
  "widgets": [
    {
      "path": "widgets/weather/index",
      "family": "1x2",
      "placement": "overlay",
      "displayName": "Weather",
      "description": "Shows the weather and temperature."
    }
  ],
  "agentWorkers": [
    {
      "name": "sync",
      "script": "workers/sync.js",
      "trigger": { "type": "open" },
      "lifetime": "instant"
    }
  ]
}
```

A Widget's `path` corresponds to its file, such as `widgets/weather/index.ink`. `family` is the size category: currently `1x1` or `1x2`, and it must match the declaration in the Widget file. `placement` controls presentation: `persistent` is the default, while `overlay` can be opened with `window.open(..., '_widget')`.

`agentWorkers` declares a background script's name, path, trigger, and lifetime. The example uses `instant` for a short one-time task; explore `foreground` if it needs to run while a Page or Widget is open. The developer still needs to write the script.

For complete rules and files, see [Widget](/AIUI/framework/open-agent-format-widget) and [Agent Worker](/AIUI/framework/open-agent-format-agent-worker).

### Provide Widget Text in Another Language

`app.json` needs a default `displayName` and `description`. To add English, for example, create `app.en-US.json` at the project root:

```json
{
  "locale": "en-US",
  "widgets": {
    "widgets/weather/index": {
      "displayName": "Weather",
      "description": "Shows the weather and temperature."
    }
  }
}
```

The locale file's `widgets` object uses each Widget's `path` as its key. It overrides only `displayName` and `description`, not configuration such as `family` or `placement`. The runtime matches the user's language preferences and falls back to `app.json` when a locale or field is missing. Use BCP 47 tags in filenames, such as `app.en-US.json` or `app.zh-TW.json`.

## Declare the Permissions Your App Needs

For capabilities such as location, camera, microphone, or the system media library, declare the permissions the app actually needs in `permissions`. For example:

```json
{
  "pages": ["pages/index/index"],
  "permissions": ["GEOLOCATION", "CAMERA", "RECORD_AUDIO"]
}
```

Permission names are case-sensitive. Common declarations include:

| Permission | Purpose |
| --- | --- |
| `GEOLOCATION` | Get a location or receive location updates |
| `CAMERA` | Capture images or video with the camera |
| `RECORD_AUDIO` | Capture audio with the microphone |
| `READ_MEDIA_IMAGES` | List and read images in the media library |
| `CREATE_MEDIA_IMAGES` | Add images to the media library; does not include changing or replacing existing assets |
| `READ_MEDIA_AUDIO` | List and read audio in the media library |
| `CREATE_MEDIA_AUDIO` | Add audio to the media library; does not include changing or replacing existing assets |

Declare `INTERNET` for network features. Not every network API currently checks this declaration; consult the relevant API documentation for its requirements.

`permissions` is an application declaration; **it does not mean the user has granted access**. Sensitive capabilities may also need device authorization. Even if declared, a call can still fail if the user denies access or the device doesn't support it. Handle denial and unavailable capabilities. Unknown permission names do not automatically grant access.

Use [Permission State](/AIUI/api/permissions) to query location, camera, and microphone status without prompting. Request access through the relevant sensitive API; there is no general `navigator.permissions.request()`. Declarations are read at application startup, so editing the file does not update a running session. See [Geolocation](/AIUI/api/geo-data-geolocation) and [Media Capture](/AIUI/api/media-media-capture) for the related capabilities.

## How Do `app.json`, `app.js`, and `AGENTS.md` Differ?

| File | Responsibility |
| --- | --- |
| `AGENTS.md` | Describes the agent's identity, responsibilities, and behavioral guidance |
| `app.json` | Declares entry points, window configuration, and permissions |
| `app.js` | Defines application-level logic and shared data |

For example, `app.js` can run code when the agent initializes:

```javascript
export default {
  onLaunch() {
    console.log('Agent started');
  },
  globalData: {
    city: 'Hangzhou'
  }
};
```

Common application-level callbacks include `onLaunch` (initialization), `onShow` (startup or return to the foreground), `onHide` (move to the background), and `onError` (application script errors). These differ from an individual page's lifecycle; handle API failures using the error mechanism for that API too.

## Continue Reading

- [AGENTS.md](/AIUI/framework/config-agents): Learn about agent descriptions.
- [Page Overview](/AIUI/framework/open-agent-format-page) and [Page Definition](/AIUI/framework/open-agent-format-page-definition): Create and configure pages.
- [Widget](/AIUI/framework/open-agent-format-widget) and [Agent Worker](/AIUI/framework/open-agent-format-agent-worker): Explore the optional entry points.
