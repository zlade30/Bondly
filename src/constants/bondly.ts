/**
 * Bondly design tokens: soft pink-to-lavender pastels, deep plum ink,
 * and a violet primary. Bondly is light-only for now.
 */

export const Palette = {
  ink: '#2B1760',
  inkSoft: '#6B5B95',
  inkMuted: '#9A8FB8',
  primary: '#7C5CFC',
  primaryDeep: '#6644EE',
  pink: '#FF7EB6',
  coral: '#FF9C8A',
  white: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSoft: '#F7F2FF',
  border: '#EDE6FA',
  track: '#ECE6F7',
  success: '#3DBE8B',
  warning: '#FF6F7D',
  /** Error and destructive text; passes AA contrast on white and on errorTint. */
  danger: '#B3263A',
  errorTint: '#FFE4E8',

  // Card tints (from the journey cards)
  blush: '#FDE6F1',
  mint: '#DDF5EA',
  sky: '#E4E9FF',
  butter: '#FFF4D6',
  lilac: '#EFE7FF',
} as const;

export const Gradients = {
  /** Page background, top to bottom. */
  screen: ['#FFF1F8', '#F8F1FF', '#FBF8FF'] as const,
  /** Primary call-to-action. */
  primary: ['#FF8FC0', '#9B6BFF', '#7C5CFC'] as const,
  /** Progress and slider fills. */
  progress: ['#C6A8FF', '#7C5CFC'] as const,
  /** Today's lesson style highlight card. */
  blushCard: ['#FCE1EF', '#F7E4F6'] as const,
};

export const Font = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extrabold: 'Nunito_800ExtraBold',
  black: 'Nunito_900Black',
} as const;

export const Radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export const Space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Shadow = {
  soft: {
    shadowColor: '#7C5CFC',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  button: {
    shadowColor: '#7C5CFC',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
} as const;
