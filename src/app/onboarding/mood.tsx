import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { NextFab, tapFeedback } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { MOODS } from '@/features/onboarding/content';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { useOnboarding } from '@/features/onboarding/store';

const RESPONSES: Record<string, string> = {
  great: 'Love that! Let’s keep the good stuff growing.',
  calm: 'Steady is a great place to learn from.',
  okay: 'Okay is honest. Small steps make a big difference.',
  low: 'Thanks for sharing. We’ll go gently.',
  tense: 'That’s hard. We’ll start with tools for calmer conversations.',
};

export default function MoodScreen() {
  const { next, back, progress } = useOnboardingFlow();
  const { answers, update } = useOnboarding();
  const selected = MOODS.find((m) => m.id === answers.mood);

  return (
    <Screen onBack={back} progress={progress}>
      <BText variant="title" style={styles.title}>
        Daily check-in
      </BText>
      <BText variant="body">How are you feeling in your relationships today?</BText>

      <View style={styles.big}>
        <Float distance={10}>
          <Bondling
            size={200}
            color={selected?.color ?? 'lavender'}
            mood={selected?.mood ?? 'curious'}
          />
        </Float>
        {selected && (
          <Animated.View key={selected.id} entering={FadeIn.duration(300)} style={styles.response}>
            <BText variant="bodyBold" center>
              {RESPONSES[selected.id]}
            </BText>
          </Animated.View>
        )}
      </View>

      <View style={styles.row}>
        {MOODS.map((m, i) => {
          const on = answers.mood === m.id;
          return (
            <Animated.View key={m.id} entering={FadeInDown.delay(i * 60).duration(400)}>
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={m.label}
                onPress={() => {
                  tapFeedback();
                  update({ mood: m.id });
                }}
                style={({ pressed }) => [styles.choice, on && styles.choiceOn, pressed && styles.pressed]}>
                <Bondling size={50} color={m.color} mood={m.mood} noShadow />
                <BText variant="caption" color={on ? Palette.ink : Palette.inkSoft} style={styles.choiceLabel}>
                  {m.label}
                </BText>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.fab}>
        <NextFab onPress={next} disabled={!answers.mood} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: Space.sm, marginBottom: Space.xs },
  big: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Space.lg },
  response: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    paddingVertical: Space.md,
    paddingHorizontal: Space.lg,
    ...Shadow.soft,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  choice: {
    alignItems: 'center',
    paddingVertical: Space.sm,
    paddingHorizontal: Space.xs,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    width: 64,
  },
  choiceOn: { borderColor: Palette.primary, backgroundColor: Palette.white },
  pressed: { transform: [{ scale: 0.94 }] },
  choiceLabel: { fontFamily: 'Nunito_800ExtraBold', marginTop: 2 },
  fab: { alignItems: 'flex-end', paddingVertical: Space.lg },
});
