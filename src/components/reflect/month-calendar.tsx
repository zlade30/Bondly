import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ChevronRightIcon } from '@/components/bondly/icons';
import { Bondling } from '@/components/bondly/mascot';
import { BText } from '@/components/bondly/text';
import { Font, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { todayKey } from '@/features/learn/progress';
import { MOODS, type Mood } from '@/features/onboarding/content';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

/** A month of daily check-ins: each checked-in day shows its mood mascot. */
export function MonthCalendar({
  checkIns,
  entryDays,
}: {
  checkIns: Record<string, Mood>;
  /** Days (YYYY-MM-DD) with at least one journal entry. */
  entryDays: Set<string>;
}) {
  const now = new Date();
  const [month, setMonth] = useState(() => new Date(now.getFullYear(), now.getMonth(), 1));
  const isCurrentMonth = month.getFullYear() === now.getFullYear() && month.getMonth() === now.getMonth();
  const today = todayKey(now);

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
          return (
            <View key={i} style={styles.cell} accessibilityLabel={`${d.getDate()}${mood ? `, ${mood.label}` : ''}`}>
              {mood ? (
                <Bondling size={34} color={mood.color} mood={mood.mood} noShadow />
              ) : (
                <View style={[styles.day, isToday && styles.today]}>
                  <BText
                    variant="caption"
                    color={d > now ? Palette.border : isToday ? Palette.primaryDeep : Palette.inkSoft}
                    style={isToday && { fontFamily: Font.extrabold }}>
                    {d.getDate()}
                  </BText>
                </View>
              )}
              {entryDays.has(key) && <View style={styles.dot} />}
            </View>
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
  cell: { width: `${100 / 7}%`, height: 46, alignItems: 'center', justifyContent: 'center' },
  day: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  today: { borderWidth: 2, borderColor: Palette.primary },
  dot: {
    position: 'absolute',
    bottom: 2,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Palette.pink,
  },
});
