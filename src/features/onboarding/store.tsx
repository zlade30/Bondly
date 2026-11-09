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

import type { RelationshipGoal, FocusArea, Mood, DailyMinutes } from './content';

const STORAGE_KEY = 'bondly.onboarding.v1';

export type OnboardingAnswers = {
  name: string;
  goal: RelationshipGoal | null;
  focus: FocusArea[];
  /** Quiz slider answers keyed by question id, 0..4. */
  quiz: Record<string, number>;
  minutes: DailyMinutes | null;
  mood: Mood | null;
  remindersWanted: boolean;
};

const EMPTY: OnboardingAnswers = {
  name: '',
  goal: null,
  focus: [],
  quiz: {},
  minutes: null,
  mood: null,
  remindersWanted: false,
};

type Stored = { completed: boolean; answers: OnboardingAnswers };

type OnboardingContextValue = {
  /** False until the saved state has been read from storage. */
  ready: boolean;
  completed: boolean;
  answers: OnboardingAnswers;
  update: (patch: Partial<OnboardingAnswers>) => void;
  complete: () => Promise<void>;
  reset: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const saved = JSON.parse(raw) as Stored;
        setCompleted(saved.completed);
        setAnswers({ ...EMPTY, ...saved.answers });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // After onboarding, keep saved answers in sync with edits from Settings.
  useEffect(() => {
    if (ready && completed) {
      const stored: Stored = { completed: true, answers };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored)).catch(() => {});
    }
  }, [ready, completed, answers]);

  const update = useCallback((patch: Partial<OnboardingAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
  }, []);

  const complete = useCallback(async () => {
    const stored: Stored = { completed: true, answers };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored)).catch(() => {});
    setCompleted(true);
  }, [answers]);

  const reset = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setAnswers(EMPTY);
    setCompleted(false);
  }, []);

  const value = useMemo(
    () => ({ ready, completed, answers, update, complete, reset }),
    [ready, completed, answers, update, complete, reset]
  );

  return <OnboardingContext value={value}>{children}</OnboardingContext>;
}

export function useOnboarding() {
  const ctx = use(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
