import * as Notifications from 'expo-notifications';
import { router, type Href } from 'expo-router';
import { useEffect, useRef } from 'react';

import { todaysLesson } from '@/features/learn/content';
import { useProgress } from '@/features/learn/progress';
import { useOnboarding } from '@/features/onboarding/store';
import { useActivity } from '@/features/profile/use-activity';

import { scheduleReminders, useReminders } from './reminders';

/**
 * Keeps scheduled reminders in step with the person's next lesson and today's
 * activity, and opens the lesson when a reminder is tapped. Renders nothing.
 */
export function ReminderSync() {
  const { enabled, hour, minute, ready } = useReminders();
  const { answers } = useOnboarding();
  const { completedLessons } = useProgress();
  const { streak } = useActivity();

  const next = todaysLesson(answers.focus, completedLessons, answers.goal).lesson;

  useEffect(() => {
    if (!ready || !enabled) return;
    scheduleReminders({
      hour,
      minute,
      skipToday: streak.activeToday,
      name: answers.name,
      lesson: { id: next.id, title: next.title, minutes: next.minutes },
    }).catch(() => {});
  }, [ready, enabled, hour, minute, streak.activeToday, answers.name, next.id, next.title, next.minutes]);

  // Open the lesson from a tapped reminder (works for cold starts too).
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef<string | null>(null);
  useEffect(() => {
    if (!response || response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const id = response.notification.request.identifier;
    if (handled.current === id) return;
    handled.current = id;
    const url = response.notification.request.content.data?.url;
    if (typeof url === 'string') router.push(url as Href);
    Notifications.clearLastNotificationResponseAsync().catch(() => {});
  }, [response]);

  return null;
}
