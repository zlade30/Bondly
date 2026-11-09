import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Space } from '@/constants/bondly';
import { useOnboardingFlow } from '@/features/onboarding/flow';

export default function PersonalizeScreen() {
  const { next, back } = useOnboardingFlow();

  return (
    <Screen onBack={back} footer={<PrimaryButton label="Let’s go" onPress={next} />}>
      <View style={styles.center}>
        <View style={styles.art}>
          <Float distance={10}>
            <Bondling size={190} color="lavender" mood="curious" prop="sparkles" />
          </Float>
        </View>

        <Animated.View entering={FadeInDown.duration(500)} style={styles.copy}>
          <BText variant="title" center>
            Let’s make Bondly yours
          </BText>
          <BText variant="body" center>
            A few quick questions help us shape lessons around the people who matter to you.
          </BText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.privacy}>
          <BText style={styles.lock}>🔒</BText>
          <BText variant="caption" style={styles.privacyText}>
            Your answers stay private. We never share them outside Bondly.
          </BText>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: Space.xl },
  art: { alignItems: 'center' },
  copy: { gap: Space.sm, paddingHorizontal: Space.sm },
  privacy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    alignSelf: 'center',
    backgroundColor: Palette.white,
    borderRadius: Radius.pill,
    paddingVertical: Space.sm,
    paddingHorizontal: Space.lg,
  },
  lock: { fontSize: 14 },
  privacyText: { color: Palette.inkSoft, flexShrink: 1 },
});
