import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton, tapFeedback } from '@/components/bondly/buttons';
import { Bondling, type BondlingColor } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { TodayLessonCard } from '@/components/bondly/today-lesson-card';
import { TopicIcon, type TopicIconName } from '@/components/bondly/topic-icons';
import { Palette, Radius, Space } from '@/constants/bondly';
import { todaysLesson } from '@/features/learn/content';
import { useProgress } from '@/features/learn/progress';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { useOnboarding } from '@/features/onboarding/store';
import { formatTime, useReminders } from '@/features/reminders/reminders';

/** Quick picks for when the daily reminder arrives. Any other time can be set in Settings. */
const TIMES: { label: string; hour: number; minute: number; icon: TopicIconName; color: BondlingColor }[] = [
  { label: 'Morning', hour: 8, minute: 0, icon: 'sunrise', color: 'yellow' },
  { label: 'Lunch', hour: 12, minute: 30, icon: 'sandwich', color: 'peach' },
  { label: 'Evening', hour: 19, minute: 0, icon: 'nightmoon', color: 'lavender' },
];

/**
 * Explains reminders before the system permission prompt, so the prompt
 * only appears once the person has chosen to get them. There's no “Not now”:
 * declining the system prompt moves on too, and reminders can be turned off
 * or on any time in Settings.
 */
export default function RemindersScreen() {
  const { next, back } = useOnboardingFlow();
  const { answers, update } = useOnboarding();
  const { enable, hour, minute, setTime } = useReminders();
  const [asking, setAsking] = useState(false);
  // The reminder names your next lesson, so preview the real one: the start of your main journey.
  const { completedLessons } = useProgress();
  const first = todaysLesson(answers.journeys, completedLessons);

  const remindMe = async () => {
    setAsking(true);
    const result = await enable();
    setAsking(false);
    update({ remindersWanted: result === 'granted' });
    next();
  };

  return (
    <Screen
      onBack={back}
      scroll
      footer={<PrimaryButton label="Remind me" onPress={remindMe} disabled={asking} />}>
      <View style={styles.center}>
        <Float distance={8}>
          <Bondling size={120} color="blue" mood="wink" prop="flag" />
        </Float>

        <Animated.View entering={FadeInDown.duration(500)} style={styles.copy}>
          <BText variant="title" center>
            A gentle nudge, once a day
          </BText>
          <BText variant="body" center>
            Pick when suits you. No ping on days you’ve already practised, and you can change it any
            time in Settings.
          </BText>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.times}>
          {TIMES.map((t) => {
            const on = t.hour === hour && t.minute === minute;
            return (
              <Pressable
                key={t.label}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={`${t.label}, ${formatTime(t.hour, t.minute)}`}
                onPress={() => {
                  tapFeedback();
                  setTime(t.hour, t.minute);
                }}
                style={({ pressed }) => [styles.time, on && styles.timeOn, pressed && { opacity: 0.8 }]}>
                <TopicIcon name={t.icon} color={t.color} size={52} noShadow />
                <BText variant="bodyBold" color={on ? Palette.primaryDeep : Palette.ink}>
                  {t.label}
                </BText>
                <BText variant="caption" color={on ? Palette.primaryDeep : Palette.inkSoft}>
                  {formatTime(t.hour, t.minute)}
                </BText>
              </Pressable>
            );
          })}
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.lesson}>
          <TodayLessonCard course={first.course} lesson={first.lesson} label="Your first lesson" />
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', gap: Space.lg, paddingVertical: Space.sm },
  copy: { gap: Space.sm },
  times: { flexDirection: 'row', gap: Space.sm, alignSelf: 'stretch' },
  time: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  timeOn: { borderColor: Palette.primary, backgroundColor: Palette.lilac },
  lesson: { alignSelf: 'stretch' },
});
