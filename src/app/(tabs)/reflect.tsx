import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton, tapFeedback } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { Float } from '@/components/bondly/screen';
import { TabScreen } from '@/components/bondly/tab-screen';
import { BText } from '@/components/bondly/text';
import { MonthCalendar } from '@/components/reflect/month-calendar';
import { Font, Gradients, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { findLesson } from '@/features/learn/content';
import { todayKey, useProgress } from '@/features/learn/progress';
import { MOODS } from '@/features/onboarding/content';
import { buildInsights } from '@/features/reflect/insights';
import { WHO, formatEntryDate, useJournal, type JournalEntry } from '@/features/reflect/journal';

export default function ReflectScreen() {
  const { checkIns, today } = useProgress();
  const { entries } = useJournal();
  // The journal shows one day at a time: today, or a day picked on the calendar.
  // When the date rolls over, it moves on to the new today.
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedOn, setPickedOn] = useState(today);
  if (pickedOn !== today) {
    setPickedOn(today);
    setPicked(null);
  }
  const selected = picked ?? today;
  const isToday = selected === today;

  const entryDays = useMemo(() => new Set(entries.map((e) => todayKey(new Date(e.createdAt)))), [entries]);
  const shown = useMemo(
    () => entries.filter((e) => todayKey(new Date(e.createdAt)) === selected),
    [entries, selected]
  );
  const selectedMood = MOODS.find((m) => m.id === checkIns[selected]);
  const selectedDate = new Date(`${selected}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const selectedLabel = isToday ? 'Today' : selectedDate;
  const insights = useMemo(() => buildInsights(checkIns, entries), [checkIns, entries]);

  const newEntry = () => router.push('/journal/new' as Href);

  return (
    <TabScreen title="Reflect" subtitle="Your check-ins and journal, private to you.">
      <Animated.View entering={FadeInDown.duration(400)}>
        <LinearGradient
          colors={Gradients.blushCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.write}>
          <View style={styles.writeText}>
            <BText variant="heading">How are things with your people?</BText>
            <BText variant="body">Jot down a moment, big or small.</BText>
            <PrimaryButton label="New entry" onPress={newEntry} style={styles.writeButton} />
          </View>
          <Float distance={6}>
            <Bondling size={92} color="purple" mood="content" prop="heart" />
          </Float>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <MonthCalendar checkIns={checkIns} entryDays={entryDays} selected={selected} onSelect={setPicked} />
      </Animated.View>

      {insights.length > 0 && (
        <Animated.View entering={FadeInDown.delay(140).duration(400)} style={styles.insights}>
          <BText variant="overline" color={Palette.primaryDeep}>
            Patterns
          </BText>
          {insights.map((text) => (
            <View key={text} style={styles.insightRow}>
              <BText style={styles.insightIcon}>💡</BText>
              <BText variant="body" color={Palette.ink} style={styles.insightText}>
                {text}
              </BText>
            </View>
          ))}
        </Animated.View>
      )}

      <View style={styles.sectionHead}>
        <View style={styles.sectionTitleWrap}>
          <BText variant="title" style={styles.sectionTitle}>
            Journal
          </BText>
          <BText variant="caption" color={Palette.primaryDeep} style={styles.filterLabel}>
            {selectedLabel} · {shown.length} {shown.length === 1 ? 'entry' : 'entries'}
          </BText>
        </View>
      </View>

      {shown.length === 0 && entries.length > 0 ? (
        <View style={styles.empty}>
          {selectedMood ? (
            <Bondling size={80} color={selectedMood.color} mood={selectedMood.mood} />
          ) : (
            <Bondling size={80} color="lavender" mood="curious" />
          )}
          <BText variant="bodyBold" center>
            {isToday ? 'Nothing written today yet' : `Nothing written on ${selectedDate}`}
          </BText>
          <BText variant="body" center>
            {selectedMood
              ? `You checked in feeling ${selectedMood.label.toLowerCase()} ${isToday ? 'today' : 'that day'}.`
              : isToday
                ? 'Tap New entry to write about today.'
                : 'Pick another day on the calendar to see its entries.'}
          </BText>
        </View>
      ) : entries.length === 0 ? (
        <View style={styles.empty}>
          <Bondling size={96} color="lavender" mood="curious" prop="sparkles" />
          <BText variant="bodyBold" center>
            No entries yet
          </BText>
          <BText variant="body" center>
            Write about a moment with someone, or finish a lesson with a writing prompt. It’ll appear here.
          </BText>
        </View>
      ) : (
        shown.map((entry, i) => <EntryCard key={entry.id} entry={entry} index={i} />)
      )}
    </TabScreen>
  );
}

function EntryCard({ entry, index }: { entry: JournalEntry; index: number }) {
  const mood = MOODS.find((m) => m.id === entry.mood);
  const who = WHO.find((w) => w.id === entry.who);
  const lesson = entry.lessonId ? findLesson(entry.lessonId) : null;

  return (
    <Animated.View entering={FadeInDown.delay(Math.min(index, 6) * 50).duration(350)}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Opens the entry to read or edit"
        onPress={() => {
          tapFeedback();
          router.push(`/journal/${entry.id}` as Href);
        }}
        style={({ pressed }) => [styles.entry, pressed && { transform: [{ scale: 0.98 }] }]}>
        <View style={styles.entryHead}>
          <View style={styles.entryMeta}>
            <BText variant="caption">{formatEntryDate(entry.createdAt)}</BText>
            <View style={styles.tags}>
              {who && (
                <View style={styles.tag}>
                  <BText variant="caption" color={Palette.ink} style={styles.tagText}>
                    {who.emoji} {who.label}
                  </BText>
                </View>
              )}
              {lesson && (
                <View style={[styles.tag, { backgroundColor: lesson.course.tint }]}>
                  <BText variant="caption" color={Palette.ink} style={styles.tagText}>
                    📖 {lesson.lesson.title}
                  </BText>
                </View>
              )}
            </View>
          </View>
          {mood && <Bondling size={40} color={mood.color} mood={mood.mood} noShadow />}
        </View>
        <BText variant="body" color={Palette.ink} numberOfLines={3}>
          {entry.text}
        </BText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  write: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    padding: Space.lg,
    gap: Space.sm,
  },
  writeText: { flex: 1, gap: 4 },
  writeButton: { marginTop: Space.sm, height: 48 },
  insights: {
    backgroundColor: Palette.lilac,
    borderRadius: Radius.xl,
    padding: Space.lg,
    gap: Space.sm,
  },
  insightRow: { flexDirection: 'row', gap: Space.sm, alignItems: 'flex-start' },
  insightIcon: { fontSize: 16, lineHeight: 23 },
  insightText: { flex: 1 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginTop: Space.lg,
  },
  sectionTitleWrap: { flex: 1, gap: 2 },
  sectionTitle: { fontSize: 24, lineHeight: 30 },
  filterLabel: { fontFamily: Font.bold },
  empty: { alignItems: 'center', gap: Space.sm, paddingVertical: Space.xl, paddingHorizontal: Space.md },
  entry: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.sm,
    ...Shadow.soft,
  },
  entryHead: { flexDirection: 'row', alignItems: 'flex-start', gap: Space.md },
  entryMeta: { flex: 1, gap: Space.xs },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Space.xs },
  tag: {
    backgroundColor: Palette.surfaceSoft,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.sm,
    paddingVertical: 2,
  },
  tagText: { fontFamily: Font.bold },
});
