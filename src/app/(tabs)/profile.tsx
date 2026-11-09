import { Alert, StyleSheet, View } from 'react-native';

import { SecondaryButton } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { TabScreen } from '@/components/bondly/tab-screen';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { useProgress } from '@/features/learn/progress';
import { FOCUS_AREAS } from '@/features/onboarding/content';
import { useOnboarding } from '@/features/onboarding/store';
import { useJournal } from '@/features/reflect/journal';

/** Basic profile; skill progress, streaks and settings arrive with the Profile flow. */
export default function ProfileScreen() {
  const { answers, reset: resetOnboarding } = useOnboarding();
  const { completedLessons, checkIns, reset: resetProgress } = useProgress();
  const { reset: resetJournal } = useJournal();
  const focus = FOCUS_AREAS.filter((f) => answers.focus.includes(f.id));

  const replay = () =>
    Alert.alert(
      'Start over?',
      'This permanently clears your answers, lesson progress, check-ins and journal, then replays onboarding.',
      [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Start over',
        style: 'destructive',
        onPress: async () => {
          await resetJournal();
          await resetProgress();
          await resetOnboarding();
        },
      },
      ]
    );

  return (
    <TabScreen title="Profile">
      <View style={styles.card}>
        <Bondling size={88} color="pink" mood="happy" />
        <View style={styles.who}>
          <BText variant="heading">{answers.name || 'Friend'}</BText>
          <BText variant="caption" color={Palette.inkSoft}>
            {answers.minutes ?? 5} minutes a day
          </BText>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat value={completedLessons.length} label="Lessons done" />
        <Stat value={Object.keys(checkIns).length} label="Check-ins" />
      </View>

      {focus.length > 0 && (
        <View style={styles.section}>
          <BText variant="bodyBold">Your focus</BText>
          <View style={styles.chips}>
            {focus.map((f) => (
              <View key={f.id} style={[styles.chip, { backgroundColor: f.tint }]}>
                <BText variant="caption" color={Palette.ink} style={styles.chipText}>
                  {f.label}
                </BText>
              </View>
            ))}
          </View>
        </View>
      )}

      <SecondaryButton label="Replay onboarding" onPress={replay} style={styles.replay} />
    </TabScreen>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <BText variant="title">{value}</BText>
      <BText variant="caption">{label}</BText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.lg,
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Space.lg,
    ...Shadow.soft,
  },
  who: { flex: 1, gap: 2 },
  stats: { flexDirection: 'row', gap: Space.md },
  stat: {
    flex: 1,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.lg,
    ...Shadow.soft,
  },
  section: { gap: Space.sm, marginTop: Space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  chip: { borderRadius: Radius.pill, paddingHorizontal: Space.md, paddingVertical: Space.xs },
  chipText: { fontFamily: 'Nunito_800ExtraBold' },
  replay: { marginTop: Space.xl },
});
