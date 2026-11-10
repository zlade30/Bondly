import type { Course } from './content';
import type { LessonStep } from './lesson-types';

/**
 * Experience points. Every finished lesson earns a completion bonus plus XP
 * for each question answered right first time, so finishing always counts and
 * doing well counts more. Each lesson keeps its best score, so replays can
 * improve it but can't farm it.
 *
 * In a relationship journey, each lesson is one level (1–10). Finishing a
 * level's lesson always unlocks the next level.
 */

export const XP_PER_ANSWER = 10;
export const FINISH_BONUS = 20;
export const MAX_LEVEL = 10;

/** Steps that are scored (right first time or not). */
const GRADED: LessonStep['kind'][] = ['choice', 'blank', 'scene', 'sort', 'match', 'order'];

function isGraded(step: LessonStep) {
  return GRADED.includes(step.kind);
}

/** XP earned in a lesson play-through. */
export function lessonXp(rightFirstTime: number) {
  return FINISH_BONUS + rightFirstTime * XP_PER_ANSWER;
}

/** The most XP a lesson can give. */
export function maxLessonXp(steps: LessonStep[]) {
  return FINISH_BONUS + steps.filter(isGraded).length * XP_PER_ANSWER;
}

/**
 * Best XP for one lesson. Lessons finished before XP existed have no score
 * saved, so they're credited with the completion bonus.
 */
export function bestXp(lessonId: string, xpByLesson: Record<string, number>, completed: string[]) {
  return xpByLesson[lessonId] ?? (completed.includes(lessonId) ? FINISH_BONUS : 0);
}

/** Total best XP across a course's lessons. */
export function courseXp(course: Course, xpByLesson: Record<string, number>, completed: string[]) {
  return course.lessons.reduce((sum, l) => sum + bestXp(l.id, xpByLesson, completed), 0);
}

/**
 * Where someone is in a journey. `level` is the level they're on now (the
 * next unfinished lesson), or MAX_LEVEL once everything is done.
 */
export function journeyLevel(course: Course, completed: string[]) {
  const levels = Math.min(course.lessons.length, MAX_LEVEL);
  const done = course.lessons.slice(0, levels).filter((l) => completed.includes(l.id)).length;
  const finished = done >= levels;
  return { level: finished ? levels : done + 1, levels, finished, levelsDone: done };
}
