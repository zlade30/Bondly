import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton, TextButton } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { useOnboarding } from '@/features/onboarding/store';

/**
 * Explains reminders before any system prompt. The actual notification
 * permission request will be added with the reminders feature.
 */
export default function RemindersScreen() {
  const { next, back } = useOnboardingFlow();
  const { answers, update } = useOnboarding();
  const minutes = answers.minutes ?? 5;

  const choose = (wanted: boolean) => {
    update({ remindersWanted: wanted });
    next();
  };

  return (
    <Screen
      onBack={back}
      footer={
        <>
          <PrimaryButton label="Remind me" onPress={() => choose(true)} />
          <TextButton label="Not now" onPress={() => choose(false)} />
        </>
      }>
      <View style={styles.center}>
        <Float distance={8}>
          <Bondling size={180} color="blue" mood="wink" prop="flag" />
        </Float>

        <Animated.View entering={FadeInDown.duration(500)} style={styles.copy}>
          <BText variant="title" center>
            A gentle nudge, once a day
          </BText>
          <BText variant="body" center>
            People who get a daily reminder are far more likely to make it a habit. We’ll keep
            it to one friendly ping.
          </BText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.preview}>
          <View style={styles.appIcon}>
            <Bondling size={30} color="pink" mood="happy" noShadow />
          </View>
          <View style={styles.previewText}>
            <BText variant="bodyBold" style={styles.previewTitle}>
              Bondly
            </BText>
            <BText variant="caption" color={Palette.inkSoft}>
              Your {minutes}-minute lesson is ready: “Say what you feel” 💌
            </BText>
          </View>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Space.xl },
  copy: { gap: Space.sm },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: Radius.lg,
    padding: Space.md,
    ...Shadow.soft,
  },
  appIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Palette.blush,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: { flex: 1 },
  previewTitle: { fontSize: 14 },
});
