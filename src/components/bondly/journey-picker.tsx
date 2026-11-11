import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { OptionRow } from '@/components/bondly/option';
import { BText } from '@/components/bondly/text';
import { TopicIcon } from '@/components/bondly/topic-icons';
import { Font, Palette, Radius, Space } from '@/constants/bondly';
import { journeyFor } from '@/features/learn/content';
import { GOALS, type RelationshipGoal } from '@/features/onboarding/content';
import { MAX_JOURNEYS } from '@/features/onboarding/store';

/**
 * The list of relationship journeys to pick your focus from, drawn the same
 * way as the journeys themselves: each journey’s own icon and name. Used in
 * onboarding and in Learn’s “Your focus” editor. The first pick is tagged Main.
 */
export function JourneyPicker({
  chosen,
  onToggle,
  animate,
}: {
  chosen: RelationshipGoal[];
  onToggle: (id: RelationshipGoal) => void;
  /** Fade the rows in one by one (onboarding). */
  animate?: boolean;
}) {
  return (
    <View style={styles.list}>
      {GOALS.map((g, i) => {
        const journey = journeyFor(g.id);
        const on = chosen.includes(g.id);
        const full = !on && chosen.length >= MAX_JOURNEYS;
        return (
          <Animated.View
            key={g.id}
            entering={animate ? FadeInDown.delay(i * 60).duration(400) : undefined}
            style={full && styles.full}>
            <OptionRow
              multi
              label={journey?.title ?? g.label}
              leading={
                journey ? (
                  <View style={[styles.art, { backgroundColor: journey.tint }]}>
                    <TopicIcon name={journey.icon} color={journey.mascot.color} size={40} noShadow />
                  </View>
                ) : undefined
              }
              trailing={
                chosen[0] === g.id ? (
                  <View style={styles.main}>
                    <BText style={styles.mainText}>Main</BText>
                  </View>
                ) : undefined
              }
              selected={on}
              onPress={() => onToggle(g.id)}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Space.md },
  full: { opacity: 0.5 },
  art: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    paddingHorizontal: Space.sm,
    paddingVertical: 2,
    marginRight: Space.sm,
    borderRadius: Radius.pill,
    backgroundColor: Palette.primary,
  },
  mainText: { fontFamily: Font.extrabold, fontSize: 12, color: Palette.white },
});
