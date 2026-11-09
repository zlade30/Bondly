import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tapFeedback } from '@/components/bondly/buttons';
import { BellIcon, ChevronRightIcon, ClockIcon, PlayIcon } from '@/components/bondly/icons';
import { Logo } from '@/components/bondly/logo';
import { Bondling, HeartIcon, HuggingPair } from '@/components/bondly/mascot';
import { Float } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Gradients, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { courseProgress, orderedCourses, todaysLesson, type Course } from '@/features/learn/content';
import { useProgress } from '@/features/learn/progress';
import { MOODS, type Mood } from '@/features/onboarding/content';
import { useOnboarding } from '@/features/onboarding/store';

const CHECK_IN_REPLIES: Record<Mood, string> = {
  great: 'Love that! Keep the good stuff growing.',
  calm: 'Steady days are great for learning.',
  okay: 'Okay is honest. One small step today?',
  low: 'Thanks for sharing. Go gently with yourself today.',
  tense: 'That’s hard. Today’s lesson can help calm things down.',
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { answers } = useOnboarding();
  const { completedLessons, todayCheckIn, checkIn } = useProgress();

  const today = useMemo(
    () => todaysLesson(answers.focus, completedLessons),
    [answers.focus, completedLessons]
  );
  const courses = useMemo(() => orderedCourses(answers.focus), [answers.focus]);
  const heroArt = Math.min(width * 0.62, 280);

  const openLesson = () => {
    tapFeedback();
    router.push(`/lesson/${today.lesson.id}` as Href);
  };

  return (
    <View style={styles.root}>
      <LinearGradient colors={Gradients.screen} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + Space.sm, paddingBottom: Space.xxl }}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Logo />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => Alert.alert('Notifications', 'You’re all caught up.')}
            style={({ pressed }) => [styles.bell, pressed && { opacity: 0.7 }]}>
            <BellIcon />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={[styles.hero, { minHeight: heroArt * 0.83 + 64 }]}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.heroCopy}>
            <BText variant="display" style={styles.heroTitle}>
              Build{'\n'}Healthier{'\n'}Relationships
            </BText>
            <BText variant="body" style={styles.heroSub}>
              Small lessons for bigger, happier connections.
            </BText>
          </Animated.View>
          <View style={[styles.heroArt, { width: heroArt }]} pointerEvents="none">
            <Float distance={8} duration={2000}>
              <HuggingPair width={heroArt} />
            </Float>
            <Float style={[styles.heart, { right: heroArt * 0.3, top: -10 }]} distance={10} duration={1500}>
              <HeartIcon size={40} />
            </Float>
            <Float style={[styles.heart, { right: heroArt * 0.5, top: 22 }]} distance={7} duration={1700} delay={300}>
              <HeartIcon size={24} colors={['#FFD1B8', '#FF8A9E']} />
            </Float>
          </View>
        </View>

        {/* Today's lesson */}
        <Animated.View entering={FadeInDown.delay(120).duration(500)} style={styles.padded}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Today’s lesson: ${today.lesson.title}, ${today.lesson.minutes} minutes`}
            onPress={openLesson}
            style={({ pressed }) => [pressed && { transform: [{ scale: 0.985 }] }]}>
            <LinearGradient
              colors={['#FCDDEC', '#F9E4F3', '#F6E9FA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.lesson}>
              <View style={styles.play}>
                <PlayIcon size={30} />
              </View>
              <View style={styles.lessonText}>
                <BText variant="overline">Today’s lesson</BText>
                <BText variant="heading" style={styles.lessonTitle} numberOfLines={2}>
                  {today.lesson.title}
                </BText>
                <View style={styles.duration}>
                  <ClockIcon />
                  <BText variant="body">{today.lesson.minutes} min</BText>
                </View>
              </View>
              <View style={styles.lessonArt} pointerEvents="none">
                <Bondling size={118} color="yellow" mood="content" prop="heart" noShadow />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Your journey */}
        <View style={[styles.sectionHead, styles.padded]}>
          <BText variant="title" style={styles.sectionTitle}>
            Your Journey
          </BText>
          <Pressable
            accessibilityRole="link"
            hitSlop={10}
            onPress={() => router.navigate('/learn' as Href)}
            style={styles.seeAll}>
            <BText variant="body">See All</BText>
            <ChevronRightIcon />
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.journeyRow}>
          {courses.map((course, i) => (
            <Animated.View key={course.id} entering={FadeInDown.delay(180 + i * 60).duration(450)}>
              <JourneyCard course={course} completed={completedLessons} />
            </Animated.View>
          ))}
        </ScrollView>

        {/* Daily check-in */}
        <View style={styles.padded}>
          <BText variant="title" style={styles.sectionTitle}>
            Daily Check-In
          </BText>
          <BText variant="body" style={styles.checkInSub}>
            How are you feeling in your relationships today?
          </BText>
          <View style={styles.moods}>
            {MOODS.map((m) => {
              const on = todayCheckIn === m.id;
              return (
                <Pressable
                  key={m.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={m.label}
                  onPress={() => {
                    tapFeedback();
                    checkIn(m.id);
                  }}
                  style={({ pressed }) => [
                    styles.mood,
                    on && styles.moodOn,
                    todayCheckIn && !on && styles.moodDim,
                    pressed && { transform: [{ scale: 0.93 }] },
                  ]}>
                  <Bondling size={54} color={m.color} mood={m.mood} noShadow />
                </Pressable>
              );
            })}
          </View>
          {todayCheckIn && (
            <Animated.View key={todayCheckIn} entering={FadeIn.duration(300)} style={styles.reply}>
              <BText variant="bodyBold" center>
                {CHECK_IN_REPLIES[todayCheckIn]}
              </BText>
            </Animated.View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function JourneyCard({ course, completed }: { course: Course; completed: string[] }) {
  const { done, total, ratio } = courseProgress(course, completed);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${course.title}, ${done} of ${total} lessons done`}
      onPress={() => {
        tapFeedback();
        router.push(`/course/${course.id}` as Href);
      }}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: course.tint },
        pressed && { transform: [{ scale: 0.97 }] },
      ]}>
      <View style={styles.cardArt}>
        <Bondling size={92} color={course.mascot.color} mood={course.mascot.mood} prop={course.mascot.prop} />
      </View>
      <BText variant="bodyBold" style={styles.cardTitle} numberOfLines={2}>
        {course.title}
      </BText>
      <View style={styles.cardTrack}>
        {ratio > 0 && (
          <LinearGradient
            colors={Gradients.progress}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.cardFill, { width: `${ratio * 100}%` }]}
          />
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.surfaceSoft },
  padded: { paddingHorizontal: Space.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.xl,
  },
  bell: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  hero: { marginTop: Space.xl, marginBottom: Space.md },
  heroCopy: { paddingLeft: Space.xl, zIndex: 1, gap: Space.md },
  heroTitle: { fontSize: 34, lineHeight: 38 },
  heroSub: { fontSize: 16, lineHeight: 22, width: 160 },
  heroArt: { position: 'absolute', right: -Space.lg, bottom: 0 },
  heart: { position: 'absolute' },
  lesson: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 44,
    paddingVertical: Space.lg,
    paddingLeft: Space.lg,
    minHeight: 120,
    overflow: 'hidden',
    gap: Space.md,
  },
  play: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
    ...Shadow.soft,
  },
  lessonText: { flex: 1, gap: 2, paddingRight: 96 },
  lessonTitle: { fontSize: 21, lineHeight: 26 },
  duration: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  lessonArt: { position: 'absolute', right: -6, bottom: -14 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Space.xxl,
  },
  sectionTitle: { fontSize: 24, lineHeight: 30 },
  seeAll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  journeyRow: { paddingHorizontal: Space.xl, paddingVertical: Space.lg, gap: Space.md },
  card: {
    width: 150,
    height: 190,
    borderRadius: Radius.xl,
    padding: Space.lg,
    justifyContent: 'flex-end',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  cardArt: { position: 'absolute', top: 6, left: 0, right: 0, alignItems: 'center' },
  cardTitle: { fontSize: 16, lineHeight: 20, marginBottom: Space.sm },
  cardTrack: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
  },
  cardFill: { height: '100%', borderRadius: Radius.pill },
  checkInSub: { marginTop: Space.xs },
  moods: { flexDirection: 'row', justifyContent: 'space-between', marginTop: Space.lg },
  mood: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodOn: { borderColor: Palette.primary, backgroundColor: Palette.white },
  moodDim: { opacity: 0.5 },
  reply: {
    marginTop: Space.lg,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    paddingVertical: Space.md,
    paddingHorizontal: Space.lg,
    ...Shadow.soft,
  },
});
