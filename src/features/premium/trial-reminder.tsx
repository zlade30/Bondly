import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { TRIAL_REMINDER_ID } from '@/features/reminders/reminders';

import { useSubscription, type TrialStatus } from './subscription';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Remind this long before the trial ends; the first that's still ahead is used. */
const LEAD_TIMES = [2 * DAY_MS, DAY_MS];

async function scheduleTrialReminder(trial: TrialStatus) {
  await Notifications.cancelScheduledNotificationAsync(TRIAL_REMINDER_ID).catch(() => {});
  if (!trial.willRenew) return;

  // Don't ask for permission here; only remind people who already allow notifications.
  const { granted } = await Notifications.getPermissionsAsync();
  if (!granted) return;

  const now = Date.now();
  const at = LEAD_TIMES.map((lead) => trial.endsAt.getTime() - lead).find((t) => t > now + 60 * 1000);
  if (!at) return;

  const day = trial.endsAt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
  const price = trial.priceString && trial.period ? ` at ${trial.priceString} per ${trial.period}` : '';
  await Notifications.scheduleNotificationAsync({
    identifier: TRIAL_REMINDER_ID,
    content: {
      title: 'Your Bondly trial ends soon',
      body: `Your free trial ends ${day}, then your plan starts${price}. Cancel before then in Settings if it’s not for you.`,
      data: { url: '/' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(at),
      channelId: Platform.OS === 'android' ? 'daily-reminder' : undefined,
    },
  });
}

/**
 * Keeps a single "your trial ends soon" notification scheduled a couple of days
 * before a free trial converts, and removes it if the trial is cancelled or ends.
 * Renders nothing.
 */
export function TrialReminderSync() {
  const { trial, ready } = useSubscription();
  const endsAt = trial?.endsAt.getTime() ?? null;
  const willRenew = trial?.willRenew ?? false;
  const priceString = trial?.priceString ?? null;
  const period = trial?.period ?? null;

  useEffect(() => {
    if (!ready) return;
    if (endsAt === null) {
      Notifications.cancelScheduledNotificationAsync(TRIAL_REMINDER_ID).catch(() => {});
      return;
    }
    scheduleTrialReminder({ endsAt: new Date(endsAt), willRenew, priceString, period }).catch(() => {});
  }, [ready, endsAt, willRenew, priceString, period]);

  return null;
}
