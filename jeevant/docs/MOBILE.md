# Mobile decision: PWA or Capacitor

Short answer: stay PWA until a specific chore genuinely requires a native shell.
The wrapper does not unlock control of other apps.

## What each option actually gives you

| Capability | PWA (current) | Capacitor wrapper |
|---|---|---|
| Install on Android | Home Screen / install prompt | APK, Play Store |
| Install on iOS | Add to Home Screen (16.4+ for push) | App Store (needs a Mac + Apple account) |
| Web Push, app closed | Yes, with VAPID + HTTPS | Yes, native push |
| Camera and file picker | Browser APIs, limited | Full native pickers |
| Share sheet out | Yes (Web Share API) | Yes |
| Receive shared content | Android only (Share Target) | Both platforms |
| Deep links / intents | URLs only | Android intents |
| Background work | Service worker only | Android services; iOS still restricted |
| Control other apps or settings | No | **Still no** on iOS; Android needs accessibility hacks |
| Calls, SMS, alarms, music, HomeKit | No | Only through each platform's allowed APIs |

## Recommendation

Finish and use the PWA:

- It is free, has no store review, updates instantly, and already supports push.
- Every chore that matters here is server-side: tasks, mail, calendar, posting,
  messaging, tracking, approvals.
- The remaining gaps are input surfaces (camera, share-in on iOS), not automation.

Add Capacitor only if one of these becomes a real requirement:

1. Android share-in from other apps is essential.
2. You need native camera or file access beyond the browser pickers.
3. You want Play Store distribution.
4. You need Android background services for periodic sync.

## What the wrapper would cost

- A native build toolchain (Android SDK; Xcode on a Mac for iOS).
- Signing keys, versioning, and store accounts.
- A second release path for every UI change.
- Push must be rewired to FCM/APNs, or the WebView must host the existing PWA.
- iOS still cannot read other apps, control settings, or run arbitrary background
  tasks, so the promise of "more OS control" is mostly an Android-only story.

## If we do it

The least painful path is a thin Capacitor shell that loads the existing app and
adds only:

- `ShareTarget` for Android.
- `Camera` and `Filesystem` plugins.
- Native push via FCM, keeping the current `/api/push` contract as the source of
  truth.

The web app stays the single codebase; the shell is a transport, not a rewrite.
