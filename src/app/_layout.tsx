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
          <RootStack />
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
  const loaded = (fontsLoaded || !!fontError) && ready && progressReady;

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!completed}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
        <Stack.Protected guard={completed}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="lesson/[lessonId]" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
