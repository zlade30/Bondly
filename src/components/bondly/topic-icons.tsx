import { useId, type ReactNode } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { INK, TONES, type BondlingColor } from './mascot';
import { MORE_TOPIC_ICONS, moreArt, type MoreTopicIconName } from './topic-icons-more';

/**
 * Topic icons for journey levels, drawn in the same soft-3D style as the
 * Bondling mascots: a gradient body, a darker rim, a glossy highlight, rosy
 * cheeks and a little face where the shape has room for one.
 */

type FriendsIconName =
  'envelope' | 'ear' | 'speech' | 'shield' | 'calendar' | 'scales' | 'bandage' | 'sprout' | 'hug' | 'party';

/** Every topic icon: the friends journey's ten, then one per level for the other journeys. */
export type TopicIconName = FriendsIconName | MoreTopicIconName;

export const TOPIC_ICONS: TopicIconName[] = [
  'envelope',
  'ear',
  'speech',
  'shield',
  'calendar',
  'scales',
  'bandage',
  'sprout',
  'hug',
  'party',
  ...MORE_TOPIC_ICONS,
];

/** A rounded rectangle as a path, so it can take the same soft shading as any other shape. */
function rr(x: number, y: number, w: number, h: number, r: number) {
  return `M${x + r} ${y} H${x + w - r} Q${x + w} ${y} ${x + w} ${y + r} V${y + h - r} Q${x + w} ${y + h} ${x + w - r} ${y + h} H${x + r} Q${x} ${y + h} ${x} ${y + h - r} V${y + r} Q${x} ${y} ${x + r} ${y} Z`;
}

/** A heart in a 24-unit box, placed at (x, y) and scaled. */
function heart(x: number, y: number, s: number) {
  const p = (px: number, py: number) => `${x + px * s} ${y + py * s}`;
  return `M${p(12, 21)} C${p(5, 15)} ${p(2, 11)} ${p(2, 7.5)} C${p(2, 4.5)} ${p(4.5, 2)} ${p(7.5, 2)} C${p(9.5, 2)} ${p(11, 3)} ${p(12, 5)} C${p(13, 3)} ${p(14.5, 2)} ${p(16.5, 2)} C${p(19.5, 2)} ${p(22, 4.5)} ${p(22, 7.5)} C${p(22, 11)} ${p(19, 15)} ${p(12, 21)} Z`;
}

const SPARKLE = (x: number, y: number, s: number) =>
  `M${x} ${y - s} Q ${x + s * 0.2} ${y - s * 0.2} ${x + s} ${y} Q ${x + s * 0.2} ${y + s * 0.2} ${x} ${y + s} Q ${x - s * 0.2} ${y + s * 0.2} ${x - s} ${y} Q ${x - s * 0.2} ${y - s * 0.2} ${x} ${y - s} Z`;

export function TopicIcon({
  name,
  color = 'lavender',
  size = 96,
  sparkles,
  noShadow,
}: {
  name: TopicIconName;
  color?: BondlingColor;
  size?: number;
  /** Little stars around the icon, e.g. once a level is complete. */
  sparkles?: boolean;
  noShadow?: boolean;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const tone = TONES[color];
  const body = `url(#body${uid})`;

  /** Draws a shape with the mascot's three layers: body colour, darker rim, glossy highlight. */
  const soft = (d: string, key?: string) => (
    <G key={key}>
      <Path d={d} fill={body} />
      <Path d={d} fill={`url(#rim${uid})`} />
      <Path d={d} fill={`url(#hi${uid})`} />
    </G>
  );

  /** Eyes, smile and cheeks, centred at (x, y). */
  const face = (x: number, y: number, s = 1) => (
    <G>
      <Ellipse cx={x - 17 * s} cy={y + 7 * s} rx={6.5 * s} ry={4 * s} fill={tone.cheek} opacity={0.32} />
      <Ellipse cx={x + 17 * s} cy={y + 7 * s} rx={6.5 * s} ry={4 * s} fill={tone.cheek} opacity={0.32} />
      <Circle cx={x - 9 * s} cy={y} r={3.8 * s} fill={INK} />
      <Circle cx={x + 9 * s} cy={y} r={3.8 * s} fill={INK} />
      <Circle cx={x - 7.8 * s} cy={y - 1.2 * s} r={1.2 * s} fill="#FFFFFF" />
      <Circle cx={x + 10.2 * s} cy={y - 1.2 * s} r={1.2 * s} fill="#FFFFFF" />
      <Path
        d={`M${x - 6 * s} ${y + 7 * s} Q ${x} ${y + 12.5 * s} ${x + 6 * s} ${y + 7 * s}`}
        stroke={INK}
        strokeWidth={3 * s}
        strokeLinecap="round"
        fill="none"
      />
    </G>
  );

  /** A shape in another gradient, with the same glossy highlight. */
  const tinted = (d: string, fill: string, key?: string) => (
    <G key={key}>
      <Path d={d} fill={fill} />
      <Path d={d} fill={`url(#hi${uid})`} />
    </G>
  );

  const line = { stroke: INK, strokeLinecap: 'round' as const, fill: 'none' };
  const PINK = { top: '#FFC1D6', bottom: '#FF6FA5' };
  const GREEN = { top: '#B8F0D8', bottom: '#3DBE8B' };

  const art: Record<TopicIconName, ReactNode> = {
    ...moreArt({
      soft,
      tinted,
      face,
      body,
      pink: `url(#pink${uid})`,
      green: `url(#green${uid})`,
      gold: `url(#gold${uid})`,
      sky: `url(#sky${uid})`,
      ink: INK,
      cheek: tone.cheek,
      rr,
      heart,
    }),
    // Reaching out: a happy letter on its way, with a little heart.
    envelope: (
      <>
        {soft(rr(16, 34, 88, 64, 14))}
        <Path
          d="M24 42 L60 70 L96 42"
          stroke="#FFFFFF"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.85}
        />
        {face(60, 80, 0.8)}
        <Path d={heart(82, 12, 1.25)} fill={`url(#pink${uid})`} />
      </>
    ),
    // Being present: an ear catching sound waves.
    ear: (
      <>
        <Path d="M28 50 C 22 58, 22 70, 28 78" {...line} strokeWidth={4.5} opacity={0.3} />
        <Path d="M16 42 C 6 56, 6 72, 16 86" {...line} strokeWidth={4.5} opacity={0.18} />
        {soft(
          'M68 14 C 94 14, 106 36, 100 60 C 96 75, 84 80, 80 92 C 76 104, 60 110, 50 102 C 42 96, 42 86, 48 80 C 54 74, 54 68, 48 60 C 38 47, 42 14, 68 14 Z'
        )}
        <Path d="M60 38 C 66 26, 88 27, 90 48 C 91 60, 82 66, 78 76" {...line} strokeWidth={6} opacity={0.2} />
        <Path d="M62 62 C 66 54, 76 56, 74 66" {...line} strokeWidth={5} opacity={0.2} />
        <Ellipse cx={86} cy={64} rx={6} ry={4} fill={tone.cheek} opacity={0.32} />
      </>
    ),
    // Honest words: a friendly speech bubble.
    speech: (
      <>
        {soft('M38 80 L30 104 L58 82 Z')}
        {soft(rr(14, 20, 92, 66, 26))}
        {face(60, 50)}
      </>
    ),
    // Healthy space: a gentle shield.
    shield: (
      <>
        {soft('M60 12 C 74 21, 88 23, 102 23 C 102 63, 89 93, 60 108 C 31 93, 18 63, 18 23 C 32 23, 46 21, 60 12 Z')}
        {face(60, 56)}
      </>
    ),
    // Being reliable: a calendar with the day ticked off.
    calendar: (
      <>
        {soft(rr(18, 28, 84, 74, 16))}
        <Path d={rr(18, 28, 84, 24, 16)} fill={tone.cheek} opacity={0.55} />
        <Path d={rr(18, 40, 84, 12, 0)} fill={tone.cheek} opacity={0.55} />
        <Path d={rr(38, 18, 9, 20, 4.5)} fill={INK} />
        <Path d={rr(73, 18, 9, 20, 4.5)} fill={INK} />
        <Path
          d="M42 76 L54 87 L78 63"
          stroke="#FFFFFF"
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M42 76 L54 87 L78 63"
          stroke={INK}
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </>
    ),
    // Different views: scales in balance.
    scales: (
      <>
        <Path d="M28 38 L18 66 M28 38 L38 66 M92 38 L82 66 M92 38 L102 66" {...line} strokeWidth={2.5} opacity={0.4} />
        {soft(rr(55, 30, 10, 68, 5))}
        {soft(rr(20, 32, 80, 9, 4.5))}
        {soft('M10 66 Q 28 86, 46 66 Z')}
        {soft('M74 66 Q 92 86, 110 66 Z')}
        {soft(rr(34, 94, 52, 14, 7))}
        <Circle cx={60} cy={27} r={7} fill={body} />
        <Circle cx={58} cy={25} r={2.4} fill="#FFFFFF" opacity={0.8} />
      </>
    ),
    // Making repairs: a plaster that fixes things.
    bandage: (
      <G transform="rotate(-32 60 62)">
        {soft(rr(10, 42, 100, 40, 20))}
        <Path d={rr(40, 45, 40, 34, 9)} fill="#FFFFFF" opacity={0.5} />
        <Circle cx={22} cy={56} r={2} fill={INK} opacity={0.15} />
        <Circle cx={28} cy={68} r={2} fill={INK} opacity={0.15} />
        <Circle cx={92} cy={56} r={2} fill={INK} opacity={0.15} />
        <Circle cx={98} cy={68} r={2} fill={INK} opacity={0.15} />
        {face(60, 59, 0.7)}
      </G>
    ),
    // Life changes: a sprout growing in a pot.
    sprout: (
      <>
        <Path
          d="M60 64 C 60 52, 60 44, 60 34"
          stroke={GREEN.bottom}
          strokeWidth={5}
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M60 44 C 45 44, 34 34, 33 20 C 48 19, 60 28, 60 44 Z" fill={`url(#green${uid})`} />
        <Path d="M60 38 C 73 38, 86 29, 88 15 C 73 13, 60 22, 60 38 Z" fill={`url(#green${uid})`} />
        {soft('M30 70 L90 70 L82 104 C 81 108, 78 110, 74 110 L46 110 C 42 110, 39 108, 38 104 Z')}
        {soft(rr(24, 60, 72, 16, 8))}
        {face(60, 88, 0.75)}
      </>
    ),
    // Supporting friends: a big heart giving a little heart a hug.
    hug: (
      <>
        {soft(heart(10, 6, 4.2))}
        {face(60, 42, 0.85)}
        <Path d={heart(44, 58, 1.35)} fill={`url(#pink${uid})`} />
        <Ellipse cx={44} cy={76} rx={7} ry={12} fill={tone.arm} transform="rotate(-35 44 76)" />
        <Ellipse cx={76} cy={76} rx={7} ry={12} fill={tone.arm} transform="rotate(35 76 76)" />
      </>
    ),
    // Shared joy: a party popper bursting with confetti.
    party: (
      <>
        <Path d="M62 40 C 66 28, 76 26, 80 16" stroke={PINK.bottom} strokeWidth={4} strokeLinecap="round" fill="none" />
        <Path d="M74 52 C 86 48, 92 38, 104 38" stroke="#8FA8FF" strokeWidth={4} strokeLinecap="round" fill="none" />
        <Circle cx={92} cy={22} r={5} fill="#6FD6B1" />
        <Circle cx={56} cy={22} r={4} fill="#8FA8FF" />
        <Circle cx={104} cy={58} r={4} fill={PINK.bottom} />
        <Path d={rr(84, 6, 8, 8, 2)} fill="#FFCB5C" transform="rotate(25 88 10)" />
        <Path d={rr(98, 72, 8, 8, 2)} fill="#B48AF0" transform="rotate(-20 102 76)" />
        {soft('M16 104 L46 44 C 52 42, 66 52, 76 74 Z')}
        <Path d="M28 80 L50 92 M36 64 L60 78" stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" opacity={0.55} />
        {face(44, 74, 0.6)}
      </>
    ),
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Defs>
        <LinearGradient id={`body${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={tone.top} />
          <Stop offset="1" stopColor={tone.bottom} />
        </LinearGradient>
        <RadialGradient id={`hi${uid}`} cx="0.36" cy="0.3" r="0.55">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.7} />
          <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity={0.08} />
          <Stop offset="1" stopColor="#FFFFFF" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`rim${uid}`} cx="0.5" cy="0.45" r="0.6">
          <Stop offset="0.7" stopColor={tone.bottom} stopOpacity={0} />
          <Stop offset="1" stopColor={tone.bottom} stopOpacity={0.5} />
        </RadialGradient>
        <LinearGradient id={`pink${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={PINK.top} />
          <Stop offset="1" stopColor={PINK.bottom} />
        </LinearGradient>
        <LinearGradient id={`green${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor={GREEN.top} />
          <Stop offset="1" stopColor={GREEN.bottom} />
        </LinearGradient>
        <LinearGradient id={`gold${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#FFE9A6" />
          <Stop offset="1" stopColor="#FFC24D" />
        </LinearGradient>
        <LinearGradient id={`sky${uid}`} x1="0.2" y1="0" x2="0.8" y2="1">
          <Stop offset="0" stopColor="#D6E4FF" />
          <Stop offset="1" stopColor="#8FA8FF" />
        </LinearGradient>
        <RadialGradient id={`shadow${uid}`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#7C5CFC" stopOpacity={0.22} />
          <Stop offset="1" stopColor="#7C5CFC" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {!noShadow && <Ellipse cx={60} cy={113} rx={40} ry={6} fill={`url(#shadow${uid})`} />}
      {art[name]}
      {sparkles && (
        <>
          <Path d={SPARKLE(12, 24, 9)} fill="#FFD45C" />
          <Path d={SPARKLE(108, 92, 7)} fill="#FFD45C" />
          <Path d={SPARKLE(14, 84, 5)} fill="#FFD45C" />
        </>
      )}
    </Svg>
  );
}
