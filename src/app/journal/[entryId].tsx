import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tapFeedback } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { BText } from '@/components/bondly/text';
import { Font, Gradients, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { findLesson } from '@/features/learn/content';
import { MOODS, type Mood } from '@/features/onboarding/content';
import { WHO, formatEntryDate, useJournal, type Who } from '@/features/reflect/journal';

/** Write a new journal entry (entryId "new") or edit an existing one. */
export default function JournalEntryScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const { entries, add, edit, remove } = useJournal();
  const existing = entries.find((e) => e.id === entryId);
  const isNew = !existing;
  const insets = useSafeAreaInsets();

  const [text, setText] = useState(existing?.text ?? '');
  const [mood, setMood] = useState<Mood | undefined>(existing?.mood);
  const [who, setWho] = useState<Who | undefined>(existing?.who);
  const canSave = text.trim().length > 0;
  const lesson = existing?.lessonId ? findLesson(existing.lessonId) : null;

  const close = () => (router.canGoBack() ? router.back() : router.replace('/reflect'));

  const save = () => {
    if (!canSave) return;
    tapFeedback();
    const data = { text: text.trim(), mood, who };
    if (existing) edit(existing.id, data);
    else add(data);
    close();
  };

  const confirmDelete = () => {
    if (!existing) return;
    Alert.alert('Delete this entry?', 'It will be removed from your journal. This can’t be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          remove(existing.id);
          close();
        },
      },
    ]);
  };

  // iOS shows this as a sheet below the status bar; other platforms are full screen.
  const top = Platform.OS === 'ios' ? Space.lg : insets.top + Space.sm;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={Gradients.screen} style={StyleSheet.absoluteFill} />

      <View style={[styles.header, { paddingTop: top }]}>
        <Pressable accessibilityRole="button" hitSlop={10} onPress={close}>
          <BText variant="bodyBold" color={Palette.inkSoft}>
            Cancel
          </BText>
        </Pressable>
        <BText variant="bodyBold">{isNew ? 'New entry' : 'Journal entry'}</BText>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          hitSlop={10}
          disabled={!canSave}
          onPress={save}>
          <BText variant="bodyBold" color={canSave ? Palette.primary : Palette.inkMuted}>
            Save
          </BText>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Space.xxl }]}
        keyboardShouldPersistTaps="handled">
        {existing && (
          <BText variant="caption" style={styles.date}>
            {formatEntryDate(existing.createdAt)}
          </BText>
        )}

        {lesson && existing?.prompt && (
          <View style={styles.fromLesson}>
            <BText variant="overline" color={Palette.primaryDeep}>
              From “{lesson.lesson.title}”
            </BText>
            <BText variant="body">{existing.prompt}</BText>
          </View>
        )}

        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="What happened, and how did it feel?"
          placeholderTextColor={Palette.inkMuted}
          multiline
          autoFocus={isNew}
          maxLength={2000}
          style={styles.input}
        />

        <BText variant="bodyBold" style={styles.label}>
          How did it feel?
        </BText>
        <View style={styles.moods}>
          {MOODS.map((m) => {
            const on = mood === m.id;
            return (
              <Pressable
                key={m.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                accessibilityLabel={m.label}
                onPress={() => {
                  tapFeedback();
                  setMood(on ? undefined : m.id);
                }}
                style={[styles.mood, on && styles.moodOn]}>
                <Bondling size={44} color={m.color} mood={m.mood} noShadow />
                <BText variant="caption" color={on ? Palette.ink : Palette.inkSoft} style={styles.moodLabel}>
                  {m.label}
                </BText>
              </Pressable>
            );
          })}
        </View>

        <BText variant="bodyBold" style={styles.label}>
          Who was it about?
        </BText>
        <View style={styles.chips}>
          {WHO.map((w) => {
            const on = who === w.id;
            return (
              <Pressable
                key={w.id}
                accessibilityRole="radio"
                accessibilityState={{ selected: on }}
                onPress={() => {
                  tapFeedback();
                  setWho(on ? undefined : w.id);
                }}
                style={[styles.chip, on && styles.chipOn]}>
                <BText variant="bodyBold" color={on ? Palette.primaryDeep : Palette.ink} style={styles.chipText}>
                  {w.emoji} {w.label}
                </BText>
              </Pressable>
            );
          })}
        </View>

        <BText variant="caption" style={styles.private}>
          🔒 Your journal is private. Only you can read it, here and in your backup if you sign in.
        </BText>

        {existing && (
          <Pressable accessibilityRole="button" onPress={confirmDelete} style={styles.delete}>
            <BText variant="bodyBold" color={Palette.warning}>
              Delete entry
            </BText>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.surfaceSoft },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Space.xl,
    paddingBottom: Space.md,
  },
  content: { paddingHorizontal: Space.xl, paddingTop: Space.sm },
  date: { marginBottom: Space.sm },
  fromLesson: {
    backgroundColor: Palette.lilac,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: 4,
    marginBottom: Space.md,
  },
  input: {
    minHeight: 180,
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
  label: { marginTop: Space.xl, marginBottom: Space.md },
  moods: { flexDirection: 'row', justifyContent: 'space-between' },
  mood: {
    alignItems: 'center',
    width: 62,
    paddingVertical: Space.sm,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moodOn: { borderColor: Palette.primary, backgroundColor: Palette.white },
  moodLabel: { fontFamily: Font.extrabold, marginTop: 2 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.sm },
  chip: {
    backgroundColor: Palette.white,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipOn: { borderColor: Palette.primary, backgroundColor: Palette.lilac },
  chipText: { fontSize: 15 },
  private: { textAlign: 'center', marginTop: Space.xl },
  delete: { alignSelf: 'center', marginTop: Space.xl, padding: Space.sm },
});
