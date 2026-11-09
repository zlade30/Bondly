import * as Haptics from 'expo-haptics';
import { useState, type ReactNode } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';

import { PrimaryButton, TextButton, tapFeedback } from '@/components/bondly/buttons';
import { Bondling, type BondlingColor } from '@/components/bondly/mascot';
import { OptionRow } from '@/components/bondly/option';
import { Float, SpeechBubble } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Font, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import type { LessonStep } from '@/features/learn/lessons';

/** firstTry is set for steps with a right answer; note for a written answer. */
export type StepResult = { firstTry?: boolean; note?: string };

type StepProps<K extends LessonStep['kind']> = {
  step: Extract<LessonStep, { kind: K }>;
  onDone: (result?: StepResult) => void;
  color: BondlingColor;
  tint: string;
};

function notify(success: boolean) {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(
    success ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
  ).catch(() => {});
}

/** Lays out a step: content scrolls above, the action area sits at the bottom. */
function StepFrame({ children, footer }: { children: ReactNode; footer: ReactNode }) {
  return (
    <View style={styles.frame}>
      <View style={styles.frameBody}>{children}</View>
      <View style={styles.frameFooter}>{footer}</View>
    </View>
  );
}

// ---------- Read ----------

export function ReadStep({ step, onDone, color, tint }: StepProps<'read'>) {
  return (
    <StepFrame footer={<PrimaryButton label="Continue" onPress={() => onDone()} />}>
      <View style={styles.readCenter}>
        <Animated.View entering={FadeIn.duration(400)} style={[styles.readArt, { backgroundColor: tint }]}>
          <Float distance={7}>
            <Bondling size={150} color={color} mood={step.mood ?? 'happy'} />
          </Float>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(100).duration(450)} style={styles.readCopy}>
          <BText variant="title" center>
            {step.title}
          </BText>
          <BText variant="body" center style={styles.readBody}>
            {step.body}
          </BText>
        </Animated.View>
      </View>
    </StepFrame>
  );
}

// ---------- Feedback panel shared by choice and blank ----------

function Feedback({
  correct,
  why,
  onContinue,
  onRetry,
}: {
  correct: boolean;
  why: string;
  onContinue: () => void;
  onRetry: () => void;
}) {
  return (
    <Animated.View
      entering={FadeInUp.springify().damping(16)}
      style={[styles.feedback, correct ? styles.feedbackGood : styles.feedbackBad]}>
      <BText variant="heading" color={correct ? '#1F8A60' : '#D2455A'}>
        {correct ? 'Nice one! 🎉' : 'Not quite'}
      </BText>
      <BText variant="body" color={Palette.ink}>
        {why}
      </BText>
      {correct ? (
        <PrimaryButton label="Continue" onPress={onContinue} style={styles.feedbackButton} />
      ) : (
        <PrimaryButton label="Try again" onPress={onRetry} style={styles.feedbackButton} />
      )}
    </Animated.View>
  );
}

// ---------- Choice ----------

export function ChoiceStep({ step, onDone, color }: StepProps<'choice'>) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [missed, setMissed] = useState(false);

  const chosen = selected !== null ? step.options[selected] : null;
  const correct = !!chosen?.correct;

  const check = () => {
    setChecked(true);
    notify(correct);
    if (!correct) setMissed(true);
  };

  return (
    <StepFrame
      footer={
        checked && chosen ? (
          <Feedback
            correct={correct}
            why={chosen.why}
            onContinue={() => onDone({ firstTry: !missed })}
            onRetry={() => {
              setChecked(false);
              setSelected(null);
            }}
          />
        ) : (
          <PrimaryButton label="Check" onPress={check} disabled={selected === null} />
        )
      }>
      <View style={styles.askRow}>
        <Bondling size={72} color={color} mood="curious" noShadow />
        <SpeechBubble>
          <BText variant="heading">{step.prompt}</BText>
        </SpeechBubble>
      </View>
      <View style={styles.options}>
        {step.options.map((o, i) => {
          const isSel = selected === i;
          const tone = checked && isSel ? (o.correct ? 'good' : 'bad') : undefined;
          return (
            <Animated.View key={i} entering={FadeInDown.delay(i * 70).duration(350)}>
              <OptionRow
                label={o.text}
                selected={isSel}
                tone={tone}
                onPress={() => {
                  if (!checked) setSelected(i);
                }}
              />
            </Animated.View>
          );
        })}
      </View>
    </StepFrame>
  );
}

// ---------- Fill in the blank ----------

/** Split into words so the sentence wraps naturally around the blank. */
function words(text: string) {
  return text.split(' ').filter(Boolean);
}

export function BlankStep({ step, onDone }: StepProps<'blank'>) {
  const [word, setWord] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [missed, setMissed] = useState(false);
  const correct = word === step.answer;

  const check = () => {
    setChecked(true);
    notify(correct);
    if (!correct) setMissed(true);
  };

  return (
    <StepFrame
      footer={
        checked ? (
          <Feedback
            correct={correct}
            why={correct ? step.why : `The best fit is “${step.answer}”. ${step.why}`}
            onContinue={() => onDone({ firstTry: !missed })}
            onRetry={() => {
              setChecked(false);
              setWord(null);
            }}
          />
        ) : (
          <PrimaryButton label="Check" onPress={check} disabled={!word} />
        )
      }>
      <BText variant="overline" style={styles.blankLabel}>
        {step.prompt}
      </BText>

      <View style={styles.sentenceCard}>
        <View style={styles.sentence}>
          {words(step.before).map((w, i) => (
            <BText key={`b${i}`} variant="heading" style={styles.sentenceText}>
              {w}
            </BText>
          ))}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={word ? `Remove ${word}` : 'Empty blank'}
            disabled={!word || checked}
            onPress={() => {
              tapFeedback();
              setWord(null);
            }}
            style={[
              styles.slot,
              word ? styles.slotFilled : null,
              checked && (correct ? styles.slotGood : styles.slotBad),
            ]}>
            <BText variant="heading" color={word ? Palette.primaryDeep : Palette.inkMuted} style={styles.sentenceText}>
              {word ?? '      '}
            </BText>
          </Pressable>
          {words(step.after).map((w, i) => (
            <BText key={`a${i}`} variant="heading" style={styles.sentenceText}>
              {w}
            </BText>
          ))}
        </View>
      </View>

      <View style={styles.bank}>
        {step.words.map((w, i) => {
          const used = word === w;
          return (
            <Animated.View key={w} entering={FadeInDown.delay(i * 70).duration(350)}>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: used || checked }}
                disabled={used || checked}
                onPress={() => {
                  tapFeedback();
                  setWord(w);
                }}
                style={({ pressed }) => [styles.chip, used && styles.chipUsed, pressed && styles.pressed]}>
                <BText variant="bodyBold" color={used ? 'transparent' : Palette.ink}>
                  {w}
                </BText>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    </StepFrame>
  );
}

// ---------- Reflect (no right answer) ----------

export function ReflectStep({ step, onDone, color }: StepProps<'reflect'>) {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <StepFrame footer={<PrimaryButton label="Continue" onPress={() => onDone()} disabled={selected === null} />}>
      <View style={styles.askRow}>
        <Bondling size={72} color={color} mood={selected === null ? 'curious' : 'happy'} noShadow />
        <SpeechBubble>
          <BText variant="heading">{step.prompt}</BText>
        </SpeechBubble>
      </View>
      <View style={styles.options}>
        {step.options.map((o, i) => (
          <Animated.View key={o} entering={FadeInDown.delay(i * 70).duration(350)}>
            <OptionRow label={o} selected={selected === i} onPress={() => setSelected(i)} />
          </Animated.View>
        ))}
      </View>
      {selected !== null && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.reply}>
          <BText variant="bodyBold" center>
            {step.reply}
          </BText>
        </Animated.View>
      )}
    </StepFrame>
  );
}

// ---------- Write (optional; saved to the journal on this phone) ----------

export function WriteStep({ step, onDone, color }: StepProps<'write'>) {
  const [text, setText] = useState('');
  const finish = (save: boolean) => {
    Keyboard.dismiss();
    onDone(save && text.trim() ? { note: text.trim() } : undefined);
  };

  return (
    <StepFrame
      footer={
        <>
          <PrimaryButton label="Save & continue" onPress={() => finish(true)} disabled={!text.trim()} />
          <TextButton label="Skip for now" onPress={() => finish(false)} />
        </>
      }>
      <View style={styles.askRow}>
        <Bondling size={72} color={color} mood="content" noShadow />
        <SpeechBubble>
          <BText variant="heading">{step.prompt}</BText>
        </SpeechBubble>
      </View>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={step.placeholder}
        placeholderTextColor={Palette.inkMuted}
        multiline
        maxLength={400}
        style={styles.input}
      />
      <BText variant="caption" style={styles.private}>
        🔒 Saved privately to your journal.
      </BText>
    </StepFrame>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1 },
  frameBody: { flex: 1, paddingTop: Space.md },
  frameFooter: { gap: Space.md, paddingTop: Space.md },
  pressed: { transform: [{ scale: 0.96 }] },

  readCenter: { flex: 1, justifyContent: 'center', gap: Space.xl },
  readArt: {
    alignSelf: 'center',
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: 'center',
    justifyContent: 'center',
  },
  readCopy: { gap: Space.md },
  readBody: { fontSize: 18, lineHeight: 27 },

  askRow: { flexDirection: 'row', alignItems: 'center', gap: Space.xs, marginBottom: Space.xl },
  options: { gap: Space.md },

  feedback: {
    borderRadius: Radius.xl,
    padding: Space.lg,
    gap: Space.sm,
  },
  feedbackGood: { backgroundColor: '#DDF5EA' },
  feedbackBad: { backgroundColor: '#FFE4E8' },
  feedbackButton: { marginTop: Space.sm },

  blankLabel: { marginBottom: Space.md },
  sentenceCard: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Space.xl,
    ...Shadow.soft,
  },
  sentence: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 6, rowGap: Space.xs },
  sentenceText: { fontSize: 22, lineHeight: 34 },
  slot: {
    minWidth: 90,
    paddingHorizontal: Space.md,
    borderBottomWidth: 3,
    borderColor: Palette.primary,
    alignItems: 'center',
  },
  slotFilled: { backgroundColor: Palette.lilac, borderRadius: Radius.sm },
  slotGood: { borderColor: Palette.success, backgroundColor: '#DDF5EA' },
  slotBad: { borderColor: Palette.warning, backgroundColor: '#FFE4E8' },
  bank: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.md, marginTop: Space.xxl, justifyContent: 'center' },
  chip: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    paddingVertical: Space.md,
    paddingHorizontal: Space.lg,
    borderWidth: 2,
    borderColor: Palette.border,
    ...Shadow.soft,
  },
  chipUsed: { backgroundColor: Palette.track, borderColor: Palette.track, shadowOpacity: 0, elevation: 0 },

  reply: {
    marginTop: Space.lg,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.lg,
    ...Shadow.soft,
  },

  input: {
    minHeight: 150,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    padding: Space.lg,
    paddingTop: Space.lg,
    fontFamily: Font.semibold,
    fontSize: 17,
    lineHeight: 24,
    color: Palette.ink,
    textAlignVertical: 'top',
    ...Shadow.soft,
  },
  private: { marginTop: Space.md, textAlign: 'center' },
});
