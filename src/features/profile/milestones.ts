import AsyncStorage from '@react-native-async-storage/async-storage';

import { todayKey } from '@/features/learn/progress';

/** Streak lengths worth a proper celebration, with what to say at each. */
export const MILESTONES: { days: number; badge: string; title: string; body: string }[] = [
  {
    days: 7,
    badge: 'One week',
    title: 'A whole week!',
    body: 'Seven days in a row of showing up for the people you care about.',
  },
  {
    days: 30,
    badge: 'One month',
    title: 'A month-long streak!',
    body: 'Thirty days of small steps. That’s a real habit now.',
  },
  {
    days: 100,
    badge: '100 days',
    title: '100 days strong!',
    body: 'A hundred days of practice. Your relationships are feeling it.',
  },
  {
    days: 365,
    badge: 'One year',
    title: 'A full year!',
    body: 'Every single day for a year. That’s something to be proud of.',
  },
];

export function milestoneFor(days: number) {
  return MILESTONES.find((m) => m.days === days) ?? null;
}

const STORAGE_KEY = 'bondly.streak.lastMilestone';

/**
 * Whether today's milestone has already been celebrated. A streak only grows
 * once a day, so remembering the day is enough; a rebuilt streak that reaches
 * a milestone again on a later day gets its own celebration.
 */
export async function celebratedToday() {
  try {
    return (await AsyncStorage.getItem(STORAGE_KEY)) === todayKey();
  } catch {
    return false;
  }
}

export function markCelebrated() {
  AsyncStorage.setItem(STORAGE_KEY, todayKey()).catch(() => {});
}
