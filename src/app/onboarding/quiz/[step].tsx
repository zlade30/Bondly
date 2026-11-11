import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { NextFab } from '@/components/bondly/buttons';
import { Bondling, type BondlingColor, type BondlingMood } from '@/components/bondly/mascot';
import { ScaleSlider } from '@/components/bondly/scale-slider';
import { Float, Screen, SpeechBubble } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Space } from '@/constants/bondly';
import { QUIZ } from '@/features/onboarding/content';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { useOnboarding } from '@/features/onboarding/store';

/** The mascot's face and color for each slider step, matching the feelings on the mood screen. */
const FEELING_BY_VALUE: { mood: BondlingMood; color: BondlingColor }[] = [
  { mood: 'sad', color: 'purple' }, // like Low
  { mood: 'neutral', color: 'yellow' }, // like Okay
  { mood: 'curious', color: 'lavender' },
  { mood: 'content', color: 'mint' }, // like Calm
  { mood: 'happy', color: 'pink' }, // like Great
];

export default function QuizScreen() {
  const { step } = useLocalSearchParams<{ step: string }>();
  const index = Math.min(QUIZ.length - 1, Math.max(0, Number(step) || 0));
  const question = QUIZ[index];

  const { next, back, progress } = useOnboardingFlow();
  const { answers, update } = useOnboarding();
  const value = answers.quiz[question.id] ?? null;

  return (
    <Screen onBack={back} progress={progress}>
      <BText variant="caption" center style={styles.counter}>
        Question {index + 1} of {QUIZ.length}
      </BText>

      <View style={styles.prompt}>
        <Float distance={6}>
          <Bondling
            size={104}
            color={value === null ? 'lavender' : FEELING_BY_VALUE[value].color}
            mood={value === null ? 'curious' : FEELING_BY_VALUE[value].mood}
          />
        </Float>
        <SpeechBubble>
          <BText variant="heading">{question.prompt}</BText>
        </SpeechBubble>
      </View>

      <View style={styles.slider}>
        <ScaleSlider
          value={value}
          onChange={(v) => update({ quiz: { ...answers.quiz, [question.id]: v } })}
          leftLabel={question.left}
          rightLabel={question.right}
        />
      </View>

      <View style={styles.fab}>
        <NextFab onPress={next} disabled={value === null} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  counter: { marginTop: -Space.xs },
  prompt: { flexDirection: 'row', alignItems: 'center', gap: Space.xs, marginTop: Space.xl },
  slider: { flex: 1, justifyContent: 'center' },
  fab: { alignItems: 'flex-end', paddingBottom: Space.lg },
});
