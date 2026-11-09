import type { BondlingMood } from '@/components/bondly/mascot';

/** One screen inside a lesson. */
export type LessonStep =
  | { kind: 'read'; title: string; body: string; mood?: BondlingMood }
  | {
      kind: 'choice';
      prompt: string;
      options: { text: string; correct?: boolean; why: string }[];
    }
  | {
      kind: 'blank';
      prompt: string;
      before: string;
      after: string;
      words: string[];
      answer: string;
      why: string;
    }
  | { kind: 'reflect'; prompt: string; options: string[]; reply: string }
  | { kind: 'write'; prompt: string; placeholder: string };

/** The closing card every lesson ends with. */
export const tryIt = (body: string): LessonStep => ({
  kind: 'read',
  title: 'Try it today',
  body,
  mood: 'wink',
});
