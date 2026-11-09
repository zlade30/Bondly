import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Palette, Radius, Shadow, Space } from '@/constants/bondly';

import { tapFeedback } from './buttons';
import { BText } from './text';

type OptionRowProps = {
  label: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
};

/** A full-width answer row, as in the goal and daily-time lists. */
export function OptionRow({ label, leading, trailing, selected, onPress, multi }: OptionRowProps) {
  return (
    <Pressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={multi ? { checked: selected } : { selected }}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [
        styles.row,
        selected ? styles.rowSelected : Shadow.soft,
        pressed && styles.pressed,
      ]}>
      {leading}
      <BText variant="bodyBold" style={styles.label}>
        {label}
      </BText>
      {trailing}
      <Check on={selected} round={!multi} />
    </Pressable>
  );
}

export function Check({ on, round = true }: { on: boolean; round?: boolean }) {
  return (
    <View
      style={[
        styles.check,
        { borderRadius: round ? 12 : 7 },
        on ? styles.checkOn : styles.checkOff,
      ]}>
      {on && (
        <Svg width={14} height={14} viewBox="0 0 24 24">
          <Path
            d="M5 12.5l4.5 4.5L19 7.5"
            stroke={Palette.white}
            strokeWidth={3.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    minHeight: 64,
    paddingHorizontal: Space.lg,
    paddingVertical: Space.md,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rowSelected: {
    borderColor: Palette.primary,
    backgroundColor: '#FBF8FF',
  },
  pressed: { transform: [{ scale: 0.985 }] },
  label: { flex: 1 },
  check: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: Palette.primary },
  checkOff: { borderWidth: 2, borderColor: Palette.border },
});
