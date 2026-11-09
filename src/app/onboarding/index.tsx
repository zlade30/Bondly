import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { router, type Href } from 'expo-router';

import { PrimaryButton, TextButton } from '@/components/bondly/buttons';
import { Logo } from '@/components/bondly/logo';
import { HeartIcon, HuggingPair } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Palette, Space } from '@/constants/bondly';
import { useOnboardingFlow } from '@/features/onboarding/flow';

export default function WelcomeScreen() {
  const { next } = useOnboardingFlow();
  const { width } = useWindowDimensions();
  const art = Math.min(width - 32, 380);

  return (
    <Screen
      footer={
        <Animated.View entering={FadeInDown.delay(450).duration(500)} style={styles.footer}>
          <PrimaryButton label="Get started" onPress={next} />
          <TextButton label="I already have an account" onPress={() => router.push('/account' as Href)} />
          <BText variant="caption" center>
            🔒 Private by default. Nothing leaves this phone unless you sign in.
          </BText>
        </Animated.View>
      }>
      <View style={styles.top}>
        <Logo />
      </View>

      <View style={styles.hero}>
        <Float distance={10} duration={2000}>
          <HuggingPair width={art} />
        </Float>
        <Float style={[styles.heart, { right: art * 0.32, top: 6 }]} distance={12} duration={1500}>
          <HeartIcon size={46} />
        </Float>
        <Float style={[styles.heart, { right: art * 0.48, top: 44 }]} distance={8} duration={1700} delay={300}>
          <HeartIcon size={28} colors={['#FFD1B8', '#FF8A9E']} />
        </Float>
      </View>

      <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.copy}>
        <BText variant="display">Build healthier relationships</BText>
        <BText variant="body" style={styles.sub}>
          Small lessons for bigger, happier connections.
        </BText>
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { paddingTop: Space.md },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: 220 },
  heart: { position: 'absolute' },
  copy: { gap: Space.sm, paddingBottom: Space.sm },
  sub: { fontSize: 18, lineHeight: 26, color: Palette.inkSoft },
  footer: { gap: Space.md },
});
