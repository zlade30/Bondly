import AsyncStorage from '@react-native-async-storage/async-storage';
import * as StoreReview from 'expo-store-review';
import { Platform } from 'react-native';

/**
 * Asking for an App Store rating, politely.
 *
 * Bondly shows Apple's own rating popup straight away, with no "Enjoying
 * Bondly?" question first: Apple and Expo advise against asking anything
 * before the rating card, and steering only happy people to the store is
 * review gating, which Google Play forbids. The popup has its own "Not Now".
 *
 * Apple never tells an app whether someone rated or tapped Not Now, and shows
 * the popup at most three times a year anyway. So instead of asking after
 * every lesson, Bondly asks only at good moments and leaves room in between:
 *
 * - not before the third finished lesson,
 * - then only after a new level, or after 5 more finished lessons,
 * - at least 7 days since the last ask,
 * - and no more than 3 asks in any 365 days.
 */

const STORAGE_KEY = 'bondly.rating.v1';
const DAY = 24 * 60 * 60 * 1000;

export const RATING_RULES = {
  firstAfterLessons: 3,
  lessonsBetween: 5,
  daysBetween: 7,
  maxPerYear: 3,
} as const;

export type RatingState = {
  /** When Bondly asked, newest last (milliseconds). */
  askedAt: number[];
  /** Finished lessons at the last ask. */
  lessonsAtLastAsk: number;
};

const EMPTY: RatingState = { askedAt: [], lessonsAtLastAsk: 0 };

/** Whether now is a good moment to ask. Pure, so it can be tested. */
export function shouldAsk(
  state: RatingState,
  moment: { lessonsDone: number; levelUp: boolean },
  now = Date.now()
): boolean {
  const { firstAfterLessons, lessonsBetween, daysBetween, maxPerYear } = RATING_RULES;
  if (moment.lessonsDone < firstAfterLessons) return false;
  const thisYear = state.askedAt.filter((t) => now - t < 365 * DAY);
  if (thisYear.length >= maxPerYear) return false;
  const last = state.askedAt[state.askedAt.length - 1];
  if (last === undefined) return true;
  if (now - last < daysBetween * DAY) return false;
  return moment.levelUp || moment.lessonsDone - state.lessonsAtLastAsk >= lessonsBetween;
}

async function load(): Promise<RatingState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? { ...EMPTY, ...(JSON.parse(raw) as RatingState) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

/**
 * Called when someone finishes a lesson for the first time. Shows Apple's
 * rating popup if this is a good moment, and remembers that it asked.
 */
export async function maybeAskForRating(moment: { lessonsDone: number; levelUp: boolean }) {
  if (Platform.OS === 'web') return;
  const state = await load();
  if (!shouldAsk(state, moment)) return;
  // False on TestFlight, where Apple doesn't allow the popup.
  if (!(await StoreReview.isAvailableAsync().catch(() => false))) return;

  const next: RatingState = {
    askedAt: [...state.askedAt, Date.now()].slice(-RATING_RULES.maxPerYear),
    lessonsAtLastAsk: moment.lessonsDone,
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  await StoreReview.requestReview().catch(() => {});
}

/** Clears the record, so the next good moment asks again. For Start over. */
export async function resetRating() {
  await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
}
