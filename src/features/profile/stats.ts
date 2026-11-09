import { COURSES, courseProgress } from '@/features/learn/content';
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

/** The last 7 days, oldest first, for the streak strip. */
export function lastSevenDays(activeDays: Set<string>, now = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(now, i - 6);
    return { key: todayKey(d), label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), active: activeDays.has(todayKey(d)) };
  });
}

/** Which courses build each skill on the map. */
const SKILL_COURSES: Record<SkillId, string[]> = {
  communication: ['communication'],
  trust: ['trust'],
  boundaries: ['boundaries'],
  conflict: ['conflict'],
  connection: ['connection', 'listening'],
};

export type SkillProgress = {
  id: SkillId;
  label: string;
  /** 0..1, used for the chart. */
  value: number;
  done: number;
  total: number;
};

/**
 * Starts from the onboarding estimate and grows with finished lessons in the
 * matching courses, so the map fills out as the person practises.
 */
export function skillProgress(answers: OnboardingAnswers, completed: string[]): SkillProgress[] {
  const base = scoreSkills(answers);
  return SKILLS.map((s) => {
    let done = 0;
    let total = 0;
    for (const courseId of SKILL_COURSES[s.id]) {
      const course = COURSES.find((c) => c.id === courseId);
      if (!course) continue;
      const p = courseProgress(course, completed);
      done += p.done;
      total += p.total;
    }
    const ratio = total ? done / total : 0;
    const value = Math.min(1, base[s.id] + (1 - base[s.id]) * ratio * 0.9);
    return { id: s.id, label: s.label, value, done, total };
  });
}

export function minutesPractised(completed: string[]) {
  let minutes = 0;
  for (const course of COURSES) {
    for (const lesson of course.lessons) {
      if (completed.includes(lesson.id)) minutes += lesson.minutes;
    }
  }
  return minutes;
}

export function coursesFinished(completed: string[]) {
  return COURSES.filter((c) => courseProgress(c, completed).done === c.lessons.length).length;
}
