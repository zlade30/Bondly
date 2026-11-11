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

/** The most relationship journeys someone can focus on at once. */
export const MAX_JOURNEYS = 3;

/** Fills in `journeys` for saves from before it existed: your main journey alone. */
function withJourneys(answers: OnboardingAnswers): OnboardingAnswers {
  if (answers.journeys?.length) return { ...answers, goal: answers.journeys[0] };
  return { ...answers, journeys: answers.goal ? [answers.goal] : [] };
}

export type OnboardingAnswers = {
  name: string;
  /** Your main relationship journey: the first of `journeys`. */
  goal: RelationshipGoal | null;
  /** Your focus: 1–3 relationship journeys, in the order you picked them. */
  journeys: RelationshipGoal[];
  /** No longer asked in onboarding (skill focus areas); kept so older saves still load. */
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
  journeys: [],
  focus: [],
  quiz: {},
  minutes: null,
  mood: null,
  remindersWanted: false,
};

/** What's saved on the device, and what syncs to an account. */
export type OnboardingSnapshot = {
  completed: boolean;
  answers: OnboardingAnswers;
  /** ISO time of the last change, so the newer copy wins when syncing. */
  updatedAt?: string;
};

type OnboardingContextValue = {
  /** False until the saved state has been read from storage. */
  ready: boolean;
  completed: boolean;
  answers: OnboardingAnswers;
  snapshot: OnboardingSnapshot;
  update: (patch: Partial<OnboardingAnswers>) => void;
  complete: () => Promise<void>;
  /** Replace everything with a copy from the account (used by sync). */
  restore: (snapshot: OnboardingSnapshot) => void;
  reset: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) return;
        const saved = JSON.parse(raw) as OnboardingSnapshot;
        setCompleted(saved.completed);
        setAnswers(withJourneys({ ...EMPTY, ...saved.answers }));
        setUpdatedAt(saved.updatedAt);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const snapshot = useMemo<OnboardingSnapshot>(
    () => ({ completed, answers, updatedAt }),
    [completed, answers, updatedAt]
  );

  // Once onboarding is finished, keep the saved copy in step with every change.
  useEffect(() => {
    if (ready && snapshot.completed) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => {});
    }
  }, [ready, snapshot]);

  const update = useCallback((patch: Partial<OnboardingAnswers>) => {
    setAnswers((prev) => ({ ...prev, ...patch }));
    setUpdatedAt(new Date().toISOString());
  }, []);

  const complete = useCallback(async () => {
    const now = new Date().toISOString();
    const stored: OnboardingSnapshot = { completed: true, answers, updatedAt: now };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stored)).catch(() => {});
    setUpdatedAt(now);
    setCompleted(true);
  }, [answers]);

  const restore = useCallback((next: OnboardingSnapshot) => {
    setAnswers(withJourneys({ ...EMPTY, ...next.answers }));
    setUpdatedAt(next.updatedAt);
    setCompleted(next.completed);
  }, []);

  const reset = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setAnswers(EMPTY);
    setUpdatedAt(undefined);
    setCompleted(false);
  }, []);

  const value = useMemo(
    () => ({ ready, completed, answers, snapshot, update, complete, restore, reset }),
    [ready, completed, answers, snapshot, update, complete, restore, reset]
  );

  return <OnboardingContext value={value}>{children}</OnboardingContext>;
}

export function useOnboarding() {
  const ctx = use(OnboardingContext);
  if (!ctx) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return ctx;
}
