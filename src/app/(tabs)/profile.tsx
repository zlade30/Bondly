import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { tapFeedback } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { RadarChart } from '@/components/bondly/radar-chart';
import { TabScreen } from '@/components/bondly/tab-screen';
import { BText } from '@/components/bondly/text';
import { Font, Gradients, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { useProgress } from '@/features/learn/progress';
import { FOCUS_AREAS } from '@/features/onboarding/content';
import { useOnboarding } from '@/features/onboarding/store';
import { coursesFinished, lastSevenDays, minutesPractised, skillProgress } from '@/features/profile/stats';
import { useActivity } from '@/features/profile/use-activity';
import { useJournal } from '@/features/reflect/journal';

export default function ProfileScreen() {
  const { answers } = useOnboarding();
  const { completedLessons, checkIns } = useProgress();
  const { entries } = useJournal();
  const { activeDays, streak } = useActivity();

  const skills = useMemo(() => skillProgress(answers, completedLessons), [answers, completedLessons]);
  const finished = useMemo(() => coursesFinished(completedLessons), [completedLessons]);
  const week = lastSevenDays(activeDays);
  const focus = FOCUS_AREAS.filter((f) => answers.focus.includes(f.id));

  const streakNote = streak.activeToday
    ? 'You’ve practised today. Nice work!'
    : streak.current > 0
      ? 'Do one small thing today to keep it going.'
      : 'Finish a lesson, check in or write an entry to start one.';

  return (
    <TabScreen title="Profile">
      {/* Who */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.card}>
        <Bondling size={80} color="pink" mood="happy" />
        <View style={styles.who}>
          <BText variant="heading">{answers.name || 'Friend'}</BText>
          <BText variant="caption" color={Palette.inkSoft}>
            Goal: {answers.minutes ?? 5} minutes a day
          </BText>
          {focus.length > 0 && (
            <View style={styles.chips}>
              {focus.map((f) => (
                <View key={f.id} style={[styles.chip, { backgroundColor: f.tint }]}>
                  <BText variant="caption" color={Palette.ink} style={styles.chipText}>
                    {f.label}
                  </BText>
                </View>
              ))}
            </View>
          )}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Settings"
          hitSlop={10}
          onPress={() => {
            tapFeedback();
            router.push('/settings' as Href);
          }}
          style={({ pressed }) => [styles.gear, pressed && { opacity: 0.6 }]}>
          <GearIcon />
        </Pressable>
      </Animated.View>

      {/* Streak */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <LinearGradient colors={['#FFE9D6', '#FDE1EE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.streak}>
          <View style={styles.streakHead}>
            <BText style={styles.flame}>🔥</BText>
            <View style={styles.streakText}>
              <BText variant="title" style={styles.streakNumber}>
                {streak.current}-day streak
              </BText>
              <BText variant="caption" color={Palette.inkSoft}>
                Longest: {streak.longest} {streak.longest === 1 ? 'day' : 'days'}
              </BText>
            </View>
          </View>
          <View style={styles.week}>
            {week.map((d) => (
              <View key={d.key} style={styles.day}>
                <View style={[styles.dayDot, d.active && styles.dayDotOn]}>
                  {d.active && <BText style={styles.dayFlame}>🔥</BText>}
                </View>
                <BText variant="caption">{d.label}</BText>
              </View>
            ))}
          </View>
          <BText variant="body" color={Palette.ink} style={styles.streakNote}>
            {streakNote}
          </BText>
        </LinearGradient>
      </Animated.View>

      {/* Connection map */}
      <Animated.View entering={FadeInDown.delay(140).duration(400)} style={styles.mapCard}>
        <BText variant="heading">Your connection map</BText>
        <BText variant="caption" color={Palette.inkSoft}>
          Grows as you finish lessons in each skill.
        </BText>
        <RadarChart size={170} axes={skills.map((s) => ({ label: s.label, value: s.value }))} />
        <View style={styles.skills}>
          {skills.map((s) => (
            <View key={s.id} style={styles.skillRow}>
              <BText variant="bodyBold" style={styles.skillName}>
                {s.label}
              </BText>
              <View style={styles.skillTrack}>
                {s.done > 0 && (
                  <LinearGradient
                    colors={Gradients.progress}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.skillFill, { width: `${(s.done / s.total) * 100}%` }]}
                  />
                )}
              </View>
              <BText variant="caption" style={styles.skillCount}>
                {s.done}/{s.total}
              </BText>
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Stats */}
      <BText variant="heading" style={styles.statsTitle}>
        Your progress
      </BText>
      <View style={styles.stats}>
        {[
          { value: completedLessons.length, label: 'Lessons done', emoji: '📚', colors: ['#FDDDEC', '#FFF1F7'] },
          { value: minutesPractised(completedLessons), label: 'Minutes practised', emoji: '⏱️', colors: ['#DCE5FF', '#F1F4FF'] },
          {
            value: `${finished.done}/${finished.total}`,
            label: 'Courses finished',
            emoji: '🏆',
            colors: ['#FFEDC2', '#FFF8E6'],
          },
          { value: Object.keys(checkIns).length, label: 'Check-ins', emoji: '🌤️', colors: ['#D4F3E5', '#EEFBF5'] },
          { value: entries.length, label: 'Journal entries', emoji: '📝', colors: ['#E8DDFF', '#F6F1FF'] },
          { value: activeDays.size, label: 'Days active', emoji: '🔥', colors: ['#FFDDD0', '#FFF2EC'] },
        ].map((s, i) => (
          <Animated.View key={s.label} entering={FadeInDown.delay(200 + i * 50).duration(400)} style={styles.statCell}>
            <Stat {...s} colors={s.colors as [string, string]} />
          </Animated.View>
        ))}
      </View>
    </TabScreen>
  );
}

function Stat({
  value,
  label,
  emoji,
  colors,
}: {
  value: number | string;
  label: string;
  emoji: string;
  colors: [string, string];
}) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.stat}>
      {/* soft decorative bubbles */}
      <View style={[styles.bubble, styles.bubbleLarge]} />
      <View style={[styles.bubble, styles.bubbleSmall]} />

      <View style={styles.badge}>
        <BText style={styles.badgeEmoji}>{emoji}</BText>
      </View>
      <BText variant="title" style={styles.statValue}>
        {value}
      </BText>
      <BText variant="caption" color={Palette.inkSoft} style={styles.statLabel}>
        {label}
      </BText>
    </LinearGradient>
  );
}

function GearIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        d="M12 2.8l1.6 2.1 2.6-.5.9 2.5 2.5.9-.5 2.6 2.1 1.6-2.1 1.6.5 2.6-2.5.9-.9 2.5-2.6-.5L12 21.2l-1.6-2.1-2.6.5-.9-2.5-2.5-.9.5-2.6L2.8 12l2.1-1.6-.5-2.6 2.5-.9.9-2.5 2.6.5z"
        fill="none"
        stroke={Palette.ink}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={3.2} fill="none" stroke={Palette.ink} strokeWidth={1.8} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Space.lg,
    ...Shadow.soft,
  },
  who: { flex: 1, gap: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: Space.xs },
  chip: { borderRadius: Radius.pill, paddingHorizontal: Space.sm, paddingVertical: 2 },
  chipText: { fontFamily: Font.bold, fontSize: 12 },
  gear: {
    position: 'absolute',
    top: Space.md,
    right: Space.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Palette.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streak: { borderRadius: Radius.xl, padding: Space.lg, gap: Space.md },
  streakHead: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  flame: { fontSize: 40, lineHeight: 48 },
  streakText: { flex: 1 },
  streakNumber: { fontSize: 26, lineHeight: 32 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 4 },
  dayDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotOn: { backgroundColor: Palette.white, borderWidth: 2, borderColor: '#FFB36B' },
  dayFlame: { fontSize: 16, lineHeight: 20 },
  streakNote: { fontSize: 15 },
  mapCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Space.lg,
    gap: 2,
    ...Shadow.soft,
  },
  skills: { gap: Space.sm, marginTop: Space.sm },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  skillName: { width: 118, fontSize: 15 },
  skillTrack: {
    flex: 1,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Palette.track,
    overflow: 'hidden',
  },
  skillFill: { height: '100%', borderRadius: Radius.pill },
  skillCount: { width: 32, textAlign: 'right' },
  statsTitle: { marginTop: Space.sm },
  stats: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Space.sm / 2, marginTop: -Space.xs },
  statCell: { width: '50%', padding: Space.sm / 2 },
  stat: {
    borderRadius: Radius.xl,
    padding: Space.lg,
    minHeight: 140,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  bubble: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.45)' },
  bubbleLarge: { width: 96, height: 96, top: -28, right: -26 },
  bubbleSmall: { width: 34, height: 34, top: 58, right: 18, backgroundColor: 'rgba(255,255,255,0.35)' },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Space.md,
    ...Shadow.soft,
  },
  badgeEmoji: { fontSize: 22, lineHeight: 28 },
  statValue: { fontSize: 30, lineHeight: 34 },
  statLabel: { fontFamily: Font.bold, marginTop: 2 },
});
