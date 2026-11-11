import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';
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
  /** Minutes of lessons finished on each day (YYYY-MM-DD), replays included. Measures the daily goal. */
  dayMinutes: Record<string, number>;
  /** Days (YYYY-MM-DD) whose daily goal has been celebrated, so it happens once a day. */
  goalDays: string[];
};

const EMPTY: ProgressState = {
  completedLessons: [],
  checkIns: {},
  lessonDays: [],
  lessonXp: {},
  dayMinutes: {},
  goalDays: [],
};

type ProgressContextValue = ProgressState & {
  ready: boolean;
  /** Marks a lesson done, keeps its best XP and adds its minutes to today's total. */
  completeLesson: (lessonId: string, xp?: number, minutes?: number) => void;
  /** Minutes of lessons finished today, for the daily goal. */
  todayMinutes: number;
  /** Whether today's daily goal has already been celebrated. */
  goalCelebratedToday: boolean;
  /** Records that today's daily goal has been celebrated. */
  markGoalCelebrated: () => void;
  checkIn: (mood: Mood) => void;
  todayCheckIn: Mood | undefined;
  /**
   * Today's local date (YYYY-MM-DD). It moves on at midnight and when the app
   * comes back to the front, so screens left open overnight redraw for the
   * new day.
   */
  today: string;
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

/** Milliseconds until just after the next local midnight. */
function untilMidnight(now = new Date()) {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
  return next.getTime() - now.getTime();
}

/** Today's date key, kept current across midnight and app resumes. */
function useCurrentDay() {
  const [day, setDay] = useState(() => todayKey());
  useEffect(() => {
    const refresh = () => setDay(todayKey());
    let timer = setTimeout(function tick() {
      refresh();
      timer = setTimeout(tick, untilMidnight());
    }, untilMidnight());
    // Timers pause while the app is in the background, so check again on return.
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') refresh();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);
  return day;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<ProgressState>(EMPTY);
  const today = useCurrentDay();

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

  const completeLesson = useCallback((lessonId: string, xp = 0, minutes = 0) => {
    const day = todayKey();
    setState((prev) => ({
      ...prev,
      dayMinutes: { ...prev.dayMinutes, [day]: (prev.dayMinutes[day] ?? 0) + minutes },
      lessonXp: { ...prev.lessonXp, [lessonId]: Math.max(prev.lessonXp[lessonId] ?? 0, xp) },
      completedLessons: prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId],
      lessonDays: prev.lessonDays.includes(day) ? prev.lessonDays : [...prev.lessonDays, day],
    }));
  }, []);

  const markGoalCelebrated = useCallback(() => {
    const day = todayKey();
    setState((prev) => (prev.goalDays.includes(day) ? prev : { ...prev, goalDays: [...prev.goalDays, day] }));
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

  const todayCheckIn = state.checkIns[today];
  const todayMinutes = state.dayMinutes[today] ?? 0;
  const goalCelebratedToday = state.goalDays.includes(today);

  const value = useMemo(
    () => ({
      ...state,
      snapshot: state,
      ready,
      completeLesson,
      checkIn,
      todayCheckIn,
      todayMinutes,
      goalCelebratedToday,
      markGoalCelebrated,
      today,
      restore,
      reset,
    }),
    [
      state,
      ready,
      completeLesson,
      checkIn,
      todayCheckIn,
      todayMinutes,
      goalCelebratedToday,
      markGoalCelebrated,
      today,
      restore,
      reset,
    ]
  );

  return <ProgressContext value={value}>{children}</ProgressContext>;
}

export function useProgress() {
  const ctx = use(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used inside ProgressProvider');
  return ctx;
}
