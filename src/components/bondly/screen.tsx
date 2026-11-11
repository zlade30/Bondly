import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gradients, Palette, Radius, Space } from '@/constants/bondly';

import { BackButton, CloseButton } from './buttons';
import { BText } from './text';

type ScreenProps = {
  children: ReactNode;
  /** Pinned to the bottom, above the safe area (buttons). */
  footer?: ReactNode;
  onBack?: () => void;
  /** Shows an X instead of a back arrow. */
  onClose?: () => void;
  /** 0..1; omit to hide the progress bar. */
  progress?: number;
  headerLabel?: string;
  scroll?: boolean;
  contentStyle?: ViewStyle;
};

export function Screen({
  children,
  footer,
  onBack,
  onClose,
  progress,
  headerLabel,
  scroll,
  contentStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const showHeader = onBack || onClose || progress !== undefined || headerLabel;

  const body = (
    <View style={[styles.content, contentStyle]}>{children}</View>
  );

  return (
    <View style={styles.root}>
      <LinearGradient colors={Gradients.screen} style={StyleSheet.absoluteFill} />
      <View style={{ height: insets.top }} />

      {showHeader && (
        <View style={styles.header}>
          <View style={styles.headerSide}>
            {onClose ? <CloseButton onPress={onClose} /> : onBack && <BackButton onPress={onBack} />}
          </View>
          <View style={styles.headerCenter}>
            {progress !== undefined ? (
              <ProgressBar value={progress} />
            ) : headerLabel ? (
              <BText variant="caption" center>
                {headerLabel}
              </BText>
            ) : null}
          </View>
          <View style={styles.headerSide} />
        </View>
      )}

      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        body
      )}

      {footer && (
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, Space.lg) + 4 }]}>
          {footer}
        </View>
      )}
      {!footer && <View style={{ height: insets.bottom }} />}
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const width = useSharedValue(value);
  useEffect(() => {
    width.value = withTiming(value, { duration: 450, easing: Easing.out(Easing.cubic) });
  }, [value, width]);
  const fill = useAnimatedStyle(() => ({ width: `${Math.max(0.04, width.value) * 100}%` }));

  return (
    <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <Animated.View style={[styles.trackFill, fill]}>
        <LinearGradient
          colors={Gradients.progress}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

/** How much of each Float's distance is used, and how much slower it moves. */
const GENTLER = 0.4;
const SLOWER = 1.4;

/** Gently bobs its children up and down, like the mascots are breathing. */
export function Float({
  children,
  distance = 8,
  duration = 1800,
  delay = 0,
  style,
}: {
  children: ReactNode;
  distance?: number;
  duration?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useSharedValue(0);
  useEffect(() => {
    // Kept small and slow on purpose: a soft breath, not a bounce.
    const slow = duration * SLOWER;
    t.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: slow, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: slow, easing: Easing.inOut(Easing.sin) })
        ),
        -1
      )
    );
  }, [t, duration, delay]);
  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: -distance * GENTLER * t.value }] }));
  return <Animated.View style={[style, animated]}>{children}</Animated.View>;
}

export function SpeechBubble({ children, tail = 'left' }: { children: ReactNode; tail?: 'left' | 'bottom' }) {
  return (
    <View style={styles.bubbleWrap}>
      {tail === 'left' && <View style={[styles.tail, styles.tailLeft]} />}
      <View style={styles.bubble}>{children}</View>
      {tail === 'bottom' && <View style={[styles.tail, styles.tailBottom]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.surfaceSoft },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Space.lg,
    paddingTop: Space.sm,
    paddingBottom: Space.md,
    gap: Space.md,
  },
  headerSide: { width: 40, height: 40, justifyContent: 'center' },
  headerCenter: { flex: 1 },
  content: { flex: 1, paddingHorizontal: Space.xl },
  scrollContent: { flexGrow: 1, paddingBottom: Space.xl },
  footer: { paddingHorizontal: Space.xl, paddingTop: Space.md, gap: Space.md },
  track: {
    height: 10,
    borderRadius: Radius.pill,
    backgroundColor: Palette.track,
    overflow: 'hidden',
  },
  trackFill: { height: '100%', borderRadius: Radius.pill, overflow: 'hidden' },
  bubbleWrap: { flexShrink: 1, alignItems: 'flex-start', flexDirection: 'row' },
  bubble: {
    flexShrink: 1,
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    paddingVertical: Space.md,
    paddingHorizontal: Space.lg,
    shadowColor: '#7C5CFC',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  tail: {
    width: 16,
    height: 16,
    backgroundColor: Palette.white,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
  tailLeft: { marginTop: 22, marginRight: -9, zIndex: 1 },
  tailBottom: { position: 'absolute', bottom: -6, left: 32 },
});
