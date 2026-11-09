import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { PrimaryButton, SecondaryButton } from '@/components/bondly/buttons';
import { ClockIcon } from '@/components/bondly/icons';
import { Bondling, HeartIcon } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { BlankStep, ChoiceStep, ReadStep, ReflectStep, WriteStep } from '@/components/lesson/steps';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { findLesson, type Course, type Lesson } from '@/features/learn/content';
import { LESSON_STEPS, isPlayable, type LessonStep } from '@/features/learn/lessons';
import { useProgress } from '@/features/learn/progress';

type Phase = 'intro' | 'play' | 'done';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
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
  return <LessonPlayer key={lessonId} course={found.course} lesson={found.lesson} close={close} />;
}

function LessonPlayer({ course, lesson, close }: { course: Course; lesson: Lesson; close: () => void }) {
  const steps = LESSON_STEPS[lesson.id] ?? [];
  const { completeLesson, completedLessons } = useProgress();
  const [phase, setPhase] = useState<Phase>('intro');
  const [index, setIndex] = useState(0);
  const [graded, setGraded] = useState({ total: 0, firstTry: 0 });

  const finishStep = (result?: { firstTry: boolean }) => {
    if (result) {
      setGraded((g) => ({ total: g.total + 1, firstTry: g.firstTry + (result.firstTry ? 1 : 0) }));
    }
    if (index + 1 < steps.length) {
      setIndex(index + 1);
    } else {
      completeLesson(lesson.id);
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

  if (phase === 'done') {
    const next = course.lessons[course.lessons.indexOf(lesson) + 1];
    const nextPlayable = next && isPlayable(next.id) ? next : null;
    return (
      <Screen
        footer={
          <>
            {nextPlayable && (
              <PrimaryButton
                label={`Next: ${nextPlayable.title}`}
                onPress={() => router.replace(`/lesson/${nextPlayable.id}` as Href)}
              />
            )}
            {nextPlayable ? (
              <SecondaryButton label="Back to home" onPress={close} />
            ) : (
              <PrimaryButton label="Back to home" onPress={close} />
            )}
          </>
        }>
        <Celebration course={course} lesson={lesson} graded={graded} />
      </Screen>
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
  onDone: (result?: { firstTry: boolean }) => void;
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
  }
}

function Celebration({
  course,
  lesson,
  graded,
}: {
  course: Course;
  lesson: Lesson;
  graded: { total: number; firstTry: number };
}) {
  return (
    <View style={styles.center}>
      <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.party}>
        <Float distance={10}>
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
          Lesson complete!
        </BText>
        <BText variant="body" center>
          You finished “{lesson.title}”. Small steps like this add up.
        </BText>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(320).duration(500)} style={styles.stats}>
        <Stat value={`${lesson.minutes} min`} label="Time" />
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
  heartA: { position: 'absolute', top: 0, right: 30 },
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
