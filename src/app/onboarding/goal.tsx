import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { NextFab } from '@/components/bondly/buttons';
import { OptionRow } from '@/components/bondly/option';
import { Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Space } from '@/constants/bondly';
import { GOALS } from '@/features/onboarding/content';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { useOnboarding } from '@/features/onboarding/store';

export default function GoalScreen() {
  const { next, back, progress } = useOnboardingFlow();
  const { answers, update } = useOnboarding();

  return (
    <Screen onBack={back} progress={progress} scroll>
      <BText variant="title" style={styles.title}>
        {answers.name ? `${answers.name}, which` : 'Which'} relationship do you want to grow most?
      </BText>

      <View style={styles.list}>
        {GOALS.map((g, i) => (
          <Animated.View key={g.id} entering={FadeInDown.delay(i * 60).duration(400)}>
            <OptionRow
              label={g.label}
              leading={<BText style={styles.emoji}>{g.emoji}</BText>}
              selected={answers.goal === g.id}
              onPress={() => update({ goal: g.id })}
            />
          </Animated.View>
        ))}
      </View>

      <View style={styles.fab}>
        <NextFab onPress={next} disabled={!answers.goal} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: Space.sm, marginBottom: Space.xl },
  list: { gap: Space.md },
  emoji: { fontSize: 24, lineHeight: 30 },
  fab: { alignItems: 'flex-end', marginTop: Space.xl },
});
