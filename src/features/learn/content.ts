import type { BondlingColor, BondlingMood, BondlingProp } from '@/components/bondly/mascot';
import type { TopicIconName } from '@/components/bondly/topic-icons';
import type { FocusArea, RelationshipGoal } from '@/features/onboarding/content';

import { JOURNEYS } from './journeys';
import { isPlayable } from './lessons';

export type Lesson = {
  id: string;
  title: string;
  minutes: number;
  summary: string;
  /** For journey lessons: the skill it practises. */
  focus?: FocusArea;
  /** For journey lessons: the level (1–10) it belongs to. Defaults to its position. */
  level?: number;
};

/** A journey level's name, plus the topic icon (and its colour) that sets its theme. */
export type LevelInfo = {
  title: string;
  icon: TopicIconName;
  color: BondlingColor;
};

export type Course = {
  /** A focus area for skill courses, or "journey-<relationship>" for journeys. */
  id: string;
  /** Skill courses teach one skill; journeys follow one relationship. Defaults to skill. */
  kind?: 'skill' | 'journey';
  relationship?: RelationshipGoal;
  /** Journeys only: who it's for and what they'll gain. */
  intro?: string;
  title: string;
  tint: string;
  /** Journeys: each level's name and look, in order. */
  levels?: LevelInfo[];
  /** Optional full-screen scene behind the journey path (a bundled image, from require()). */
  background?: number;
  mascot: { color: BondlingColor; mood: BondlingMood; prop: BondlingProp };
  lessons: Lesson[];
};

/**
 * Starter catalogue. Every course lists its lessons so progress and
 * "today's lesson" work now; full lesson bodies arrive with the lesson player.
 */
export const COURSES: Course[] = [
  {
    id: 'communication',
    title: 'Communicate with Care',
    tint: '#FDE6F1',
    mascot: { color: 'pink', mood: 'happy', prop: 'none' },
    lessons: [
      { id: 'comm-1', title: 'Say What You Feel', minutes: 3, summary: 'Swap blame for “I feel…” and watch defences drop.' },
      { id: 'comm-2', title: 'Ask, Don’t Assume', minutes: 4, summary: 'Curious questions beat mind-reading every time.' },
      { id: 'comm-3', title: 'Timing Matters', minutes: 3, summary: 'Pick the moment so the message can land.' },
      { id: 'comm-4', title: 'Listen to Understand', minutes: 5, summary: 'Reflect back before you respond.' },
      { id: 'comm-5', title: 'Repair After a Misstep', minutes: 4, summary: 'Small, quick repairs keep connection strong.' },
    ],
  },
  {
    id: 'trust',
    title: 'Build Trust',
    tint: '#DDF5EA',
    mascot: { color: 'mint', mood: 'content', prop: 'shield' },
    lessons: [
      { id: 'trust-1', title: 'Small Promises, Kept', minutes: 3, summary: 'Trust is built in tiny, reliable moments.' },
      { id: 'trust-2', title: 'Owning Mistakes', minutes: 4, summary: 'A real apology has three parts.' },
      { id: 'trust-3', title: 'Being Predictable', minutes: 3, summary: 'Consistency feels like safety.' },
      { id: 'trust-4', title: 'Rebuilding After Hurt', minutes: 5, summary: 'Patience, transparency and time.' },
    ],
  },
  {
    id: 'boundaries',
    title: 'Set Boundaries',
    tint: '#E4E9FF',
    mascot: { color: 'blue', mood: 'wink', prop: 'flag' },
    lessons: [
      { id: 'bound-1', title: 'Know Your Limits', minutes: 3, summary: 'Notice the signs you’ve hit a limit.' },
      { id: 'bound-2', title: 'A Kind, Clear No', minutes: 4, summary: 'Saying no without the guilt spiral.' },
      { id: 'bound-3', title: 'Holding the Line', minutes: 4, summary: 'What to do when a boundary is pushed.' },
      { id: 'bound-4', title: 'Respecting Theirs', minutes: 3, summary: 'Boundaries go both ways.' },
    ],
  },
  {
    id: 'conflict',
    title: 'Resolve Conflict',
    tint: '#FFF4D6',
    mascot: { color: 'yellow', mood: 'neutral', prop: 'none' },
    lessons: [
      { id: 'conf-1', title: 'Pause Before You React', minutes: 3, summary: 'A ten-second pause changes the whole fight.' },
      { id: 'conf-2', title: 'Same Team, Shared Problem', minutes: 4, summary: 'It’s you two versus the issue.' },
      { id: 'conf-3', title: 'Fight Fair', minutes: 4, summary: 'Rules that keep arguments safe.' },
      { id: 'conf-4', title: 'Finding the Middle', minutes: 5, summary: 'Compromise without losing yourself.' },
    ],
  },
  {
    id: 'connection',
    title: 'Deepen Connection',
    tint: '#EFE7FF',
    mascot: { color: 'lavender', mood: 'content', prop: 'heart' },
    lessons: [
      { id: 'conn-1', title: 'Turn Toward Bids', minutes: 3, summary: 'Notice the small reaches for connection.' },
      { id: 'conn-2', title: 'Questions That Go Deeper', minutes: 4, summary: 'Move past “how was your day?”.' },
      { id: 'conn-3', title: 'Rituals of Connection', minutes: 3, summary: 'Little habits that keep you close.' },
      { id: 'conn-4', title: 'Showing Appreciation', minutes: 3, summary: 'Make the good things visible.' },
    ],
  },
  {
    id: 'listening',
    title: 'Listen to Understand',
    tint: '#FFE9E2',
    mascot: { color: 'peach', mood: 'curious', prop: 'none' },
    lessons: [
      { id: 'list-1', title: 'Full Attention', minutes: 3, summary: 'Put the phone down and tune in.' },
      { id: 'list-2', title: 'Reflect It Back', minutes: 4, summary: '“So what I’m hearing is…”' },
      { id: 'list-3', title: 'Validate the Feeling', minutes: 3, summary: 'You can understand without agreeing.' },
      { id: 'list-4', title: 'When Not to Fix', minutes: 4, summary: 'Sometimes support beats solutions.' },
    ],
  },
];

/** Every course: relationship journeys first, then the skill courses. */
export const ALL_COURSES: Course[] = [...JOURNEYS, ...COURSES];

export function findCourse(courseId: string) {
  return ALL_COURSES.find((c) => c.id === courseId) ?? null;
}

/** The journey for the relationship someone chose in onboarding, if it exists yet. */
export function journeyFor(goal: RelationshipGoal | null) {
  return goal ? (JOURNEYS.find((j) => j.relationship === goal) ?? null) : null;
}

/** Journeys for the other relationships, to explore. */
export function otherJourneys(goal: RelationshipGoal | null) {
  return JOURNEYS.filter((j) => j.relationship !== goal);
}

export function findLesson(lessonId: string) {
  for (const course of ALL_COURSES) {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (lesson) return { course, lesson };
  }
  return null;
}

/** Skill courses ordered with the person's chosen focus areas first. */
export function orderedCourses(focus: FocusArea[]) {
  const chosen = focus
    .map((f) => COURSES.find((c) => c.id === f))
    .filter((c): c is Course => !!c);
  return [...chosen, ...COURSES.filter((c) => !(focus as string[]).includes(c.id))];
}

/**
 * The next lesson to suggest: the person's relationship journey comes first,
 * in order; once it's finished (or if it doesn't exist yet), the skill
 * courses follow, focus areas first. Prefers lessons that have content, so
 * "Today's lesson" is always playable.
 */
export function todaysLesson(focus: FocusArea[], completed: string[], goal: RelationshipGoal | null = null) {
  const journey = journeyFor(goal);
  const courses = journey ? [journey, ...orderedCourses(focus)] : orderedCourses(focus);
  for (const playableOnly of [true, false]) {
    for (const course of courses) {
      const lesson = course.lessons.find(
        (l) => !completed.includes(l.id) && (!playableOnly || isPlayable(l.id))
      );
      if (lesson) return { course, lesson };
    }
  }
  const course = COURSES[0];
  return { course, lesson: course.lessons[0] };
}

export function courseProgress(course: Course, completed: string[]) {
  const done = course.lessons.filter((l) => completed.includes(l.id)).length;
  return { done, total: course.lessons.length, ratio: done / course.lessons.length };
}
