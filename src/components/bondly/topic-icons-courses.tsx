import type { ReactNode } from 'react';
import { Circle, G, Path } from 'react-native-svg';

import type { IconKit } from './topic-icons-more';

/**
 * One icon for each relationship journey and skill refresher, shown on its
 * card and map. Same soft-3D kit as the level icons, but none of these are
 * used by a level, so a journey never looks like one of its own levels.
 */
export const COURSE_ICONS = [
  // Journeys
  'hearts',
  'tulip',
  'trio',
  'bracelet',
  'briefcase',
  'star',
  // Skill refreshers
  'chat',
  'padlock',
  'fence',
  'thermometer',
  'links',
  'shell',
] as const;

export type CourseIconName = (typeof COURSE_ICONS)[number];

/** A circle as a path, so it can take soft shading. */
const circ = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;

const WHITE = '#FFFFFF';

/** Bead spots around the friendship bracelet, leaving the bottom free for the heart charm. */
const BEADS: [number, number][] = [
  [60, 24],
  [78, 28.8],
  [91.2, 42],
  [96, 60],
  [91.2, 78],
  [28.8, 78],
  [24, 60],
  [28.8, 42],
  [42, 28.8],
];

export function courseArt(k: IconKit): Record<CourseIconName, ReactNode> {
  const { soft, tinted, face, body, pink, gold, sky, ink, cheek, rr, heart } = k;
  const stroke = (color: string, width: number, opacity = 1) => ({
    stroke: color,
    strokeWidth: width,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
    opacity,
  });

  return {
    // ---------- Journeys ----------
    // Partner: two hearts, side by side.
    hearts: (
      <>
        {soft(heart(8, 14, 3.4))}
        {face(49, 44, 0.75)}
        {tinted(heart(64, 56, 2.1), pink)}
        {face(89, 74, 0.42)}
      </>
    ),
    // Dating: a tulip, like a first bunch of flowers.
    tulip: (
      <>
        <Path d="M60 110 C 60 96, 60 86, 60 76" {...stroke('#3DBE8B', 5)} />
        <Path d="M60 100 C 44 100, 34 90, 32 78 C 46 76, 58 84, 60 100 Z" fill={k.green} />
        <Path d="M60 94 C 74 94, 86 86, 90 74 C 76 72, 62 80, 60 94 Z" fill={k.green} />
        {soft('M30 26 L44 40 L60 18 L76 40 L90 26 C 98 52, 88 78, 60 80 C 32 78, 22 52, 30 26 Z')}
        {face(60, 56, 0.72)}
      </>
    ),
    // Family: a little group, two grown-ups and a small one in front.
    trio: (
      <>
        {soft(circ(36, 56, 24))}
        {tinted(circ(84, 56, 24), gold)}
        {face(36, 52, 0.55)}
        {face(84, 52, 0.55)}
        {tinted(circ(60, 88, 18), pink)}
        {face(60, 86, 0.45)}
      </>
    ),
    // Friendships: a friendship bracelet with a heart charm.
    bracelet: (
      <>
        <Circle cx={60} cy={60} r={36} {...stroke(ink, 2.5, 0.25)} />
        {BEADS.map(([x, y], i) =>
          i % 3 === 0 ? (
            <G key={i}>{soft(circ(x, y, 10))}</G>
          ) : (
            <G key={i}>{tinted(circ(x, y, 9), i % 3 === 1 ? pink : sky)}</G>
          )
        )}
        {soft(heart(39.6, 76, 1.7))}
        {face(60, 92, 0.42)}
      </>
    ),
    // Work: a friendly briefcase.
    briefcase: (
      <>
        <Path d={rr(42, 20, 36, 26, 10)} {...stroke(ink, 6, 0.75)} />
        {soft(rr(12, 38, 96, 68, 16))}
        <Path d={rr(12, 60, 96, 7, 0)} fill={cheek} opacity={0.4} />
        {tinted(rr(51, 54, 18, 18, 5), gold)}
        {face(60, 86, 0.65)}
      </>
    ),
    // Yourself: a star, for seeing your own worth.
    star: (
      <>
        {soft('M60 16 L72.9 46.2 L105.7 49.2 L80.9 70.8 L88.2 102.8 L60 86 L31.8 102.8 L39.1 70.8 L14.3 49.2 L47.1 46.2 Z')}
        {face(60, 62, 0.72)}
      </>
    ),

    // ---------- Skill refreshers ----------
    // Communication: two speech bubbles in conversation.
    chat: (
      <>
        {tinted(rr(44, 14, 66, 46, 20), sky)}
        {tinted('M90 56 L104 74 L76 58 Z', sky)}
        <Circle cx={64} cy={37} r={4} fill={WHITE} />
        <Circle cx={77} cy={37} r={4} fill={WHITE} />
        <Circle cx={90} cy={37} r={4} fill={WHITE} />
        {soft('M26 92 L18 112 L46 96 Z')}
        {soft(rr(8, 46, 76, 54, 22))}
        {face(46, 70, 0.68)}
      </>
    ),
    // Trust: a padlock with a heart, for something kept safe.
    padlock: (
      <>
        <Path d="M38 56 V40 C 38 18, 82 18, 82 40 V56" {...stroke('#C9C2E6', 11)} />
        <Path d="M38 56 V40 C 38 18, 82 18, 82 40 V56" {...stroke(WHITE, 3, 0.6)} />
        {soft(rr(20, 50, 80, 60, 18))}
        {tinted(heart(48, 56, 1), pink)}
        {face(60, 92, 0.55)}
      </>
    ),
    // Boundaries: a little picket fence.
    fence: (
      <>
        {tinted(rr(8, 52, 104, 11, 5.5), gold)}
        {tinted(rr(8, 82, 104, 11, 5.5), gold)}
        {soft('M14 44 L27 28 L40 44 V104 C 40 108, 38 110, 34 110 H20 C 16 110, 14 108, 14 104 Z')}
        {soft('M47 38 L60 22 L73 38 V104 C 73 108, 71 110, 67 110 H53 C 49 110, 47 108, 47 104 Z')}
        {soft('M80 44 L93 28 L106 44 V104 C 106 108, 104 110, 100 110 H86 C 82 110, 80 108, 80 104 Z')}
        {face(60, 66, 0.48)}
      </>
    ),
    // Resolving conflict: a thermometer cooling things down.
    thermometer: (
      <>
        {soft(rr(46, 10, 28, 76, 14))}
        {soft(circ(60, 90, 21))}
        <Path d={rr(55, 46, 10, 40, 5)} fill="#8FA8FF" />
        <Path d={circ(60, 90, 14)} fill="#8FA8FF" />
        <Path d="M74 26 H82 M74 38 H80 M74 50 H82 M74 62 H80" {...stroke(ink, 3, 0.3)} />
        {face(60, 90, 0.45)}
        <Path d="M22 28 L22 52 M12 34 L32 46 M12 46 L32 34" {...stroke('#8FA8FF', 3.5, 0.9)} />
      </>
    ),
    // Connection: two chain links holding on to each other.
    links: (
      <>
        <G transform="rotate(-30 42 62)">
          <Path d={rr(14, 44, 56, 36, 18)} stroke={body} strokeWidth={14} fill="none" />
          <Path d={rr(14, 44, 56, 36, 18)} {...stroke(WHITE, 3, 0.5)} />
        </G>
        <G transform="rotate(-30 78 58)">
          <Path d={rr(50, 40, 56, 36, 18)} stroke={pink} strokeWidth={14} fill="none" />
          <Path d={rr(50, 40, 56, 36, 18)} {...stroke(WHITE, 3, 0.5)} />
        </G>
        <Path d={heart(48, 82, 1)} fill={pink} />
      </>
    ),
    // Listening: a seashell, for hearing what's really being said.
    shell: (
      <>
        {soft('M60 102 C 30 102, 12 80, 16 52 C 20 30, 40 16, 60 16 C 80 16, 100 30, 104 52 C 108 80, 90 102, 60 102 Z')}
        <Path
          d="M60 100 L 26 50 M60 100 L 40 28 M60 100 L 60 20 M60 100 L 80 28 M60 100 L 94 50"
          {...stroke(WHITE, 4, 0.45)}
        />
        {soft(rr(44, 96, 32, 14, 7))}
        {face(60, 66, 0.68)}
      </>
    ),
  };
}
