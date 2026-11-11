This is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## Expo has changed — do not trust your training data

Expo ships breaking changes every SDK release. APIs you remember are likely renamed, moved, or removed. Before writing any code that touches an Expo or React Native API:

1. Read the major version of the `expo` package in `package.json`.
2. Fetch the matching versioned docs: `https://docs.expo.dev/versions/v<major>.0.0/`
3. For anything else, fetch https://docs.expo.dev/llms.txt — an index of all Expo docs with corrections to common LLM misconceptions. Follow its links to the specific page you need; never answer from memory.

## Commands

Use `bunx` instead of `npx` if the project uses bun (`bun.lock` present).

```bash
npx expo install <package>  # ALWAYS use instead of npm/yarn/pnpm/bun add — resolves SDK-compatible versions
npx expo start              # start the dev server
npx expo lint               # lint
npx tsc --noEmit            # typecheck
npx expo-doctor             # diagnose dependency and config issues
npx expo install --fix      # fix incompatible package versions
```

Run lint and typecheck before declaring any task done.

## Navigation & Routing

- Use **Expo Router** for all navigation. Routes live in `src/app/` — every file there is a screen, `_layout.tsx` files define navigators. Keep non-route code (components, hooks, utils) outside `src/app/`.
- Import `Link`, `router`, and `useLocalSearchParams` from `expo-router`.
- Docs: https://docs.expo.dev/router/introduction.md

## Building and releasing (no EAS)

Bondly does **not** use EAS. Never run `eas build`, `eas submit` or `eas update`, and don't add `eas.json`, `expo-updates` or an EAS project ID. Builds are made locally with Xcode and Gradle and uploaded by hand; see `RELEASING.md`.

## Rules

- `ios/` and `android/` are committed and are the source of truth for native settings. Edit them directly (in Xcode / Android Studio or by hand). **Never run `npx expo prebuild`** (and especially not `--clean`): it would overwrite hand-made native changes.
- Changes to `app.json` (name, icons, splash, permissions, plugins, version) no longer reach the native projects on their own. Make the same change in `ios/` and `android/` as well.
- The app version and build number live in the native projects: `MARKETING_VERSION` / `CURRENT_PROJECT_VERSION` in Xcode, and `versionName` / `versionCode` in `android/app/build.gradle`.
- After adding a library with native code, run `npx pod-install` (iOS) and rebuild with `npx expo run:ios|android`. Expo Go can't run this app.
- Prefer recommended Expo modules over third-party libraries, and check your available skills before adding dependencies. Docs: https://docs.expo.dev/versions/latest/index.md
