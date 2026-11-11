import type { FocusArea } from '@/features/onboarding/content';

import type { Lesson, LevelInfo } from '../content';
import { tryIt, type LessonStep } from '../lesson-types';

import boundaries from './boundaries-levels.json';
import communication from './communication-levels.json';
import conflict from './conflict-levels.json';
import connection from './connection-levels.json';
import listening from './listening-levels.json';
import trust from './trust-levels.json';

/**
 * Levels 2–10 of each skill refresher. Level 1 is the refresher's original
 * lessons (in ./<id>.ts), so anything already finished stays finished.
 *
 * Each file is checked with `node scripts/check-journey.mjs <file>`, the same
 * checker the relationship journeys use.
 */
type RefresherFile = {
  course: FocusArea;
  /** All ten levels, including level 1. */
  levels: LevelInfo[];
  /** Lessons for levels 2–10. */
  lessons: (Lesson & {
    level: number;
    steps: (LessonStep | { kind: 'try'; body: string })[];
  })[];
};

const FILES = [communication, trust, boundaries, conflict, connection, listening] as RefresherFile[];

/** Each refresher's ten levels and its new lessons (levels 2–10), by refresher id. */
export const REFRESHER_LEVELS: Partial<Record<FocusArea, { levels: LevelInfo[]; lessons: Lesson[] }>> =
  Object.fromEntries(
    FILES.map((file) => [
      file.course,
      {
        levels: file.levels,
        lessons: file.lessons.map(({ id, title, minutes, summary, focus, level }) => ({
          id,
          title,
          minutes,
          summary,
          focus,
          level,
        })),
      },
    ])
  );

/** Steps for every refresher lesson in levels 2–10, keyed by lesson id. */
export const REFRESHER_STEPS: Record<string, LessonStep[]> = Object.fromEntries(
  FILES.flatMap((file) =>
    file.lessons.map((lesson) => [lesson.id, lesson.steps.map((s) => (s.kind === 'try' ? tryIt(s.body) : s))])
  )
);
