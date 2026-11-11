import type { ReactNode } from 'react';
import { Circle, G, Path } from 'react-native-svg';

import type { IconKit } from './topic-icons-more';

/**
 * Level icons for the six skill refreshers, ten each, in the same soft-3D kit
 * as the journey level icons. Like those, every icon belongs to exactly one
 * level in the app.
 */
export const REFRESHER_ICONS = [
  // Communicate with Care
  'microphone',
  'signpost',
  'lantern',
  'keyboard',
  'olive',
  'pencil',
  'mailbox',
  'paintbrush',
  'kettle',
  'bell',
  // Build Trust
  'acorn',
  'ribbon',
  'window',
  'lighthouse',
  'vault',
  'owl',
  'hourglass',
  'egg',
  'bricks',
  'nest',
  // Set Boundaries
  'gate',
  'palm',
  'candle',
  'laptop',
  'raincoat',
  'kite',
  'toggle',
  'tent',
  'bench',
  'wateringcan',
  // Resolve Conflict
  'icecube',
  'matchstick',
  'pillow',
  'ladder',
  'hammock',
  'binoculars',
  'flashlight',
  'map',
  'glue',
  'yarn',
  // Deepen Connection
  'cookie',
  'question',
  'camera',
  'popcorn',
  'honey',
  'dice',
  'blanket',
  'postcard',
  'submarine',
  'bonsai',
  // Listen to Understand
  'bunny',
  'cairn',
  'parachute',
  'eye',
  'guitar',
  'truce',
  'bottle',
  'snowglobe',
  'sticky',
  'treasure',
] as const;

export type RefresherIconName = (typeof REFRESHER_ICONS)[number];

/** A circle as a path, so it can take soft shading. */
const circ = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;

/** An ellipse as a path. */
const ell = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

const WHITE = '#FFFFFF';
const WOOD = '#D9A86C';
const STEEL = '#C9C2E6';

export function refresherArt(k: IconKit): Record<RefresherIconName, ReactNode> {
  const { soft, tinted, face, body, pink, green, gold, sky, ink, cheek, rr, heart } = k;
  const stroke = (color: string, width: number, opacity = 1) => ({
    stroke: color,
    strokeWidth: width,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
    opacity,
  });

  return {
    // ---------- Communicate with Care ----------
    // Speaking kindly: a friendly microphone.
    microphone: (
      <>
        <Path d="M30 56 C 30 84, 90 84, 90 56" {...stroke(ink, 5, 0.55)} />
        <Path d={rr(56, 80, 8, 18, 4)} fill={ink} opacity={0.5} />
        {tinted(rr(38, 96, 44, 12, 6), gold)}
        {soft(rr(40, 10, 40, 62, 20))}
        <Path d="M46 26 H74 M44 36 H76" {...stroke(WHITE, 3, 0.5)} />
        {face(60, 52, 0.6)}
      </>
    ),
    // Clear requests: a signpost pointing the way.
    signpost: (
      <>
        {tinted(rr(54, 18, 12, 92, 6), gold)}
        {tinted('M102 58 H38 L24 71 L38 84 H102 Z', sky)}
        {soft('M16 22 H84 L100 37 L84 52 H16 Z')}
        {face(54, 36, 0.55)}
      </>
    ),
    // Hard conversations: a lantern to light the way.
    lantern: (
      <>
        <Path d="M44 26 C 44 8, 76 8, 76 26" {...stroke(ink, 5, 0.55)} />
        {tinted(rr(34, 22, 52, 13, 6), gold)}
        {soft(rr(30, 33, 60, 60, 18))}
        <Path d="M60 44 C 70 56, 72 68, 60 78 C 48 68, 50 56, 60 44 Z" fill={gold} />
        <Path d="M60 56 C 64 62, 65 68, 60 73 C 55 68, 56 62, 60 56 Z" fill={WHITE} opacity={0.75} />
        {tinted(rr(34, 90, 52, 13, 6), gold)}
      </>
    ),
    // Tone and texting: a smiley keyboard.
    keyboard: (
      <>
        {soft(rr(8, 40, 104, 58, 14))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Path key={`a${i}`} d={rr(17 + i * 15, 50, 11, 10, 3)} fill={WHITE} opacity={0.75} />
        ))}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Path key={`b${i}`} d={rr(17 + i * 15, 64, 11, 10, 3)} fill={WHITE} opacity={0.75} />
        ))}
        <Path d={rr(34, 80, 52, 9, 4.5)} fill={WHITE} opacity={0.75} />
        <Path d={heart(46, 8, 1.15)} fill={pink} />
      </>
    ),
    // Saying sorry: an olive branch.
    olive: (
      <>
        <Path d="M18 104 C 40 84, 68 56, 102 18" {...stroke('#3DBE8B', 5)} />
        <Path d="M38 84 C 24 80, 18 68, 20 58 C 32 60, 40 72, 38 84 Z" fill={green} />
        <Path d="M58 64 C 62 50, 74 44, 84 44 C 82 56, 70 64, 58 64 Z" fill={green} />
        <Path d="M80 38 C 74 26, 76 14, 82 8 C 90 16, 88 30, 80 38 Z" fill={green} />
        {soft(circ(62, 84, 17))}
        {face(62, 82, 0.5)}
        {tinted(circ(96, 54, 10), green)}
      </>
    ),
    // Giving feedback: a pencil, ready to help.
    pencil: (
      <G transform="rotate(-35 60 60)">
        <Path d={rr(8, 47, 16, 26, 5)} fill={pink} />
        {soft(rr(20, 46, 70, 28, 6))}
        <Path d="M90 46 L110 60 L90 74 Z" fill="#F6D9B8" />
        <Path d="M103 55 L110 60 L103 65 Z" fill={ink} />
        {face(54, 59, 0.55)}
      </G>
    ),
    // Receiving feedback: a mailbox with something inside.
    mailbox: (
      <>
        {tinted(rr(52, 72, 16, 38, 5), gold)}
        <Path d={rr(28, 22, 32, 20, 3)} fill={WHITE} opacity={0.9} />
        {soft(rr(16, 30, 88, 48, 22))}
        <Path d={rr(94, 12, 6, 34, 3)} fill={pink} />
        <Path d={rr(94, 12, 18, 11, 3)} fill={pink} />
        {face(56, 56, 0.6)}
      </>
    ),
    // Sharing feelings: a paintbrush, for colouring in how you feel.
    paintbrush: (
      <>
        <Path d={heart(10, 70, 1.5)} fill={pink} />
        <G transform="rotate(35 60 60)">
          {soft(rr(53, 4, 14, 66, 7))}
          <Path d={rr(51, 66, 18, 12, 3)} fill={STEEL} />
          {tinted('M51 78 H69 C71 94, 65 104, 60 110 C55 104, 49 94, 51 78 Z', pink)}
          {face(60, 34, 0.45)}
        </G>
      </>
    ),
    // Talking under pressure: a kettle letting off steam.
    kettle: (
      <>
        <Path d="M106 40 C 100 32, 110 26, 104 18 M114 44 C 110 36, 118 30, 112 22" {...stroke(STEEL, 4)} />
        <Path d="M32 62 C 14 64, 14 92, 28 96" {...stroke(ink, 6, 0.5)} />
        {soft('M90 76 L108 54 L102 50 L84 66 Z')}
        {soft('M24 104 C 18 80, 26 52, 60 50 C 94 52, 102 80, 96 104 Z')}
        {soft(rr(42, 40, 36, 13, 6))}
        {tinted(circ(60, 35, 6), gold)}
        {face(60, 80, 0.65)}
      </>
    ),
    // Everyday check-ins: a little bell.
    bell: (
      <>
        <Path d="M16 40 C 10 48, 10 58, 16 66 M104 40 C 110 48, 110 58, 104 66" {...stroke(ink, 4, 0.3)} />
        <Circle cx={60} cy={14} r={6} {...stroke(ink, 4, 0.55)} />
        {tinted(circ(60, 98, 9), gold)}
        {soft('M60 18 C 84 18, 90 42, 90 62 C 90 76, 100 84, 104 92 H16 C 20 84, 30 76, 30 62 C 30 42, 36 18, 60 18 Z')}
        {face(60, 60, 0.65)}
      </>
    ),

    // ---------- Build Trust ----------
    // Trust basics: an acorn, which grows into something big.
    acorn: (
      <>
        <Path d={rr(56, 14, 8, 18, 4)} fill={ink} opacity={0.55} />
        {soft('M30 52 H90 C 90 84, 76 104, 60 108 C 44 104, 30 84, 30 52 Z')}
        {tinted('M22 50 C 22 26, 98 26, 98 50 C 98 58, 22 58, 22 50 Z', gold)}
        <Path d="M36 38 L48 50 M52 34 L64 48 M70 34 L82 48" {...stroke(WHITE, 3, 0.45)} />
        {face(60, 76, 0.65)}
      </>
    ),
    // Keeping your word: a promise tied in a ribbon.
    ribbon: (
      <>
        {soft('M56 58 L40 102 L50 98 L56 108 L62 60 Z')}
        {soft('M64 58 L80 102 L70 98 L64 108 L58 60 Z')}
        {soft('M60 52 C 40 22, 12 28, 18 52 C 22 72, 46 66, 60 52 Z')}
        {soft('M60 52 C 80 22, 108 28, 102 52 C 98 72, 74 66, 60 52 Z')}
        {tinted(circ(60, 54, 11), pink)}
        <Circle cx={57} cy={51} r={3} fill={WHITE} opacity={0.7} />
      </>
    ),
    // Honest answers: an open window, nothing hidden.
    window: (
      <>
        {soft(rr(16, 14, 88, 90, 14))}
        {tinted(rr(26, 24, 30, 32, 6), sky)}
        {tinted(rr(64, 24, 30, 32, 6), sky)}
        {tinted(rr(26, 64, 30, 30, 6), sky)}
        {tinted(rr(64, 64, 30, 30, 6), sky)}
        {tinted(rr(10, 100, 100, 10, 5), gold)}
        <Path d={heart(68, 68, 0.95)} fill={pink} />
        <Path d="M30 30 L40 30 M30 36 L36 36" {...stroke(WHITE, 3, 0.8)} />
      </>
    ),
    // Reliable when it’s hard: a lighthouse in the storm.
    lighthouse: (
      <>
        <Path d="M82 30 L116 18 L116 44 Z" fill="#FFE9A6" opacity={0.7} />
        <Path d="M38 30 L4 18 L4 44 Z" fill="#FFE9A6" opacity={0.7} />
        {tinted(rr(24, 100, 72, 12, 6), sky)}
        {soft('M44 42 H76 L84 104 H36 Z')}
        <Path d="M41 64 H79 L81 76 H39 Z" fill={pink} opacity={0.85} />
        {tinted(rr(42, 24, 36, 20, 6), gold)}
        <Path d="M38 26 L60 6 L82 26 Z" fill={pink} />
        {face(60, 88, 0.5)}
      </>
    ),
    // Privacy and respect: a vault that keeps things safe.
    vault: (
      <>
        <Path d={rr(24, 102, 14, 10, 3)} fill={ink} opacity={0.45} />
        <Path d={rr(82, 102, 14, 10, 3)} fill={ink} opacity={0.45} />
        {soft(rr(14, 14, 92, 90, 18))}
        <Circle cx={60} cy={58} r={30} fill={WHITE} opacity={0.35} />
        <Path d="M60 30 V40 M60 76 V86 M32 58 H42 M78 58 H88" {...stroke(ink, 4, 0.35)} />
        {tinted(circ(60, 58, 14), gold)}
        <Path d={heart(53, 52, 0.58)} fill={pink} />
      </>
    ),
    // Saying “I don’t know”: a wise owl.
    owl: (
      <>
        {soft('M26 46 C 22 22, 36 12, 44 26 C 52 22, 68 22, 76 26 C 84 12, 98 22, 94 46 C 100 78, 86 106, 60 106 C 34 106, 20 78, 26 46 Z')}
        <Path d={ell(60, 84, 20, 16)} fill={WHITE} opacity={0.35} />
        <Circle cx={45} cy={52} r={13} fill={WHITE} />
        <Circle cx={75} cy={52} r={13} fill={WHITE} />
        <Circle cx={46} cy={53} r={6} fill={ink} />
        <Circle cx={74} cy={53} r={6} fill={ink} />
        <Circle cx={47.5} cy={51} r={2} fill={WHITE} />
        <Circle cx={75.5} cy={51} r={2} fill={WHITE} />
        <Path d="M55 66 L65 66 L60 75 Z" fill={gold} />
        <Path d={ell(34, 72, 6, 4)} fill={cheek} opacity={0.4} />
        <Path d={ell(86, 72, 6, 4)} fill={cheek} opacity={0.4} />
      </>
    ),
    // Trusting wisely: an hourglass, because trust takes time.
    hourglass: (
      <>
        {soft('M30 18 H90 C 90 42, 66 52, 66 60 C 66 68, 90 78, 90 102 H30 C 30 78, 54 68, 54 60 C 54 52, 30 42, 30 18 Z')}
        <Path d="M40 28 H80 C 76 40, 64 46, 60 52 C 56 46, 44 40, 40 28 Z" fill={pink} opacity={0.85} />
        <Path d="M60 56 V90" {...stroke(pink, 3, 0.8)} />
        <Path d="M38 100 C 44 88, 76 88, 82 100 Z" fill={pink} opacity={0.85} />
        {tinted(rr(22, 8, 76, 12, 6), gold)}
        {tinted(rr(22, 100, 76, 12, 6), gold)}
      </>
    ),
    // Small letdowns: an egg with a little crack, still whole.
    egg: (
      <>
        {soft('M60 10 C 86 10, 100 52, 100 72 C 100 96, 82 110, 60 110 C 38 110, 20 96, 20 72 C 20 52, 34 10, 60 10 Z')}
        <Path d="M28 58 L40 50 L48 60 L58 50 L66 58" {...stroke(ink, 3, 0.45)} />
        {face(60, 80, 0.7)}
      </>
    ),
    // Rebuilding slowly: bricks going back up, one at a time.
    bricks: (
      <>
        {soft(rr(12, 84, 46, 24, 6))}
        {tinted(rr(62, 84, 46, 24, 6), pink)}
        {soft(rr(34, 56, 52, 24, 6))}
        {face(60, 66, 0.5)}
        <G transform="rotate(-8 60 34)">{tinted(rr(38, 22, 44, 22, 6), gold)}</G>
        <Path d="M24 22 L30 30 M96 18 L90 28" {...stroke(ink, 3, 0.3)} />
      </>
    ),
    // Trust that lasts: a nest, built twig by twig.
    nest: (
      <>
        {tinted(ell(40, 60, 12, 15), sky)}
        {tinted(ell(80, 60, 12, 15), pink)}
        {tinted('M60 28 C 72 28, 76 46, 76 56 C 76 66, 68 72, 60 72 C 52 72, 44 66, 44 56 C 44 46, 48 28, 60 28 Z', gold)}
        {face(60, 54, 0.45)}
        {soft('M10 60 C 10 104, 110 104, 110 60 C 90 72, 30 72, 10 60 Z')}
        <Path d="M20 74 C 40 82, 80 82, 100 74 M26 86 C 46 92, 74 92, 94 86" {...stroke(WHITE, 3, 0.4)} />
      </>
    ),

    // ---------- Set Boundaries ----------
    // Boundary basics: a garden gate, with a way in.
    gate: (
      <>
        {[38, 51, 64, 77].map((x) => (
          <G key={x}>{tinted(rr(x, 40, 8, 60, 4), sky)}</G>
        ))}
        {tinted(rr(26, 48, 68, 8, 4), gold)}
        {tinted(rr(26, 86, 68, 8, 4), gold)}
        {soft(rr(12, 26, 18, 84, 7))}
        {soft(rr(90, 26, 18, 84, 7))}
        {tinted(circ(21, 22, 8), gold)}
        {tinted(circ(99, 22, 8), gold)}
        <Path d={heart(49, 60, 0.95)} fill={pink} />
      </>
    ),
    // A kind no: an open palm, saying “not this”.
    palm: (
      <>
        {soft(rr(30, 22, 14, 46, 7))}
        {soft(rr(45, 12, 14, 52, 7))}
        {soft(rr(60, 14, 14, 50, 7))}
        {soft(rr(75, 24, 14, 42, 7))}
        <G transform="rotate(40 90 72)">{soft(rr(82, 56, 14, 34, 7))}</G>
        {soft(rr(28, 50, 62, 58, 26))}
        {face(58, 78, 0.6)}
      </>
    ),
    // Time and energy: a candle you don’t burn at both ends.
    candle: (
      <>
        <Path d="M60 10 C 71 22, 71 32, 60 38 C 49 32, 49 22, 60 10 Z" fill={gold} />
        <Path d="M60 20 C 64 26, 64 31, 60 34 C 56 31, 56 26, 60 20 Z" fill={WHITE} opacity={0.75} />
        <Path d="M60 38 V44" {...stroke(ink, 3)} />
        {soft(rr(40, 42, 40, 56, 10))}
        <Path d="M46 44 C 46 54, 52 56, 52 48" {...stroke(WHITE, 4, 0.5)} />
        {face(60, 68, 0.6)}
        {tinted('M24 96 H96 C 96 108, 24 108, 24 96 Z', gold)}
      </>
    ),
    // Digital boundaries: a laptop that knows when to close.
    laptop: (
      <>
        {soft(rr(22, 20, 76, 56, 10))}
        <Path d={rr(30, 28, 60, 40, 6)} fill={WHITE} opacity={0.55} />
        <Path d="M42 44 Q 48 48 54 44 M66 44 Q 72 48 78 44" {...stroke(ink, 3)} />
        <Path d="M54 56 Q 60 60 66 56" {...stroke(ink, 3)} />
        {tinted('M8 80 H112 L104 96 H16 Z', sky)}
        <Path d="M84 14 L92 14 L84 22 L92 22" {...stroke(ink, 2.5, 0.5)} />
      </>
    ),
    // Emotional limits: a raincoat, so not every storm soaks in.
    raincoat: (
      <>
        <Path d="M18 16 C 20 22, 14 24, 18 28 M100 12 C 102 18, 96 20, 100 24 M86 4 C 88 10, 82 12, 86 16" {...stroke('#8FA8FF', 4)} />
        {soft('M40 26 C 46 18, 74 18, 80 26 L102 58 L90 64 L86 56 V106 H34 V56 L30 64 L18 58 Z')}
        <Path d="M48 24 L60 42 L72 24" {...stroke(WHITE, 4, 0.7)} />
        {tinted(circ(60, 70, 4.5), gold)}
        {tinted(circ(60, 88, 4.5), gold)}
        {face(60, 52, 0.45)}
      </>
    ),
    // Staying steady: a kite that flies because the string holds.
    kite: (
      <>
        <Path d="M60 92 C 48 100, 70 104, 56 112" {...stroke(ink, 3, 0.45)} />
        <Path d="M50 100 L56 96 L56 104 Z M62 106 L68 102 L68 110 Z" fill={pink} />
        {soft('M60 8 L98 50 L60 92 L22 50 Z')}
        <Path d="M60 8 V92 M22 50 H98" {...stroke(WHITE, 3, 0.4)} />
        {face(60, 50, 0.55)}
      </>
    ),
    // Changing your mind: a switch you’re allowed to flip.
    toggle: (
      <>
        {soft(rr(12, 36, 96, 48, 24))}
        <Circle cx={83} cy={60} r={20} fill={WHITE} />
        <Circle cx={78} cy={54} r={6} fill={WHITE} opacity={0.9} />
        <Circle cx={77} cy={58} r={2.6} fill={ink} />
        <Circle cx={89} cy={58} r={2.6} fill={ink} />
        <Path d="M78 65 Q 83 69 88 65" {...stroke(ink, 2.5)} />
        <Path d="M28 60 L34 66 L46 54" {...stroke(WHITE, 5, 0.85)} />
      </>
    ),
    // Asking for space: a little tent of your own.
    tent: (
      <>
        {tinted(rr(6, 98, 108, 10, 5), green)}
        <Path d="M60 14 V2 L76 7 L60 12" fill={pink} />
        {soft('M60 14 L106 100 H14 Z')}
        <Path d="M60 50 L80 100 H40 Z" fill={ink} opacity={0.22} />
        <Path d="M60 14 L60 100" {...stroke(WHITE, 3, 0.35)} />
        {face(40, 80, 0.4)}
      </>
    ),
    // Hearing their no: a bench with room to sit apart.
    bench: (
      <>
        {tinted(rr(14, 28, 92, 12, 6), gold)}
        {tinted(rr(14, 46, 92, 12, 6), gold)}
        <Path d={rr(20, 78, 10, 28, 4)} fill={ink} opacity={0.5} />
        <Path d={rr(90, 78, 10, 28, 4)} fill={ink} opacity={0.5} />
        {soft(rr(8, 62, 104, 18, 9))}
        {face(60, 70, 0.45)}
      </>
    ),
    // Living your limits: a watering can, looking after yourself.
    wateringcan: (
      <>
        <Path d="M108 50 L104 60 M114 56 L114 66 M102 56 L96 64" {...stroke('#8FA8FF', 4)} />
        <Path d="M22 58 C 4 58, 4 92, 22 94" {...stroke(ink, 7, 0.5)} />
        {soft('M80 74 L100 40 L108 44 L90 84 Z')}
        <G transform="rotate(30 104 38)">{tinted(rr(94, 30, 22, 12, 5), gold)}</G>
        {soft(rr(20, 50, 66, 56, 16))}
        {tinted(rr(16, 44, 74, 12, 6), gold)}
        {face(52, 78, 0.6)}
      </>
    ),

    // ---------- Resolve Conflict ----------
    // Calm first: an ice cube, for cooling down.
    icecube: (
      <>
        {soft(rr(20, 24, 80, 80, 18))}
        <Path d={rr(28, 32, 26, 12, 6)} fill={WHITE} opacity={0.6} />
        <Path d="M90 36 L94 42 M86 92 L80 96" {...stroke(WHITE, 3, 0.7)} />
        {face(60, 66, 0.7)}
        <Path d="M18 112 C 18 106, 26 106, 26 112 Z M100 112 C 100 107, 106 107, 106 112 Z" fill="#8FA8FF" />
      </>
    ),
    // Spotting triggers: an unlit match, best left that way.
    matchstick: (
      <>
        <G transform="rotate(18 60 70)">
          {tinted(rr(55, 40, 11, 70, 5), gold)}
          {soft('M61 12 C 72 12, 76 26, 74 34 C 72 46, 50 46, 48 34 C 46 26, 50 12, 61 12 Z')}
          {face(61, 30, 0.42)}
        </G>
        <Path d="M94 24 L102 18 M98 36 L108 36 M22 40 L14 34" {...stroke(ink, 3, 0.3)} />
      </>
    ),
    // Starting softly: a soft pillow.
    pillow: (
      <>
        {soft('M14 40 C 14 22, 26 20, 40 26 C 54 32, 66 32, 80 26 C 94 20, 106 22, 106 40 V80 C 106 98, 94 100, 80 94 C 66 88, 54 88, 40 94 C 26 100, 14 98, 14 80 Z')}
        <Path d="M24 36 C 40 44, 80 44, 96 36" {...stroke(WHITE, 3, 0.45)} />
        {face(60, 62, 0.7)}
      </>
    ),
    // One issue at a time: a ladder, one rung at a time.
    ladder: (
      <>
        {[18, 38, 78, 98].map((y) => (
          <G key={y}>{soft(rr(30, y - 4, 60, 9, 4.5))}</G>
        ))}
        {tinted(rr(26, 50, 68, 22, 11), pink)}
        {face(60, 59, 0.42)}
        {tinted(rr(20, 6, 11, 108, 5.5), gold)}
        {tinted(rr(89, 6, 11, 108, 5.5), gold)}
      </>
    ),
    // Taking breaks: a hammock for a pause.
    hammock: (
      <>
        {tinted(rr(8, 20, 10, 92, 5), gold)}
        {tinted(rr(102, 20, 10, 92, 5), gold)}
        <Path d="M14 30 L26 48 M106 30 L94 48" {...stroke(ink, 3, 0.4)} />
        {soft('M22 46 C 40 96, 80 96, 98 46 C 80 72, 40 72, 22 46 Z')}
        {face(60, 72, 0.5)}
        <Path d="M70 16 H80 L70 26 H80 M84 6 H91 L84 13 H91" {...stroke(ink, 2.5, 0.45)} />
      </>
    ),
    // Hearing the other side: binoculars, for seeing their view.
    binoculars: (
      <>
        {tinted(rr(22, 22, 28, 22, 8), sky)}
        {tinted(rr(70, 22, 28, 22, 8), sky)}
        {soft(rr(14, 38, 40, 66, 18))}
        {soft(rr(66, 38, 40, 66, 18))}
        {tinted(rr(48, 52, 24, 16, 6), sky)}
        {tinted(circ(34, 86, 13), sky)}
        {tinted(circ(86, 86, 13), sky)}
        <Circle cx={30} cy={82} r={4} fill={WHITE} opacity={0.85} />
        <Circle cx={82} cy={82} r={4} fill={WHITE} opacity={0.85} />
      </>
    ),
    // Owning your part: a flashlight turned on yourself.
    flashlight: (
      <>
        <Path d="M96 40 L118 26 L118 92 L96 78 Z" fill="#FFE9A6" opacity={0.65} />
        {soft(rr(12, 46, 66, 28, 10))}
        {soft('M76 40 H96 V80 H76 Z')}
        {tinted(rr(94, 42, 7, 36, 3.5), gold)}
        <Path d={rr(36, 42, 14, 7, 3.5)} fill={pink} />
        {face(46, 61, 0.45)}
      </>
    ),
    // Making a plan: a map with a route.
    map: (
      <>
        {soft('M10 30 L42 20 L78 30 L110 20 V92 L78 102 L42 92 L10 102 Z')}
        <Path d="M42 20 L78 30 V102 L42 92 Z" fill={ink} opacity={0.08} />
        <Path d="M22 84 C 34 70, 46 76, 56 62 C 64 50, 78 56, 90 42" {...stroke(pink, 4)} strokeDasharray="6 7" />
        <Path d="M84 34 L96 46 M96 34 L84 46" {...stroke(pink, 5)} />
        <Circle cx={22} cy={84} r={5} fill={gold} />
      </>
    ),
    // Repair after a fight: glue, for putting things back together.
    glue: (
      <>
        {tinted('M54 24 L60 8 L66 24 Z', pink)}
        {tinted('M46 46 H74 L68 22 H52 Z', gold)}
        {soft(rr(30, 44, 60, 64, 16))}
        <Path d={rr(38, 60, 44, 32, 8)} fill={WHITE} opacity={0.7} />
        {face(60, 74, 0.5)}
      </>
    ),
    // Breaking old loops: a ball of yarn, untangled.
    yarn: (
      <>
        <Path d="M92 84 C 106 92, 100 106, 114 110" stroke={body} strokeWidth={6} strokeLinecap="round" fill="none" />
        {soft(circ(56, 60, 42))}
        <Path d="M22 50 C 40 40, 72 40, 92 54 M18 70 C 40 58, 76 60, 96 74 M40 22 C 30 46, 32 80, 48 100" {...stroke(WHITE, 3, 0.45)} />
        {face(58, 64, 0.6)}
      </>
    ),

    // ---------- Deepen Connection ----------
    // Small moments: a cookie to share.
    cookie: (
      <>
        {soft(circ(60, 62, 44))}
        {[
          [36, 40],
          [80, 36],
          [30, 74],
          [88, 76],
          [60, 96],
        ].map(([x, y]) => (
          <Path key={`${x}${y}`} d={rr(x - 4, y - 4, 9, 8, 3)} fill={ink} opacity={0.55} />
        ))}
        {face(60, 62, 0.7)}
      </>
    ),
    // Curious questions: a big, friendly question mark.
    question: (
      <>
        <Path d="M38 40 C 38 14, 82 12, 82 40 C 82 58, 60 60, 60 78" stroke={body} strokeWidth={20} strokeLinecap="round" fill="none" />
        <Path d="M44 36 C 46 22, 70 20, 74 34" {...stroke(WHITE, 4, 0.5)} />
        {soft(circ(60, 102, 11))}
        <Path d="M20 22 L24 30 M100 20 L96 28 M18 60 L26 60" {...stroke(gold, 4)} />
      </>
    ),
    // Showing interest: a camera, noticing what matters to them.
    camera: (
      <>
        {soft(rr(30, 26, 26, 16, 6))}
        {soft(rr(10, 36, 100, 70, 16))}
        {tinted(circ(60, 72, 24), sky)}
        <Circle cx={60} cy={72} r={12} fill={ink} opacity={0.75} />
        <Circle cx={54} cy={66} r={4} fill={WHITE} opacity={0.9} />
        {tinted(rr(84, 44, 16, 9, 4.5), gold)}
      </>
    ),
    // Shared rituals: popcorn for movie night.
    popcorn: (
      <>
        {[
          [34, 44, 13],
          [54, 34, 14],
          [76, 36, 13],
          [88, 48, 11],
          [44, 52, 11],
          [66, 52, 12],
        ].map(([x, y, r]) => (
          <G key={`${x}${y}`}>{tinted(circ(x, y, r), gold)}</G>
        ))}
        {soft('M24 52 H96 L88 110 H32 Z')}
        <Path d="M44 52 H56 L55 110 H45 Z M66 52 H78 L74 110 H65 Z" fill={pink} opacity={0.7} />
        {face(60, 80, 0.55)}
      </>
    ),
    // Saying thank you: a pot of honey, sweet words.
    honey: (
      <>
        <G transform="rotate(20 70 24)">{tinted(rr(66, 2, 9, 40, 4.5), gold)}</G>
        {soft('M24 58 C 24 40, 40 36, 60 36 C 80 36, 96 40, 96 58 V86 C 96 102, 82 110, 60 110 C 38 110, 24 102, 24 86 Z')}
        {tinted(rr(28, 30, 64, 14, 7), gold)}
        <Path d="M38 44 C 38 56, 46 58, 46 48 C 50 58, 58 56, 58 46" fill={gold} />
        {face(60, 78, 0.65)}
      </>
    ),
    // Fun together: a pair of dice.
    dice: (
      <>
        <G transform="rotate(-10 40 70)">
          {soft(rr(14, 44, 52, 52, 12))}
          <Circle cx={28} cy={58} r={4.5} fill={WHITE} />
          <Circle cx={40} cy={70} r={4.5} fill={WHITE} />
          <Circle cx={52} cy={82} r={4.5} fill={WHITE} />
        </G>
        <G transform="rotate(14 82 50)">
          {tinted(rr(58, 26, 48, 48, 12), pink)}
          <Circle cx={72} cy={40} r={4.5} fill={WHITE} />
          <Circle cx={92} cy={40} r={4.5} fill={WHITE} />
          <Circle cx={72} cy={60} r={4.5} fill={WHITE} />
          <Circle cx={92} cy={60} r={4.5} fill={WHITE} />
        </G>
      </>
    ),
    // There in hard times: a warm blanket around a little heart.
    blanket: (
      <>
        {soft(rr(10, 60, 84, 42, 14))}
        <Path d="M30 64 V98 M52 64 V98 M74 64 V98" {...stroke(WHITE, 3, 0.3)} />
        {soft(circ(90, 80, 22))}
        <Path d="M90 80 m -10 0 a 10 10 0 1 1 10 10 a 6 6 0 1 1 -6 -6" {...stroke(WHITE, 3.5, 0.55)} />
        {tinted(heart(26, 10, 2.2), pink)}
        {face(52, 34, 0.5)}
      </>
    ),
    // Staying close apart: a postcard from far away.
    postcard: (
      <>
        {soft(rr(8, 26, 104, 72, 10))}
        <Path d="M64 36 V88" {...stroke(WHITE, 3, 0.6)} />
        {tinted(rr(80, 34, 22, 26, 3), pink)}
        <Path d={heart(84, 39, 0.6)} fill={WHITE} />
        <Path d="M72 70 H102 M72 80 H96" {...stroke(WHITE, 3, 0.7)} />
        {face(36, 60, 0.6)}
      </>
    ),
    // Deep conversations: a submarine diving deeper.
    submarine: (
      <>
        <Circle cx={14} cy={34} r={5} {...stroke('#8FA8FF', 3)} />
        <Circle cx={24} cy={18} r={3.5} {...stroke('#8FA8FF', 3)} />
        <Path d="M66 32 V14 H80" {...stroke(ink, 5, 0.55)} />
        {soft(rr(46, 28, 28, 24, 8))}
        {tinted('M100 62 L114 52 V88 L100 78 Z', gold)}
        {soft(rr(10, 44, 94, 48, 24))}
        {tinted(circ(62, 68, 9), sky)}
        {tinted(circ(84, 68, 9), sky)}
        {face(34, 66, 0.5)}
      </>
    ),
    // Growing together: a bonsai, shaped with care over years.
    bonsai: (
      <>
        <Path d="M60 82 C 58 68, 46 64, 50 50 M58 68 C 64 60, 74 58, 76 50" {...stroke(WOOD, 8)} />
        {soft(circ(42, 42, 18))}
        {soft(circ(74, 38, 20))}
        {soft(circ(58, 24, 14))}
        {face(72, 40, 0.48)}
        {tinted(rr(22, 78, 76, 11, 5.5), pink)}
        {tinted('M30 88 H90 L84 108 H36 Z', pink)}
      </>
    ),

    // ---------- Listen to Understand ----------
    // Listening basics: a bunny, all ears.
    bunny: (
      <>
        <G transform="rotate(-10 42 34)">
          {soft(rr(33, 4, 20, 58, 10))}
          <Path d={rr(38, 12, 10, 40, 5)} fill={pink} opacity={0.7} />
        </G>
        <G transform="rotate(10 78 34)">
          {soft(rr(67, 4, 20, 58, 10))}
          <Path d={rr(72, 12, 10, 40, 5)} fill={pink} opacity={0.7} />
        </G>
        {soft(circ(60, 76, 34))}
        {face(60, 78, 0.7)}
      </>
    ),
    // A quiet mind: a calm stack of stones.
    cairn: (
      <>
        {tinted(ell(60, 98, 46, 13), sky)}
        {soft(ell(60, 72, 34, 15))}
        {face(60, 72, 0.5)}
        {tinted(ell(60, 46, 23, 11), pink)}
        {soft(ell(60, 26, 13, 8))}
      </>
    ),
    // Open questions: a parachute that opens wide.
    parachute: (
      <>
        <Path d="M18 54 L52 90 M44 54 L56 88 M76 54 L64 88 M102 54 L68 90" {...stroke(ink, 2.5, 0.35)} />
        {tinted(rr(48, 86, 24, 22, 6), gold)}
        {soft('M14 54 C 14 18, 106 18, 106 54 C 96 46, 86 46, 76 54 C 68 46, 52 46, 44 54 C 34 46, 24 46, 14 54 Z')}
        {face(60, 38, 0.6)}
      </>
    ),
    // Body language: an eye that notices.
    eye: (
      <>
        <Path d="M30 30 L24 20 M48 24 L46 13 M72 24 L74 13 M90 30 L96 20" {...stroke(ink, 4, 0.55)} />
        {soft('M8 62 C 30 26, 90 26, 112 62 C 90 98, 30 98, 8 62 Z')}
        {tinted(circ(60, 62, 22), sky)}
        <Circle cx={60} cy={62} r={10} fill={ink} />
        <Circle cx={54} cy={56} r={4} fill={WHITE} />
      </>
    ),
    // Hearing emotions: a guitar, tuning in.
    guitar: (
      <G transform="rotate(-30 60 60)">
        {tinted(rr(54, -2, 12, 46, 5), gold)}
        {soft(circ(60, 50, 19))}
        {soft(circ(60, 82, 27))}
        <Circle cx={60} cy={72} r={8} fill={ink} opacity={0.65} />
        <Path d="M57 4 V96 M63 4 V96" {...stroke(WHITE, 1.5, 0.6)} />
        <Path d={rr(48, 94, 24, 5, 2.5)} fill={ink} opacity={0.5} />
        <Path d={ell(46, 90, 5, 3)} fill={cheek} opacity={0.5} />
        <Path d={ell(74, 90, 5, 3)} fill={cheek} opacity={0.5} />
      </G>
    ),
    // Listening in conflict: a white flag, ready to hear them out.
    truce: (
      <>
        {tinted(ell(30, 108, 20, 6), green)}
        {tinted(rr(24, 8, 9, 102, 4.5), gold)}
        {soft('M33 16 C 54 6, 66 28, 100 16 V64 C 66 76, 54 54, 33 64 Z')}
        {face(64, 40, 0.55)}
      </>
    ),
    // Listening in messages: a message in a bottle.
    bottle: (
      <>
        {tinted(rr(48, 10, 24, 20, 5), gold)}
        {soft('M48 28 H72 V44 C 88 52, 92 64, 92 76 V100 C 92 106, 88 110, 82 110 H38 C 32 110, 28 106, 28 100 V76 C 28 64, 32 52, 48 44 Z')}
        <Path d={rr(40, 64, 40, 30, 6)} fill={WHITE} opacity={0.85} />
        <Path d="M48 74 H72 M48 82 H66" {...stroke(ink, 2.5, 0.35)} />
        <Path d={heart(65, 77, 0.55)} fill={pink} />
      </>
    ),
    // Holding silence: a calm snow globe.
    snowglobe: (
      <>
        <Path d={circ(60, 54, 42)} fill="#D6E4FF" opacity={0.45} />
        {soft('M40 88 C 40 64, 80 64, 80 88 Z')}
        {face(60, 78, 0.42)}
        {[
          [40, 34],
          [70, 26],
          [84, 50],
          [34, 58],
          [58, 44],
        ].map(([x, y]) => (
          <Circle key={`${x}${y}`} cx={x} cy={y} r={3} fill={WHITE} />
        ))}
        <Path d="M32 34 C 38 22, 50 16, 60 16" {...stroke(WHITE, 4, 0.7)} />
        {tinted('M28 88 H92 L100 110 H20 Z', pink)}
      </>
    ),
    // Remembering details: a sticky note.
    sticky: (
      <>
        {soft('M18 16 H102 V86 L82 106 H18 Z')}
        <Path d="M82 106 V86 H102 Z" fill={WHITE} opacity={0.55} />
        <Path d="M32 36 H86 M32 48 H74" {...stroke(WHITE, 4, 0.75)} />
        {tinted(circ(60, 16, 7), pink)}
        {face(56, 76, 0.55)}
      </>
    ),
    // Listening for needs: a treasure chest of what really matters.
    treasure: (
      <>
        <Path d="M22 22 L26 30 M98 18 L94 28 M60 6 V14" {...stroke(gold, 4)} />
        {soft(rr(12, 56, 96, 50, 10))}
        {tinted('M12 60 C 12 30, 108 30, 108 60 Z', gold)}
        <Path d={rr(24, 40, 9, 66, 3)} fill={ink} opacity={0.2} />
        <Path d={rr(87, 40, 9, 66, 3)} fill={ink} opacity={0.2} />
        {tinted(rr(51, 52, 18, 18, 5), pink)}
        {face(60, 86, 0.55)}
      </>
    ),
  };
}
