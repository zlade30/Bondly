# Supabase setup for Bondly accounts

Accounts are optional. Bondly works fully without one, and signing in backs up
onboarding answers, lesson progress, check-ins and the journal to one private
row per person (`public.user_state`).

The app only uses the project URL and the **publishable** key, which live in
`src/constants/supabase-config.ts`. Never put the secret key, the
`service_role` key or the database password in the app or in this repo.

Dashboard: https://supabase.com/dashboard/project/hpviwfcqlgifxfdvklmn

## 1. Create the table (required)

**SQL Editor → New query**, paste all of
[`migrations/0001_user_state.sql`](migrations/0001_user_state.sql), and click **Run**.

This creates `user_state` with row-level security, so each signed-in person can
read and change only their own row. It also adds `delete_account()`, which lets
someone delete their own account from the app.

## 2. Redirect URLs (required)

**Authentication → URL Configuration → Redirect URLs → Add URL**, and add:

| URL | Used by |
| --- | --- |
| `bondly://auth-callback` | App Store and development builds |
| `exp://**` | Expo Go while developing |

## 3. Email sign-in

Bondly emails a sign-in link. The link only opens Bondly on the phone where
Bondly is installed, so people should open the email on that phone.

Supabase's built-in email sender only delivers to members of your Supabase
organisation, a few times an hour, so real users won't receive anything. Before
launch, connect your own sender under **Authentication → Emails → SMTP Settings**
(for example Resend, with 3,000 free emails a month, or Brevo). On the free plan
this is also what unlocks editing the email templates.

**Branded emails:** once custom SMTP is connected, paste
[`email-templates/confirm-signup.html`](email-templates/confirm-signup.html) into
the **Confirm signup** template and
[`email-templates/magic-link.html`](email-templates/magic-link.html) into
**Magic Link**. Paste into the **Source** tab (not Preview), then check Preview shows the design. Suggested subjects: "Welcome to Bondly" and "Your Bondly sign-in link".

**Testing on the simulator:** copy the link from the email (don't click it on
your Mac, since each link works once) and open it in the simulator:
`xcrun simctl openurl booted "<link>"`.

## 4. Sign in with Google

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials),
   set up the OAuth consent screen, then **Create credentials → OAuth client ID →
   Web application**.
2. Under **Authorized redirect URIs**, add
   `https://hpviwfcqlgifxfdvklmn.supabase.co/auth/v1/callback`.
3. In Supabase, **Authentication → Sign In / Providers → Google**: switch it on
   and paste the client ID and client secret.

Until this is done, the Google button shows an error.

## 5. Sign in with Apple

This needs a paid Apple Developer account, and only works in a development or
App Store build, not in Expo Go.

1. In Apple Developer → **Identifiers**, open (or create) the App ID
   `com.zalstudio.bondly` and turn on **Sign in with Apple**.
2. In Supabase, **Authentication → Sign In / Providers → Apple**: switch it on and
   add `com.zalstudio.bondly,host.exp.Exponent` under **Client IDs** (the second one is Expo Go, for testing). (For native sign-in, a secret key
   isn't needed.)

`app.json` already sets `ios.usesAppleSignIn`, so the next build includes the
entitlement.

## How sync works

- When someone signs in, the app downloads their row, merges it with what's on the
  phone, and uploads the result. It syncs again when the app comes to the
  foreground, and about 2 seconds after any change.
- The merge never loses work: lessons and practice days are combined, today's
  check-in on this phone wins, journal entries keep their newest edit, and deleted
  entries stay deleted everywhere.
- Signing out keeps everything on the phone. **Delete account** removes the account
  and its backup, and leaves the phone's copy alone.
