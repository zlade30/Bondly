# Releasing Bondly

Bondly is built and published by hand, without EAS. The native projects in
`ios/` and `android/` are committed and are the source of truth.

Before every release:

```bash
npx tsc --noEmit
npx expo lint
```

## 1. Bump the version

Use the same version on both platforms. The build number must go up for every
upload, even when the version stays the same.

| | Version (shown in the store) | Build number |
|---|---|---|
| iOS | `MARKETING_VERSION` (Xcode → Bondly target → General → Version) | `CURRENT_PROJECT_VERSION` (Build) |
| Android | `versionName` in `android/app/build.gradle` | `versionCode` in `android/app/build.gradle` |

Also update `version` in `app.json` so it stays in step, but it doesn't
change the builds by itself.

## 2. iOS → App Store

One-time setup: Xcode → Settings → Accounts, signed in with the Apple
developer account for team `Y4BQ9LRMZB`. Signing is automatic.

1. `npm run ios:open` (opens `ios/Bondly.xcworkspace` in Xcode).
2. Pick **Any iOS Device (arm64)** as the run destination.
3. **Product → Archive.** Xcode builds a Release build with the JavaScript bundled in.
4. In the Organizer window that opens: **Distribute App → App Store Connect → Upload**.
5. In about 10–30 minutes the build shows in App Store Connect under
   **TestFlight**. Test it there, then pick it on the version page and
   **Submit for Review**.

## 3. Android → Google Play

### One-time: Android Studio

Install Android Studio, then let it install the Android SDK. Add to `~/.zshrc`:

```bash
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
```

### One-time: the upload key

Google Play needs every upload signed with your **upload key**. Create it once,
keep it outside the repo, and back it up somewhere safe (a password manager).

```bash
mkdir -p ~/keys
keytool -genkeypair -v -storetype PKCS12 -keystore ~/keys/bondly-upload.jks \
  -alias bondly-upload -keyalg RSA -keysize 2048 -validity 10000
```

Then add these lines to `~/.gradle/gradle.properties` (your home folder, **not**
the repo), using the passwords you just chose:

```properties
BONDLY_UPLOAD_STORE_FILE=/Users/<you>/keys/bondly-upload.jks
BONDLY_UPLOAD_STORE_PASSWORD=...
BONDLY_UPLOAD_KEY_ALIAS=bondly-upload
BONDLY_UPLOAD_KEY_PASSWORD=...
```

When you create the app in Play Console, keep **Play App Signing** on (the
default). Google then holds the real signing key, and a lost upload key can be
reset through Play Console support.

### Each release

```bash
npm run android:bundle
```

This writes `android/app/build/outputs/bundle/release/app-release.aab`. Upload
it in Play Console → your app → **Test and release** → a testing track or
**Production** → **Create new release**.

If the upload key isn't set up, the bundle is signed with the debug key and
Play Console rejects it.

## Native changes

- Don't run `npx expo prebuild`: it overwrites the committed native projects.
- Changes to `app.json` (icon, splash, name, permissions, plugins) must also be
  made in `ios/` and `android/` by hand.
- After adding a package with native code: `npx pod-install`, then rebuild.
