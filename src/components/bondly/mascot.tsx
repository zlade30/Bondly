import { useId } from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from 'react-native-svg';

/**
 * Bondlings: Bondly's original soft-blob mascots.
 * Drawn on a 120x120 canvas; the body is a gumdrop with gradient shading,
 * a specular highlight and a ground shadow to read as soft 3D.
 */

export type BondlingColor = 'pink' | 'lavender' | 'blue' | 'yellow' | 'mint' | 'purple' | 'peach';
export type BondlingMood =
  | 'happy'
  | 'content'
  | 'neutral'
  | 'sad'
  | 'upset'
  | 'curious'
  | 'sleepy'
  | 'wink';
export type BondlingProp = 'none' | 'heart' | 'shield' | 'flag' | 'hourglass' | 'sparkles';

const TONES: Record<BondlingColor, { top: string; bottom: string; cheek: string; arm: string }> = {
  pink: { top: '#FFC1A8', bottom: '#FF86B4', cheek: '#FF5C93', arm: '#FFA0BE' },
  peach: { top: '#FFD9B0', bottom: '#FF9E9E', cheek: '#FF6F8C', arm: '#FFB5A6' },
  lavender: { top: '#D9CCFF', bottom: '#9C86FF', cheek: '#F48FC6', arm: '#B6A2FF' },
  blue: { top: '#CFE1FF', bottom: '#8FA8FF', cheek: '#F79ACB', arm: '#A6BCFF' },
  yellow: { top: '#FFF2B3', bottom: '#FFCB5C', cheek: '#FF9D7A', arm: '#FFD97A' },
  mint: { top: '#C9F7E6', bottom: '#6FD6B1', cheek: '#FF9DB8', arm: '#8EE3C6' },
  purple: { top: '#E7D3FF', bottom: '#B48AF0', cheek: '#F48FC6', arm: '#C4A2F5' },
};

const INK = '#2B1760';
const BODY =
  'M60 14 C 90 14, 106 46, 108 76 C 110 102, 90 110, 60 110 C 30 110, 10 102, 12 76 C 14 46, 30 14, 60 14 Z';

type BondlingProps = {
  size?: number;
  color?: BondlingColor;
  mood?: BondlingMood;
  prop?: BondlingProp;
  /** Hide the soft shadow under the body. */
  noShadow?: boolean;
};

export function Bondling({
  size = 120,
  color = 'lavender',
  mood = 'happy',
  prop = 'none',
  noShadow,
}: BondlingProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const tone = TONES[color];

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={`body${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={tone.top} />
          <Stop offset="1" stopColor={tone.bottom} />
        </LinearGradient>
        <RadialGradient id={`hi${uid}`} cx="0.36" cy="0.3" r="0.55">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.75} />
          <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity={0.08} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`rim${uid}`} cx="0.5" cy="0.45" r="0.6">
          <Stop offset="0.7" stopColor={tone.bottom} stopOpacity={0} />
          <Stop offset="1" stopColor={tone.bottom} stopOpacity={0.55} />
        </RadialGradient>
        <RadialGradient id={`shadow${uid}`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#7C5CFC" stopOpacity={0.22} />
          <Stop offset="1" stopColor="#7C5CFC" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {!noShadow && <Ellipse cx={60} cy={111} rx={44} ry={7} fill={`url(#shadow${uid})`} />}

      <Path d={BODY} fill={`url(#body${uid})`} />
      <Path d={BODY} fill={`url(#rim${uid})`} />
      <Path d={BODY} fill={`url(#hi${uid})`} />

      {/* cheeks */}
      <Ellipse cx={36} cy={72} rx={8} ry={5} fill={tone.cheek} opacity={0.28} />
      <Ellipse cx={84} cy={72} rx={8} ry={5} fill={tone.cheek} opacity={0.28} />

      <Face mood={mood} />
      <HeldProp prop={prop} arm={tone.arm} uid={uid} />
    </Svg>
  );
}

function Face({ mood }: { mood: BondlingMood }) {
  const stroke = { stroke: INK, strokeWidth: 3.4, strokeLinecap: 'round' as const, fill: 'none' };
  const dotEyes = (
    <>
      <Circle cx={47} cy={60} r={4.2} fill={INK} />
      <Circle cx={73} cy={60} r={4.2} fill={INK} />
      <Circle cx={48.4} cy={58.6} r={1.3} fill="#FFFFFF" />
      <Circle cx={74.4} cy={58.6} r={1.3} fill="#FFFFFF" />
    </>
  );
  const smileEyes = (
    <>
      <Path d="M41 60 Q 47 66 53 60" {...stroke} />
      <Path d="M67 60 Q 73 66 79 60" {...stroke} />
    </>
  );

  switch (mood) {
    case 'happy':
      return (
        <G>
          {dotEyes}
          <Path d="M53 70 Q 60 78 67 70" {...stroke} />
        </G>
      );
    case 'content':
      return (
        <G>
          {smileEyes}
          <Path d="M54 71 Q 60 76 66 71" {...stroke} />
        </G>
      );
    case 'sleepy':
      return (
        <G>
          <Path d="M41 62 Q 47 57 53 62" {...stroke} />
          <Path d="M67 62 Q 73 57 79 62" {...stroke} />
          <Path d="M55 72 Q 60 75 65 72" {...stroke} />
        </G>
      );
    case 'neutral':
      return (
        <G>
          {dotEyes}
          <Path d="M54 73 L 66 72" {...stroke} />
        </G>
      );
    case 'sad':
      return (
        <G>
          {/* Brows raised in the middle read as sad; lowered in the middle would read as angry. */}
          <Path d="M40 54 L 50 50" {...stroke} strokeWidth={3} />
          <Path d="M80 54 L 70 50" {...stroke} strokeWidth={3} />
          {dotEyes}
          <Path d="M53 75 Q 60 69 67 75" {...stroke} />
        </G>
      );
    case 'upset':
      return (
        <G>
          <Path d="M41 55 L 51 60 L 41 65" {...stroke} strokeLinejoin="round" />
          <Path d="M79 55 L 69 60 L 79 65" {...stroke} strokeLinejoin="round" />
          <Path d="M51 74 Q 55.5 70 60 74 Q 64.5 78 69 74" {...stroke} />
        </G>
      );
    case 'curious':
      return (
        <G>
          <Circle cx={47} cy={59} r={5.4} fill={INK} />
          <Circle cx={73} cy={59} r={5.4} fill={INK} />
          <Circle cx={49} cy={57} r={1.8} fill="#FFFFFF" />
          <Circle cx={75} cy={57} r={1.8} fill="#FFFFFF" />
          <Ellipse cx={60} cy={73} rx={3.4} ry={4} fill={INK} />
        </G>
      );
    case 'wink':
      return (
        <G>
          <Circle cx={47} cy={60} r={4.2} fill={INK} />
          <Circle cx={48.4} cy={58.6} r={1.3} fill="#FFFFFF" />
          <Path d="M67 61 Q 73 66 79 61" {...stroke} />
          <Path d="M52 70 Q 60 79 68 70" {...stroke} />
        </G>
      );
  }
}

function HeldProp({ prop, arm, uid }: { prop: BondlingProp; arm: string; uid: string }) {
  if (prop === 'none') return null;

  const arms = (
    <>
      <Ellipse cx={42} cy={92} rx={9} ry={7} fill={arm} />
      <Ellipse cx={78} cy={92} rx={9} ry={7} fill={arm} />
    </>
  );

  switch (prop) {
    case 'heart':
      return (
        <G>
          <Heart x={60} y={92} size={30} uid={`h${uid}`} />
          {arms}
        </G>
      );
    case 'shield':
      return (
        <G>
          <Path
            d="M60 76 L 76 82 C 76 96, 70 104, 60 108 C 50 104, 44 96, 44 82 Z"
            fill="#9C86FF"
          />
          <Path d="M54 90 C 54 86, 60 86, 60 90 C 60 86, 66 86, 66 90 C 66 94, 60 98, 60 98 C 60 98, 54 94, 54 90 Z" fill="#FFFFFF" />
          {arms}
        </G>
      );
    case 'flag':
      return (
        <G>
          <Path d="M98 40 L 98 96" stroke="#C98B6B" strokeWidth={3} strokeLinecap="round" />
          <Path d="M98 40 L 118 46 L 98 54 Z" fill="#FF8FA3" />
          <Ellipse cx={96} cy={84} rx={8} ry={7} fill={arm} />
        </G>
      );
    case 'hourglass':
      return (
        <G>
          <Path d="M50 78 L 70 78 L 62 92 L 70 106 L 50 106 L 58 92 Z" fill="#FFFFFF" opacity={0.9} />
          <Path d="M53 102 L 67 102 L 60 94 Z" fill="#FFB36B" />
          <Path d="M48 76 H 72 M48 108 H 72" stroke="#9C86FF" strokeWidth={4} strokeLinecap="round" />
          {arms}
        </G>
      );
    case 'sparkles':
      return (
        <G>
          <Sparkle x={14} y={28} size={10} />
          <Sparkle x={106} y={22} size={8} />
          <Sparkle x={110} y={58} size={6} />
        </G>
      );
  }
}

export function Heart({
  x,
  y,
  size,
  uid,
  colors = ['#FFB3D1', '#FF5C98'],
}: {
  x: number;
  y: number;
  size: number;
  uid: string;
  colors?: [string, string];
}) {
  const s = size / 24;
  return (
    <G transform={`translate(${x - size / 2} ${y - size / 2}) scale(${s})`}>
      <Defs>
        <LinearGradient id={uid} x1="0" y1="0" x2="0.6" y2="1">
          <Stop offset="0" stopColor={colors[0]} />
          <Stop offset="1" stopColor={colors[1]} />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 21.6 C 5 16.8, 1.5 13, 1.5 8.4 C 1.5 5.2, 4 2.7, 7.1 2.7 C 9.1 2.7, 10.9 3.8, 12 5.4 C 13.1 3.8, 14.9 2.7, 16.9 2.7 C 20 2.7, 22.5 5.2, 22.5 8.4 C 22.5 13, 19 16.8, 12 21.6 Z"
        fill={`url(#${uid})`}
      />
      <Ellipse cx={7.2} cy={7.4} rx={2.4} ry={1.5} fill="#FFFFFF" opacity={0.55} />
    </G>
  );
}

function Sparkle({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <Path
      d={`M${x} ${y - size} Q ${x + size * 0.2} ${y - size * 0.2} ${x + size} ${y} Q ${x + size * 0.2} ${y + size * 0.2} ${x} ${y + size} Q ${x - size * 0.2} ${y + size * 0.2} ${x - size} ${y} Q ${x - size * 0.2} ${y - size * 0.2} ${x} ${y - size} Z`}
      fill="#FFD66B"
    />
  );
}

/** Standalone floating heart. */
export function HeartIcon({ size = 32, colors }: { size?: number; colors?: [string, string] }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Heart x={12} y={12} size={24} uid={`hi${uid}`} colors={colors} />
    </Svg>
  );
}

/** The hero illustration: a pink Bondling hugging a bigger lavender one. */
export function HuggingPair({ width = 300 }: { width?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const height = (width * 250) / 300;
  const stroke = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round' as const, fill: 'none' };

  const big =
    'M196 30 C 246 30, 278 84, 280 140 C 282 196, 250 222, 196 222 C 142 222, 114 196, 116 140 C 118 84, 146 30, 196 30 Z';
  const small =
    'M104 88 C 142 88, 166 124, 168 164 C 170 206, 144 228, 104 228 C 64 228, 38 206, 40 164 C 42 124, 66 88, 104 88 Z';

  return (
    <Svg width={width} height={height} viewBox="0 0 300 250">
      <Defs>
        <LinearGradient id={`big${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#D6CCFF" />
          <Stop offset="1" stopColor="#8F9CFF" />
        </LinearGradient>
        <LinearGradient id={`small${uid}`} x1="0.2" y1="0" x2="0.7" y2="1">
          <Stop offset="0" stopColor="#FFC9A8" />
          <Stop offset="1" stopColor="#FF7FB2" />
        </LinearGradient>
        <RadialGradient id={`hi${uid}`} cx="0.36" cy="0.28" r="0.55">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.7} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`cloud${uid}`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.95} />
          <Stop offset="1" stopColor="#F3ECFF" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* cloud they sit on */}
      <Ellipse cx={160} cy={226} rx={150} ry={26} fill={`url(#cloud${uid})`} />

      {/* big lavender Bondling */}
      <Path d={big} fill={`url(#big${uid})`} />
      <Path d={big} fill={`url(#hi${uid})`} />
      <Ellipse cx={176} cy={118} rx={12} ry={7} fill="#F48FC6" opacity={0.3} />
      <Ellipse cx={246} cy={118} rx={12} ry={7} fill="#F48FC6" opacity={0.3} />
      <Circle cx={186} cy={102} r={6} fill={INK} />
      <Circle cx={236} cy={104} r={6} fill={INK} />
      <Path d="M200 112 Q 211 122 222 112" {...stroke} />

      {/* hugging arm, drawn first so it comes out from behind the pink body */}
      <Path
        d="M140 176 C 160 168, 178 160, 190 152 C 200 146, 210 154, 204 164 C 196 176, 172 190, 150 196 Z"
        fill="#FF9EBF"
      />

      {/* small pink Bondling */}
      <Path d={small} fill={`url(#small${uid})`} />
      <Path d={small} fill={`url(#hi${uid})`} />
      <Ellipse cx={80} cy={152} rx={11} ry={6.5} fill="#FF5C93" opacity={0.28} />
      <Ellipse cx={142} cy={146} rx={11} ry={6.5} fill="#FF5C93" opacity={0.28} />
      <Path d="M84 138 Q 92 146 100 138" {...stroke} />
      <Path d="M118 134 Q 126 142 134 134" {...stroke} />
      <Path d="M104 152 Q 110 157 116 152" {...stroke} stroke="#E0457E" />

      {/* hand resting on the lavender one */}
      <Ellipse cx={198} cy={156} rx={12} ry={11} fill="#FFA9C6" />
    </Svg>
  );
}
