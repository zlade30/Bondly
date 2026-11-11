import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type GestureResponderEvent,
  type LayoutChangeEvent,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Gradients, Palette, Radius, Space } from '@/constants/bondly';

import { tapFeedback } from './buttons';
import { BText } from './text';

const STEPS = 5;
const THUMB = 34;
const BAR_HEIGHTS = [120, 84, 56, 84, 120];

type Props = {
  value: number | null;
  onChange: (value: number) => void;
  leftLabel: string;
  rightLabel: string;
};

/** A five-step "which side are you closer to" slider. Drag the thumb or tap a bar. */
export function ScaleSlider({ value, onChange, leftLabel, rightLabel }: Props) {
  const [width, setWidth] = useState(0);
  const position = value ?? 2;
  const x = useSharedValue(0);

  useEffect(() => {
    if (width > 0) {
      x.value = withSpring((position / (STEPS - 1)) * (width - THUMB), { damping: 22, stiffness: 220, overshootClamping: true });
    }
  }, [position, width, x]);

  /** Map a touch on the track to the nearest step. */
  const pick = (e: GestureResponderEvent) => {
    if (!width) return;
    const ratio = Math.min(1, Math.max(0, (e.nativeEvent.locationX - THUMB / 2) / (width - THUMB)));
    const step = Math.round(ratio * (STEPS - 1));
    if (step !== value) {
      tapFeedback();
      onChange(step);
    }
  };

  const thumbStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.root}>
      <View style={styles.bars}>
        {BAR_HEIGHTS.map((h, i) => {
          const active = value !== null && i === value;
          return (
            <Pressable
              key={i}
              accessibilityRole="adjustable"
              accessibilityLabel={`Option ${i + 1} of ${STEPS}`}
              accessibilityState={{ selected: active }}
              onPress={() => {
                tapFeedback();
                onChange(i);
              }}
              style={styles.barSlot}>
              <View style={[styles.bar, { height: h }, active && styles.barActive]}>
                {active && (
                  <LinearGradient
                    colors={Gradients.progress}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
              </View>
            </Pressable>
          );
        })}
      </View>

      <View
        style={styles.trackArea}
        onLayout={onLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderTerminationRequest={() => false}
        onResponderGrant={pick}
        onResponderMove={pick}>
        <View style={styles.track} pointerEvents="none" />
        <Animated.View style={[styles.thumb, thumbStyle]} pointerEvents="none">
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.thumbFill}
          />
        </Animated.View>
      </View>

      <View style={styles.labels}>
        <BText variant="bodyBold" style={[styles.label, value !== null && value <= 1 && styles.labelOn]}>
          {leftLabel}
        </BText>
        <BText
          variant="bodyBold"
          style={[styles.label, styles.labelRight, value !== null && value >= 3 && styles.labelOn]}>
          {rightLabel}
        </BText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Space.lg },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
  },
  barSlot: { width: THUMB, alignItems: 'center', justifyContent: 'flex-end', height: '100%' },
  bar: {
    width: 14,
    borderRadius: Radius.pill,
    backgroundColor: 'rgba(124,92,252,0.10)',
    overflow: 'hidden',
  },
  barActive: { width: 16 },
  trackArea: { height: THUMB, justifyContent: 'center' },
  track: {
    height: 12,
    borderRadius: Radius.pill,
    backgroundColor: Palette.track,
    marginHorizontal: THUMB / 2 - 6,
  },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 4,
    borderColor: Palette.white,
    shadowColor: '#7C5CFC',
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  thumbFill: { flex: 1, borderRadius: THUMB / 2 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', gap: Space.xl },
  label: { flex: 1, color: Palette.inkSoft, fontSize: 15 },
  labelRight: { textAlign: 'right' },
  labelOn: { color: Palette.ink },
});
