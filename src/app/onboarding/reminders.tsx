import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton, TextButton } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { useOnboarding } from '@/features/onboarding/store';
import { formatTime, useReminders } from '@/features/reminders/reminders';

/**
 * Explains reminders before the system permission prompt, so the prompt
 * only appears once the person has chosen to get them.
 */
export default function RemindersScreen() {
  const { next, back } = useOnboardingFlow();
  const { answers, update } = useOnboarding();
  const { enable, hour, minute } = useReminders();
  const [asking, setAsking] = useState(false);
  const minutes = answers.minutes ?? 5;

  const choose = async (wanted: boolean) => {
    if (wanted) {
      setAsking(true);
      const result = await enable();
      setAsking(false);
      update({ remindersWanted: result === 'granted' });
    } else {
      update({ remindersWanted: false });
    }
    next();
  };

  return (
    <Screen
      onBack={back}
      footer={
        <>
          <PrimaryButton label="Remind me" onPress={() => choose(true)} disabled={asking} />
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
            One friendly ping at {formatTime(hour, minute)}, and none on days you’ve already
            practised. Change the time or turn it off any time in Settings.
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
              Your {minutes}-minute lesson is ready: “Say What You Feel” 💌
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
