import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { RadarChart } from '@/components/bondly/radar-chart';
import { Float, Screen, SpeechBubble } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { SKILL_COPY, SKILLS } from '@/features/onboarding/content';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { scoreSkills, strongestAndWeakest } from '@/features/onboarding/scoring';
import { useOnboarding } from '@/features/onboarding/store';

export default function ResultsScreen() {
  const { next } = useOnboardingFlow();
  const { answers } = useOnboarding();
  const scores = useMemo(() => scoreSkills(answers), [answers]);
  const { strongest, weakest } = strongestAndWeakest(scores);

  return (
    <Screen scroll footer={<PrimaryButton label="Continue" onPress={next} />}>
      <BText variant="title" center style={styles.title}>
        {answers.name ? `${answers.name}’s` : 'Your'} connection map
      </BText>

      <Animated.View entering={FadeInDown.duration(600)}>
        <RadarChart
          size={200}
          axes={SKILLS.map((s) => ({ label: s.label, value: scores[s.id] }))}
        />
      </Animated.View>

      <View style={styles.intro}>
        <Float distance={5}>
          <Bondling size={84} color="lavender" mood="wink" prop="sparkles" />
        </Float>
        <SpeechBubble>
          <BText variant="bodyBold">Here’s where you shine, and where we’ll grow together.</BText>
        </SpeechBubble>
      </View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.card}>
        <View style={styles.cardHead}>
          <BText variant="bodyBold" color={Palette.primaryDeep}>
            Superpower
          </BText>
          <View style={styles.cardHeadRight}>
            <BText variant="bodyBold">{strongest.label}</BText>
            <View style={[styles.badge, { backgroundColor: '#DDF5EA' }]}>
              <BText variant="caption" color={Palette.success} style={styles.badgeText}>
                {Math.round(scores[strongest.id] * 100)}%
              </BText>
            </View>
          </View>
        </View>
        <BText variant="body">{SKILL_COPY[strongest.id].strength}</BText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.card}>
        <View style={styles.cardHead}>
          <BText variant="bodyBold" color={Palette.primaryDeep}>
            Growth area
          </BText>
          <View style={styles.cardHeadRight}>
            <BText variant="bodyBold">{weakest.label}</BText>
            <View style={[styles.badge, { backgroundColor: '#FFE4E8' }]}>
              <BText variant="caption" color={Palette.warning} style={styles.badgeText}>
                {Math.round(scores[weakest.id] * 100)}%
              </BText>
            </View>
          </View>
        </View>
        <BText variant="body">{SKILL_COPY[weakest.id].growth}</BText>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: Space.lg },
  intro: { flexDirection: 'row', alignItems: 'center', gap: Space.xs, marginBottom: Space.lg },
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.sm,
    marginBottom: Space.md,
    ...Shadow.soft,
  },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardHeadRight: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  badge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontFamily: 'Nunito_800ExtraBold' },
});
