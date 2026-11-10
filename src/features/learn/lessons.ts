import SKILL_ACTIVITIES from './courses/activities.json';
import { BOUNDARIES } from './courses/boundaries';
import { COMMUNICATION } from './courses/communication';
import { CONFLICT } from './courses/conflict';
import { CONNECTION } from './courses/connection';
import { LISTENING } from './courses/listening';
import { TRUST } from './courses/trust';
import { JOURNEY_STEPS } from './journeys';
import type { LessonStep } from './lesson-types';

export type { LessonStep } from './lesson-types';

/**
 * Adds each skill lesson's mini-game (from ./courses/activities.json) just
 * before its closing "Try it today" step.
 */
function withActivities(course: Record<string, LessonStep[]>) {
  const activities = SKILL_ACTIVITIES as Record<string, LessonStep>;
  return Object.fromEntries(
    Object.entries(course).map(([id, steps]) => {
      const activity = activities[id];
      return [id, activity ? [...steps.slice(0, -1), activity, ...steps.slice(-1)] : steps];
    })
  );
}

/** Every lesson's steps, keyed by lesson id. Each course lives in ./courses. */
export const LESSON_STEPS: Record<string, LessonStep[]> = {
  ...withActivities({ ...COMMUNICATION, ...TRUST, ...BOUNDARIES, ...CONFLICT, ...CONNECTION, ...LISTENING }),
  ...JOURNEY_STEPS,
};

export function isPlayable(lessonId: string) {
  return (LESSON_STEPS[lessonId]?.length ?? 0) > 0;
}
