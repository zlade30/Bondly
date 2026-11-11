import { router, usePathname, type Href } from 'expo-router';
import { useCallback } from 'react';

/** The onboarding screens, in order. */
export const STEPS = [
  '/onboarding',
  '/onboarding/personalize',
  '/onboarding/name',
  '/onboarding/goal',
  '/onboarding/quiz/0',
  '/onboarding/quiz/1',
  '/onboarding/tip',
  '/onboarding/quiz/2',
  '/onboarding/time',
  '/onboarding/mood',
  '/onboarding/analyzing',
  '/onboarding/results',
  '/onboarding/reminders',
  '/onboarding/ready',
] as const;

/** Steps that show the top progress bar (the question part of the flow). */
const FIRST_QUESTION = STEPS.indexOf('/onboarding/name');
const LAST_QUESTION = STEPS.indexOf('/onboarding/mood');

export function useOnboardingFlow() {
  const pathname = usePathname();
  const index = STEPS.indexOf(pathname as (typeof STEPS)[number]);

  const next = useCallback(() => {
    const target = STEPS[index + 1];
    if (target) router.push(target as Href);
  }, [index]);

  /** Go forward without leaving the current screen in history (for loading screens). */
  const replaceNext = useCallback(() => {
    const target = STEPS[index + 1];
    if (target) router.replace(target as Href);
  }, [index]);

  const back = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, []);

  const progress =
    index < FIRST_QUESTION
      ? 0
      : Math.min(1, (index - FIRST_QUESTION + 1) / (LAST_QUESTION - FIRST_QUESTION + 1));

  return { index, next, replaceNext, back, progress };
}
