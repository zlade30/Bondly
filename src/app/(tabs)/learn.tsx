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
import { courseProgress, journeyFor, orderedCourses, otherJourneys, type Course } from '@/features/learn/content';
import { useProgress } from '@/features/learn/progress';
import { courseXp, journeyLevel } from '@/features/learn/xp';
import { useOnboarding } from '@/features/onboarding/store';

/**
 * Your relationship journey first, then the other journeys, then the skill refreshers (focus areas
 * first), then the journeys for other relationships. Each opens its map.
 */
export default function LearnScreen() {
  const { answers } = useOnboarding();
  const { completedLessons, lessonXp } = useProgress();
  const journey = journeyFor(answers.goal);
  const skills = orderedCourses(answers.focus);
  const others = otherJourneys(answers.goal);

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
      {journey && row(journey, 'Your journey')}

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
      {skills.map((course) =>
        row(course, (answers.focus as string[]).includes(course.id) ? 'Your focus' : undefined)
      )}
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
    course.kind === 'journey'
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
