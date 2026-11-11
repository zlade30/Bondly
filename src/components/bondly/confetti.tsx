import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

/**
 * A one-off confetti celebration: a burst that shoots up from a point and
 * tumbles down, plus a lighter shower from the top of the screen. It doesn't
 * block touches, and it's skipped entirely when the system asks for reduced motion.
 */

const COLORS = ['#FF86B4', '#FFCB5C', '#8FA8FF', '#6FD6B1', '#B48AF0', '#FF9E9E', '#7C5CFC'];
const GRAVITY = 1100; // points per second²

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  spin: number;
  sway: number;
  w: number;
  h: number;
  round: boolean;
  color: string;
  delay: number;
  duration: number;
};

function makePieces(width: number, origin: { x: number; y: number }): Piece[] {
  const rand = (a: number, b: number) => a + Math.random() * (b - a);
  const piece = (base: Partial<Piece>): Piece => {
    const round = Math.random() < 0.3;
    const size = rand(7, 12);
    return {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      spin: rand(-900, 900),
      sway: rand(6, 18),
      w: round ? size : size * 0.7,
      h: round ? size : size * 1.5,
      round,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      delay: 0,
      duration: rand(2200, 3200),
      ...base,
    };
  };

  // The burst: thrown upwards and outwards, then pulled down by gravity.
  const burst = Array.from({ length: 70 }, () => {
    const angle = -Math.PI / 2 + rand(-1, 1) * 1.05;
    const speed = rand(520, 980);
    return piece({
      x: origin.x,
      y: origin.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      delay: rand(0, 120),
    });
  });

  // The shower: drifting down from above the screen a moment later.
  const shower = Array.from({ length: 36 }, () =>
    piece({
      x: rand(0, width),
      y: rand(-80, -20),
      vx: rand(-30, 30),
      vy: rand(60, 160),
      delay: rand(250, 900),
      duration: rand(2600, 3600),
    })
  );

  return [...burst, ...shower];
}

function ConfettiPiece({ p }: { p: Piece }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(p.delay, withTiming(1, { duration: p.duration, easing: Easing.linear }));
  }, [p, t]);

  const style = useAnimatedStyle(() => {
    const secs = (t.value * p.duration) / 1000;
    const x = p.x + p.vx * secs + Math.sin(secs * 6) * p.sway;
    const y = p.y + p.vy * secs + 0.5 * GRAVITY * secs * secs;
    return {
      opacity: t.value === 0 ? 0 : t.value > 0.8 ? (1 - t.value) / 0.2 : 1,
      transform: [
        { translateX: x - p.w / 2 },
        { translateY: y - p.h / 2 },
        { rotate: `${p.spin * secs}deg` },
        // A flip on one axis makes flat pieces flutter.
        { scaleX: Math.cos(secs * 9) },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.piece,
        { width: p.w, height: p.h, backgroundColor: p.color, borderRadius: p.round ? p.w / 2 : 2 },
        style,
      ]}
    />
  );
}

/** `origin` is where the burst starts, in screen points; it defaults to the upper middle. */
export function Confetti({ origin }: { origin?: { x: number; y: number } }) {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const pieces = useMemo(
    () => makePieces(width, origin ?? { x: width / 2, y: height * 0.36 }),
    // Only once per mount: a new burst each time the screen appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (reduceMotion) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {pieces.map((p, i) => (
        <ConfettiPiece key={i} p={p} />
      ))}
    </View>
  );
}

/** Confetti that bursts after `delay` ms, so it can land on a beat of the screen's own animation. */
export function ConfettiAfter({ delay }: { delay: number }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return show ? <Confetti /> : null;
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', left: 0, top: 0 },
});
