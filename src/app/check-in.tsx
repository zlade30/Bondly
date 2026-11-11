import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  ZoomIn,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PrimaryButton } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { TopicIcon } from '@/components/bondly/topic-icons';
import { Font, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { useProgress } from '@/features/learn/progress';
import { CHECK_IN_REPLIES, MOODS, type Mood } from '@/features/onboarding/content';
import { useActivity } from '@/features/profile/use-activity';
import { playSound, playSoundAfter } from '@/features/sound/sound';

/**
 * The once-a-day check-in. It opens from Home on the first visit of the day:
 * first the streak ticks up by one, then it asks how you're feeling, then it
 * heads back to Home on its own. Picking a feeling is what counts the day.
 *
 * `?step=mood` skips straight to the question, for changing today's answer.
 */
export default function CheckInScreen() {
  const { step } = useLocalSearchParams<{ step?: string }>();
  const { checkIn, todayCheckIn } = useProgress();
  const { streak } = useActivity();

  // Work out the streak once, as it was when the screen opened, so the
  // animation doesn't change under us when the check-in is saved.
  const [start] = useState(() => {
    const before = streak.current;
    return { before, after: streak.activeToday ? before : before + 1, grows: !streak.activeToday };
  });
  const [phase, setPhase] = useState<'streak' | 'mood'>(step === 'mood' || !start.grows ? 'mood' : 'streak');
  const [picked, setPicked] = useState<Mood | null>(null);
  const leaving = useRef(false);

  const done = () => {
    if (leaving.current) return;
    leaving.current = true;
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  // After answering, show the reply for a moment, then go back to Home.
  useEffect(() => {
    if (!picked) return;
    const t = setTimeout(done, 2600);
    return () => clearTimeout(t);
  }, [picked]);

  const choose = (mood: Mood) => {
    if (picked) return;
    playSound('chime');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    checkIn(mood);
    setPicked(mood);
  };

  if (phase === 'streak') {
    return <StreakStep before={start.before} after={start.after} onNext={() => setPhase('mood')} />;
  }

  const answer = picked ?? null;
  return (
    <Screen
      footer={
        answer ? (
          <Animated.View entering={FadeIn.delay(300)}>
            <PrimaryButton label="Back to Home" onPress={done} />
          </Animated.View>
        ) : undefined
      }>
      <View style={styles.center}>
        {answer ? (
          <Animated.View key="reply" entering={ZoomIn.duration(320)} style={styles.replyWrap}>
            <Float distance={3} duration={2600}>
              <Bondling
                size={150}
                color={MOODS.find((m) => m.id === answer)!.color}
                mood={MOODS.find((m) => m.id === answer)!.mood}
                prop={answer === 'great' ? 'sparkles' : 'heart'}
              />
            </Float>
            <BText variant="title" center>
              Thanks for checking in
            </BText>
            <BText variant="body" center>
              {CHECK_IN_REPLIES[answer]}
            </BText>
          </Animated.View>
        ) : (
          <Animated.View key="ask" exiting={FadeOut.duration(150)} style={styles.ask}>
            <Animated.View entering={FadeInDown.duration(400)}>
              <BText variant="overline" center color={Palette.primaryDeep}>
                Daily check-in
              </BText>
              <BText variant="title" center style={styles.question}>
                How are you feeling in your relationships today?
              </BText>
              {todayCheckIn && (
                <BText variant="caption" center>
                  You can change today’s answer.
                </BText>
              )}
            </Animated.View>
            <View style={styles.moods}>
              {MOODS.map((m, i) => (
                <Animated.View key={m.id} entering={FadeInDown.delay(120 + i * 70).duration(380)}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Feeling ${m.label}`}
                    onPress={() => choose(m.id)}
                    style={({ pressed }) => [
                      styles.mood,
                      todayCheckIn === m.id && styles.moodOn,
                      pressed && { transform: [{ scale: 0.94 }] },
                    ]}>
                    <Bondling size={72} color={m.color} mood={m.mood} noShadow />
                    <BText variant="bodyBold" center>
                      {m.label}
                    </BText>
                  </Pressable>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}

/**
 * The streak ticking up: the flame pops in, yesterday's number rolls up and
 * away, today's rolls in, and a “+1” floats off. Then it moves on by itself.
 */
function StreakStep({ before, after, onNext }: { before: number; after: number; onNext: () => void }) {
  const reduceMotion = useReducedMotion();
  const roll = useSharedValue(0);
  const plus = useSharedValue(0);
  const moved = useRef(false);

  const next = () => {
    if (moved.current) return;
    moved.current = true;
    onNext();
  };

  useEffect(() => {
    const ease = { duration: 420, easing: Easing.out(Easing.cubic) };
    roll.value = withDelay(reduceMotion ? 0 : 700, withTiming(1, reduceMotion ? { duration: 0 } : ease));
    plus.value = withDelay(
      700,
      withSequence(withTiming(1, { duration: 200 }), withTiming(2, { duration: 1100, easing: Easing.out(Easing.quad) }))
    );
    const buzz = setTimeout(
      () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
      700
    );
    const auto = setTimeout(next, 3200);
    // The flame pops in, then the sparkle lands with the “+1”.
    playSound('pop');
    const sparkle = playSoundAfter('streak', 700);
    return () => {
      sparkle();
      clearTimeout(buzz);
      clearTimeout(auto);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const oldStyle = useAnimatedStyle(() => ({
    opacity: 1 - roll.value,
    transform: [{ translateY: -46 * roll.value }],
  }));
  const newStyle = useAnimatedStyle(() => ({
    opacity: roll.value,
    transform: [{ translateY: 46 * (1 - roll.value) }],
  }));
  // 0 → 1: pops in; 1 → 2: floats up and fades.
  const plusStyle = useAnimatedStyle(() => ({
    opacity: plus.value <= 1 ? plus.value : 2 - plus.value,
    transform: [{ translateY: plus.value <= 1 ? 0 : -60 * (plus.value - 1) }, { scale: plus.value <= 1 ? 0.6 + plus.value * 0.4 : 1 }],
  }));

  return (
    <Screen
      footer={
        <Animated.View entering={FadeIn.delay(1500).duration(400)}>
          <PrimaryButton label="Continue" onPress={next} />
        </Animated.View>
      }>
      <Pressable accessibilityRole="button" accessibilityLabel={`Streak now ${after} days. Continue`} onPress={next} style={styles.center}>
        <Animated.View entering={ZoomIn.duration(320)} style={styles.flame}>
          <Float distance={4} duration={2200}>
            <TopicIcon name="flame" color="peach" size={170} />
          </Float>
        </Animated.View>

        <View style={styles.counter}>
          <View style={styles.numberBox}>
            <Animated.View style={[styles.numberLayer, oldStyle]}>
              <BText style={styles.number}>{before}</BText>
            </Animated.View>
            <Animated.View style={[styles.numberLayer, newStyle]}>
              <BText style={styles.number}>{after}</BText>
            </Animated.View>
          </View>
          <Animated.View style={[styles.plus, plusStyle]}>
            <BText style={styles.plusText}>+1</BText>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(900).duration(450)} style={styles.copy}>
          <BText variant="title" center>
            {after === 1 ? 'Day 1. A fresh start!' : `${after}-day streak!`}
          </BText>
          <BText variant="body" center>
            {after === 1
              ? 'Every streak starts with one day. Let’s check in.'
              : 'You keep showing up. Let’s check in on today.'}
          </BText>
        </Animated.View>
      </Pressable>
    </Screen>
  );
}

const NUMBER_SIZE = 84;

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Space.lg },
  flame: { alignItems: 'center' },
  counter: { alignItems: 'center', justifyContent: 'center', marginTop: -Space.md },
  numberBox: { height: NUMBER_SIZE + 8, width: 200, overflow: 'hidden', alignItems: 'center' },
  numberLayer: { position: 'absolute', top: 0, left: 0, right: 0, alignItems: 'center' },
  number: { fontFamily: Font.black, fontSize: NUMBER_SIZE, lineHeight: NUMBER_SIZE + 8, color: Palette.ink },
  plus: { position: 'absolute', right: 34, top: -6 },
  plusText: { fontFamily: Font.black, fontSize: 30, lineHeight: 36, color: '#FF6FA5' },
  copy: { gap: Space.xs, paddingHorizontal: Space.lg },
  ask: { width: '100%', gap: Space.xl },
  question: { marginTop: Space.xs },
  moods: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: Space.md },
  mood: {
    width: 96,
    paddingVertical: Space.md,
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadow.soft,
  },
  moodOn: { borderColor: Palette.primary },
  replyWrap: { alignItems: 'center', gap: Space.md, paddingHorizontal: Space.lg },
});
