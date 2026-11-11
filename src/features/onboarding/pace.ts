import type { BondlingColor } from '@/components/bondly/mascot';
import type { TopicIconName } from '@/components/bondly/topic-icons';
import { Palette } from '@/constants/bondly';

import { DAILY_OPTIONS, type DailyMinutes } from './content';

/** A little mascot for each daily pace: Gentle, Steady, Committed, All in. */
export const PACE_ART: Record<DailyMinutes, { icon: TopicIconName; color: BondlingColor; tint: string }> = {
  3: { icon: 'dandelion', color: 'mint', tint: Palette.mint },
  5: { icon: 'tortoise', color: 'blue', tint: Palette.sky },
  10: { icon: 'boot', color: 'peach', tint: Palette.butter },
  15: { icon: 'rocket', color: 'lavender', tint: Palette.lilac },
};

/** The goal used before one is chosen, matching the onboarding tip. */
export const DEFAULT_DAILY_MINUTES: DailyMinutes = 5;

/** The pace's name for a daily goal, e.g. "Gentle" for 3 minutes. */
export function paceName(minutes: DailyMinutes) {
  return DAILY_OPTIONS.find((o) => o.minutes === minutes)?.note ?? '';
}
