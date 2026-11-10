import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { AndroidImportance, IosAuthorizationStatus } from 'expo-notifications';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

const STORAGE_KEY = 'bondly.reminders.v1';
/** How many days ahead we schedule. Refreshed every time the app opens. */
const DAYS_AHEAD = 14;
const ANDROID_CHANNEL = 'daily-reminder';

/** Scheduled notifications that aren't daily reminders, so rescheduling leaves them alone. */
export const TRIAL_REMINDER_ID = 'bondly-trial-ending';
const KEEP_IDENTIFIERS = [TRIAL_REMINDER_ID];

// Show reminders even if they arrive while Bondly is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type ReminderSettings = { enabled: boolean; hour: number; minute: number };

const DEFAULTS: ReminderSettings = { enabled: false, hour: 19, minute: 0 };

export type PermissionResult = 'granted' | 'denied';

type RemindersContextValue = ReminderSettings & {
  ready: boolean;
  /** Asks for permission if needed, then turns reminders on. */
  enable: () => Promise<PermissionResult>;
  disable: () => void;
  setTime: (hour: number, minute: number) => void;
};

const RemindersContext = createContext<RemindersContextValue | null>(null);

async function ensurePermission(): Promise<PermissionResult> {
  const current = await Notifications.getPermissionsAsync();
  if (isGranted(current)) return 'granted';
  if (!current.canAskAgain) return 'denied';
  const asked = await Notifications.requestPermissionsAsync();
  return isGranted(asked) ? 'granted' : 'denied';
}

function isGranted(status: Notifications.NotificationPermissionsStatus) {
  if (Platform.OS === 'ios') {
    const s = status.ios?.status;
    return (
      s === IosAuthorizationStatus.AUTHORIZED ||
      s === IosAuthorizationStatus.PROVISIONAL ||
      s === IosAuthorizationStatus.EPHEMERAL
    );
  }
  return status.granted;
}

export function RemindersProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!cancelled && raw) setSettings({ ...DEFAULTS, ...(JSON.parse(raw) as ReminderSettings) });
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
    if (ready) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  }, [ready, settings]);

  const enable = useCallback(async () => {
    const result = await ensurePermission();
    if (result === 'granted') setSettings((s) => ({ ...s, enabled: true }));
    return result;
  }, []);

  const disable = useCallback(() => {
    setSettings((s) => ({ ...s, enabled: false }));
    Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
  }, []);

  const setTime = useCallback((hour: number, minute: number) => {
    setSettings((s) => ({ ...s, hour, minute }));
  }, []);

  const value = useMemo(
    () => ({ ...settings, ready, enable, disable, setTime }),
    [settings, ready, enable, disable, setTime]
  );

  return <RemindersContext value={value}>{children}</RemindersContext>;
}

export function useReminders() {
  const ctx = use(RemindersContext);
  if (!ctx) throw new Error('useReminders must be used inside RemindersProvider');
  return ctx;
}

export type ReminderPlan = {
  hour: number;
  minute: number;
  /** Skip today's reminder (the person already practised). */
  skipToday: boolean;
  name: string;
  lesson: { id: string; title: string; minutes: number };
};

const MESSAGES = [
  (p: ReminderPlan) => `Your ${p.lesson.minutes}-minute lesson is ready: “${p.lesson.title}” 💌`,
  (p: ReminderPlan) => `${p.name ? `${p.name}, a` : 'A'} few minutes for your people? “${p.lesson.title}” is up next.`,
  (p: ReminderPlan) => `Small steps, big connections. Try “${p.lesson.title}” today 🌱`,
];

/**
 * Replaces Bondly's scheduled reminders with one per day for the next two
 * weeks, at the chosen time. Today's is skipped if the person already practised.
 */
export async function scheduleReminders(plan: ReminderPlan) {
  // Clear only the daily reminders; other notifications (like the trial reminder) stay.
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((n) => !KEEP_IDENTIFIERS.includes(n.identifier))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: 'Daily reminder',
      importance: AndroidImportance.DEFAULT,
    });
  }

  const now = new Date();
  for (let day = 0; day < DAYS_AHEAD; day++) {
    if (day === 0 && plan.skipToday) continue;
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + day, plan.hour, plan.minute);
    if (at <= now) continue;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Bondly',
        body: MESSAGES[day % MESSAGES.length](plan),
        data: { url: `/lesson/${plan.lesson.id}` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at,
        channelId: Platform.OS === 'android' ? ANDROID_CHANNEL : undefined,
      },
    });
  }
}

export function formatTime(hour: number, minute: number) {
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
