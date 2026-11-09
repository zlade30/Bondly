import { StyleSheet, Text, type TextProps } from 'react-native';

import { Font, Palette } from '@/constants/bondly';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'bodyBold' | 'caption' | 'overline';

export type BTextProps = TextProps & {
  variant?: Variant;
  color?: string;
  center?: boolean;
};

export function BText({ variant = 'body', color, center, style, ...rest }: BTextProps) {
  return (
    <Text
      {...rest}
      style={[
        styles[variant],
        color ? { color } : null,
        center ? styles.center : null,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  display: {
    fontFamily: Font.black,
    fontSize: 40,
    lineHeight: 44,
    color: Palette.ink,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: Font.black,
    fontSize: 28,
    lineHeight: 34,
    color: Palette.ink,
    letterSpacing: -0.3,
  },
  heading: {
    fontFamily: Font.extrabold,
    fontSize: 20,
    lineHeight: 26,
    color: Palette.ink,
  },
  body: {
    fontFamily: Font.semibold,
    fontSize: 16,
    lineHeight: 23,
    color: Palette.inkSoft,
  },
  bodyBold: {
    fontFamily: Font.extrabold,
    fontSize: 16,
    lineHeight: 22,
    color: Palette.ink,
  },
  caption: {
    fontFamily: Font.semibold,
    fontSize: 13,
    lineHeight: 18,
    color: Palette.inkMuted,
  },
  overline: {
    fontFamily: Font.extrabold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: Palette.inkSoft,
  },
  center: { textAlign: 'center' },
});
