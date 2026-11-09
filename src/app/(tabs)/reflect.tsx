import { StyleSheet, View } from 'react-native';

import { Bondling } from '@/components/bondly/mascot';
import { Float } from '@/components/bondly/screen';
import { TabScreen } from '@/components/bondly/tab-screen';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { todayKey, useProgress } from '@/features/learn/progress';
import { MOODS } from '@/features/onboarding/content';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** Check-in history for the last 7 days; journaling arrives with the Reflect flow. */
export default function ReflectScreen() {
  const { checkIns } = useProgress();

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const mood = MOODS.find((m) => m.id === checkIns[todayKey(d)]);
    return { key: todayKey(d), label: DAY_LABELS[d.getDay()], mood };
  });

  return (
    <TabScreen title="Reflect" subtitle="Your week of check-ins.">
      <View style={styles.week}>
        {days.map((d) => (
          <View key={d.key} style={styles.day}>
            {d.mood ? (
              <Bondling size={38} color={d.mood.color} mood={d.mood.mood} noShadow />
            ) : (
              <View style={styles.empty} />
            )}
            <BText variant="caption">{d.label}</BText>
          </View>
        ))}
      </View>

      <View style={styles.soon}>
        <Float distance={6}>
          <Bondling size={120} color="purple" mood="content" prop="sparkles" />
        </Float>
        <BText variant="heading" center>
          Journaling is on its way
        </BText>
        <BText variant="body" center>
          Soon you’ll be able to jot down moments, spot patterns and see how your relationships grow.
        </BText>
      </View>
    </TabScreen>
  );
}

const styles = StyleSheet.create({
  week: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.md,
    ...Shadow.soft,
  },
  day: { alignItems: 'center', gap: Space.xs, width: 40 },
  empty: {
    width: 30,
    height: 30,
    margin: 4,
    borderRadius: 15,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Palette.border,
  },
  soon: { alignItems: 'center', gap: Space.sm, marginTop: Space.xxl, paddingHorizontal: Space.md },
});
