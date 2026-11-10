import { BOUNDARIES } from './courses/boundaries';
import { COMMUNICATION } from './courses/communication';
import { CONFLICT } from './courses/conflict';
import { CONNECTION } from './courses/connection';
import { LISTENING } from './courses/listening';
import { TRUST } from './courses/trust';
import { JOURNEY_STEPS } from './journeys';
import type { LessonStep } from './lesson-types';

export type { LessonStep } from './lesson-types';

/** Every lesson's steps, keyed by lesson id. Each course lives in ./courses. */
export const LESSON_STEPS: Record<string, LessonStep[]> = {
  ...COMMUNICATION,
  ...TRUST,
  ...BOUNDARIES,
  ...CONFLICT,
  ...CONNECTION,
  ...LISTENING,
  ...JOURNEY_STEPS,
};

export function isPlayable(lessonId: string) {
  return (LESSON_STEPS[lessonId]?.length ?? 0) > 0;
}
