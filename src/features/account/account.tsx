import type { Session } from '@supabase/supabase-js';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { useProgress } from '@/features/learn/progress';
import { useOnboarding } from '@/features/onboarding/store';
import { useJournal } from '@/features/reflect/journal';
import { supabase } from '@/lib/supabase';

import { mergeAll, sameState, type SyncedState } from './merge';

/** How long to wait after a change before uploading it. */
const UPLOAD_DELAY_MS = 2000;

export type SyncStatus = 'idle' | 'syncing' | 'error';

type AccountContextValue = {
  /** False until we know whether someone is signed in. */
  ready: boolean;
  session: Session | null;
  email: string | null;
  syncStatus: SyncStatus;
  lastSyncedAt: Date | null;
  syncError: string | null;
  /** Returns whether the account is now up to date. */
  syncNow: () => Promise<boolean>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AccountContext = createContext<AccountContextValue | null>(null);

/**
 * Holds the signed-in session and keeps this phone and the account in step:
 * on sign-in and whenever the app comes to the foreground it downloads the
 * account copy, merges it with the phone's, and uploads the result; local
 * changes are uploaded shortly after they happen.
 */
export function AccountProvider({ children }: { children: ReactNode }) {
  const onboarding = useOnboarding();
  const progress = useProgress();
  const journal = useJournal();

  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const userId = session?.user.id ?? null;
  const storesReady = onboarding.ready && progress.ready && journal.ready;

  const local = useMemo<SyncedState>(
    () => ({ onboarding: onboarding.snapshot, progress: progress.snapshot, journal: journal.snapshot }),
    [onboarding.snapshot, progress.snapshot, journal.snapshot]
  );

  // Latest values for use inside async work.
  const localRef = useRef(local);
  const storesRef = useRef({ onboarding, progress, journal });
  useEffect(() => {
    localRef.current = local;
    storesRef.current = { onboarding, progress, journal };
  });

  /** The state we last saw in the account, to skip needless uploads. */
  const syncedRef = useRef<SyncedState | null>(null);
  const syncingRef = useRef(false);

  // Session: read the saved one, then follow sign-in and sign-out events.
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .catch(() => {})
      .finally(() => setReady(true));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (!next) {
        syncedRef.current = null;
        setLastSyncedAt(null);
        setSyncError(null);
        setSyncStatus('idle');
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const syncNow = useCallback(async () => {
    if (!userId) return false;
    if (syncingRef.current) {
      // A sync is already running; wait for it to finish.
      while (syncingRef.current) await new Promise((resolve) => setTimeout(resolve, 100));
      return syncedRef.current !== null && sameState(localRef.current, syncedRef.current);
    }
    syncingRef.current = true;
    setSyncStatus('syncing');
    try {
      const { data: remote, error } = await supabase
        .from('user_state')
        .select('onboarding, progress, journal')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;

      const current = localRef.current;
      const merged = mergeAll(current, remote as Partial<SyncedState> | null);

      // Bring this phone up to date with anything new from the account.
      const stores = storesRef.current;
      if (!sameState(merged.onboarding, current.onboarding)) stores.onboarding.restore(merged.onboarding);
      if (!sameState(merged.progress, current.progress)) stores.progress.restore(merged.progress);
      if (!sameState(merged.journal, current.journal)) stores.journal.restore(merged.journal);

      // Upload anything the account doesn't have yet.
      if (!remote || !sameState(merged, remote)) {
        const { error: upsertError } = await supabase
          .from('user_state')
          .upsert({ user_id: userId, ...merged }, { onConflict: 'user_id' });
        if (upsertError) throw upsertError;
      }

      syncedRef.current = merged;
      setLastSyncedAt(new Date());
      setSyncError(null);
      setSyncStatus('idle');
      return true;
    } catch (e) {
      setSyncError(e instanceof Error ? e.message : 'Sync failed');
      setSyncStatus('error');
      return false;
    } finally {
      syncingRef.current = false;
    }
  }, [userId]);

  // Sync as soon as someone signs in (and on every launch while signed in).
  useEffect(() => {
    if (!userId || !storesReady) return;
    const timer = setTimeout(syncNow, 0);
    return () => clearTimeout(timer);
  }, [userId, storesReady, syncNow]);

  // Sync again whenever the app comes back to the foreground.
  useEffect(() => {
    if (!userId) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncNow();
    });
    return () => sub.remove();
  }, [userId, syncNow]);

  // Upload local changes shortly after they happen.
  useEffect(() => {
    if (!userId || !syncedRef.current || sameState(local, syncedRef.current)) return;
    const timer = setTimeout(syncNow, UPLOAD_DELAY_MS);
    return () => clearTimeout(timer);
  }, [userId, local, syncNow]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const deleteAccount = useCallback(async () => {
    const { error } = await supabase.rpc('delete_account');
    if (error) throw error;
    // The account no longer exists, so only clear the session on this phone.
    await supabase.auth.signOut({ scope: 'local' });
  }, []);

  const value = useMemo(
    () => ({
      ready,
      session,
      email: session?.user.email ?? null,
      syncStatus,
      lastSyncedAt,
      syncError,
      syncNow,
      signOut,
      deleteAccount,
    }),
    [ready, session, syncStatus, lastSyncedAt, syncError, syncNow, signOut, deleteAccount]
  );

  return <AccountContext value={value}>{children}</AccountContext>;
}

export function useAccount() {
  const ctx = use(AccountContext);
  if (!ctx) throw new Error('useAccount must be used inside AccountProvider');
  return ctx;
}
