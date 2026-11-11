import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

import { tapFeedback } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import type { BondlingColor } from '@/components/bondly/mascot';
import { RadarChart } from '@/components/bondly/radar-chart';
import { TopicIcon, type TopicIconName } from '@/components/bondly/topic-icons';
import { TabScreen } from '@/components/bondly/tab-screen';
import { BText } from '@/components/bondly/text';
import { Font, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { useProgress } from '@/features/learn/progress';
import { FOCUS_AREAS } from '@/features/onboarding/content';
import { useOnboarding } from '@/features/onboarding/store';
import { coursesFinished, thisWeek, minutesPractised, skillProgress } from '@/features/profile/stats';
import { useActivity } from '@/features/profile/use-activity';
import { useJournal } from '@/features/reflect/journal';

export default function ProfileScreen() {
  const { answers } = useOnboarding();
  const { completedLessons, checkIns } = useProgress();
  const { entries } = useJournal();
  const { activeDays, streak } = useActivity();

  const skills = useMemo(() => skillProgress(answers, completedLessons), [answers, completedLessons]);
  const finished = useMemo(() => coursesFinished(completedLessons), [completedLessons]);
  const week = thisWeek(activeDays);
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
        <LinearGradient
          colors={['#FFE9D6', '#FDE1EE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streak}>
          <View style={styles.streakHead}>
            <TopicIcon name="flame" color="peach" size={56} noShadow />
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
              <View key={d.key} style={[styles.day, d.future && styles.dayFuture]}>
                <View style={[styles.dayDot, d.active && styles.dayDotOn]}>
                  {d.active && <TopicIcon name="flame" color="peach" size={26} noShadow />}
                </View>
                <BText variant="caption" style={d.today && styles.dayToday}>
                  {d.label}
                </BText>
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
          Grows as you finish lessons in journeys and skills.
        </BText>
        {/* A pentagon sits higher than its square box, so trim the spare room below it. */}
        <View style={styles.mapChart}>
          <RadarChart size={170} axes={skills.map((s) => ({ label: s.label, value: s.value }))} />
        </View>
      </Animated.View>

      {/* Stats */}
      <BText variant="heading" style={styles.statsTitle}>
        Your progress
      </BText>
      <View style={styles.stats}>
        {[
          {
            value: completedLessons.length,
            label: 'Lessons done',
            icon: 'books',
            tone: 'pink',
            colors: ['#FDDDEC', '#FFF1F7'],
          },
          {
            value: minutesPractised(completedLessons),
            label: 'Minutes practised',
            icon: 'stopwatch',
            tone: 'blue',
            colors: ['#DCE5FF', '#F1F4FF'],
          },
          {
            value: `${finished.done}/${finished.total}`,
            label: 'Courses finished',
            icon: 'medal',
            tone: 'yellow',
            colors: ['#FFEDC2', '#FFF8E6'],
          },
          {
            value: Object.keys(checkIns).length,
            label: 'Check-ins',
            icon: 'sunny',
            tone: 'mint',
            colors: ['#D4F3E5', '#EEFBF5'],
          },
          {
            value: entries.length,
            label: 'Journal entries',
            icon: 'journal',
            tone: 'lavender',
            colors: ['#E8DDFF', '#F6F1FF'],
          },
          {
            value: activeDays.size,
            label: 'Days active',
            icon: 'flame',
            tone: 'peach',
            colors: ['#FFDDD0', '#FFF2EC'],
          },
        ].map((s, i) => (
          <Animated.View key={s.label} entering={FadeInDown.delay(200 + i * 50).duration(400)} style={styles.statCell}>
            <Stat
              {...s}
              icon={s.icon as TopicIconName}
              tone={s.tone as BondlingColor}
              colors={s.colors as [string, string]}
            />
          </Animated.View>
        ))}
      </View>
    </TabScreen>
  );
}

function Stat({
  value,
  label,
  icon,
  tone,
  colors,
}: {
  value: number | string;
  label: string;
  /** A little illustrated icon in the mascot style, coloured to match the tile. */
  icon: TopicIconName;
  tone: BondlingColor;
  colors: [string, string];
}) {
  return (
    <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.stat}>
      {/* soft decorative bubbles */}
      <View style={[styles.bubble, styles.bubbleLarge]} />
      <View style={[styles.bubble, styles.bubbleSmall]} />

      <View style={styles.statTop}>
        <View style={styles.badge}>
          <TopicIcon name={icon} color={tone} size={58} noShadow />
        </View>
        <BText variant="title" style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </BText>
      </View>
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
  streakText: { flex: 1 },
  streakNumber: { fontSize: 26, lineHeight: 32 },
  week: { flexDirection: 'row', justifyContent: 'space-between' },
  day: { alignItems: 'center', gap: 4 },
  dayFuture: { opacity: 0.45 },
  dayToday: { fontFamily: Font.bold, color: Palette.ink },
  dayDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDotOn: { backgroundColor: Palette.white, borderWidth: 2, borderColor: '#FFB36B' },
  streakNote: { fontSize: 15 },
  mapCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Space.lg,
    gap: 2,
    ...Shadow.soft,
  },
  statsTitle: { marginTop: Space.sm },
  stats: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -Space.sm / 2, marginTop: -Space.xs },
  statCell: { width: '50%', padding: Space.sm / 2 },
  stat: {
    borderRadius: Radius.xl,
    padding: Space.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  bubble: { position: 'absolute', borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.45)' },
  bubbleLarge: { width: 96, height: 96, top: -28, right: -26 },
  bubbleSmall: { width: 34, height: 34, top: 58, right: 18, backgroundColor: 'rgba(255,255,255,0.35)' },
  mapChart: { marginBottom: -36 },
  statTop: { flexDirection: 'row', alignItems: 'center', gap: Space.xs, marginLeft: -6, marginBottom: Space.sm },
  badge: { width: 58, height: 58 },
  statValue: { flex: 1, fontSize: 30, lineHeight: 34 },
  statLabel: { fontFamily: Font.bold, marginTop: 2 },
});
