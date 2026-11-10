import type { BondlingColor, BondlingMood, BondlingProp } from '@/components/bondly/mascot';
import type { FocusArea, RelationshipGoal } from '@/features/onboarding/content';

import type { Course, LevelInfo } from '../content';
import { tryIt, type LessonStep } from '../lesson-types';

import dating from './dating.json';
import family from './family.json';
import friends from './friends.json';
import partner from './partner.json';
import self from './self.json';
import work from './work.json';

/**
 * Relationship journeys: one learning path per relationship people choose in
 * onboarding ("My partner", "My family"…). Each lives in its own JSON file in
 * this folder, written with content-prompts/relationship-journeys.md, and is
 * listed in FILES below.
 */

/** A journey file exactly as the prompt asks ChatGPT to write it. */
export type JourneyFile = {
  relationship: RelationshipGoal;
  journeyTitle: string;
  journeyIntro: string;
  /** Optional: each level's name and look. Without it, every lesson is its own level. */
  levels?: LevelInfo[];
  lessons: {
    id: string;
    title: string;
    minutes: number;
    focus: FocusArea;
    summary: string;
    /** Which level (1–10) the lesson belongs to, when `levels` is set. */
    level?: number;
    /** Same as LessonStep, plus a closing "try" step. */
    steps: (LessonStep | { kind: 'try'; body: string })[];
  }[];
};

// To add or replace a journey: save its JSON here, check it with
// `node scripts/check-journey.mjs <file>`, then import it and list it below.
const FILES = [partner, dating, family, friends, work, self] as JourneyFile[];

/** Look and feel for each relationship's journey. */
const STYLE: Record<
  RelationshipGoal,
  { tint: string; background?: number; mascot: { color: BondlingColor; mood: BondlingMood; prop: BondlingProp } }
> = {
  partner: { tint: '#FDE6F1', mascot: { color: 'pink', mood: 'happy', prop: 'heart' } },
  dating: { tint: '#FFE9E2', mascot: { color: 'peach', mood: 'wink', prop: 'sparkles' } },
  family: { tint: '#FFF4D6', mascot: { color: 'yellow', mood: 'content', prop: 'heart' } },
  friends: {
    tint: '#DDF5EA',
    background: require('@/assets/images/journeys/friends.webp'),
    mascot: { color: 'mint', mood: 'happy', prop: 'sparkles' },
  },
  work: { tint: '#E4E9FF', mascot: { color: 'blue', mood: 'curious', prop: 'flag' } },
  self: { tint: '#EFE7FF', mascot: { color: 'lavender', mood: 'content', prop: 'shield' } },
};

function toSteps(steps: JourneyFile['lessons'][number]['steps']): LessonStep[] {
  return steps.map((s) => (s.kind === 'try' ? tryIt(s.body) : s));
}

export const JOURNEYS: Course[] = FILES.map((file) => ({
  id: `journey-${file.relationship}`,
  kind: 'journey',
  relationship: file.relationship,
  title: file.journeyTitle,
  intro: file.journeyIntro,
  levels: file.levels,
  ...STYLE[file.relationship],
  lessons: file.lessons.map(({ id, title, minutes, summary, focus, level }) => ({
    id,
    title,
    minutes,
    summary,
    focus,
    level,
  })),
}));

/** Every journey lesson's steps, keyed by lesson id. */
export const JOURNEY_STEPS: Record<string, LessonStep[]> = Object.fromEntries(
  FILES.flatMap((file) => file.lessons.map((lesson) => [lesson.id, toSteps(lesson.steps)]))
);
