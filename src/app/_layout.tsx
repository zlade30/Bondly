import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { DefaultTheme, Stack, ThemeProvider, type Href } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { Palette } from '@/constants/bondly';
import { AccountProvider } from '@/features/account/account';
import { ProgressProvider, useProgress } from '@/features/learn/progress';
import { OnboardingProvider, useOnboarding } from '@/features/onboarding/store';
import { SubscriptionProvider, useSubscription } from '@/features/premium/subscription';
import { TrialReminderSync } from '@/features/premium/trial-reminder';
import { JournalProvider, useJournal } from '@/features/reflect/journal';
import { ReminderSync } from '@/features/reminders/reminder-sync';
import { RemindersProvider, useReminders } from '@/features/reminders/reminders';
import { preloadSounds } from '@/features/sound/sound';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Palette.surfaceSoft,
    primary: Palette.primary,
  },
};

export default function RootLayout() {
  useEffect(preloadSounds, []);
  return (
    <GestureHandlerRootView style={styles.root}>
      <ThemeProvider value={theme}>
        <OnboardingProvider>
          <ProgressProvider>
            <JournalProvider>
              <RemindersProvider>
                <AccountProvider>
                  <SubscriptionProvider>
                    <RootStack />
                  </SubscriptionProvider>
                </AccountProvider>
              </RemindersProvider>
            </JournalProvider>
          </ProgressProvider>
        </OnboardingProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });

function RootStack() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Nunito_900Black,
  });
  const { ready, completed } = useOnboarding();
  const { ready: progressReady } = useProgress();
  const { ready: journalReady } = useJournal();
  const { ready: remindersReady } = useReminders();
  const { ready: subscriptionReady, isPremium } = useSubscription();
  const loaded =
    (fontsLoaded || !!fontError) && ready && progressReady && journalReady && remindersReady && subscriptionReady;
  const unlocked = completed && isPremium;
  // Where someone belongs right now. Every guard redirects here, so a locked
  // screen never falls back to whichever screen happens to be listed first.
  const home: Href = !completed ? '/onboarding' : !isPremium ? '/paywall' : '/';

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      {unlocked && <ReminderSync />}
      {unlocked && <TrialReminderSync />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!completed} redirectTo={home}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        {/* Hard paywall: after onboarding, Bondly needs a trial, subscription or lifetime purchase. */}
        <Stack.Protected guard={completed && !isPremium} redirectTo={home}>
          <Stack.Screen name="paywall" options={{ gestureEnabled: false }} />
        </Stack.Protected>
        <Stack.Protected guard={unlocked} redirectTo={home}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="course/[courseId]" />
          <Stack.Screen name="lesson/[lessonId]" />
          <Stack.Screen name="journal/[entryId]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="focus" options={{ presentation: 'modal' }} />
          <Stack.Screen name="check-in" options={{ presentation: 'fullScreenModal', gestureEnabled: false, animation: 'fade' }} />
        </Stack.Protected>
        {/* Settings stays reachable from the paywall, for restoring, signing in or deleting an account. */}
        <Stack.Protected guard={completed} redirectTo={home}>
          <Stack.Screen name="settings" />
        </Stack.Protected>
        {/* Reachable whether or not onboarding is done, so returning users can sign in first. */}
        <Stack.Screen name="account" options={{ presentation: 'modal' }} />
        <Stack.Screen name="auth-callback" options={{ presentation: 'modal', gestureEnabled: false }} />
      </Stack>
    </>
  );
}
