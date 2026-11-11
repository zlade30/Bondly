import { LinearGradient } from 'expo-linear-gradient';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ClockIcon, PlayIcon } from '@/components/bondly/icons';
import { BText } from '@/components/bondly/text';
import { TopicIcon } from '@/components/bondly/topic-icons';
import { Font, Palette, Shadow, Space } from '@/constants/bondly';
import { hasLevels, type Course, type Lesson } from '@/features/learn/content';
import { levelOfLesson } from '@/features/learn/xp';

/**
 * The “Today’s lesson” card: tinted in the lesson’s journey colour, with the
 * level’s own icon. Used on Home and to preview your first lesson in onboarding.
 */
export function TodayLessonCard({
  course,
  lesson,
  label = 'Today’s lesson',
  onPress,
}: {
  course: Course;
  lesson: Lesson;
  label?: string;
  /** Leave out to show the card as a preview that can’t be tapped. */
  onPress?: () => void;
}) {
  // Where the lesson comes from, and its picture: the level's icon for a
  // journey lesson, or the skill refresher's own icon.
  const level = useMemo(() => levelOfLesson(course, lesson.id), [course, lesson.id]);
  const from = hasLevels(course) && level ? `${course.title} · Level ${level.level}` : course.title;
  const art = level?.info
    ? { icon: level.info.icon, color: level.info.color }
    : { icon: course.icon, color: course.mascot.color };

  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}: ${lesson.title}, ${lesson.minutes} minutes`}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [pressed && { transform: [{ scale: 0.985 }] }]}>
      <LinearGradient
        colors={[course.tint, towardWhite(course.tint, 0.4), towardWhite(course.tint, 0.7)]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}>
        {/* Only a card you can open gets a play button; a preview shows the lesson alone. */}
        {onPress && (
          <View style={styles.play}>
            <PlayIcon size={30} />
          </View>
        )}
        <View style={styles.text}>
          <BText variant="overline">{label}</BText>
          <BText variant="caption" color={Palette.primaryDeep} style={styles.from} numberOfLines={1}>
            {from}
          </BText>
          <BText variant="heading" style={styles.title} numberOfLines={2}>
            {lesson.title}
          </BText>
          <View style={styles.duration}>
            <ClockIcon />
            <BText variant="body">{lesson.minutes} min</BText>
          </View>
        </View>
        <View style={styles.art} pointerEvents="none">
          <TopicIcon name={art.icon} color={art.color} size={104} noShadow />
        </View>
      </LinearGradient>
    </Pressable>
  );
}

/** Mixes a #RRGGBB colour towards white by `amount` (0–1), for soft gradients. */
export function towardWhite(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const styles = StyleSheet.create({
  card: {
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
  text: { flex: 1, gap: 2, paddingRight: 96 },
  from: { fontFamily: Font.bold, marginTop: -2 },
  title: { fontSize: 21, lineHeight: 26 },
  duration: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  art: { position: 'absolute', right: 6, top: 0, bottom: 0, justifyContent: 'center' },
});
