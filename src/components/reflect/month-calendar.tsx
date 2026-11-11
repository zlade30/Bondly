import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { tapFeedback } from '@/components/bondly/buttons';
import { ChevronRightIcon } from '@/components/bondly/icons';
import { Bondling } from '@/components/bondly/mascot';
import { BText } from '@/components/bondly/text';
import { Font, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { todayKey, useProgress } from '@/features/learn/progress';
import { MOODS, type Mood } from '@/features/onboarding/content';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/**
 * A month of daily check-ins: each checked-in day shows its mood mascot.
 * Today sits on a tinted tile. Tapping a day up to today selects it, so the
 * journal below shows just that day.
 */
export function MonthCalendar({
  checkIns,
  entryDays,
  selected,
  onSelect,
}: {
  checkIns: Record<string, Mood>;
  /** Days (YYYY-MM-DD) with at least one journal entry. */
  entryDays: Set<string>;
  /** The selected day (YYYY-MM-DD). */
  selected: string;
  onSelect: (day: string) => void;
}) {
  // Comes from the progress store, so the ring moves to the new day at midnight
  // even if Reflect stays open.
  const { today } = useProgress();
  const [month, setMonth] = useState(() => monthStart(today));
  // When the day rolls over, jump back to the month it's now in.
  const [shownFor, setShownFor] = useState(today);
  if (shownFor !== today) {
    setShownFor(today);
    setMonth(monthStart(today));
  }
  const isCurrentMonth = todayKey(month).slice(0, 7) === today.slice(0, 7);

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leading = month.getDay();
  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  while (cells.length % 7) cells.push(null);

  const checkedThisMonth = cells.filter((d) => d && checkIns[todayKey(d)]).length;
  const shift = (by: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + by, 1));

  return (
    <View style={styles.card}>
      <View style={styles.head}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          hitSlop={10}
          onPress={() => shift(-1)}
          style={styles.arrowLeft}>
          <ChevronRightIcon size={20} color={Palette.ink} />
        </Pressable>
        <View style={styles.title}>
          <BText variant="bodyBold">
            {month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </BText>
          <BText variant="caption">
            {checkedThisMonth} {checkedThisMonth === 1 ? 'check-in' : 'check-ins'}
          </BText>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          hitSlop={10}
          disabled={isCurrentMonth}
          onPress={() => shift(1)}
          style={isCurrentMonth && { opacity: 0.25 }}>
          <ChevronRightIcon size={20} color={Palette.ink} />
        </Pressable>
      </View>

      <View style={styles.row}>
        {WEEKDAYS.map((d, i) => (
          <BText key={i} variant="caption" center style={styles.weekday}>
            {d}
          </BText>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={styles.cell} />;
          const key = todayKey(d);
          const mood = MOODS.find((m) => m.id === checkIns[key]);
          const isToday = key === today;
          const future = key > today;
          const isSelected = key === selected;
          const label = d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
          return (
            <Pressable
              key={i}
              disabled={future}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected, disabled: future }}
              accessibilityLabel={`${isToday ? 'Today, ' : ''}${label}${mood ? `, ${mood.label}` : ''}${
                entryDays.has(key) ? ', has journal entries' : ''
              }`}
              onPress={() => {
                if (isSelected) return;
                tapFeedback();
                onSelect(key);
              }}
              style={styles.cell}>
              <View style={[styles.tile, isToday && styles.tileToday, isSelected && styles.tileSelected]}>
                {mood ? (
                  <Bondling size={32} color={mood.color} mood={mood.mood} noShadow />
                ) : (
                  <BText
                    variant="caption"
                    color={future ? Palette.border : isToday ? Palette.primaryDeep : Palette.inkSoft}
                    style={(isToday || isSelected) && { fontFamily: Font.extrabold }}>
                    {d.getDate()}
                  </BText>
                )}
                {entryDays.has(key) && <View style={styles.dot} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Space.lg,
    ...Shadow.soft,
  },
  head: { flexDirection: 'row', alignItems: 'center', marginBottom: Space.md },
  arrowLeft: { transform: [{ rotate: '180deg' }] },
  title: { flex: 1, alignItems: 'center' },
  row: { flexDirection: 'row', marginBottom: Space.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: `${100 / 7}%` },
  cell: { width: `${100 / 7}%`, height: 48, alignItems: 'center', justifyContent: 'center' },
  tile: {
    width: 42,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    // Leaves room under the mascot for the journal dot.
    paddingBottom: 5,
  },
  tileToday: { backgroundColor: Palette.lilac },
  tileSelected: { borderColor: Palette.primary },
  dot: {
    position: 'absolute',
    bottom: 2,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.pink,
  },
});

/** The first day of the month that a YYYY-MM-DD key falls in. */
function monthStart(key: string) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1);
}
