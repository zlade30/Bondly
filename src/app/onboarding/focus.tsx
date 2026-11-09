import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton, tapFeedback } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { Check } from '@/components/bondly/option';
import { Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Space } from '@/constants/bondly';
import { FOCUS_AREAS, type FocusArea } from '@/features/onboarding/content';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { useOnboarding } from '@/features/onboarding/store';

const MAX = 3;

export default function FocusScreen() {
  const { next, back, progress } = useOnboardingFlow();
  const { answers, update } = useOnboarding();
  const chosen = answers.focus;

  const toggle = (id: FocusArea) => {
    if (chosen.includes(id)) {
      update({ focus: chosen.filter((f) => f !== id) });
    } else if (chosen.length < MAX) {
      update({ focus: [...chosen, id] });
    }
  };

  return (
    <Screen
      onBack={back}
      progress={progress}
      scroll
      footer={
        <PrimaryButton
          label={chosen.length ? `Continue (${chosen.length}/${MAX})` : 'Pick at least one'}
          onPress={next}
          disabled={!chosen.length}
        />
      }>
      <BText variant="title" style={styles.title}>
        What would you like to get better at?
      </BText>
      <BText variant="body" style={styles.sub}>
        Choose up to {MAX}. You can change this any time.
      </BText>

      <View style={styles.grid}>
        {FOCUS_AREAS.map((f, i) => {
          const on = chosen.includes(f.id);
          const full = !on && chosen.length >= MAX;
          return (
            <Animated.View
              key={f.id}
              entering={FadeInDown.delay(i * 60).duration(400)}
              style={styles.cell}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on, disabled: full }}
                accessibilityLabel={f.label}
                onPress={() => {
                  tapFeedback();
                  toggle(f.id);
                }}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: f.tint },
                  on && styles.cardOn,
                  full && styles.cardFull,
                  pressed && styles.pressed,
                ]}>
                <View style={styles.check}>
                  <Check on={on} round={false} />
                </View>
                <Bondling size={84} color={f.color} mood={f.mood} prop={f.prop} />
                <BText variant="bodyBold" style={styles.cardLabel}>
                  {f.label}
                </BText>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: Space.sm },
  sub: { marginTop: Space.sm, marginBottom: Space.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Space.sm / 2 },
  cell: { width: '50%', padding: Space.sm / 2 },
  card: {
    borderRadius: Radius.lg,
    padding: Space.lg,
    paddingTop: Space.md,
    minHeight: 170,
    borderWidth: 2.5,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  cardOn: { borderColor: Palette.primary },
  cardFull: { opacity: 0.55 },
  pressed: { transform: [{ scale: 0.97 }] },
  check: { position: 'absolute', top: Space.md, right: Space.md },
  cardLabel: { alignSelf: 'flex-start', marginTop: Space.sm, fontSize: 16 },
});
