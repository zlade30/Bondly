import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Bondling } from '@/components/bondly/mascot';
import { Float, ProgressBar, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Space } from '@/constants/bondly';
import { useOnboardingFlow } from '@/features/onboarding/flow';

const STAGES = ['Your answers', 'Your goals', 'Your journey'];
const TICK_MS = 40;

/** A short, honest "building your plan" moment before the results. */
export default function AnalyzingScreen() {
  const { replaceNext } = useOnboardingFlow();
  const [t, setT] = useState(0); // 0..300, 100 per stage

  useEffect(() => {
    const id = setInterval(() => setT((v) => Math.min(300, v + 2)), TICK_MS);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (t >= 300) {
      const id = setTimeout(replaceNext, 400);
      return () => clearTimeout(id);
    }
  }, [t, replaceNext]);

  return (
    <Screen>
      <View style={styles.center}>
        <Float distance={8} duration={1200}>
          <Bondling size={180} color="lavender" mood="sleepy" prop="hourglass" />
        </Float>
        <BText variant="title" center style={styles.title}>
          Building your Bondly plan…
        </BText>

        <View style={styles.bars}>
          {STAGES.map((label, i) => {
            const value = Math.min(100, Math.max(0, t - i * 100));
            return (
              <View key={label} style={styles.stage}>
                <View style={styles.stageRow}>
                  <BText variant="bodyBold">{label}</BText>
                  <BText variant="caption">{value}%</BText>
                </View>
                <ProgressBar value={value / 100} />
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Space.lg },
  title: { marginTop: Space.md },
  bars: { alignSelf: 'stretch', gap: Space.xl, marginTop: Space.lg },
  stage: { gap: Space.sm },
  stageRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
