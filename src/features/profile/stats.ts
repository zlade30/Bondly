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
 * Starts from the onboarding estimate and grows with every finished lesson
 * that practises each skill, journeys and skill refreshers alike, so the map
 * fills out as the person practises.
 *
 * Totals cover the person's own journey and the skill refreshers, plus any
 * other lessons they've chosen to do, so the bars measure the path they're on
 * rather than every journey in the app.
 */
export function skillProgress(answers: OnboardingAnswers, completed: string[]): SkillProgress[] {
  const base = scoreSkills(answers);
  const own = journeyFor(answers.goal);
  const done: Record<string, number> = {};
  const total: Record<string, number> = {};
  for (const course of ALL_COURSES) {
    const onPath = course.kind !== 'journey' || course.id === own?.id;
    for (const lesson of course.lessons) {
      const skill = skillOf(course, lesson);
      if (!skill) continue;
      const finished = completed.includes(lesson.id);
      if (!onPath && !finished) continue;
      total[skill] = (total[skill] ?? 0) + 1;
      if (finished) done[skill] = (done[skill] ?? 0) + 1;
    }
  }
  return SKILLS.map((s) => {
    const d = done[s.id] ?? 0;
    const t = total[s.id] ?? 0;
    const ratio = t ? d / t : 0;
    const value = Math.min(1, base[s.id] + (1 - base[s.id]) * ratio * 0.9);
    return { id: s.id, label: s.label, value, done: d, total: t };
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
