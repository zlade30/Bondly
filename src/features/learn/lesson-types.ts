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
  | { kind: 'write'; prompt: string; placeholder: string }
  /**
   * A short chat between "you" and someone else plays out bubble by bubble,
   * then you pick a reply and see how they react.
   */
  | {
      kind: 'scene';
      title: string;
      /** Who you're talking to, e.g. "Your partner". */
      them: string;
      lines: { from: 'them' | 'you'; text: string }[];
      prompt: string;
      options: { text: string; correct?: boolean; reaction: string; why: string }[];
    }
  /** Swipe each card left or right into one of two groups. */
  | {
      kind: 'sort';
      prompt: string;
      left: string;
      right: string;
      cards: { text: string; side: 'left' | 'right' }[];
      why: string;
    }
  /** Tap to pair each item with its match. */
  | { kind: 'match'; prompt: string; pairs: { a: string; b: string }[]; why: string }
  /** Put the items into the right order (listed here in the correct order). */
  | { kind: 'order'; prompt: string; items: string[]; why: string };

/** The closing card every lesson ends with. */
export const tryIt = (body: string): LessonStep => ({
  kind: 'read',
  title: 'Try it today',
  body,
  mood: 'wink',
});
