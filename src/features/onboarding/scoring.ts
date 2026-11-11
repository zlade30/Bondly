import { QUIZ, SKILLS, type SkillId } from './content';
import type { OnboardingAnswers } from './store';

/**
 * A light, encouraging estimate of where someone is today. It is not a
 * clinical assessment: it only orders the lessons we suggest first.
 */
export function scoreSkills(answers: OnboardingAnswers): Record<SkillId, number> {
  const scores: Record<SkillId, number> = {
    communication: 0.55,
    trust: 0.6,
    boundaries: 0.5,
    conflict: 0.5,
    connection: 0.62,
  };

  for (const q of QUIZ) {
    const v = answers.quiz[q.id];
    if (v === undefined) continue;
    // For "tension", the steady middle is healthiest; elsewhere, further right is.
    const health = q.id === 'tension' ? 1 - Math.abs(v - 2) / 2 : v / 4;
    scores[q.skill] = 0.3 + health * 0.55;
  }

  if (answers.mood === 'great' || answers.mood === 'calm') {
    scores.trust += 0.1;
    scores.connection += 0.1;
  } else if (answers.mood === 'low' || answers.mood === 'tense') {
    scores.connection -= 0.08;
  }

  for (const s of SKILLS) {
    scores[s.id] = Math.min(0.92, Math.max(0.2, scores[s.id]));
  }
  return scores;
}

export function strongestAndWeakest(scores: Record<SkillId, number>) {
  const sorted = [...SKILLS].sort((a, b) => scores[b.id] - scores[a.id]);
  return { strongest: sorted[0], weakest: sorted[sorted.length - 1] };
}
