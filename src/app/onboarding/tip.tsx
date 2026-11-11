import { useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/bondly/buttons';
import { Bondling, HeartIcon } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Gradients, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { playSoundAfter } from '@/features/sound/sound';

/** A breather between quiz questions, with one small, useful idea. */
export default function TipScreen() {
  // A soft pop as the mascot zooms in.
  useEffect(() => playSoundAfter('pop', 60), []);
  const { next, back, progress } = useOnboardingFlow();

  return (
    <Screen onBack={back} progress={progress} footer={<PrimaryButton label="Got it" onPress={next} />}>
      <View style={styles.center}>
        <Animated.View entering={ZoomIn.duration(320)} style={styles.art}>
          <Float distance={8}>
            <Bondling size={170} color="yellow" mood="content" prop="heart" />
          </Float>
          <Float style={styles.heart} distance={10} duration={1400}>
            <HeartIcon size={30} />
          </Float>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          <LinearGradient
            colors={Gradients.blushCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}>
            <BText variant="overline" color={Palette.primaryDeep}>
              Quick tip
            </BText>
            <BText variant="heading" style={styles.cardTitle}>
              Name it to tame it
            </BText>
            <BText variant="body">
              Saying “I feel hurt” instead of “You always…” lowers defences on both sides. It’s
              the first skill we’ll practise together.
            </BText>
          </LinearGradient>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: Space.xl },
  art: { alignItems: 'center' },
  heart: { position: 'absolute', right: '26%', top: 0 },
  card: { borderRadius: Radius.xl, padding: Space.xl, gap: Space.sm, ...Shadow.soft },
  cardTitle: { fontSize: 22 },
});
