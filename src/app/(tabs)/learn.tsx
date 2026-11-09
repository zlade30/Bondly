import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { tapFeedback } from '@/components/bondly/buttons';
import { ChevronRightIcon } from '@/components/bondly/icons';
import { Bondling } from '@/components/bondly/mascot';
import { TabScreen } from '@/components/bondly/tab-screen';
import { BText } from '@/components/bondly/text';
import { Gradients, Palette, Radius, Space } from '@/constants/bondly';
import { courseProgress, orderedCourses } from '@/features/learn/content';
import { useProgress } from '@/features/learn/progress';
import { useOnboarding } from '@/features/onboarding/store';

/** All courses, focus areas first. Each one opens its journey map. */
export default function LearnScreen() {
  const { answers } = useOnboarding();
  const { completedLessons } = useProgress();
  const courses = orderedCourses(answers.focus);

  return (
    <TabScreen title="Learn" subtitle="Pick a course to see its journey.">
      {courses.map((course, i) => {
        const { done, total, ratio } = courseProgress(course, completedLessons);
        const isFocus = answers.focus.includes(course.id);
        return (
          <Animated.View key={course.id} entering={FadeInDown.delay(i * 60).duration(400)}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${course.title}, ${done} of ${total} lessons done`}
              onPress={() => {
                tapFeedback();
                router.push(`/course/${course.id}` as Href);
              }}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: course.tint },
                pressed && { transform: [{ scale: 0.98 }] },
              ]}>
            <Bondling size={72} color={course.mascot.color} mood={course.mascot.mood} prop={course.mascot.prop} />
            <View style={styles.info}>
              {isFocus && (
                <BText variant="overline" color={Palette.primaryDeep}>
                  Your focus
                </BText>
              )}
              <BText variant="bodyBold" style={styles.name}>
                {course.title}
              </BText>
              <BText variant="caption" color={Palette.inkSoft}>
                {done} of {total} lessons
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
      })}
    </TabScreen>
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
