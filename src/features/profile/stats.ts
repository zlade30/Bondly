import { ALL_COURSES, courseProgress, journeyFor, type Course, type Lesson } from '@/features/learn/content';
import { todayKey } from '@/features/learn/progress';
import { SKILLS, type SkillId } from '@/features/onboarding/content';
import { scoreSkills } from '@/features/onboarding/scoring';
import type { OnboardingAnswers } from '@/features/onboarding/store';

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export type Streak = {
  /** Days in a row up to today (or yesterday, if today has no activity yet). */
  current: number;
  longest: number;
  activeToday: boolean;
};

/** A day counts if the person finished a lesson, checked in, or wrote a journal entry. */
export function computeStreak(activeDays: Set<string>, now = new Date()): Streak {
  const activeToday = activeDays.has(todayKey(now));

  let current = 0;
  let cursor = activeToday ? now : addDays(now, -1);
  while (activeDays.has(todayKey(cursor))) {
    current++;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  for (const day of activeDays) {
    const start = new Date(`${day}T12:00:00`);
    // Only count from the first day of each run.
    if (activeDays.has(todayKey(addDays(start, -1)))) continue;
    let length = 0;
    let c = start;
    while (activeDays.has(todayKey(c))) {
      length++;
      c = addDays(c, 1);
    }
    longest = Math.max(longest, length);
  }

  return { current, longest: Math.max(longest, current), activeToday };
}

/**
 * This week, Monday to Sunday, for the streak strip. Days still to come are
 * marked so they can be shown faded.
 */
export function thisWeek(activeDays: Set<string>, now = new Date()) {
  // getDay(): Sunday is 0, so Monday-based index is (day + 6) % 7.
  const monday = addDays(now, -((now.getDay() + 6) % 7));
  const today = todayKey(now);
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(monday, i);
    const key = todayKey(d);
    return {
      key,
      label: d.toLocaleDateString(undefined, { weekday: 'narrow' }),
      active: activeDays.has(key),
      today: key === today,
      future: key > today,
    };
  });
}

/**
 * The skill on the map a lesson builds. Journey lessons carry their own
 * focus; skill refresher lessons take their course's. Listening counts
 * towards connection, which is how the map groups it.
 */
function skillOf(course: Course, lesson: Lesson): SkillId | null {
  const focus = lesson.focus ?? course.id;
  if (focus === 'listening') return 'connection';
  return SKILLS.some((s) => s.id === focus) ? (focus as SkillId) : null;
}

export type SkillProgress = {
  id: SkillId;
  label: string;
  /** 0..1, used for the chart. */
  value: number;
  done: number;
  total: number;
};

/**
 * Starts from the onboarding estimate and grows towards full as lessons that
 * practise each skill are finished.
 *
 * Each skill has two equal halves, so neither drowns out the other:
 * - your journey's lessons for that skill (plus any lessons you've finished
 *   in other journeys, which count towards both done and total), and
 * - the skill refresher for it. Connection has two refreshers, Deepen
 *   Connection and Listen to Understand, so that half is their average.
 * Finishing both halves fills the skill to the edge of the map.
 */
export function skillProgress(answers: OnboardingAnswers, completed: string[]): SkillProgress[] {
  const base = scoreSkills(answers);
  const own = journeyFor(answers.goal);
  const done = new Set(completed);

  // Journey half: lessons on your own journey, plus finished ones from others.
  const journey: Record<string, { done: number; total: number }> = {};
  // Refresher half: each refresher's own progress, grouped by the skill it builds.
  const refreshers: Record<string, { done: number; total: number }[]> = {};

  for (const course of ALL_COURSES) {
    if (course.kind === 'journey') {
      const onPath = course.id === own?.id;
      for (const lesson of course.lessons) {
        const skill = skillOf(course, lesson);
        if (!skill || (!onPath && !done.has(lesson.id))) continue;
        const j = (journey[skill] ??= { done: 0, total: 0 });
        j.total++;
        if (done.has(lesson.id)) j.done++;
      }
    } else {
      const skill = skillOf(course, course.lessons[0]);
      if (!skill) continue;
      const finished = course.lessons.filter((l) => done.has(l.id)).length;
      (refreshers[skill] ??= []).push({ done: finished, total: course.lessons.length });
    }
  }

  return SKILLS.map((s) => {
    const j = journey[s.id];
    const r = refreshers[s.id] ?? [];
    const halves = [
      ...(j?.total ? [j.done / j.total] : []),
      ...(r.length ? [r.reduce((sum, x) => sum + x.done / x.total, 0) / r.length] : []),
    ];
    const ratio = halves.length ? halves.reduce((a, b) => a + b, 0) / halves.length : 0;
    const value = Math.min(1, base[s.id] + (1 - base[s.id]) * ratio);
    const d = (j?.done ?? 0) + r.reduce((sum, x) => sum + x.done, 0);
    const total = (j?.total ?? 0) + r.reduce((sum, x) => sum + x.total, 0);
    return { id: s.id, label: s.label, value, done: d, total };
  });
}

/** Minutes across every finished lesson, journeys and skill refreshers alike. */
export function minutesPractised(completed: string[]) {
  let minutes = 0;
  for (const course of ALL_COURSES) {
    for (const lesson of course.lessons) {
      if (completed.includes(lesson.id)) minutes += lesson.minutes;
    }
  }
  return minutes;
}

/** Journeys and skill refreshers finished, out of every one in the app. */
export function coursesFinished(completed: string[]) {
  return {
    done: ALL_COURSES.filter((c) => courseProgress(c, completed).done === c.lessons.length).length,
    total: ALL_COURSES.length,
  };
}
