import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/bondly/buttons';
import { Bondling, HeartIcon } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Space } from '@/constants/bondly';
import { FOCUS_AREAS } from '@/features/onboarding/content';
import { useOnboarding } from '@/features/onboarding/store';

export default function ReadyScreen() {
  const { answers, complete } = useOnboarding();
  const [saving, setSaving] = useState(false);
  const focus = FOCUS_AREAS.filter((f) => answers.focus.includes(f.id));

  const start = async () => {
    setSaving(true);
    // Completing flips the root guard, which moves the app to the home tabs.
    await complete();
  };

  return (
    <Screen footer={<PrimaryButton label="Start my journey" onPress={start} disabled={saving} />}>
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.art}>
          <Float distance={10}>
            <View style={styles.pair}>
              <Bondling size={130} color="pink" mood="happy" />
              <View style={styles.second}>
                <Bondling size={150} color="lavender" mood="content" />
              </View>
            </View>
          </Float>
          <Float style={styles.heartA} distance={12} duration={1300}>
            <HeartIcon size={38} />
          </Float>
          <Float style={styles.heartB} distance={9} duration={1600} delay={250}>
            <HeartIcon size={24} colors={['#FFD1B8', '#FF8A9E']} />
          </Float>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.copy}>
          <BText variant="title" center>
            You’re all set{answers.name ? `, ${answers.name}` : ''}!
          </BText>
          <BText variant="body" center>
            Your journey starts with {answers.minutes ?? 5} minutes a day. First stop:
          </BText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.chips}>
          {focus.map((f) => (
            <View key={f.id} style={[styles.chip, { backgroundColor: f.tint }]}>
              <BText variant="bodyBold" style={styles.chipText}>
                {f.label}
              </BText>
            </View>
          ))}
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Space.lg },
  art: { alignItems: 'center', justifyContent: 'center', height: 220, width: 280 },
  pair: { flexDirection: 'row', alignItems: 'flex-end' },
  second: { marginLeft: -40 },
  heartA: { position: 'absolute', top: 0, right: 40 },
  heartB: { position: 'absolute', top: 30, left: 50 },
  copy: { gap: Space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Space.sm },
  chip: {
    borderRadius: Radius.pill,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
    borderWidth: 1.5,
    borderColor: Palette.white,
  },
  chipText: { fontSize: 14 },
});
