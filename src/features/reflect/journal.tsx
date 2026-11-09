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

const STORAGE_KEY = 'bondly.journal.v1';

export type Who = 'partner' | 'family' | 'friends' | 'work' | 'self';

export const WHO: { id: Who; emoji: string; label: string }[] = [
  { id: 'partner', emoji: '💞', label: 'Partner' },
  { id: 'family', emoji: '🏡', label: 'Family' },
  { id: 'friends', emoji: '🫶', label: 'Friends' },
  { id: 'work', emoji: '💼', label: 'Work' },
  { id: 'self', emoji: '🌱', label: 'Myself' },
];

export type JournalEntry = {
  id: string;
  /** ISO timestamp. */
  createdAt: string;
  text: string;
  mood?: Mood;
  who?: Who;
  /** Set when the entry came from a lesson's writing prompt. */
  lessonId?: string;
  prompt?: string;
};

type NewEntry = Omit<JournalEntry, 'id' | 'createdAt'>;

type JournalContextValue = {
  ready: boolean;
  /** Newest first. */
  entries: JournalEntry[];
  add: (entry: NewEntry) => void;
  edit: (id: string, patch: Partial<NewEntry>) => void;
  remove: (id: string) => void;
  reset: () => Promise<void>;
};

const JournalContext = createContext<JournalContextValue | null>(null);

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function JournalProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!cancelled && raw) setEntries(JSON.parse(raw) as JournalEntry[]);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(entries)).catch(() => {});
  }, [ready, entries]);

  const add = useCallback((entry: NewEntry) => {
    setEntries((prev) => [{ ...entry, id: newId(), createdAt: new Date().toISOString() }, ...prev]);
  }, []);

  const edit = useCallback((id: string, patch: Partial<NewEntry>) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  const remove = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const reset = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setEntries([]);
  }, []);

  const value = useMemo(
    () => ({ ready, entries, add, edit, remove, reset }),
    [ready, entries, add, edit, remove, reset]
  );

  return <JournalContext value={value}>{children}</JournalContext>;
}

export function useJournal() {
  const ctx = use(JournalContext);
  if (!ctx) throw new Error('useJournal must be used inside JournalProvider');
  return ctx;
}

export function formatEntryDate(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  const time = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return `${date} · ${time}`;
}
