import { useEffect } from 'react';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BackButton, tapFeedback } from '@/components/bondly/buttons';
import { ClockIcon, LockIcon } from '@/components/bondly/icons';
import { Bondling, type BondlingColor } from '@/components/bondly/mascot';
import { TopicIcon } from '@/components/bondly/topic-icons';
import { Float, ProgressBar } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Gradients, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { courseProgress, findCourse, type Course, type LevelInfo } from '@/features/learn/content';
import { useProgress } from '@/features/learn/progress';
import { bestXp, courseLevels, courseXp, journeyLevel } from '@/features/learn/xp';
import { playSoundAfter } from '@/features/sound/sound';

const STOP = 78;
const ROW = 185;
/** Space for a level card on the path, the card itself, and the gap below it. */
const BANNER = 172;
const BANNER_CARD = 104;
const BANNER_GAP = 18;
/** Soft card colour for each mascot colour. */
const LEVEL_TINT: Record<BondlingColor, string> = {
  pink: '#FDE6F1',
  peach: '#FFE9E2',
  lavender: '#EFE7FF',
  blue: '#E4E9FF',
  yellow: '#FFF4D6',
  mint: '#DDF5EA',
  purple: '#F1E6FF',
};
const GOOD_TEXT = '#1F8A60';
/** Horizontal position of each stop, as a share of the path width, repeating. */
const ZIGZAG = [0.5, 0.78, 0.5, 0.22];

type StopState = 'done' | 'next' | 'locked';

export default function CourseScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const course = findCourse(courseId);
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
  // One soft pop as the lesson stops zoom in (one per stop would be too busy).
  useEffect(() => playSoundAfter('pop', 180), []);
  const { width } = useWindowDimensions();
  const { completedLessons, lessonXp } = useProgress();
  const { done, total, ratio } = courseProgress(course, completedLessons);
  const isJourney = course.kind === 'journey';
  const { level, levels, finished } = journeyLevel(course, completedLessons);
  const xp = courseXp(course, lessonXp, completedLessons);

  // A lesson is open once the one before it is done; finished lessons stay replayable.
  const states: StopState[] = course.lessons.map((l, i) => {
    if (completedLessons.includes(l.id)) return 'done';
    // Journeys: every earlier lesson must be done, so a level can't be skipped.
    const prevDone = isJourney
      ? course.lessons.slice(0, i).every((p) => completedLessons.includes(p.id))
      : i === 0 || completedLessons.includes(course.lessons[i - 1].id);
    return prevDone ? 'next' : 'locked';
  });
  const nextIndex = states.indexOf('next');

  const pathWidth = Math.min(width, 520) - Space.xl * 2;
  // Journeys with level data show a banner before each level's lessons.
  const grouped = isJourney && !!course.levels;
  const groups = courseLevels(course);
  const levelOf = (i: number) => course.lessons[i].level ?? i + 1;

  const banners: (LevelCardProps & { y: number })[] = [];
  const centers: { x: number; y: number }[] = [];
  // Journeys with levels start the path right under the journey card, so it can lead into Level 1.
  let y = grouped ? Space.xxl : 0;
  course.lessons.forEach((lesson, i) => {
    if (grouped && (i === 0 || levelOf(i) !== levelOf(i - 1))) {
      const group = groups.find((g) => g.level === levelOf(i))!;
      banners.push({
        level: group.level,
        title: group.title,
        info: group.info,
        y,
        total: group.lessons.length,
        done: group.lessons.filter((l) => completedLessons.includes(l.id)).length,
        // Locked until every lesson in the earlier levels is done.
        locked: !course.lessons.slice(0, i).every((p) => completedLessons.includes(p.id)),
      });
      y += BANNER;
    }
    centers.push({ x: ZIGZAG[i % ZIGZAG.length] * pathWidth, y: y + ROW / 2 });
    y += ROW;
  });
  const height = y;

  const openLesson = (index: number) => {
    const lesson = course.lessons[index];
    if (states[index] === 'locked') {
      const prev = course.lessons[index - 1];
      const newLevel = levelOf(index) !== levelOf(index - 1);
      Alert.alert(
        'Not yet',
        !isJourney
          ? `Finish “${prev.title}” to unlock this lesson.`
          : grouped && !newLevel
            ? `Finish “${prev.title}” first. It’s the lesson before this one in Level ${levelOf(index)}.`
            : grouped
              ? `Finish every lesson in Level ${levelOf(index - 1)} to unlock Level ${levelOf(index)}.`
              : `Finish Level ${index} (“${prev.title}”) to unlock Level ${index + 1}.`
      );
      return;
    }
    tapFeedback();
    router.push(`/lesson/${lesson.id}` as Href);
  };

  return (
    <View style={styles.root}>
      {course.background ? (
        // A fixed scene that stays put while the path scrolls over it.
        <Image source={course.background} style={StyleSheet.absoluteFill} contentFit="cover" contentPosition="bottom" />
      ) : (
        <LinearGradient colors={Gradients.screen} style={StyleSheet.absoluteFill} />
      )}
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
              {course.kind === 'journey' ? 'Journey' : 'Skill refresher'}
            </BText>
            <BText variant="title" style={styles.headerTitle}>
              {course.title}
            </BText>
            {course.intro && <BText variant="caption">{course.intro}</BText>}
            <BText variant="caption" color={Palette.inkSoft}>
              {isJourney
                ? finished
                  ? `All ${levels} levels complete · ${xp} XP`
                  : `Level ${level} of ${levels} · ${xp} XP`
                : done === total
                  ? 'Completed!'
                  : `${done} of ${total} lessons done`}
            </BText>
            <View style={styles.headerBar}>
              <ProgressBar value={ratio} />
            </View>
          </View>
          <Float distance={6}>
            <TopicIcon name={course.icon} color={course.mascot.color} size={100} sparkles={done === total} />
          </Float>
        </Animated.View>

        {/* Journey path */}
        <View style={[styles.path, grouped && styles.pathLinked, { width: pathWidth, height }]}>
          <Svg width={pathWidth} height={height} style={StyleSheet.absoluteFill}>
            {grouped && banners[0] && centers[0] && (
              // Journey card → Level 1 card → the first lesson.
              <Path
                d={`M${pathWidth / 2} 0 L${pathWidth / 2} ${banners[0].y + BANNER - BANNER_GAP - BANNER_CARD / 2} C ${pathWidth / 2} ${centers[0].y - ROW / 4}, ${centers[0].x} ${centers[0].y - ROW / 4}, ${centers[0].x} ${centers[0].y}`}
                stroke={Palette.primary}
                strokeWidth={6}
                strokeLinecap="round"
                fill="none"
              />
            )}
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

          {banners.map((b) => (
            <View
              key={b.level}
              pointerEvents="none"
              style={[styles.bannerSlot, { top: b.y + BANNER - BANNER_CARD - BANNER_GAP, width: pathWidth }]}>
              <LevelCard {...b} />
            </View>
          ))}

          {course.lessons.map((lesson, i) => (
            <Stop
              key={lesson.id}
              index={i}
              number={grouped ? groups.find((g) => g.level === levelOf(i))!.lessons.indexOf(lesson) + 1 : i + 1}
              title={lesson.title}
              minutes={lesson.minutes}
              levelLabel={isJourney && !grouped ? `Level ${i + 1}` : undefined}
              xp={bestXp(lesson.id, lessonXp, completedLessons)}
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

type LevelCardProps = {
  level: number;
  title: string;
  info?: LevelInfo;
  total: number;
  done: number;
  locked: boolean;
};

/**
 * The card that opens each level: a topic icon drawn in the mascot style, the
 * level's name and progress. The icon fades with a lock while the level is
 * locked, and sparkles with a tick once every lesson is done.
 */
function LevelCard({ level, title, info, total, done, locked }: LevelCardProps) {
  const complete = done === total;
  const color = info?.color ?? 'lavender';
  const status = locked
    ? `Locked. Finish Level ${level - 1} to unlock.`
    : complete
      ? 'All lessons done'
      : `${done} of ${total} lessons done`;
  return (
    <View
      accessible
      accessibilityLabel={`Level ${level}: ${title}. ${status}`}
      style={[styles.levelCard, { backgroundColor: locked ? '#F4F1F8' : LEVEL_TINT[color] }]}>
      <View style={styles.levelArt}>
        <View style={locked && styles.levelArtLocked}>
          {info ? (
            <TopicIcon name={info.icon} color={color} size={96} sparkles={complete} />
          ) : (
            <Bondling size={92} color={color} mood={locked ? 'sleepy' : 'happy'} noShadow />
          )}
        </View>
        {(locked || complete) && (
          <View style={[styles.levelBadge, complete && styles.levelBadgeDone]}>
            {locked ? (
              <LockIcon size={15} color={Palette.inkMuted} />
            ) : (
              <BText variant="bodyBold" color={Palette.white} style={styles.levelBadgeText}>
                ✓
              </BText>
            )}
          </View>
        )}
      </View>
      <View style={styles.levelBody}>
        <BText variant="overline" color={locked ? Palette.inkMuted : Palette.primaryDeep} style={styles.levelLabel}>
          Level {level} · {total} lessons
        </BText>
        <BText
          variant="heading"
          numberOfLines={1}
          color={locked ? Palette.inkMuted : Palette.ink}
          style={styles.levelTitle}>
          {title}
        </BText>
        {locked ? (
          <BText variant="caption" color={Palette.inkMuted}>
            Finish Level {level - 1} to unlock
          </BText>
        ) : complete ? (
          <BText variant="caption" color={GOOD_TEXT} style={styles.levelDone}>
            ✓ Level complete
          </BText>
        ) : (
          <View style={styles.levelProgress}>
            <View style={styles.levelTrack}>
              <View style={[styles.levelFill, { width: `${Math.max(done / total, 0.04) * 100}%` }]} />
            </View>
            <BText variant="caption" color={Palette.inkSoft}>
              {done}/{total}
            </BText>
          </View>
        )}
      </View>
    </View>
  );
}

function Stop({
  index,
  number,
  title,
  minutes,
  levelLabel,
  xp,
  state,
  x,
  y,
  pathWidth,
  onPress,
}: {
  index: number;
  /** The number shown on the stop (its place in the level, or in the course). */
  number: number;
  title: string;
  minutes: number;
  /** Journeys: "Level 3". */
  levelLabel?: string;
  /** Best XP earned, once done. */
  xp?: number;
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
        entering={ZoomIn.delay(150 + index * 80).duration(320)}
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
          accessibilityLabel={`${levelLabel ?? `Lesson ${index + 1}`}: ${title}${state === 'locked' ? ', locked' : state === 'done' ? ', done' : ''}`}
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
                  {number}
                </BText>
              )}
            </LinearGradient>
          )}
        </Pressable>
      </Animated.View>

      <View pointerEvents="none" style={[styles.label, { left, top: y + STOP / 2 + 6, width: labelWidth }]}>
        {levelLabel && (
          <BText variant="overline" center color={state === 'locked' ? Palette.inkMuted : Palette.primaryDeep} style={styles.levelLabel}>
            {levelLabel}
          </BText>
        )}
        <BText
          variant="bodyBold"
          center
          numberOfLines={2}
          color={state === 'locked' ? Palette.inkMuted : Palette.ink}
          style={styles.labelTitle}>
          {title}
        </BText>
        <View style={styles.labelMeta}>
          {state === 'done' && xp ? (
            <BText variant="caption" color={Palette.primaryDeep}>
              ⭐ {xp} XP
            </BText>
          ) : (
            <>
              <ClockIcon size={13} color={Palette.inkMuted} />
              <BText variant="caption">{minutes} min</BText>
            </>
          )}
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
  pathLinked: { marginTop: 0 },
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
  levelLabel: { fontSize: 11 },
  labelMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  guide: { position: 'absolute' },
  bannerSlot: { position: 'absolute', left: 0, zIndex: 1 },
  levelCard: {
    height: BANNER_CARD,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.sm,
    paddingRight: Space.lg,
    borderRadius: Radius.xl,
    borderWidth: 3,
    borderColor: Palette.white,
    ...Shadow.soft,
  },
  // The mascot pops up over the top edge of the card.
  levelArt: { width: 104, height: 104, marginTop: -34, marginLeft: 2, alignItems: 'center', justifyContent: 'center' },
  levelArtLocked: { opacity: 0.55 },
  levelBadge: {
    position: 'absolute',
    right: 2,
    bottom: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Palette.white,
    borderWidth: 2,
    borderColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.soft,
  },
  levelBadgeDone: { backgroundColor: '#3DBE8B' },
  levelBadgeText: { fontSize: 15, lineHeight: 19 },
  levelBody: { flex: 1, gap: 2 },
  levelTitle: { fontSize: 19, lineHeight: 24 },
  levelDone: { fontFamily: 'Nunito_800ExtraBold' },
  levelProgress: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, marginTop: 4 },
  levelTrack: { flex: 1, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.85)', overflow: 'hidden' },
  levelFill: { height: 8, borderRadius: 4, backgroundColor: Palette.primary },
});
