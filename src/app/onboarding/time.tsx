import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/bondly/buttons';
import { OptionRow } from '@/components/bondly/option';
import { Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { TopicIcon } from '@/components/bondly/topic-icons';
import { Palette, Radius, Space } from '@/constants/bondly';
import { DAILY_OPTIONS } from '@/features/onboarding/content';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { PACE_ART } from '@/features/onboarding/pace';
import { useOnboarding } from '@/features/onboarding/store';

export default function TimeScreen() {
  const { next, back, progress } = useOnboardingFlow();
  const { answers, update } = useOnboarding();

  return (
    <Screen
      onBack={back}
      progress={progress}
      scroll
      footer={<PrimaryButton label="Continue" onPress={next} disabled={!answers.minutes} />}>
      <BText variant="title" style={styles.title}>
        How much time can you give your relationships each day?
      </BText>

      <View style={styles.list}>
        {DAILY_OPTIONS.map((o, i) => (
          <Animated.View key={o.minutes} entering={FadeInDown.delay(i * 60).duration(400)}>
            <OptionRow
              label={o.label}
              leading={
                <View style={[styles.art, { backgroundColor: PACE_ART[o.minutes].tint }]}>
                  <TopicIcon name={PACE_ART[o.minutes].icon} color={PACE_ART[o.minutes].color} size={40} noShadow />
                </View>
              }
              trailing={
                <View style={styles.pill}>
                  <BText variant="caption" color={Palette.primaryDeep}>
                    {o.note}
                  </BText>
                </View>
              }
              selected={answers.minutes === o.minutes}
              onPress={() => update({ minutes: o.minutes })}
            />
          </Animated.View>
        ))}
      </View>

      <View style={styles.tip}>
        <BText style={styles.tipEmoji}>💡</BText>
        <BText variant="caption" style={styles.tipText}>
          Most people stick with Bondly when they start with 5 minutes a day.
        </BText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: Space.sm, marginBottom: Space.xl },
  list: { gap: Space.md },
  art: { width: 52, height: 52, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  pill: {
    backgroundColor: Palette.lilac,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.md,
    paddingVertical: 3,
  },
  tip: {
    marginTop: Space.xl,
    flexDirection: 'row',
    gap: Space.sm,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: Radius.md,
    padding: Space.lg,
  },
  tipEmoji: { fontSize: 18 },
  tipText: { flex: 1, color: Palette.inkSoft },
});
