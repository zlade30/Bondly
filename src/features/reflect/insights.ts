import { MOODS, type Mood } from '@/features/onboarding/content';

import { WHO, type JournalEntry } from './journal';

/**
 * Plain, honest patterns from the person's own check-ins and entries.
 * Each insight only appears once there is enough data for it to mean something.
 */
export function buildInsights(checkIns: Record<string, Mood>, entries: JournalEntry[], now = new Date()) {
  const insights: string[] = [];

  // Check-ins from the last 30 days.
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 30);
  const recent = Object.entries(checkIns).filter(([day]) => new Date(`${day}T12:00:00`) >= cutoff);

  if (recent.length >= 3) {
    const counts = new Map<Mood, number>();
    for (const [, mood] of recent) counts.set(mood, (counts.get(mood) ?? 0) + 1);
    const [topMood, topCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    const label = MOODS.find((m) => m.id === topMood)?.label ?? topMood;
    insights.push(
      `You checked in on ${recent.length} of the last 30 days. “${label}” came up most (${topCount} ${topCount === 1 ? 'day' : 'days'}).`
    );
  }

  // Which relationship most of the hard entries were about.
  const hard = entries.filter((e) => (e.mood === 'low' || e.mood === 'tense') && e.who);
  if (hard.length >= 3) {
    const byWho = new Map<string, number>();
    for (const e of hard) byWho.set(e.who!, (byWho.get(e.who!) ?? 0) + 1);
    const [who, count] = [...byWho.entries()].sort((a, b) => b[1] - a[1])[0];
    if (count >= 2) {
      const label = WHO.find((w) => w.id === who)?.label.toLowerCase() ?? who;
      insights.push(`${count} of your ${hard.length} low or tense entries were about ${label}.`);
    }
  }

  // Which relationship most of the good entries were about.
  const good = entries.filter((e) => (e.mood === 'great' || e.mood === 'calm') && e.who);
  if (good.length >= 3) {
    const byWho = new Map<string, number>();
    for (const e of good) byWho.set(e.who!, (byWho.get(e.who!) ?? 0) + 1);
    const [who, count] = [...byWho.entries()].sort((a, b) => b[1] - a[1])[0];
    if (count >= 2) {
      const label = WHO.find((w) => w.id === who)?.label.toLowerCase() ?? who;
      insights.push(`Your happiest entries were most often about ${label} (${count} of ${good.length}).`);
    }
  }

  return insights;
}
