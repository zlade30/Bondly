import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Line, Polygon, Stop } from 'react-native-svg';

import { Palette } from '@/constants/bondly';

import { BText } from './text';

type Axis = { label: string; value: number };

/** A soft pentagon radar chart. Values are 0..1. */
export function RadarChart({ axes, size = 240 }: { axes: Axis[]; size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const pad = 56;
  const total = size + pad * 2;
  const c = total / 2;
  const r = size / 2;
  const n = axes.length;

  const point = (i: number, scale: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return { x: c + Math.cos(angle) * r * scale, y: c + Math.sin(angle) * r * scale };
  };
  const ring = (scale: number) =>
    axes.map((_, i) => point(i, scale)).map((p) => `${p.x},${p.y}`).join(' ');
  const shape = axes
    .map((a, i) => point(i, Math.max(0.12, a.value)))
    .map((p) => `${p.x},${p.y}`)
    .join(' ');

  return (
    <View style={{ width: total, height: total, alignSelf: 'center' }}>
      <Svg width={total} height={total}>
        <Defs>
          <LinearGradient id={`fill${uid}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FF8FC0" stopOpacity={0.75} />
            <Stop offset="1" stopColor="#7C5CFC" stopOpacity={0.75} />
          </LinearGradient>
        </Defs>
        {[1, 0.75, 0.5, 0.25].map((s) => (
          <Polygon
            key={s}
            points={ring(s)}
            fill={s === 1 ? 'rgba(255,255,255,0.7)' : 'none'}
            stroke={Palette.border}
            strokeWidth={1.5}
          />
        ))}
        {axes.map((_, i) => {
          const p = point(i, 1);
          return <Line key={i} x1={c} y1={c} x2={p.x} y2={p.y} stroke={Palette.border} strokeWidth={1.5} />;
        })}
        <Polygon points={shape} fill={`url(#fill${uid})`} stroke={Palette.primary} strokeWidth={2.5} strokeLinejoin="round" />
        {axes.map((a, i) => {
          const p = point(i, Math.max(0.12, a.value));
          return <Circle key={i} cx={p.x} cy={p.y} r={4.5} fill={Palette.white} stroke={Palette.primary} strokeWidth={2.5} />;
        })}
      </Svg>

      {axes.map((a, i) => {
        const p = point(i, 1.22);
        return (
          <View key={a.label} style={[styles.label, { left: p.x - 55, top: p.y - 20 }]}>
            <BText variant="caption" color={Palette.ink} center style={styles.labelName}>
              {a.label}
            </BText>
            <BText variant="caption" center>
              {Math.round(a.value * 100)}%
            </BText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { position: 'absolute', width: 110, alignItems: 'center' },
  labelName: { fontFamily: 'Nunito_800ExtraBold' },
});
