import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { Palette } from '@/constants/bondly';
import { ProgressProvider, useProgress } from '@/features/learn/progress';
import { OnboardingProvider, useOnboarding } from '@/features/onboarding/store';
import { JournalProvider, useJournal } from '@/features/reflect/journal';
import { ReminderSync } from '@/features/reminders/reminder-sync';
import { RemindersProvider, useReminders } from '@/features/reminders/reminders';

SplashScreen.preventAutoHideAsync();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: Palette.surfaceSoft, primary: Palette.primary },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={theme}>
      <OnboardingProvider>
        <ProgressProvider>
          <JournalProvider>
            <RemindersProvider>
              <RootStack />
            </RemindersProvider>
          </JournalProvider>
        </ProgressProvider>
      </OnboardingProvider>
    </ThemeProvider>
  );
}

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
  const loaded =
    (fontsLoaded || !!fontError) && ready && progressReady && journalReady && remindersReady;

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      {completed && <ReminderSync />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!completed}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={completed}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="course/[courseId]" />
          <Stack.Screen name="lesson/[lessonId]" />
          <Stack.Screen name="journal/[entryId]" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
