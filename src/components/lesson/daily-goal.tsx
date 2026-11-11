import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
  ZoomIn,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { ProgressBar } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { TopicIcon } from '@/components/bondly/topic-icons';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import type { DailyMinutes } from '@/features/onboarding/content';
import { PACE_ART, paceName } from '@/features/onboarding/pace';
import { playSoundAfter } from '@/features/sound/sound';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 200;
const STROKE = 16;
const R = (SIZE - STROKE) / 2;
const LENGTH = 2 * Math.PI * R;

/** How long the ring takes to fill, after a short pause; the cheer lands when it closes. */
export const GOAL_FILL_DELAY = 250;
export const GOAL_FILL_MS = 900;

/**
 * “Daily goal reached”: the goal ring fills from where today started to full,
 * around the mascot for your pace. Shown once a day, after the lesson that
 * reaches your goal.
 */
export function DailyGoalReached({
  goal,
  before,
  after,
}: {
  goal: DailyMinutes;
  /** Minutes learned today before this lesson. */
  before: number;
  /** Minutes learned today including this lesson. */
  after: number;
}) {
  const art = PACE_ART[goal];
  const reduceMotion = useReducedMotion();
  const fill = useSharedValue(reduceMotion ? 1 : Math.min(before / goal, 1));

  useEffect(() => {
    if (!reduceMotion) {
      fill.value = withDelay(
        GOAL_FILL_DELAY,
        withTiming(1, { duration: GOAL_FILL_MS, easing: Easing.out(Easing.cubic) })
      );
    }
    return playSoundAfter('streak', GOAL_FILL_DELAY + GOAL_FILL_MS - 100);
  }, [fill, reduceMotion]);

  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: LENGTH * (1 - fill.value) }));
  const extra = after - goal;

  return (
    <View style={styles.center}>
      <Animated.View entering={ZoomIn.duration(320)} style={styles.ring}>
        <Svg width={SIZE} height={SIZE}>
          <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={Palette.track} strokeWidth={STROKE} fill="none" />
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            stroke={Palette.primary}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={LENGTH}
            animatedProps={ringProps}
            // Start the fill at twelve o'clock.
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        </Svg>
        <View style={[styles.art, { backgroundColor: art.tint }]}>
          <TopicIcon name={art.icon} color={art.color} size={96} noShadow />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(GOAL_FILL_DELAY + GOAL_FILL_MS).duration(450)} style={styles.copy}>
        <BText variant="overline" color={Palette.primaryDeep} center>
          {paceName(goal)} · {goal} min a day
        </BText>
        <BText variant="title" center>
          Daily goal reached!
        </BText>
        <BText variant="body" center>
          {extra > 0
            ? `${after} minutes today, ${extra} more than your goal. Anything else today is a bonus.`
            : `${after} minutes today, right on your goal. Anything else today is a bonus.`}
        </BText>
      </Animated.View>
    </View>
  );
}

/** A slim “2 of 3 min today” row, so the daily goal is visible before it's reached. Used on Home. */
export function DailyGoalProgress({ goal, minutes }: { goal: DailyMinutes; minutes: number }) {
  const art = PACE_ART[goal];
  const done = minutes >= goal;
  return (
    <View
      accessible
      accessibilityLabel={
        done ? `Daily goal reached: ${minutes} of ${goal} minutes today` : `Daily goal: ${minutes} of ${goal} minutes today`
      }
      style={styles.bar}>
      <View style={[styles.barArt, { backgroundColor: art.tint }]}>
        <TopicIcon name={art.icon} color={art.color} size={34} noShadow />
      </View>
      <View style={styles.barText}>
        <View style={styles.barHead}>
          <BText variant="bodyBold">{done ? 'Daily goal reached' : 'Daily goal'}</BText>
          <BText variant="caption" color={done ? Palette.primaryDeep : Palette.inkSoft}>
            {done ? `${minutes} min today` : `${minutes} of ${goal} min today`}
          </BText>
        </View>
        <ProgressBar value={Math.min(minutes / goal, 1)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    marginTop: Space.md,
    padding: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    ...Shadow.soft,
  },
  barArt: { width: 44, height: 44, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  barText: { flex: 1, gap: 6 },
  barHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Space.xl },
  ring: { width: SIZE, height: SIZE, alignItems: 'center', justifyContent: 'center' },
  art: {
    position: 'absolute',
    width: SIZE - STROKE * 2 - 24,
    height: SIZE - STROKE * 2 - 24,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { gap: Space.sm },
});
