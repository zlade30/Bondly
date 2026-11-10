/**
 * RevenueCat public SDK keys. These are meant to ship inside the app
 * (they can only fetch prices and make purchases for the person using it),
 * so they live here rather than in a secret file.
 *
 * Find them in RevenueCat → Project settings → API keys / Apps and providers.
 */

/**
 * Test Store key (starts with "test_"). Used only in development builds.
 * RevenueCat deliberately crashes release builds that use it, and it must
 * never be in an App Store build.
 */
export const REVENUECAT_TEST_KEY = 'test_ctmehuAuSTbcINZeXoLXifvgqai';

/** App Store key (starts with "appl_"). Used in release builds on iPhone. */
export const REVENUECAT_APPLE_KEY = 'appl_LObwPCkwEWeprkMIdJnhmMicxjx';

/** Google Play key (starts with "goog_"). Used in release builds on Android. */
export const REVENUECAT_GOOGLE_KEY = '';

/**
 * Development builds use the Test Store unless this is true. Set it to true to
 * test real App Store products (free trials, sandbox renewals) in a development
 * build with an Apple sandbox account. Release builds always use the store keys.
 */
export const USE_APP_STORE_IN_DEV = true;

/** The entitlement that unlocks Bondly. Must match the identifier in RevenueCat. */
export const PREMIUM_ENTITLEMENT = 'bondly_pro';
