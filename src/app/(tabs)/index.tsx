import { LinearGradient } from 'expo-linear-gradient';
import { router, useIsFocused, type Href } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tapFeedback } from '@/components/bondly/buttons';
import { BellIcon, ChevronRightIcon, ClockIcon, PlayIcon } from '@/components/bondly/icons';
import { Logo } from '@/components/bondly/logo';
import { Bondling, HeartIcon, HuggingPair } from '@/components/bondly/mascot';
import { Float } from '@/components/bondly/screen';
import { TrialCard } from '@/components/premium/trial-card';
import { BText } from '@/components/bondly/text';
import { TopicIcon } from '@/components/bondly/topic-icons';
import { Font, Gradients, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { courseProgress, hasLevels, journeyFor, otherJourneys, todaysLesson, type Course } from '@/features/learn/content';
import { useProgress } from '@/features/learn/progress';
import { journeyLevel, levelOfLesson } from '@/features/learn/xp';
import { CHECK_IN_REPLIES, MOODS } from '@/features/onboarding/content';
import { useOnboarding } from '@/features/onboarding/store';
import { useActivity } from '@/features/profile/use-activity';
import { formatTime, useReminders } from '@/features/reminders/reminders';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { answers } = useOnboarding();
  const { completedLessons, todayCheckIn, ready, today: day } = useProgress();
  const { streak } = useActivity();
  const reminders = useReminders();
  useDailyCheckIn(ready, !!todayCheckIn, day);

  const openReminders = () => {
    tapFeedback();
    const goToSettings = { text: 'Settings', onPress: () => router.push('/settings' as Href) };
    if (reminders.enabled) {
      Alert.alert(
        'Daily reminder is on',
        `We’ll nudge you at ${formatTime(reminders.hour, reminders.minute)}, except on days you’ve already practised.`,
        [{ text: 'OK', style: 'cancel' }, { ...goToSettings, text: 'Change' }]
      );
    } else {
      Alert.alert('Reminders are off', 'Turn on a gentle daily reminder in Settings.', [
        { text: 'Not now', style: 'cancel' },
        goToSettings,
      ]);
    }
  };

  const today = useMemo(
    () => todaysLesson(answers.focus, completedLessons, answers.goal),
    [answers.focus, completedLessons, answers.goal]
  );
  // Journeys only: yours first, then the other relationships. Skill refreshers live on the Learn tab.
  const courses = useMemo(() => {
    const journey = journeyFor(answers.goal);
    const others = otherJourneys(answers.goal);
    return journey ? [journey, ...others] : others;
  }, [answers.goal]);
  // Where today's lesson comes from, and its picture: the level's icon for a
  // journey lesson, or the skill refresher's own icon.
  const todayLevel = useMemo(() => levelOfLesson(today.course, today.lesson.id), [today]);
  const todayFrom =
    hasLevels(today.course) && todayLevel
      ? `${today.course.title} · Level ${todayLevel.level}`
      : today.course.title;
  const todayArt = todayLevel?.info
    ? { icon: todayLevel.info.icon, color: todayLevel.info.color }
    : { icon: today.course.icon, color: today.course.mascot.color };
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
          <View style={styles.headerRight}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${streak.current}-day streak. Opens your profile.`}
              onPress={() => {
                tapFeedback();
                router.navigate('/profile' as Href);
              }}
              style={({ pressed }) => [
                styles.streak,
                !streak.activeToday && styles.streakIdle,
                pressed && { opacity: 0.7 },
              ]}>
              <View style={[styles.streakFlame, !streak.activeToday && { opacity: 0.45 }]}>
                <TopicIcon name="flame" color="peach" size={30} noShadow />
              </View>
              <BText variant="bodyBold">{streak.current}</BText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={reminders.enabled ? 'Reminders on' : 'Reminders off'}
              onPress={openReminders}
              style={({ pressed }) => [styles.bell, pressed && { opacity: 0.7 }]}>
              <BellIcon />
              {reminders.enabled && <View style={styles.bellDot} />}
            </Pressable>
          </View>
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

        {/* Free trial: when it ends, what it costs, and a way to cancel */}
        <View style={styles.padded}>
          <TrialCard />
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
                <BText variant="caption" color={Palette.primaryDeep} style={styles.lessonFrom} numberOfLines={1}>
                  {todayFrom}
                </BText>
                <BText variant="heading" style={styles.lessonTitle} numberOfLines={2}>
                  {today.lesson.title}
                </BText>
                <View style={styles.duration}>
                  <ClockIcon />
                  <BText variant="body">{today.lesson.minutes} min</BText>
                </View>
              </View>
              <View style={styles.lessonArt} pointerEvents="none">
                <TopicIcon name={todayArt.icon} color={todayArt.color} size={104} noShadow />
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

        {/* Today's check-in. The question itself opens on its own once a day. */}
        <View style={styles.padded}>
          <BText variant="title" style={styles.sectionTitle}>
            Daily Check-In
          </BText>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={todayCheckIn ? 'Change today’s check-in' : 'Check in for today'}
            onPress={() => {
              tapFeedback();
              router.push((todayCheckIn ? '/check-in?step=mood' : '/check-in') as Href);
            }}
            style={({ pressed }) => [styles.checkInCard, pressed && { transform: [{ scale: 0.98 }] }]}>
            {todayCheckIn ? (
              <>
                <Bondling
                  size={60}
                  color={MOODS.find((m) => m.id === todayCheckIn)!.color}
                  mood={MOODS.find((m) => m.id === todayCheckIn)!.mood}
                  noShadow
                />
                <View style={styles.checkInText}>
                  <BText variant="bodyBold">Feeling {MOODS.find((m) => m.id === todayCheckIn)!.label.toLowerCase()} today</BText>
                  <BText variant="caption" color={Palette.inkSoft}>
                    {CHECK_IN_REPLIES[todayCheckIn]}
                  </BText>
                </View>
                <BText variant="caption" color={Palette.primaryDeep} style={styles.checkInChange}>
                  Change
                </BText>
              </>
            ) : (
              <>
                <Bondling size={60} color="pink" mood="happy" noShadow />
                <View style={styles.checkInText}>
                  <BText variant="bodyBold">How are you feeling today?</BText>
                  <BText variant="caption" color={Palette.inkSoft}>
                    Tap to check in and keep your streak going.
                  </BText>
                </View>
                <ChevronRightIcon />
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/**
 * Opens the daily check-in the first time Home is shown each day. `day` comes
 * from the progress store and moves on at midnight and on app resume, so it
 * still appears the next morning if the app was left open overnight.
 */
function useDailyCheckIn(ready: boolean, checkedIn: boolean, day: string) {
  const focused = useIsFocused();
  const shownFor = useRef<string | null>(null);

  useEffect(() => {
    if (!focused || !ready || checkedIn || shownFor.current === day) return;
    // A short pause lets Home settle in before the check-in slides over it.
    const t = setTimeout(() => {
      shownFor.current = day;
      router.push('/check-in' as Href);
    }, 450);
    return () => clearTimeout(t);
  }, [focused, ready, checkedIn, day]);
}

function JourneyCard({ course, completed }: { course: Course; completed: string[] }) {
  const { done, total, ratio } = courseProgress(course, completed);
  const isJourney = hasLevels(course);
  const { level, levels, finished } = journeyLevel(course, completed);
  const levelText = finished ? 'All levels done' : `Level ${level} of ${levels}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${course.title}, ${isJourney ? levelText : `${done} of ${total} lessons done`}`}
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
        <TopicIcon name={course.icon} color={course.mascot.color} size={96} />
      </View>
      {isJourney && (
        <BText variant="overline" color={Palette.primaryDeep} style={styles.cardLevel}>
          {levelText}
        </BText>
      )}
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
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  bellDot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.pink,
    borderWidth: 2,
    borderColor: Palette.white,
  },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 40,
    paddingHorizontal: Space.md,
    borderRadius: Radius.pill,
    backgroundColor: '#FFE9D6',
  },
  streakIdle: { backgroundColor: Palette.white },
  streakFlame: { width: 30, height: 30, marginLeft: -6 },
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
  lessonArt: { position: 'absolute', right: 6, top: 0, bottom: 0, justifyContent: 'center' },
  lessonFrom: { fontFamily: Font.bold, marginTop: -2 },
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
  cardLevel: { fontSize: 11, marginBottom: 2 },
  cardTitle: { fontSize: 16, lineHeight: 20, marginBottom: Space.sm },
  cardTrack: {
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
  },
  cardFill: { height: '100%', borderRadius: Radius.pill },
  checkInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    marginTop: Space.md,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.md,
    ...Shadow.soft,
  },
  checkInText: { flex: 1, gap: 2 },
  checkInChange: { fontFamily: Font.bold },
});
