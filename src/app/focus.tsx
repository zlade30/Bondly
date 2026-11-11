import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { PrimaryButton } from '@/components/bondly/buttons';
import { JourneyPicker } from '@/components/bondly/journey-picker';
import { Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Palette, Space } from '@/constants/bondly';
import type { RelationshipGoal } from '@/features/onboarding/content';
import { MAX_JOURNEYS, useOnboarding } from '@/features/onboarding/store';

/**
 * Edit your focus: up to three relationship journeys, in order. The first is
 * your main journey, which leads Today’s lesson. Opened from Learn.
 */
export default function FocusScreen() {
  const { answers, update } = useOnboarding();
  const [chosen, setChosen] = useState<RelationshipGoal[]>(answers.journeys);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/learn' as Href));

  const toggle = (id: RelationshipGoal) => {
    if (chosen.includes(id)) setChosen(chosen.filter((j) => j !== id));
    else if (chosen.length < MAX_JOURNEYS) setChosen([...chosen, id]);
  };

  const save = () => {
    update({ journeys: chosen, goal: chosen[0] ?? null });
    close();
  };

  return (
    <Screen
      onClose={close}
      scroll
      footer={<PrimaryButton label="Save" onPress={save} disabled={chosen.length === 0} />}>
      <BText variant="title">Your focus</BText>
      <BText variant="body" style={styles.intro}>
        Pick up to {MAX_JOURNEYS} relationships. Your first pick is your main journey and leads Today’s lesson.
      </BText>

      <JourneyPicker chosen={chosen} onToggle={toggle} />
      <BText variant="caption" color={chosen.length === 0 ? Palette.danger : Palette.inkSoft} style={styles.hint}>
        {chosen.length === 0
          ? 'Pick at least one relationship.'
          : `${chosen.length} of ${MAX_JOURNEYS} chosen. Your progress in every journey is kept.`}
      </BText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginTop: Space.xs, marginBottom: Space.lg },
  hint: { marginTop: Space.md },
});
