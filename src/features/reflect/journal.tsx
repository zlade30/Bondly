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
  /** ISO time of the last edit, so the newer copy wins when syncing. */
  updatedAt?: string;
};

/** What's saved on the device, and what syncs to an account. */
export type JournalState = {
  /** Newest first. */
  entries: JournalEntry[];
  /** Ids of deleted entries, so a sync never brings them back. */
  deletedIds: string[];
};

const EMPTY: JournalState = { entries: [], deletedIds: [] };

type NewEntry = Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>;

type JournalContextValue = {
  ready: boolean;
  /** Newest first. */
  entries: JournalEntry[];
  snapshot: JournalState;
  add: (entry: NewEntry) => void;
  edit: (id: string, patch: Partial<NewEntry>) => void;
  remove: (id: string) => void;
  /** Replace everything with a merged copy (used by sync). */
  restore: (state: JournalState) => void;
  reset: () => Promise<void>;
};

const JournalContext = createContext<JournalContextValue | null>(null);

function newId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

/** Older versions saved a bare array of entries. */
function parseStored(raw: string): JournalState {
  const parsed = JSON.parse(raw) as JournalState | JournalEntry[];
  if (Array.isArray(parsed)) return { entries: parsed, deletedIds: [] };
  return { ...EMPTY, ...parsed };
}

export function JournalProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<JournalState>(EMPTY);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!cancelled && raw) setState(parseStored(raw));
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
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [ready, state]);

  const add = useCallback((entry: NewEntry) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      entries: [{ ...entry, id: newId(), createdAt: now, updatedAt: now }, ...prev.entries],
    }));
  }, []);

  const edit = useCallback((id: string, patch: Partial<NewEntry>) => {
    const now = new Date().toISOString();
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: now } : e)),
    }));
  }, []);

  const remove = useCallback((id: string) => {
    setState((prev) => ({
      entries: prev.entries.filter((e) => e.id !== id),
      deletedIds: prev.deletedIds.includes(id) ? prev.deletedIds : [...prev.deletedIds, id],
    }));
  }, []);

  const restore = useCallback((next: JournalState) => {
    setState({ ...EMPTY, ...next });
  }, []);

  const reset = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
    setState(EMPTY);
  }, []);

  const value = useMemo(
    () => ({ ready, entries: state.entries, snapshot: state, add, edit, remove, restore, reset }),
    [ready, state, add, edit, remove, restore, reset]
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
