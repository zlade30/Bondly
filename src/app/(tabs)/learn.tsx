import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { tapFeedback } from '@/components/bondly/buttons';
import { ChevronRightIcon } from '@/components/bondly/icons';
import { TopicIcon } from '@/components/bondly/topic-icons';
import { TabScreen } from '@/components/bondly/tab-screen';
import { BText } from '@/components/bondly/text';
import { Gradients, Palette, Radius, Space } from '@/constants/bondly';
import { COURSES, courseProgress, focusJourneys, hasLevels, otherJourneys, type Course } from '@/features/learn/content';
import { useProgress } from '@/features/learn/progress';
import { courseXp, journeyLevel } from '@/features/learn/xp';
import { useOnboarding } from '@/features/onboarding/store';

/**
 * Your focus first: the relationship journeys you picked (main journey on
 * top), editable here. Then the other relationships, then the skill
 * refreshers. Each opens its map.
 */
export default function LearnScreen() {
  const { answers } = useOnboarding();
  const { completedLessons, lessonXp } = useProgress();
  const focused = focusJourneys(answers.journeys);
  const others = otherJourneys(answers.journeys);

  let i = 0;
  const row = (course: Course, label?: string) => (
    <CourseRow
      key={course.id}
      course={course}
      label={label}
      completed={completedLessons}
      xpByLesson={lessonXp}
      index={i++}
    />
  );

  return (
    <TabScreen title="Learn" subtitle="Pick a journey or skill refresher to see its map.">
      <View style={styles.groupHead}>
        <BText variant="heading">Your focus</BText>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit your focus relationships"
          hitSlop={10}
          onPress={() => {
            tapFeedback();
            router.push('/focus' as Href);
          }}>
          <BText variant="bodyBold" color={Palette.primaryDeep}>
            Edit
          </BText>
        </Pressable>
      </View>
      {focused.length > 0 ? (
        focused.map((course, n) => row(course, n === 0 ? 'Main journey' : undefined))
      ) : (
        <BText variant="caption" color={Palette.inkSoft}>
          No focus yet. Tap Edit to pick up to three relationships.
        </BText>
      )}

      {others.length > 0 && (
        <BText variant="heading" style={styles.section}>
          Other relationships
        </BText>
      )}
      {others.map((course) => row(course))}

      {/* Short, general lessons on one skill each, for a quick brush-up. */}
      <BText variant="heading" style={styles.section}>
        Skill refreshers
      </BText>
      {COURSES.map((course) => row(course))}
    </TabScreen>
  );
}

function CourseRow({
  course,
  label,
  completed,
  xpByLesson,
  index,
}: {
  course: Course;
  label?: string;
  completed: string[];
  xpByLesson: Record<string, number>;
  index: number;
}) {
  const { done, total, ratio } = courseProgress(course, completed);
  const { level, levels, finished } = journeyLevel(course, completed);
  const detail =
    hasLevels(course)
      ? `${finished ? `All ${levels} levels done` : `Level ${level} of ${levels}`} · ${courseXp(course, xpByLesson, completed)} XP`
      : `${done} of ${total} lessons`;
  return (
    <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label ? `${label}: ` : ''}${course.title}, ${detail}`}
        onPress={() => {
          tapFeedback();
          router.push(`/course/${course.id}` as Href);
        }}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: course.tint },
          pressed && { transform: [{ scale: 0.98 }] },
        ]}>
        <TopicIcon name={course.icon} color={course.mascot.color} size={72} />
        <View style={styles.info}>
          {label && (
            <BText variant="overline" color={Palette.primaryDeep}>
              {label}
            </BText>
          )}
          <BText variant="bodyBold" style={styles.name}>
            {course.title}
          </BText>
          <BText variant="caption" color={Palette.inkSoft}>
            {detail}
          </BText>
          <View style={styles.track}>
            {ratio > 0 && (
              <LinearGradient
                colors={Gradients.progress}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.fill, { width: `${ratio * 100}%` }]}
              />
            )}
          </View>
        </View>
        <ChevronRightIcon size={22} color={Palette.inkSoft} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  info: { flex: 1, gap: 2 },
  section: { marginTop: Space.lg },
  groupHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: 17 },
  track: {
    height: 8,
    marginTop: Space.sm,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(255,255,255,0.85)',
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: Radius.pill },
});
