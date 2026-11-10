import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import type { Mood } from '@/features/onboarding/content';

const STORAGE_KEY = 'bondly.progress.v1';

export type ProgressState = {
  completedLessons: string[];
  /** Daily check-ins keyed by local date, YYYY-MM-DD. */
  checkIns: Record<string, Mood>;
  /** Days (YYYY-MM-DD) on which a lesson was finished, including replays. */
  lessonDays: string[];
  /** Best XP earned in each lesson, keyed by lesson id. Replays keep the best score. */
  lessonXp: Record<string, number>;
};

const EMPTY: ProgressState = { completedLessons: [], checkIns: {}, lessonDays: [], lessonXp: {} };

type ProgressContextValue = ProgressState & {
  ready: boolean;
  /** Marks a lesson done and keeps its best XP. */
  completeLesson: (lessonId: string, xp?: number) => void;
  checkIn: (mood: Mood) => void;
  todayCheckIn: Mood | undefined;
  /** The whole state, as saved and synced. */
  snapshot: ProgressState;
  /** Replace everything with a merged copy (used by sync). */
  restore: (state: ProgressState) => void;
  reset: () => Promise<void>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<ProgressState>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!cancelled && raw) setState({ ...EMPTY, ...(JSON.parse(raw) as ProgressState) });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist every change once the saved state has loaded.
  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [ready, state]);

  const completeLesson = useCallback((lessonId: string, xp = 0) => {
    const day = todayKey();
    setState((prev) => ({
      ...prev,
      lessonXp: { ...prev.lessonXp, [lessonId]: Math.max(prev.lessonXp[lessonId] ?? 0, xp) },
      completedLessons: prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId],
      lessonDays: prev.lessonDays.includes(day) ? prev.lessonDays : [...prev.lessonDays, day],
    }));
  }, []);

  const checkIn = useCallback((mood: Mood) => {
    setState((prev) => ({ ...prev, checkIns: { ...prev.checkIns, [todayKey()]: mood } }));
  }, []);

  const reset = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setState(EMPTY);
  }, []);

  const restore = useCallback((next: ProgressState) => {
    setState({ ...EMPTY, ...next });
  }, []);

  const todayCheckIn = state.checkIns[todayKey()];

  const value = useMemo(
    () => ({ ...state, snapshot: state, ready, completeLesson, checkIn, todayCheckIn, restore, reset }),
    [state, ready, completeLesson, checkIn, todayCheckIn, restore, reset]
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}

export function useProgress() {
  const ctx = use(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
