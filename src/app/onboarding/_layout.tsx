import { Stack } from 'expo-router';

import { Palette } from '@/constants/bondly';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: Palette.surfaceSoft },
      }}>
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
      <Stack.Screen name="analyzing" options={{ gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="results" options={{ gestureEnabled: false, animation: 'fade' }} />
    </Stack>
  );
}
