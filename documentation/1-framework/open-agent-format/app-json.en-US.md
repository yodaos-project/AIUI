# app.json

In AIUI's extension of Open Agent Format, `app.json` defines application-level entries and global configuration. It determines where an agent application starts and how its Pages, Widgets, Agent Workers, and global window behavior are organized.

However, a complete application-level definition usually includes more than `app.json`. It is typically used together with an application-level logic entry. You can think of it as:

- `app.json`: Defines Pages, Widgets, Agent Workers, and global configuration
- `app.js`: Defines application-level logic and the global lifecycle

## What `app.json` Is Responsible For

`app.json` is mainly used to declare:

- Which pages the application contains
- Which Widgets the application contains
- Which background tasks run with the agent
- Which page the application starts from
- Global window styles
- Shared base configuration across pages

A typical example looks like this:

```json
{
  "pages": [
    "pages/index/index",
    "pages/logs/logs"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "AIUI Agent",
    "navigationBarTextStyle": "black"
  }
}
```

The most important parts here are:

- `pages`: Declares the list of page paths
- `window`: Declares the global window configuration

## Declare Widgets and Background Tasks

In addition to Pages, `app.json` can declare Widgets and Agent Workers:

```json
{
  "pages": ["pages/index/index"],
  "widgets": [
    {
      "path": "widgets/weather/index",
      "family": "1x2",
      "placement": "overlay",
      "displayName": "Weather",
      "description": "Shows the weather and temperature for your current location."
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

- `widgets` declares each independent Widget's entry point, name, description, size family, and presentation mode. `placement` accepts `persistent` for a fixed Widget or `overlay` for a Widget opened with `window.open(..., '_widget')`, and defaults to `persistent` when omitted.
- `agentWorkers` declares the name, entry file, start condition, and lifetime of a background script.

For complete configuration and examples, see [Widget](/AIUI/framework/open-agent-format-widget) and [Agent Worker](/AIUI/framework/open-agent-format-agent-worker).

### Localize Widget Metadata

`app.json` is the complete default configuration and provides the default `displayName` and `description` for every Widget. To add another language, create an `app.<locale>.json` file in the application root that overrides only Widget metadata:

```json
{
  "locale": "en-US",
  "widgets": {
    "widgets/weather/index": {
      "displayName": "Weather",
      "description": "Shows the weather and temperature for your current location."
    }
  }
}
```

The `widgets` value in a locale file is keyed by the Widget `path` and may override only `displayName` and `description`. It must not change `family`, `placement`, or other runtime configuration. The runtime selects a locale file from the user's language preferences and falls back to `app.json` when the locale or a field is missing. Use BCP 47 tags in locale filenames, such as `app.en-US.json` and `app.zh-TW.json`.

## Declare Permissions

When an application needs sensitive capabilities such as location, camera, microphone, or the system media library, declare the corresponding permissions in the `permissions` array in `app.json`:

```json
{
  "pages": ["pages/index/index"],
  "permissions": [
    "GEOLOCATION",
    "CAMERA",
    "RECORD_AUDIO"
  ]
}
```

Permission names are case-sensitive. Declare only the permissions the application actually needs. An API fails when its required runtime permission is not declared. Unrecognized strings grant no capability.

The following permissions can currently be declared:

| Permission | Description | Current behavior |
| :--- | :--- | :--- |
| `GEOLOCATION` | Get the current location or receive location updates | `navigator.geolocation` checks this permission; see [Geolocation](/AIUI/api/geo-data-geolocation) |
| `CAMERA` | Access cameras and capture images or video | Camera and video-capture APIs check this permission |
| `RECORD_AUDIO` | Access microphones and capture audio | Microphone and audio-capture APIs check this permission; see [Media Capture](/AIUI/api/media-media-capture) |
| `READ_MEDIA_IMAGES` | List and read images in the system media library | Media-library image read operations check this permission |
| `CREATE_MEDIA_IMAGES` | Add images to the system media library | Media-library image save operations check this permission; it does not allow modifying or replacing existing assets |
| `READ_MEDIA_AUDIO` | List and read audio in the system media library | Media-library audio read operations check this permission |
| `CREATE_MEDIA_AUDIO` | Add audio to the system media library | Media-library audio save operations check this permission; it does not allow modifying or replacing existing assets |

`permissions` is a capability declaration in the application manifest; it does not replace authorization from the device operating system. Location, camera, microphone, and media-library access may also require the user to grant system permission. Even when a permission is declared in `app.json`, the API can still fail if system authorization is denied or the device does not support the capability. Applications should handle permission denial and unavailable capabilities.

## Its Relationship With `AGENTS.md`

If `AGENTS.md` defines "who this agent is and what capabilities it has," then `app.json` defines "where this agent application starts and how its UI is organized."

They focus on different concerns:

- `AGENTS.md`: Agent identity, description, system instructions, and capability boundaries
- `app.json`: Application entry, page set, and global UI configuration

## Application-level Logic: `app.js`

In addition to `app.json`, AIUI applications usually have an `app.js` file as the application-level logic entry. It is used to register the application itself and carries the global lifecycle and global data.

Example:

```javascript
export default {
  onLaunch(options) {
    // Agent initialization
  },
  onShow(options) {
    // Agent becomes visible
  },
  onHide() {
    // Agent is hidden
  },
  globalData: {
    // Global data
  }
}
```

You can think of `app.js` as the "application-level logic layer." It focuses more on the behavior of the entire application during startup, display, and hiding, rather than the behavior of a specific page.

## Application-level Lifecycle

Common global lifecycle callbacks in `app.js` include:

| Callback | Description | Trigger Timing |
| :--- | :--- | :--- |
| `onLaunch` | Listens for agent initialization | Triggered once globally when agent initialization is complete |
| `onShow` | Listens for the agent becoming visible | Triggered when the agent starts or returns to the foreground |
| `onHide` | Listens for the agent being hidden | Triggered when the agent moves from the foreground to the background |
| `onError` | Error listener | Triggered when a script error occurs or an API call fails |

These callbacks are different from page-level lifecycles. They describe the entire application rather than a single page.

## Its Place In Open Agent Format

From the perspective of Open Agent Format, `app.json` and `app.js` together complete the "application-level definition" layer:

- `AGENTS.md`: Describes the agent
- `app.json`: Defines Pages, Widgets, Agent Workers, and global configuration
- `app.js`: Defines application-level logic and the global lifecycle
- `pages/`: Defines concrete pages and interactive UI

This is also where AIUI goes beyond a purely descriptive Agent Format: it not only describes the agent, but also defines how the agent exists as a runnable application.

## Recommended Reading

- [AGENTS.md](/AIUI/framework/config-agents)
- [Page Overview](/AIUI/framework/open-agent-format-page)
- [Page Definition](/AIUI/framework/open-agent-format-page-definition)
- [Widget](/AIUI/framework/open-agent-format-widget)
- [Agent Worker](/AIUI/framework/open-agent-format-agent-worker)
