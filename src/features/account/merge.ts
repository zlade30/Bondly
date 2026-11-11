/**
 * Pure merge rules for syncing a phone with its account. No React Native
 * imports, so these can be tested on their own.
 *
 * The rules never lose work: lessons and check-in days are combined,
 * journal entries keep the newest edit, and deletions stay deleted.
 */

import type { ProgressState } from '@/features/learn/progress';
import type { OnboardingSnapshot } from '@/features/onboarding/store';
import type { JournalEntry, JournalState } from '@/features/reflect/journal';

export type SyncedState = {
  onboarding: OnboardingSnapshot;
  progress: ProgressState;
  journal: JournalState;
};

function union<T>(first: T[], second: T[]) {
  const seen = new Set(first);
  return [...first, ...second.filter((x) => !seen.has(x))];
}

function time(iso?: string) {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

/** Finished onboarding beats unfinished; otherwise the newer change wins. */
export function mergeOnboarding(local: OnboardingSnapshot, remote?: Partial<OnboardingSnapshot> | null) {
  if (!remote || !remote.answers) return local;
  const r = remote as OnboardingSnapshot;
  if (r.completed && !local.completed) return r;
  if (local.completed && !r.completed) return local;
  return time(r.updatedAt) > time(local.updatedAt) ? r : local;
}

/** Keeps the higher score for each key, so XP is never lost to an older copy. */
function mergeBest(a: Record<string, number>, b: Record<string, number>) {
  const out = { ...b };
  for (const [k, v] of Object.entries(a)) out[k] = Math.max(v, out[k] ?? 0);
  return out;
}

/**
 * Lessons and active days are combined; best XP per lesson is kept; for the same day's check-in, this phone wins.
 * Minutes per day keep the higher total: two phones can't be added up without counting a lesson twice.
 */
export function mergeProgress(local: ProgressState, remote?: Partial<ProgressState> | null): ProgressState {
  if (!remote) return local;
  return {
    completedLessons: union(local.completedLessons, remote.completedLessons ?? []),
    lessonDays: union(local.lessonDays, remote.lessonDays ?? []),
    checkIns: { ...(remote.checkIns ?? {}), ...local.checkIns },
    lessonXp: mergeBest(local.lessonXp ?? {}, remote.lessonXp ?? {}),
    dayMinutes: mergeBest(local.dayMinutes ?? {}, remote.dayMinutes ?? {}),
  };
}

/** Entries are combined, each keeping its newest edit; deleted ids stay deleted everywhere. */
export function mergeJournal(local: JournalState, remote?: Partial<JournalState> | null): JournalState {
  if (!remote) return local;
  const deletedIds = union(local.deletedIds, remote.deletedIds ?? []);
  const deleted = new Set(deletedIds);
  const byId = new Map<string, JournalEntry>();
  for (const e of [...(remote.entries ?? []), ...local.entries]) {
    if (deleted.has(e.id)) continue;
    const existing = byId.get(e.id);
    const eTime = time(e.updatedAt ?? e.createdAt);
    const existingTime = existing ? time(existing.updatedAt ?? existing.createdAt) : -1;
    if (!existing || eTime >= existingTime) byId.set(e.id, e);
  }
  const entries = [...byId.values()].sort((a, b) => time(b.createdAt) - time(a.createdAt));
  return { entries, deletedIds };
}

export function mergeAll(local: SyncedState, remote?: Partial<SyncedState> | null): SyncedState {
  return {
    onboarding: mergeOnboarding(local.onboarding, remote?.onboarding),
    progress: mergeProgress(local.progress, remote?.progress),
    journal: mergeJournal(local.journal, remote?.journal),
  };
}

/** JSON with object keys sorted, because the database may reorder them. */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj)
      .filter((k) => obj[k] !== undefined)
      .sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${canonical(obj[k])}`).join(',')}}`;
  }
  return JSON.stringify(value ?? null);
}

/** Order-independent comparison, so we only write when something really changed. */
export function sameState(a: unknown, b: unknown) {
  return canonical(a) === canonical(b);
}
