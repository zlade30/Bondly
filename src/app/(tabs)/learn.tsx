import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Bondling } from '@/components/bondly/mascot';
import { TabScreen } from '@/components/bondly/tab-screen';
import { BText } from '@/components/bondly/text';
import { Gradients, Palette, Radius, Space } from '@/constants/bondly';
import { courseProgress, orderedCourses } from '@/features/learn/content';
import { useProgress } from '@/features/learn/progress';
import { useOnboarding } from '@/features/onboarding/store';

/** All courses for now; the journey map replaces this list in the Learn flow. */
export default function LearnScreen() {
  const { answers } = useOnboarding();
  const { completedLessons } = useProgress();
  const courses = orderedCourses(answers.focus);

  return (
    <TabScreen title="Learn" subtitle="Your courses, with your focus areas first.">
      {courses.map((course, i) => {
        const { done, total, ratio } = courseProgress(course, completedLessons);
        const isFocus = answers.focus.includes(course.id);
        return (
          <Animated.View
            key={course.id}
            entering={FadeInDown.delay(i * 60).duration(400)}
            style={[styles.row, { backgroundColor: course.tint }]}>
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
