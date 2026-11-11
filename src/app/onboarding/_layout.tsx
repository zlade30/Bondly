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
      {/* No swipe-back on the quiz: dragging the slider kept pulling the screen back. The back arrow still works.
          iOS 26 adds a swipe-back from anywhere on the screen, which `gestureEnabled` alone doesn't turn off. */}
      <Stack.Screen name="quiz/[step]" options={{ gestureEnabled: false, fullScreenGestureEnabled: false }} />
      <Stack.Screen name="analyzing" options={{ gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="results" options={{ gestureEnabled: false, animation: 'fade' }} />
    </Stack>
  );
}
