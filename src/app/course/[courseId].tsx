import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BackButton, tapFeedback } from '@/components/bondly/buttons';
import { ClockIcon, LockIcon } from '@/components/bondly/icons';
import { Bondling } from '@/components/bondly/mascot';
import { Float, ProgressBar } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Gradients, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { COURSES, courseProgress, type Course } from '@/features/learn/content';
import { useProgress } from '@/features/learn/progress';

const STOP = 78;
const ROW = 185;
/** Horizontal position of each stop, as a share of the path width, repeating. */
const ZIGZAG = [0.5, 0.78, 0.5, 0.22];

type StopState = 'done' | 'next' | 'locked';

export default function CourseScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const course = COURSES.find((c) => c.id === courseId);
  const insets = useSafeAreaInsets();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/learn' as Href));

  if (!course) {
    return (
      <View style={[styles.root, { paddingTop: insets.top + Space.lg, paddingHorizontal: Space.xl }]}>
        <BackButton onPress={back} />
        <BText variant="title" style={{ marginTop: Space.xl }}>
          Course not found
        </BText>
      </View>
    );
  }

  return <Journey course={course} back={back} />;
}

function Journey({ course, back }: { course: Course; back: () => void }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { completedLessons } = useProgress();
  const { done, total, ratio } = courseProgress(course, completedLessons);

  // A lesson is open once the one before it is done; finished lessons stay replayable.
  const states: StopState[] = course.lessons.map((l, i) => {
    if (completedLessons.includes(l.id)) return 'done';
    const prevDone = i === 0 || completedLessons.includes(course.lessons[i - 1].id);
    return prevDone ? 'next' : 'locked';
  });
  const nextIndex = states.indexOf('next');

  const pathWidth = Math.min(width, 520) - Space.xl * 2;
  const centers = course.lessons.map((_, i) => ({
    x: ZIGZAG[i % ZIGZAG.length] * pathWidth,
    y: ROW / 2 + i * ROW,
  }));
  const height = course.lessons.length * ROW;

  const openLesson = (index: number) => {
    const lesson = course.lessons[index];
    if (states[index] === 'locked') {
      Alert.alert('Not yet', `Finish “${course.lessons[index - 1].title}” to unlock this lesson.`);
      return;
    }
    tapFeedback();
    router.push(`/lesson/${lesson.id}` as Href);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={Gradients.screen} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + Space.sm, paddingBottom: insets.bottom + Space.xxl }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <BackButton onPress={back} />
        </View>

        {/* Course header */}
        <Animated.View entering={FadeInDown.duration(450)} style={[styles.header, { backgroundColor: course.tint }]}>
          <View style={styles.headerText}>
            <BText variant="overline" color={Palette.primaryDeep}>
              Course
            </BText>
            <BText variant="title" style={styles.headerTitle}>
              {course.title}
            </BText>
            <BText variant="caption" color={Palette.inkSoft}>
              {done === total ? 'Completed!' : `${done} of ${total} lessons done`}
            </BText>
            <View style={styles.headerBar}>
              <ProgressBar value={ratio} />
            </View>
          </View>
          <Float distance={6}>
            <Bondling
              size={96}
              color={course.mascot.color}
              mood={done === total ? 'happy' : course.mascot.mood}
              prop={done === total ? 'sparkles' : course.mascot.prop}
            />
          </Float>
        </Animated.View>

        {/* Journey path */}
        <View style={[styles.path, { width: pathWidth, height }]}>
          <Svg width={pathWidth} height={height} style={StyleSheet.absoluteFill}>
            {centers.slice(1).map((c, i) => {
              const p = centers[i];
              const midY = (p.y + c.y) / 2;
              const reached = states[i + 1] !== 'locked';
              return (
                <Path
                  key={i}
                  d={`M${p.x} ${p.y} C ${p.x} ${midY}, ${c.x} ${midY}, ${c.x} ${c.y}`}
                  stroke={reached ? Palette.primary : '#D9CFF0'}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={reached ? undefined : '2 14'}
                  fill="none"
                />
              );
            })}
          </Svg>

          {course.lessons.map((lesson, i) => (
            <Stop
              key={lesson.id}
              index={i}
              title={lesson.title}
              minutes={lesson.minutes}
              state={states[i]}
              x={centers[i].x}
              y={centers[i].y}
              pathWidth={pathWidth}
              onPress={() => openLesson(i)}
            />
          ))}

          {nextIndex >= 0 && (
            <View
              pointerEvents="none"
              style={[
                styles.guide,
                {
                  top: centers[nextIndex].y - 44,
                  left: centers[nextIndex].x > pathWidth / 2 ? 0 : pathWidth - 70,
                },
              ]}>
              <Float distance={6}>
                <Bondling size={70} color={course.mascot.color} mood="curious" noShadow />
              </Float>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function Stop({
  index,
  title,
  minutes,
  state,
  x,
  y,
  pathWidth,
  onPress,
}: {
  index: number;
  title: string;
  minutes: number;
  state: StopState;
  x: number;
  y: number;
  pathWidth: number;
  onPress: () => void;
}) {
  const labelWidth = 130;
  const left = Math.min(Math.max(x - labelWidth / 2, 0), pathWidth - labelWidth);
  return (
    <>
      <Animated.View
        entering={ZoomIn.delay(150 + index * 80).springify().damping(14)}
        style={[styles.stopWrap, { left: x - STOP / 2, top: y - STOP / 2 }]}>
        {state === 'next' && (
          <View style={styles.bubble} pointerEvents="none">
            <BText variant="caption" color={Palette.primaryDeep} style={styles.bubbleText}>
              Start
            </BText>
            <View style={styles.bubbleTail} />
          </View>
        )}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Lesson ${index + 1}: ${title}${state === 'locked' ? ', locked' : state === 'done' ? ', done' : ''}`}
          onPress={onPress}
          style={({ pressed }) => [pressed && { transform: [{ scale: 0.94 }] }]}>
          {state === 'locked' ? (
            <View style={[styles.stop, styles.stopLocked]}>
              <LockIcon size={24} color={Palette.inkMuted} />
            </View>
          ) : (
            <LinearGradient
              colors={state === 'done' ? ['#8EE3C6', '#3DBE8B'] : Gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.stop, Shadow.button, state === 'next' && styles.stopNext]}>
              {state === 'done' ? (
                <Svg width={30} height={30} viewBox="0 0 24 24">
                  <Path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke={Palette.white}
                    strokeWidth={3.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </Svg>
              ) : (
                <BText variant="title" color={Palette.white}>
                  {index + 1}
                </BText>
              )}
            </LinearGradient>
          )}
        </Pressable>
      </Animated.View>

      <View pointerEvents="none" style={[styles.label, { left, top: y + STOP / 2 + 6, width: labelWidth }]}>
        <BText
          variant="bodyBold"
          center
          numberOfLines={2}
          color={state === 'locked' ? Palette.inkMuted : Palette.ink}
          style={styles.labelTitle}>
          {title}
        </BText>
        <View style={styles.labelMeta}>
          <ClockIcon size={13} color={Palette.inkMuted} />
          <BText variant="caption">{minutes} min</BText>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.surfaceSoft },
  topBar: { paddingHorizontal: Space.lg, paddingBottom: Space.sm },
  header: {
    marginHorizontal: Space.xl,
    borderRadius: Radius.xl,
    padding: Space.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  headerText: { flex: 1, gap: 2 },
  headerTitle: { fontSize: 24, lineHeight: 30 },
  headerBar: { marginTop: Space.sm },
  path: { alignSelf: 'center', marginTop: Space.xxl },
  stopWrap: { position: 'absolute', width: STOP, height: STOP, alignItems: 'center' },
  stop: {
    width: STOP,
    height: STOP,
    borderRadius: STOP / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: Palette.white,
  },
  stopNext: { borderColor: '#F2EBFF' },
  stopLocked: { backgroundColor: '#ECE6F7' },
  bubble: {
    position: 'absolute',
    top: -38,
    backgroundColor: Palette.white,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.md,
    paddingVertical: 4,
    alignItems: 'center',
    zIndex: 2,
    ...Shadow.soft,
  },
  bubbleText: { fontFamily: 'Nunito_800ExtraBold', fontSize: 14 },
  bubbleTail: {
    position: 'absolute',
    bottom: -5,
    width: 10,
    height: 10,
    backgroundColor: Palette.white,
    transform: [{ rotate: '45deg' }],
  },
  label: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: Palette.white,
    borderRadius: Radius.md,
    paddingVertical: 6,
    paddingHorizontal: Space.sm,
    ...Shadow.soft,
  },
  labelTitle: { fontSize: 14, lineHeight: 18 },
  labelMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  guide: { position: 'absolute' },
});
