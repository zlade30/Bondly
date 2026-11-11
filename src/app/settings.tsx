import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { PrimaryButton, tapFeedback } from '@/components/bondly/buttons';
import { Check } from '@/components/bondly/option';
import { Screen } from '@/components/bondly/screen';
import { ReminderSettings } from '@/components/reminders/reminder-settings';
import { AboutSection } from '@/components/settings/about-section';
import { AccountCard } from '@/components/settings/account-card';
import { SoundSettings } from '@/components/settings/sound-settings';
import { BText } from '@/components/bondly/text';
import { Font, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { useAccount } from '@/features/account/account';
import { useProgress } from '@/features/learn/progress';
import { DAILY_OPTIONS, FOCUS_AREAS, type DailyMinutes, type FocusArea } from '@/features/onboarding/content';
import { useOnboarding } from '@/features/onboarding/store';
import { useJournal } from '@/features/reflect/journal';

const MAX_FOCUS = 3;

export default function SettingsScreen() {
  const { answers, update, reset: resetOnboarding } = useOnboarding();
  const { reset: resetProgress } = useProgress();
  const { reset: resetJournal } = useJournal();
  const { session, signOut } = useAccount();

  const [name, setName] = useState(answers.name);
  const [minutes, setMinutes] = useState<DailyMinutes>(answers.minutes ?? 5);
  const [focus, setFocus] = useState<FocusArea[]>(answers.focus);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/profile' as Href));
  const canSave = name.trim().length > 0 && focus.length > 0;

  const save = () => {
    update({ name: name.trim(), minutes, focus });
    back();
  };

  const toggleFocus = (id: FocusArea) => {
    tapFeedback();
    if (focus.includes(id)) setFocus(focus.filter((f) => f !== id));
    else if (focus.length < MAX_FOCUS) setFocus([...focus, id]);
  };

  const startOver = () =>
    Alert.alert(
      'Start over?',
      session
        ? 'This signs you out and permanently clears your answers, lesson progress, check-ins and journal on this phone, then replays onboarding. Your account backup is kept, so you can sign in again to restore it.'
        : 'This permanently clears your answers, lesson progress, check-ins and journal, then replays onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start over',
          style: 'destructive',
          onPress: async () => {
            // Sign out first, so the cleared phone isn't refilled from the account.
            if (session) await signOut();
            await resetJournal();
            await resetProgress();
            await resetOnboarding();
          },
        },
      ]
    );

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen
        onBack={back}
        scroll
        footer={<PrimaryButton label="Save changes" onPress={save} disabled={!canSave} />}>
        <BText variant="title" style={styles.title}>
          Settings
        </BText>

        <BText variant="bodyBold" style={styles.label}>
          Account
        </BText>
        <AccountCard />

        <BText variant="bodyBold" style={styles.label}>
          Your name
        </BText>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your first name"
          placeholderTextColor={Palette.inkMuted}
          autoCapitalize="words"
          maxLength={30}
          style={styles.input}
        />

        <BText variant="bodyBold" style={styles.label}>
          Daily goal
        </BText>
        <View style={styles.pills}>
          {DAILY_OPTIONS.map((o) => {
            const on = minutes === o.minutes;
            return (
              <Pressable
                key={o.minutes}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  tapFeedback();
                  setMinutes(o.minutes);
                }}
                style={[styles.pill, on && styles.pillOn]}>
                <BText variant="bodyBold" color={on ? Palette.primaryDeep : Palette.ink}>
                  {o.minutes} min
                </BText>
              </Pressable>
            );
          })}
        </View>

        <BText variant="bodyBold" style={styles.label}>
          Reminders
        </BText>
        <ReminderSettings />

        <BText variant="bodyBold" style={styles.label}>
          Sound
        </BText>
        <SoundSettings />

        <BText variant="bodyBold" style={styles.label}>
          Focus areas
        </BText>
        <BText variant="caption" style={styles.hint}>
          Up to {MAX_FOCUS}. These come first in Today’s Lesson and your courses.
        </BText>
        <View style={styles.list}>
          {FOCUS_AREAS.map((f) => {
            const on = focus.includes(f.id);
            const full = !on && focus.length >= MAX_FOCUS;
            return (
              <Pressable
                key={f.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on, disabled: full }}
                onPress={() => toggleFocus(f.id)}
                style={[styles.row, { backgroundColor: f.tint }, on && styles.rowOn, full && { opacity: 0.5 }]}>
                <BText variant="bodyBold" style={styles.rowLabel}>
                  {f.label}
                </BText>
                <Check on={on} round={false} />
              </Pressable>
            );
          })}
        </View>
        {focus.length === 0 && (
          <BText variant="caption" color={Palette.danger} style={styles.hint}>
            Pick at least one focus area.
          </BText>
        )}

        <BText variant="bodyBold" style={styles.label}>
          About
        </BText>
        <AboutSection />

        <View style={styles.danger}>
          <BText variant="bodyBold">Start over</BText>
          <BText variant="caption" color={Palette.inkSoft}>
            Clears everything on this phone and replays onboarding.
          </BText>
          <Pressable accessibilityRole="button" onPress={startOver} style={styles.dangerButton}>
            <BText variant="bodyBold" color={Palette.danger}>
              Replay onboarding
            </BText>
          </Pressable>
        </View>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { marginBottom: Space.md },
  label: { marginTop: Space.xl, marginBottom: Space.sm },
  hint: { marginBottom: Space.sm },
  input: {
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    paddingHorizontal: Space.lg,
    fontFamily: Font.bold,
    fontSize: 18,
    color: Palette.ink,
    ...Shadow.soft,
  },
  pills: { flexDirection: 'row', gap: Space.sm },
  pill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pillOn: { borderColor: Palette.primary, backgroundColor: Palette.lilac },
  list: { gap: Space.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Space.lg,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowOn: { borderColor: Palette.primary },
  rowLabel: { flex: 1 },
  danger: {
    marginTop: Space.xxl,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: 4,
    ...Shadow.soft,
  },
  dangerButton: { alignSelf: 'flex-start', marginTop: Space.sm, paddingVertical: Space.xs },
});
