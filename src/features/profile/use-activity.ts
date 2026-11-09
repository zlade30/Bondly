import { useMemo } from 'react';

import { todayKey, useProgress } from '@/features/learn/progress';
import { useJournal } from '@/features/reflect/journal';

import { computeStreak } from './stats';

/** Every day with a finished lesson, a check-in or a journal entry, plus the streak. */
export function useActivity() {
  const { lessonDays, checkIns } = useProgress();
  const { entries } = useJournal();

  return useMemo(() => {
    const days = new Set<string>([
      ...lessonDays,
      ...Object.keys(checkIns),
      ...entries.map((e) => todayKey(new Date(e.createdAt))),
    ]);
    return { activeDays: days, streak: computeStreak(days) };
  }, [lessonDays, checkIns, entries]);
}
