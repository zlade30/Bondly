import { Platform } from 'react-native';

/** Bondly's website, published from the repo's docs/ folder with GitHub Pages. */
export const SITE_URL = 'https://zlade30.github.io/Bondly';

/**
 * Bondly's App Store ID (the number in its apps.apple.com link). Fill this in
 * once the app is listed: it turns on the "Rate Bondly" row in Settings on iPhone.
 */
export const APP_STORE_ID = '';

/** Bondly's Android package, as in app.json. */
export const ANDROID_PACKAGE = 'com.zalstudio.bondly';

/**
 * Set to true once Bondly is live on Google Play: it turns on the
 * "Rate Bondly" row in Settings on Android.
 */
export const ON_GOOGLE_PLAY = false;

/**
 * Where "Rate Bondly" goes, or null while the app isn't listed on this
 * platform's store. iOS opens the App Store straight on "Write a Review";
 * Google Play has no such link, so Android opens the listing at its reviews.
 */
function writeReviewUrl() {
  if (Platform.OS === 'ios') {
    return APP_STORE_ID ? `itms-apps://itunes.apple.com/app/id${APP_STORE_ID}?action=write-review` : null;
  }
  if (Platform.OS === 'android') {
    return ON_GOOGLE_PLAY ? `market://details?id=${ANDROID_PACKAGE}&showAllReviews=true` : null;
  }
  return null;
}

export const Links = {
  site: `${SITE_URL}/`,
  privacy: `${SITE_URL}/privacy.html`,
  terms: `${SITE_URL}/terms.html`,
  writeReview: writeReviewUrl(),
  /** Web fallback for the Play listing, if the Play Store app can't open. */
  playStoreWeb: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}&showAllReviews=true`,
} as const;
