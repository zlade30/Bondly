import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { Float, Screen, SpeechBubble } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Font, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { useOnboardingFlow } from '@/features/onboarding/flow';
import { useOnboarding } from '@/features/onboarding/store';

export default function NameScreen() {
  const { next, back, progress } = useOnboardingFlow();
  const { answers, update } = useOnboarding();
  const [name, setName] = useState(answers.name);
  const trimmed = name.trim();

  const submit = () => {
    if (!trimmed) return;
    update({ name: trimmed });
    next();
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        onBack={back}
        progress={progress}
        footer={<PrimaryButton label="Continue" onPress={submit} disabled={!trimmed} />}>
        <View style={styles.intro}>
          <Float distance={6}>
            <Bondling size={96} color="pink" mood={trimmed ? 'happy' : 'curious'} />
          </Float>
          <SpeechBubble>
            <BText variant="bodyBold">Hi, I’m Bo! I’ll be with you on your journey.</BText>
          </SpeechBubble>
        </View>

        <BText variant="title" style={styles.title}>
          What should we call you?
        </BText>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your first name"
          placeholderTextColor={Palette.inkMuted}
          autoFocus
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          returnKeyType="next"
          maxLength={30}
          onSubmitEditing={submit}
          style={styles.input}
        />
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  intro: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, marginTop: Space.md },
  title: { marginTop: Space.xl, marginBottom: Space.lg },
  input: {
    height: 62,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    paddingHorizontal: Space.lg,
    fontFamily: Font.bold,
    fontSize: 20,
    color: Palette.ink,
    ...Shadow.soft,
  },
});
