import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { PrimaryButton, SecondaryButton } from '@/components/bondly/buttons';
import { Confetti, ConfettiAfter } from '@/components/bondly/confetti';
import { ClockIcon } from '@/components/bondly/icons';
import { Bondling, HeartIcon } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { MatchStep, OrderStep, SceneStep, SortStep } from '@/components/lesson/activities';
import { DailyGoalReached, GOAL_FILL_DELAY, GOAL_FILL_MS } from '@/components/lesson/daily-goal';
import {
  BlankStep,
  ChoiceStep,
  ReadStep,
  ReflectStep,
  WriteStep,
  type StepResult,
} from '@/components/lesson/steps';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { findLesson, hasLevels, type Course, type Lesson } from '@/features/learn/content';
import { LESSON_STEPS, isPlayable, type LessonStep } from '@/features/learn/lessons';
import { useProgress } from '@/features/learn/progress';
import { finishesLevel, journeyLevel, lessonXp, levelOfLesson, maxLessonXp } from '@/features/learn/xp';
import type { DailyMinutes } from '@/features/onboarding/content';
import { DEFAULT_DAILY_MINUTES } from '@/features/onboarding/pace';
import { useOnboarding } from '@/features/onboarding/store';
import { useJournal } from '@/features/reflect/journal';
import { maybeAskForRating } from '@/features/rating/rating';
import { playSound } from '@/features/sound/sound';

/** `goal` follows `done` when this lesson is the one that reaches today's daily goal. */
type Phase = 'intro' | 'play' | 'done' | 'goal';

/** Today's minutes either side of the lesson that reached the daily goal. */
type GoalMoment = { goal: DailyMinutes; before: number; after: number };

/** How a play-through went, for the celebration screen. */
type Result = {
  xp: number;
  maxXp: number;
  /** First time finishing this lesson (in a journey, that's a level up). */
  firstTime: boolean;
  /** A replay that beat the previous best score. */
  newBest: boolean;
};

export default function LessonScreen() {
  const { lessonId, step } = useLocalSearchParams<{ lessonId: string; step?: string }>();
  // Development only: bondly://lesson/<id>?step=6 opens straight at step 6, for checking content.
  const startAt = __DEV__ && step ? Math.max(0, Number(step) - 1) : null;
  const found = findLesson(lessonId);

  const close = () => (router.canGoBack() ? router.back() : router.replace('/' as Href));

  if (!found) {
    return (
      <Screen onBack={close}>
        <BText variant="title">Lesson not found</BText>
      </Screen>
    );
  }

  // Remount the player when moving to the next lesson so its state resets.
  return (
    <LessonPlayer
      key={`${lessonId}-${startAt ?? ''}`}
      course={found.course}
      lesson={found.lesson}
      close={close}
      startAt={startAt}
    />
  );
}

function LessonPlayer({
  course,
  lesson,
  close,
  startAt,
}: {
  course: Course;
  lesson: Lesson;
  close: () => void;
  startAt: number | null;
}) {
  const steps = LESSON_STEPS[lesson.id] ?? [];
  const { completeLesson, completedLessons, lessonXp: bestXp, todayMinutes, goalCelebratedToday, markGoalCelebrated } =
    useProgress();
  const { answers } = useOnboarding();
  const [goalMoment, setGoalMoment] = useState<GoalMoment | null>(null);
  const [phase, setPhase] = useState<Phase>(startAt !== null ? 'play' : 'intro');
  const [index, setIndex] = useState(Math.min(startAt ?? 0, Math.max(steps.length - 1, 0)));
  const [graded, setGraded] = useState({ total: 0, firstTry: 0 });
  const [result, setResult] = useState<Result | null>(null);
  const { add: addJournalEntry } = useJournal();

  const [rateMoment, setRateMoment] = useState<{ lessonsDone: number; levelUp: boolean } | null>(null);
  useEffect(() => {
    // Ask once the celebrations have played. When the daily goal screen follows the lesson,
    // wait for that one instead, until its ring has filled and the confetti has settled.
    if (!rateMoment) return;
    const delay = phase === 'goal' ? GOAL_FILL_DELAY + GOAL_FILL_MS + 2500 : phase === 'done' && !goalMoment ? 2200 : null;
    if (delay === null) return;
    const t = setTimeout(() => maybeAskForRating(rateMoment), delay);
    return () => clearTimeout(t);
  }, [phase, rateMoment, goalMoment]);

  const finishStep = (stepResult?: StepResult) => {
    // Count this answer now, so the final step is included in the score below.
    const total = graded.total + (stepResult?.firstTry !== undefined ? 1 : 0);
    const firstTry = graded.firstTry + (stepResult?.firstTry ? 1 : 0);
    setGraded({ total, firstTry });
    const step = steps[index];
    if (stepResult?.note && step.kind === 'write') {
      addJournalEntry({ text: stepResult.note, lessonId: lesson.id, prompt: step.prompt });
    }
    if (index + 1 < steps.length) {
      setIndex(index + 1);
    } else {
      const xp = lessonXp(firstTry);
      const firstTime = !completedLessons.includes(lesson.id);
      setResult({ xp, maxXp: maxLessonXp(steps), firstTime, newBest: !firstTime && xp > (bestXp[lesson.id] ?? 0) });
      // The first lesson each day that ends at or past the daily goal gets its own celebration:
      // once a day, even if the goal is raised or lowered along the way.
      const goal = answers.minutes ?? DEFAULT_DAILY_MINUTES;
      const after = todayMinutes + lesson.minutes;
      const reached = !goalCelebratedToday && after >= goal;
      // The ring fills from where today stood; if the goal was lowered past that, it fills from empty.
      setGoalMoment(reached ? { goal, before: todayMinutes < goal ? todayMinutes : 0, after } : null);
      if (reached) markGoalCelebrated();
      completeLesson(lesson.id, xp, lesson.minutes);
      // A first finish is a good moment to (maybe) ask for a rating, once the celebration has played.
      if (firstTime) {
        setRateMoment({
          lessonsDone: completedLessons.length + 1,
          levelUp: finishesLevel(course, lesson.id, completedLessons),
        });
      }
      playSound('celebrate');
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      setPhase('done');
    }
  };

  const confirmLeave = () =>
    Alert.alert('Leave this lesson?', 'You can pick it up again from the start any time.', [
      { text: 'Keep going', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: close },
    ]);

  if (phase === 'intro') {
    const playable = isPlayable(lesson.id);
    const alreadyDone = completedLessons.includes(lesson.id);
    return (
      <Screen
        onBack={close}
        footer={
          playable ? (
            <PrimaryButton label={alreadyDone ? 'Play again' : 'Start lesson'} onPress={() => setPhase('play')} />
          ) : (
            <SecondaryButton label="Back" onPress={close} />
          )
        }>
        <View style={styles.center}>
          <View style={[styles.art, { backgroundColor: course.tint }]}>
            <Float distance={8}>
              <Bondling size={170} color={course.mascot.color} mood={course.mascot.mood} prop={course.mascot.prop} />
            </Float>
          </View>
          <Animated.View entering={FadeInDown.duration(450)} style={styles.copy}>
            <BText variant="overline" color={Palette.primaryDeep} center>
              {course.title}
            </BText>
            <BText variant="title" center>
              {lesson.title}
            </BText>
            <View style={styles.meta}>
              <ClockIcon />
              <BText variant="body">
                {lesson.minutes} min{playable ? ` · ${steps.length} steps` : ''}
              </BText>
            </View>
            <BText variant="body" center style={styles.summary}>
              {lesson.summary}
            </BText>
            {!playable && (
              <View style={styles.notice}>
                <BText variant="bodyBold" center>
                  This lesson is still being written. Check back soon!
                </BText>
              </View>
            )}
          </Animated.View>
        </View>
      </Screen>
    );
  }

  if (phase === 'done' || phase === 'goal') {
    const next = course.lessons[course.lessons.indexOf(lesson) + 1];
    const nextPlayable = next && isPlayable(next.id) ? next : null;
    const courseDone = course.lessons.every((l) => l.id === lesson.id || completedLessons.includes(l.id));
    // Where to go from here: on to the next lesson, or done for now.
    const exits = (
      <>
        {nextPlayable && !courseDone && (
          <PrimaryButton
            label={`Next: ${nextPlayable.title}`}
            onPress={() => router.replace(`/lesson/${nextPlayable.id}` as Href)}
          />
        )}
        {nextPlayable && !courseDone ? (
          <SecondaryButton label="Done" onPress={close} />
        ) : (
          <PrimaryButton label="Done" onPress={close} />
        )}
      </>
    );

    if (phase === 'goal' && goalMoment) {
      return (
        <View style={styles.flex}>
          <Screen footer={exits}>
            <DailyGoalReached goal={goalMoment.goal} before={goalMoment.before} after={goalMoment.after} />
          </Screen>
          <ConfettiAfter delay={GOAL_FILL_DELAY + GOAL_FILL_MS} />
        </View>
      );
    }

    // Confetti the first time a lesson completes its journey level.
    const levelUp = !!result?.firstTime && finishesLevel(course, lesson.id, completedLessons);
    return (
      <View style={styles.flex}>
        <Screen
          footer={
            // When this lesson reached the daily goal, that screen comes next and offers the way on.
            goalMoment ? <PrimaryButton label="Continue" onPress={() => setPhase('goal')} /> : exits
          }>
          <Celebration
            course={course}
            lesson={lesson}
            graded={graded}
            courseDone={courseDone}
            result={result}
            completed={completedLessons}
          />
        </Screen>
        {levelUp && <Confetti />}
      </View>
    );
  }

  const step = steps[index];
  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen onClose={confirmLeave} progress={(index + 1) / (steps.length + 1)}>
        <Animated.View key={index} entering={FadeIn.duration(250)} style={styles.flex}>
          <StepView step={step} onDone={finishStep} course={course} />
        </Animated.View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

function StepView({
  step,
  onDone,
  course,
}: {
  step: LessonStep;
  onDone: (result?: StepResult) => void;
  course: Course;
}) {
  const shared = { onDone, color: course.mascot.color, tint: course.tint };
  switch (step.kind) {
    case 'read':
      return <ReadStep step={step} {...shared} />;
    case 'choice':
      return <ChoiceStep step={step} {...shared} />;
    case 'blank':
      return <BlankStep step={step} {...shared} />;
    case 'reflect':
      return <ReflectStep step={step} {...shared} />;
    case 'write':
      return <WriteStep step={step} {...shared} />;
    case 'scene':
      return <SceneStep step={step} {...shared} />;
    case 'sort':
      return <SortStep step={step} {...shared} />;
    case 'match':
      return <MatchStep step={step} {...shared} />;
    case 'order':
      return <OrderStep step={step} {...shared} />;
  }
}

function Celebration({
  course,
  lesson,
  graded,
  courseDone,
  result,
  completed,
}: {
  course: Course;
  lesson: Lesson;
  graded: { total: number; firstTry: number };
  courseDone: boolean;
  result: Result | null;
  completed: string[];
}) {
  const isJourney = hasLevels(course);
  const relationship = course.kind === 'journey';
  // Count this lesson as done even if the saved progress hasn't caught up yet.
  const done = completed.includes(lesson.id) ? completed : [...completed, lesson.id];
  const where = levelOfLesson(course, lesson.id);
  const levelNumber = where?.level ?? course.lessons.indexOf(lesson) + 1;
  const left = where ? where.lessons.filter((l) => !done.includes(l.id)).length : 0;
  const { level, levels, finished } = journeyLevel(course, done);
  const firstTime = !!result?.firstTime;
  // A level only goes up once every lesson in it is finished.
  const leveledUp = isJourney && firstTime && left === 0;

  const badge = isJourney
    ? finished && leveledUp
      ? `🏆 Level ${levelNumber} · ${relationship ? 'Journey' : 'Refresher'} complete`
      : leveledUp
        ? `⬆️ Level ${level} unlocked`
        : where && where.count > 1
          ? `Level ${levelNumber} · Lesson ${where.index + 1} of ${where.count}`
          : `Level ${levelNumber}`
    : courseDone
      ? '🏆 Course complete'
      : null;

  const title = isJourney
    ? finished && leveledUp
      ? relationship
        ? `You finished the ${course.title} journey!`
        : `You finished ${course.title}!`
      : leveledUp
        ? `Level ${levelNumber} complete!`
        : 'Lesson complete!'
    : courseDone
      ? `You finished ${course.title}!`
      : 'Lesson complete!';

  const body = isJourney
    ? finished && leveledUp
      ? relationship
        ? `All ${levels} levels done. You’ve built real skills for this relationship.`
        : `All ${levels} levels done. That’s a real new skill in your toolkit.`
      : leveledUp
        ? `You finished every lesson in “${where?.title ?? lesson.title}”. Level ${level} is ready when you are.`
        : firstTime && left > 0
          ? `${left} more ${left === 1 ? 'lesson' : 'lessons'} to finish Level ${levelNumber}.`
          : result?.newBest
            ? 'New best score for this lesson. Nice practice!'
            : 'Replays keep your skills fresh. Your best score is saved.'
    : courseDone
      ? `All ${course.lessons.length} lessons done. That’s a real new skill in your toolkit.`
      : `You finished “${lesson.title}”. Small steps like this add up.`;

  return (
    <View style={styles.center}>
      <Animated.View entering={ZoomIn.duration(320)} style={styles.party}>
        {badge && (
          <View style={styles.badge}>
            <BText variant="overline" color={Palette.white}>
              {badge}
            </BText>
          </View>
        )}
        {/* A gentle drift, so the mascot doesn't compete with the confetti. */}
        <Float distance={3} duration={2600}>
          <Bondling size={190} color={course.mascot.color} mood="happy" prop="sparkles" />
        </Float>
        <Float style={styles.heartA} distance={12} duration={1300}>
          <HeartIcon size={40} />
        </Float>
        <Float style={styles.heartB} distance={9} duration={1600} delay={250}>
          <HeartIcon size={26} colors={['#FFD1B8', '#FF8A9E']} />
        </Float>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(500)} style={styles.copy}>
        <BText variant="title" center>
          {title}
        </BText>
        <BText variant="body" center>
          {body}
        </BText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.stats}>
        {result ? (
          <Stat value={`+${result.xp} XP`} label={result.newBest ? 'New best!' : `of ${result.maxXp} possible`} />
        ) : (
          <Stat value={`${lesson.minutes} min`} label="Time" />
        )}
        {graded.total > 0 && <Stat value={`${graded.firstTry}/${graded.total}`} label="Right first try" />}
      </Animated.View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <BText variant="heading">{value}</BText>
      <BText variant="caption">{label}</BText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', gap: Space.xl },
  art: {
    alignSelf: 'center',
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { gap: Space.sm },
  meta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  summary: { marginTop: Space.sm, fontSize: 18, lineHeight: 26 },
  notice: {
    marginTop: Space.md,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.lg,
    ...Shadow.soft,
  },
  party: { alignSelf: 'center', alignItems: 'center', width: 280 },
  badge: {
    backgroundColor: Palette.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.lg,
    paddingVertical: 6,
    marginBottom: Space.md,
    ...Shadow.button,
  },
  heartA: { position: 'absolute', top: 64, right: 30 },
  heartB: { position: 'absolute', top: 40, left: 36 },
  stats: { flexDirection: 'row', gap: Space.md },
  stat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    paddingVertical: Space.lg,
    gap: 2,
    ...Shadow.soft,
  },
});
