import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Gradients, Palette, Radius, Shadow } from '@/constants/bondly';

import { BText } from './text';

export function tapFeedback() {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync().catch(() => {});
  }
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  icon?: ReactNode;
};

export function PrimaryButton({ label, onPress, disabled, style, icon }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [
        styles.base,
        !disabled && Shadow.button,
        pressed && styles.pressed,
        style,
      ]}>
      {disabled ? (
        <View style={[styles.fill, styles.disabledFill]}>
          <BText variant="bodyBold" color={Palette.inkMuted} style={styles.label}>
            {label}
          </BText>
        </View>
      ) : (
        <LinearGradient
          colors={Gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}>
          {icon}
          <BText variant="bodyBold" color={Palette.white} style={styles.label}>
            {label}
          </BText>
        </LinearGradient>
      )}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress, style }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [styles.base, styles.secondary, pressed && styles.pressed, style]}>
      <BText variant="bodyBold" color={Palette.primaryDeep} style={styles.label}>
        {label}
      </BText>
    </Pressable>
  );
}

export function TextButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [styles.textButton, pressed && { opacity: 0.6 }]}>
      <BText variant="bodyBold" color={disabled ? Palette.inkMuted : Palette.inkSoft}>
        {label}
      </BText>
    </Pressable>
  );
}

/** Round floating "next" button with an arrow, as on the question screens. */
export function NextFab({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continue"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [
        styles.fab,
        !disabled && Shadow.button,
        pressed && styles.pressed,
        disabled && { opacity: 0.45 },
      ]}>
      <LinearGradient
        colors={disabled ? ['#D9D0EE', '#CFC4EA'] : Gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.fabFill}>
        <Svg width={26} height={26} viewBox="0 0 24 24">
          <Path
            d="M5 12h13M13 6l6 6-6 6"
            stroke={Palette.white}
            strokeWidth={2.6}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </LinearGradient>
    </Pressable>
  );
}

export function BackButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}>
      <Svg width={22} height={22} viewBox="0 0 24 24">
        <Path
          d="M15 5l-7 7 7 7"
          stroke={Palette.ink}
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </Pressable>
  );
}

export function CloseButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Close"
      hitSlop={12}
      onPress={onPress}
      style={({ pressed }) => [styles.back, pressed && { opacity: 0.6 }]}>
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Path
          d="M6 6l12 12M18 6L6 18"
          stroke={Palette.ink}
          strokeWidth={2.6}
          strokeLinecap="round"
          fill="none"
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 58,
    borderRadius: Radius.pill,
  },
  fill: {
    flex: 1,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  disabledFill: {
    backgroundColor: Palette.track,
  },
  label: {
    fontSize: 17,
  },
  secondary: {
    backgroundColor: Palette.lilac,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.92,
  },
  textButton: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  fabFill: {
    flex: 1,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
