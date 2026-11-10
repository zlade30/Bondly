import type { Course, LevelInfo } from './content';
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

export type JourneyLevel = {
  level: number;
  title: string;
  /** The level's emoji and mascot, when the journey defines them. */
  info?: LevelInfo;
  lessons: Course['lessons'];
};

/**
 * A journey's levels, in order. Each level holds 3–5 lessons that all have to
 * be finished before the next level opens. A journey without level data treats
 * every lesson as its own level.
 */
export function courseLevels(course: Course): JourneyLevel[] {
  const levels: JourneyLevel[] = [];
  course.lessons.forEach((lesson, i) => {
    const level = lesson.level ?? i + 1;
    let group = levels.find((g) => g.level === level);
    if (!group) {
      const info = course.levels?.[level - 1];
      group = { level, title: info?.title ?? lesson.title, info, lessons: [] };
      levels.push(group);
    }
    group.lessons.push(lesson);
  });
  return levels.sort((a, b) => a.level - b.level);
}

/** The level a lesson belongs to, and where it sits within it. */
export function levelOfLesson(course: Course, lessonId: string) {
  const levels = courseLevels(course);
  const group = levels.find((g) => g.lessons.some((l) => l.id === lessonId));
  if (!group) return null;
  return { ...group, index: group.lessons.findIndex((l) => l.id === lessonId), count: group.lessons.length };
}

/**
 * Where someone is in a journey. `level` is the level they're on now (the
 * first one with an unfinished lesson), or the last level once everything is done.
 */
export function journeyLevel(course: Course, completed: string[]) {
  const all = courseLevels(course).slice(0, MAX_LEVEL);
  const isDone = (g: JourneyLevel) => g.lessons.every((l) => completed.includes(l.id));
  const current = all.find((g) => !isDone(g));
  const levelsDone = all.filter(isDone).length;
  const levels = all.length;
  return {
    level: current ? current.level : levels,
    levels,
    finished: !current,
    levelsDone,
    /** Lessons finished in the current level, out of how many. */
    inLevel: current
      ? { done: current.lessons.filter((l) => completed.includes(l.id)).length, total: current.lessons.length }
      : null,
  };
}

/**
 * True when finishing this lesson completes its journey level, given the
 * lessons done before it. Used to celebrate a level-up.
 */
export function finishesLevel(course: Course, lessonId: string, completedBefore: string[]) {
  if (course.kind !== 'journey') return false;
  const where = levelOfLesson(course, lessonId);
  if (!where) return false;
  return where.lessons.every((l) => l.id === lessonId || completedBefore.includes(l.id));
}
