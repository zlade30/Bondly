import type { BondlingColor, BondlingMood, BondlingProp } from '@/components/bondly/mascot';

export type RelationshipGoal = 'partner' | 'dating' | 'family' | 'friends' | 'work' | 'self';
export type FocusArea =
  | 'communication'
  | 'trust'
  | 'boundaries'
  | 'conflict'
  | 'connection'
  | 'listening';
export type Mood = 'great' | 'calm' | 'okay' | 'low' | 'tense';
export type DailyMinutes = 3 | 5 | 10 | 15;

export const GOALS: { id: RelationshipGoal; emoji: string; label: string }[] = [
  { id: 'partner', emoji: '💞', label: 'My partner' },
  { id: 'dating', emoji: '🌷', label: 'Dating & new love' },
  { id: 'family', emoji: '🏡', label: 'My family' },
  { id: 'friends', emoji: '🫶', label: 'My friendships' },
  { id: 'work', emoji: '💼', label: 'People at work' },
  { id: 'self', emoji: '🌱', label: 'How I show up in general' },
];

export const FOCUS_AREAS: {
  id: FocusArea;
  label: string;
  tint: string;
  color: BondlingColor;
  mood: BondlingMood;
  prop: BondlingProp;
}[] = [
  { id: 'communication', label: 'Communicate with Care', tint: '#FDE6F1', color: 'pink', mood: 'happy', prop: 'none' },
  { id: 'trust', label: 'Build Trust', tint: '#DDF5EA', color: 'mint', mood: 'content', prop: 'shield' },
  { id: 'boundaries', label: 'Set Boundaries', tint: '#E4E9FF', color: 'blue', mood: 'wink', prop: 'flag' },
  { id: 'conflict', label: 'Resolve Conflict', tint: '#FFF4D6', color: 'yellow', mood: 'neutral', prop: 'none' },
  { id: 'connection', label: 'Deepen Connection', tint: '#EFE7FF', color: 'lavender', mood: 'content', prop: 'heart' },
  { id: 'listening', label: 'Listen to Understand', tint: '#FFE9E2', color: 'peach', mood: 'curious', prop: 'none' },
];

export type QuizQuestion = {
  id: string;
  prompt: string;
  left: string;
  right: string;
  /** Skill this question informs on the results map. */
  skill: SkillId;
};

export const QUIZ: QuizQuestion[] = [
  {
    id: 'tension',
    prompt: 'When a conversation gets tense, what do you usually do?',
    left: 'I go quiet and pull away',
    right: 'I say it all, right away',
    skill: 'conflict',
  },
  {
    id: 'needs',
    prompt: 'How easy is it to say what you need?',
    left: 'I keep it to myself',
    right: 'I ask clearly and kindly',
    skill: 'communication',
  },
  {
    id: 'no',
    prompt: 'When someone asks too much of you…',
    left: 'I say yes, then resent it',
    right: 'I say no without guilt',
    skill: 'boundaries',
  },
];

export const DAILY_OPTIONS: { minutes: DailyMinutes; label: string; note: string }[] = [
  { minutes: 3, label: '3 min / day', note: 'Gentle' },
  { minutes: 5, label: '5 min / day', note: 'Steady' },
  { minutes: 10, label: '10 min / day', note: 'Committed' },
  { minutes: 15, label: '15 min / day', note: 'All in' },
];

export const MOODS: { id: Mood; label: string; color: BondlingColor; mood: BondlingMood }[] = [
  { id: 'great', label: 'Great', color: 'pink', mood: 'happy' },
  { id: 'calm', label: 'Calm', color: 'blue', mood: 'content' },
  { id: 'okay', label: 'Okay', color: 'yellow', mood: 'neutral' },
  { id: 'low', label: 'Low', color: 'purple', mood: 'sad' },
  { id: 'tense', label: 'Tense', color: 'lavender', mood: 'upset' },
];

/** What Bondly says back after a daily check-in. */
export const CHECK_IN_REPLIES: Record<Mood, string> = {
  great: 'Love that! Keep the good stuff growing.',
  calm: 'Steady days are great for learning.',
  okay: 'Okay is honest. One small step today?',
  low: 'Thanks for sharing. Go gently with yourself today.',
  tense: 'That’s hard. Today’s lesson can help calm things down.',
};

export type SkillId = 'communication' | 'trust' | 'boundaries' | 'conflict' | 'connection';

export const SKILLS: { id: SkillId; label: string }[] = [
  { id: 'communication', label: 'Communication' },
  { id: 'trust', label: 'Trust' },
  { id: 'boundaries', label: 'Boundaries' },
  { id: 'conflict', label: 'Conflict' },
  { id: 'connection', label: 'Connection' },
];

export const SKILL_COPY: Record<SkillId, { strength: string; growth: string }> = {
  communication: {
    strength: 'You put feelings into words, so people rarely have to guess.',
    growth: 'Naming what you need, out loud, will make everything else easier.',
  },
  trust: {
    strength: 'You show up consistently, and people feel safe with you.',
    growth: 'Small, kept promises are the fastest way to build trust. We will practise them.',
  },
  boundaries: {
    strength: 'You protect your energy without shutting people out.',
    growth: 'A kind, clear "no" protects the relationship too. You will learn how.',
  },
  conflict: {
    strength: 'You can stay steady when things heat up.',
    growth: 'Pausing before reacting turns fights into conversations.',
  },
  connection: {
    strength: 'You notice the little moments that bring people closer.',
    growth: 'Curious questions will help you feel closer, faster.',
  },
};
