# RevenueCat setup for the Bondly paywall

Bondly uses a hard paywall: after onboarding, people start a 7-day free trial
(or buy lifetime) to use the app. RevenueCat handles the App Store and Google
Play purchases, the trial and receipts. Settings stays reachable from the
paywall, so anyone can restore a purchase, sign in or delete their account.

Keys go in [`src/constants/revenuecat-config.ts`](../src/constants/revenuecat-config.ts).
They're public SDK keys, safe to ship in the app. Never put a RevenueCat
**secret** key (`sk_…`) in the app or the repo.

## 1. Create the project

1. Sign up at https://app.revenuecat.com and create a project called **Bondly**.

## 2. Test Store (for development)

The Test Store lets you test purchases in a development build without any App
Store setup.

1. **Apps and providers → Test configuration → Create Test Store.** Copy its API
   key (starts with `test_`) into `REVENUECAT_TEST_KEY`.
2. **Product catalog → Products → New**, in the Test Store. Create:

   | Identifier | Type | Duration | Price | Free trial |
   | --- | --- | --- | --- | --- |
   | `bondly_weekly` | Subscription | 1 week | e.g. $3.99 | 7 days |
   | `bondly_monthly` | Subscription | 1 month | e.g. $9.99 | 7 days |
   | `bondly_yearly` | Subscription | 1 year | e.g. $49.99 | 7 days |
   | `bondly_lifetime` | Non-consumable | — | e.g. $99.99 | — |

   Test Store products can't be edited after saving, so double-check them.

3. **Product catalog → Entitlements → New:** identifier `bondly_pro` (display name "Bondly Pro"). Attach all
   four products.
4. **Product catalog → Offerings → New:** identifier `default`, and make it the
   current offering. Add four packages using the built-in types, each with its
   product: **Weekly**, **Monthly**, **Annual** and **Lifetime**.

The development build shows these plans, and a test purchase shows a RevenueCat
sheet where you choose to succeed, fail or cancel.

The Test Store key must never ship: RevenueCat crashes release builds that use
it on purpose.

## 3. App Store (before TestFlight and launch)

1. In **App Store Connect**, create the app with bundle ID `com.zalstudio.bondly`.
2. **Subscriptions:** create a group "Bondly Premium" with weekly, monthly and
   yearly subscriptions (same identifiers as above), each with a **7-day free
   trial** introductory offer.
3. **In-App Purchases:** create a non-consumable `bondly_lifetime`.
4. In RevenueCat, **Apps and providers → New → App Store**, with bundle ID
   `com.zalstudio.bondly` and an **In-App Purchase key** from App Store Connect
   (Users and Access → Integrations → In-App Purchase).
5. Import the App Store products, attach them to the `bondly_pro` entitlement and
   to the same packages in the `default` offering.
6. Copy the App Store public key (starts with `appl_`) into `REVENUECAT_APPLE_KEY`.

## How it works in the app

- `src/features/premium/subscription.tsx` configures RevenueCat, follows the
  customer's status, and links purchases to the signed-in Bondly account, so a
  subscription follows the person to a new phone.
- `src/app/paywall.tsx` shows the plans, with the trial, price and renewal terms,
  Restore, and links to the Terms and Privacy Policy, as Apple requires.
- Development builds have a "Skip for now" link so you aren't locked out while
  working. It doesn't exist in release builds.
