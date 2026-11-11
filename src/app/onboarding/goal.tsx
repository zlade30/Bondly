import { StyleSheet, View } from 'react-native';

import { NextFab } from '@/components/bondly/buttons';
import { JourneyPicker } from '@/components/bondly/journey-picker';
import { Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Space } from '@/constants/bondly';
import type { RelationshipGoal } from '@/features/onboarding/content';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { MAX_JOURNEYS, useOnboarding } from '@/features/onboarding/store';

/**
 * Your focus: up to three relationships to work on, each with its own
 * journey. The first one picked becomes your main journey.
 */
export default function GoalScreen() {
  const { next, back, progress } = useOnboardingFlow();
  const { answers, update } = useOnboarding();
  const chosen = answers.journeys;

  const toggle = (id: RelationshipGoal) => {
    const journeys = chosen.includes(id)
      ? chosen.filter((j) => j !== id)
      : chosen.length < MAX_JOURNEYS
        ? [...chosen, id]
        : chosen;
    update({ journeys, goal: journeys[0] ?? null });
  };

  return (
    <Screen onBack={back} progress={progress} scroll>
      <BText variant="title" style={styles.title}>
        {answers.name ? `${answers.name}, which` : 'Which'} relationships do you want to grow?
      </BText>
      <BText variant="body" style={styles.sub}>
        Pick up to {MAX_JOURNEYS}. Your first pick is your main journey.
      </BText>

      <JourneyPicker chosen={chosen} onToggle={toggle} animate />

      <View style={styles.fab}>
        <NextFab onPress={next} disabled={chosen.length === 0} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: Space.sm },
  sub: { marginTop: Space.xs, marginBottom: Space.xl },
  fab: { alignItems: 'flex-end', marginTop: Space.xl },
});
