import type { ReactNode } from 'react';
import { Circle, Ellipse, G, Path } from 'react-native-svg';

/**
 * The topic icons for the partner, dating, family, work and self journeys,
 * drawn with the same kit as the friends icons in ./topic-icons (soft 3D
 * shapes, a little face where there's room). One icon per level, so no two
 * levels in the app share one.
 */

export const MORE_TOPIC_ICONS = [
  // Partner
  'feather',
  'headphones',
  'mugs',
  'door',
  'key',
  'cloud',
  'puzzle',
  'basket',
  'magnifier',
  'rings',
  // Dating
  'phone',
  'radio',
  'snail',
  'gift',
  'bridge',
  'bulb',
  'flowers',
  'traffic',
  'compass',
  'balloon',
  // Family
  'teapot',
  'frame',
  'house',
  'umbrella',
  'clock',
  'glasses',
  'stitched',
  'cake',
  'telephone',
  'tree',
  // Work
  'plane',
  'notepad',
  'cup',
  'moon',
  'clipboard',
  'target',
  'megaphone',
  'chart',
  'wrench',
  'trophy',
  // Self
  'rainbow',
  'stethoscope',
  'battery',
  'sunflower',
  'anchor',
  'lotus',
  'mirror',
  'thought',
  'lifebuoy',
  'mountain',
] as const;

export type MoreTopicIconName = (typeof MORE_TOPIC_ICONS)[number];

/** Everything an icon needs from the shared drawing kit. */
export type IconKit = {
  /** A shape in the level colour, with rim and highlight. */
  soft: (d: string, key?: string) => ReactNode;
  /** A shape in another gradient (pink, green, gold or sky), with a highlight. */
  tinted: (d: string, fill: string, key?: string) => ReactNode;
  face: (x: number, y: number, s?: number) => ReactNode;
  body: string;
  pink: string;
  green: string;
  gold: string;
  sky: string;
  ink: string;
  cheek: string;
  rr: (x: number, y: number, w: number, h: number, r: number) => string;
  heart: (x: number, y: number, s: number) => string;
};

/** A circle as a path, so it can take soft shading. */
const circ = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy} A${r} ${r} 0 1 0 ${cx + r} ${cy} A${r} ${r} 0 1 0 ${cx - r} ${cy} Z`;

const WHITE = '#FFFFFF';

export function moreArt(k: IconKit): Record<MoreTopicIconName, ReactNode> {
  const { soft, tinted, face, body, pink, green, gold, sky, ink, rr, heart } = k;
  const stroke = (color: string, width: number, opacity = 1) => ({
    stroke: color,
    strokeWidth: width,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
    opacity,
  });
  const sleepyEyes = (x: number, y: number) => (
    <Path
      d={`M${x - 13} ${y} Q ${x - 9} ${y + 4} ${x - 5} ${y} M${x + 5} ${y} Q ${x + 9} ${y + 4} ${x + 13} ${y}`}
      {...stroke(ink, 3)}
    />
  );

  return {
    // ---------- Partner ----------
    // Gentle starts: a soft feather, for soft words.
    feather: (
      <>
        {soft('M88 12 C 60 16, 32 42, 26 82 C 25 90, 28 96, 32 100 C 60 92, 90 64, 98 28 C 100 18, 96 12, 88 12 Z')}
        <Path d="M32 100 C 48 76, 66 50, 86 24" {...stroke(ink, 3.5, 0.25)} />
        <Path d="M32 100 L 20 112" {...stroke(ink, 4, 0.45)} />
        {face(62, 58, 0.7)}
      </>
    ),
    // Really listening: headphones with a little heart.
    headphones: (
      <>
        <Path d="M24 72 C 24 26, 96 26, 96 72" stroke={body} strokeWidth={11} strokeLinecap="round" fill="none" />
        {soft(rr(10, 60, 30, 44, 13))}
        {soft(rr(80, 60, 30, 44, 13))}
        <Path d={heart(47, 66, 1.1)} fill={pink} />
        <Path d="M50 46 Q 60 40, 70 46" {...stroke(ink, 3, 0.2)} />
      </>
    ),
    // Everyday closeness: two mugs side by side.
    mugs: (
      <>
        <Path d="M30 34 C 26 28, 34 22, 30 14 M82 40 C 78 34, 86 28, 82 20" {...stroke(ink, 3, 0.22)} />
        <Path d="M56 56 C 68 56, 68 80, 56 80" {...stroke(body, 7)} />
        {soft(rr(12, 44, 46, 56, 11))}
        <Path d="M104 62 C 116 62, 116 86, 104 86" {...stroke(body, 7)} />
        <G>{tinted(rr(62, 52, 44, 50, 11), pink)}</G>
        {face(35, 68, 0.55)}
        {face(84, 74, 0.5)}
        <Path d={heart(48, 18, 1)} fill={pink} />
      </>
    ),
    // Needs and limits: a door with a sign that says “come in kindly”.
    door: (
      <>
        {soft(rr(28, 12, 64, 98, 12))}
        <Path d={rr(36, 20, 48, 30, 6)} fill={WHITE} opacity={0.35} />
        <Circle cx={80} cy={66} r={5} fill={ink} opacity={0.55} />
        <Path d="M44 38 L 60 22 L 76 38" {...stroke(ink, 2, 0.35)} />
        <Path d={heart(48, 30, 1)} fill={pink} />
        {face(54, 84, 0.65)}
      </>
    ),
    // Everyday trust: a friendly key.
    key: (
      <G transform="rotate(-30 60 62)">
        {soft(rr(50, 56, 50, 13, 6.5))}
        {soft(rr(76, 65, 9, 16, 3))}
        {soft(rr(89, 65, 9, 11, 3))}
        {soft(circ(34, 62, 24))}
        <Circle cx={34} cy={45} r={4} fill={WHITE} opacity={0.85} />
        {face(34, 65, 0.58)}
      </G>
    ),
    // Calmer conflicts: a cloud calming down, with the sun coming out.
    cloud: (
      <>
        <Circle cx={92} cy={32} r={14} fill={gold} />
        {soft(
          'M28 90 C 10 90, 8 66, 24 60 C 22 40, 46 30, 56 44 C 62 26, 92 28, 94 50 C 110 50, 114 78, 98 88 C 96 90, 94 90, 92 90 Z'
        )}
        {sleepyEyes(60, 64)}
        <Path d="M54 74 Q 60 79 66 74" {...stroke(ink, 3)} />
        <Ellipse cx={42} cy={72} rx={6} ry={3.5} fill={k.cheek} opacity={0.32} />
        <Ellipse cx={78} cy={72} rx={6} ry={3.5} fill={k.cheek} opacity={0.32} />
      </>
    ),
    // Making up: two puzzle pieces that fit back together.
    puzzle: (
      <>
        {tinted(rr(62, 30, 46, 58, 9), pink)}
        {soft(rr(12, 30, 48, 58, 9))}
        {soft(circ(62, 59, 10))}
        {face(34, 56, 0.55)}
        {face(88, 56, 0.5)}
      </>
    ),
    // Sharing the load: a basket you carry together.
    basket: (
      <>
        <Path d="M30 50 C 30 16, 90 16, 90 50" {...stroke(body, 7)} />
        <Path d={rr(40, 34, 22, 20, 6)} fill={pink} />
        <Path d={rr(62, 38, 18, 16, 6)} fill={sky} />
        {soft('M18 58 L102 58 L92 100 C 91 104, 88 106, 84 106 L36 106 C 32 106, 29 104, 28 100 Z')}
        {soft(rr(12, 50, 96, 14, 7))}
        <Path d="M40 66 L42 100 M60 66 L60 104 M80 66 L78 100" {...stroke(WHITE, 3, 0.35)} />
        {face(60, 82, 0.6)}
      </>
    ),
    // Staying curious: a magnifying glass.
    magnifier: (
      <>
        <G transform="rotate(-45 80 84)">{soft(rr(72, 72, 16, 42, 8))}</G>
        {soft(circ(50, 50, 34))}
        <Circle cx={50} cy={50} r={23} fill={WHITE} opacity={0.82} />
        <Path d="M36 40 Q 40 32 48 30" {...stroke(WHITE, 4)} />
        {face(50, 52, 0.6)}
      </>
    ),
    // Choosing us: two rings, linked.
    rings: (
      <>
        <Circle cx={44} cy={68} r={24} stroke={gold} strokeWidth={10} fill="none" />
        <Circle cx={76} cy={68} r={24} stroke={body} strokeWidth={10} fill="none" />
        <Path d="M44 30 L52 38 L44 48 L36 38 Z" fill="#DDEBFF" />
        <Path d="M44 30 L48 38 L44 48 Z" fill={WHITE} opacity={0.7} />
        <Path d={heart(66, 14, 1)} fill={pink} />
      </>
    ),

    // ---------- Dating ----------
    // Great first chats: a phone with a new message.
    phone: (
      <>
        {soft(rr(30, 10, 60, 100, 15))}
        <Path d={rr(37, 22, 46, 74, 7)} fill={WHITE} opacity={0.85} />
        <Path d={rr(42, 30, 28, 14, 7)} fill={pink} />
        <Path d={rr(52, 50, 26, 12, 6)} fill={sky} />
        {face(60, 78, 0.55)}
      </>
    ),
    // Truly listening: a radio tuned in.
    radio: (
      <>
        <Path d="M32 42 L 22 16" {...stroke(ink, 4, 0.55)} />
        <Circle cx={22} cy={16} r={4} fill={ink} opacity={0.55} />
        <Path d="M96 20 C 102 26, 102 34, 96 40 M104 14 C 114 24, 114 38, 104 48" {...stroke(ink, 3.5, 0.25)} />
        {soft(rr(12, 42, 96, 62, 15))}
        <Circle cx={40} cy={73} r={17} fill={WHITE} opacity={0.6} />
        <Circle cx={34} cy={68} r={2.2} fill={ink} opacity={0.3} />
        <Circle cx={46} cy={68} r={2.2} fill={ink} opacity={0.3} />
        <Circle cx={34} cy={78} r={2.2} fill={ink} opacity={0.3} />
        <Circle cx={46} cy={78} r={2.2} fill={ink} opacity={0.3} />
        <Circle cx={40} cy={73} r={2.2} fill={ink} opacity={0.3} />
        {face(82, 70, 0.6)}
      </>
    ),
    // Your own pace: a happy snail taking its time.
    snail: (
      <>
        {tinted(
          'M12 98 C 12 86, 22 80, 34 82 L 96 92 C 106 94, 106 104, 96 104 L 18 104 C 14 104, 12 102, 12 98 Z',
          pink
        )}
        <Path d="M22 80 L 16 58 M32 80 L 36 58" {...stroke('#FF8FB4', 4)} />
        <Circle cx={16} cy={56} r={4.5} fill={ink} />
        <Circle cx={36} cy={56} r={4.5} fill={ink} />
        <Path d="M20 92 Q 26 97 32 92" {...stroke(ink, 3)} />
        {soft(circ(68, 62, 32))}
        <Path
          d="M68 62 C 68 54, 80 54, 80 64 C 80 76, 60 78, 56 66 C 52 50, 74 40, 88 54"
          {...stroke(ink, 4.5, 0.22)}
        />
      </>
    ),
    // Small signs of care: a little gift.
    gift: (
      <>
        <Ellipse cx={46} cy={32} rx={13} ry={8} fill={pink} transform="rotate(-25 46 32)" />
        <Ellipse cx={74} cy={32} rx={13} ry={8} fill={pink} transform="rotate(25 74 32)" />
        {soft(rr(20, 52, 80, 56, 11))}
        {soft(rr(14, 40, 92, 18, 8))}
        <Path d={rr(53, 40, 14, 68, 3)} fill={pink} />
        <Circle cx={60} cy={38} r={7} fill={pink} />
        {face(37, 80, 0.5)}
      </>
    ),
    // Building trust: a bridge, built step by step.
    bridge: (
      <>
        <Path d="M8 108 C 18 102, 28 114, 38 108 S 58 102, 68 108 S 88 114, 112 108" {...stroke(sky, 4)} />
        {soft(
          'M6 98 L6 62 C 30 60, 46 46, 60 46 C 74 46, 90 60, 114 62 L114 98 L94 98 C 94 82, 80 72, 60 72 C 40 72, 26 82, 26 98 Z'
        )}
        <Path d="M20 60 L20 48 M40 54 L40 42 M80 54 L80 42 M100 60 L100 48" {...stroke(ink, 3, 0.3)} />
        {face(60, 58, 0.55)}
      </>
    ),
    // Honest talks: a light bulb moment.
    bulb: (
      <>
        <Path d="M60 4 L60 0 M22 22 L18 18 M98 22 L102 18 M12 54 L6 54 M108 54 L114 54" {...stroke(gold, 4)} />
        {soft(
          'M60 12 C 84 12, 98 30, 96 52 C 94 66, 82 72, 80 82 L 40 82 C 38 72, 26 66, 24 52 C 22 30, 36 12, 60 12 Z'
        )}
        <Path d={rr(40, 84, 40, 10, 4)} fill={ink} opacity={0.45} />
        <Path d={rr(44, 96, 32, 10, 4)} fill={ink} opacity={0.35} />
        {face(60, 48, 0.8)}
      </>
    ),
    // Respectful differences: two different flowers, side by side.
    flowers: (
      <>
        <Path d="M38 62 L38 108 M84 62 L84 108" {...stroke('#3DBE8B', 4.5)} />
        <Ellipse cx={30} cy={92} rx={9} ry={5} fill={green} transform="rotate(-30 30 92)" />
        <Ellipse cx={92} cy={96} rx={9} ry={5} fill={green} transform="rotate(30 92 96)" />
        {[0, 72, 144, 216, 288].map((a) => (
          <Ellipse key={a} cx={38} cy={30} rx={10} ry={14} fill={pink} transform={`rotate(${a} 38 44)`} />
        ))}
        <Circle cx={38} cy={44} r={11} fill={gold} />
        {soft('M70 34 L77 48 L84 32 L91 48 L98 34 C 100 58, 94 66, 84 66 C 74 66, 68 58, 70 34 Z')}
        {face(38, 44, 0.38)}
        {face(84, 54, 0.38)}
      </>
    ),
    // Consent and respect: a traffic light that checks in.
    traffic: (
      <>
        {soft(rr(36, 6, 48, 108, 18))}
        <Circle cx={60} cy={30} r={12} fill="#FF7A95" />
        <Circle cx={60} cy={60} r={12} fill="#FFCB5C" />
        <Circle cx={60} cy={90} r={12} fill="#3DBE8B" />
        <Circle cx={56} cy={26} r={3} fill={WHITE} opacity={0.7} />
        <Circle cx={56} cy={56} r={3} fill={WHITE} opacity={0.7} />
        <Circle cx={56} cy={86} r={3} fill={WHITE} opacity={0.7} />
        <Path d="M55 92 Q 60 97 65 92" {...stroke(ink, 2.6)} />
        <Circle cx={56} cy={88} r={1.6} fill={ink} />
        <Circle cx={64} cy={88} r={1.6} fill={ink} />
      </>
    ),
    // Clear about the future: a compass pointing the way.
    compass: (
      <>
        {soft(circ(60, 60, 46))}
        <Circle cx={60} cy={60} r={35} fill={WHITE} opacity={0.85} />
        <Path d="M60 30 L68 60 L52 60 Z" fill={pink} />
        <Path d="M60 90 L68 60 L52 60 Z" fill={ink} opacity={0.3} />
        <Circle cx={60} cy={60} r={5} fill={ink} />
        <Path d="M60 18 L60 24 M60 96 L60 102 M18 60 L24 60 M96 60 L102 60" {...stroke(ink, 3, 0.4)} />
      </>
    ),
    // Choosing well: a heart balloon floating up.
    balloon: (
      <>
        <Path d="M60 88 C 54 98, 66 104, 58 116" {...stroke(ink, 2.5, 0.45)} />
        <Path d="M56 90 L64 90 L60 84 Z" fill={body} />
        {soft(heart(12, 0, 4))}
        {face(60, 38, 0.8)}
      </>
    ),

    // ---------- Family ----------
    // Calm words: a teapot, for a calm chat.
    teapot: (
      <>
        <Path d="M50 26 C 46 20, 54 14, 50 6 M66 26 C 62 20, 70 14, 66 6" {...stroke(ink, 3, 0.2)} />
        <Path d="M28 60 C 8 60, 8 90, 30 88" {...stroke(body, 7)} />
        {soft('M92 66 C 106 62, 110 48, 114 42 L 108 38 C 102 46, 98 52, 90 56 Z')}
        {soft('M22 72 C 22 46, 98 46, 98 72 C 98 96, 82 106, 60 106 C 38 106, 22 96, 22 72 Z')}
        {soft(rr(44, 38, 32, 12, 6))}
        <Circle cx={60} cy={34} r={6} fill={body} />
        {face(60, 76, 0.8)}
      </>
    ),
    // Across generations: a photo frame with two smiling faces.
    frame: (
      <>
        {soft(rr(16, 16, 88, 88, 15))}
        <Path d={rr(28, 28, 64, 64, 7)} fill={WHITE} opacity={0.88} />
        <Path d="M30 92 C 34 72, 62 72, 66 92 Z" fill={sky} />
        <Path d="M54 92 C 58 76, 86 76, 90 92 Z" fill={pink} />
        <Circle cx={48} cy={60} r={11} fill={sky} />
        <Circle cx={72} cy={64} r={9} fill={pink} />
        <Path d="M44 63 Q 48 66 52 63 M69 67 Q 72 69 75 67" {...stroke(ink, 2)} />
        <Path d={heart(52, 30, 0.7)} fill={pink} />
      </>
    ),
    // Showing up: a cosy house.
    house: (
      <>
        <Path d={rr(78, 22, 11, 24, 3)} fill={pink} />
        {soft(rr(24, 52, 72, 56, 9))}
        {tinted('M60 14 L108 58 C 110 60, 108 62, 106 62 L14 62 C 12 62, 10 60, 12 58 Z', pink)}
        <Path d={rr(50, 80, 20, 28, 7)} fill={ink} opacity={0.3} />
        {face(60, 70, 0.55)}
        <Path d={heart(86, 2, 0.75)} fill={pink} />
      </>
    ),
    // Healthy limits: an umbrella, keeping you dry.
    umbrella: (
      <>
        <Ellipse cx={20} cy={84} rx={3} ry={5} fill={sky} />
        <Ellipse cx={100} cy={90} rx={3} ry={5} fill={sky} />
        <Ellipse cx={28} cy={104} rx={3} ry={5} fill={sky} />
        <Path d="M60 62 L60 100 C 60 112, 46 112, 46 102" {...stroke(ink, 5, 0.55)} />
        {soft(
          'M10 64 C 14 30, 40 12, 60 12 C 80 12, 106 30, 110 64 C 102 58, 94 58, 86 64 C 78 58, 68 58, 60 64 C 52 58, 42 58, 34 64 C 26 58, 18 58, 10 64 Z'
        )}
        {face(60, 40, 0.75)}
      </>
    ),
    // Being reliable: an alarm clock, always on time.
    clock: (
      <>
        {soft(circ(30, 26, 13))}
        {soft(circ(90, 26, 13))}
        <Path d="M34 98 L26 110 M86 98 L94 110" {...stroke(ink, 5, 0.5)} />
        {soft(circ(60, 64, 42))}
        <Circle cx={60} cy={64} r={31} fill={WHITE} opacity={0.88} />
        <Path d="M60 64 L60 46 M60 64 L74 64" {...stroke(ink, 4)} />
        <Circle cx={60} cy={64} r={3.5} fill={ink} />
        <Path d="M60 38 L60 42 M86 64 L82 64 M60 90 L60 86 M34 64 L38 64" {...stroke(ink, 2.5, 0.4)} />
        <Path d="M52 78 Q 60 84 68 78" {...stroke(ink, 2.6)} />
      </>
    ),
    // Different views: a pair of glasses, seeing it another way.
    glasses: (
      <>
        <Path d="M14 58 L 4 46 M106 58 L116 46" {...stroke(body, 6)} />
        <Circle cx={35} cy={64} r={22} fill={WHITE} opacity={0.75} stroke={body} strokeWidth={9} />
        <Circle cx={85} cy={64} r={22} fill={WHITE} opacity={0.75} stroke={body} strokeWidth={9} />
        <Path d="M56 60 C 58 52, 62 52, 64 60" {...stroke(body, 7)} />
        <Circle cx={37} cy={66} r={5.5} fill={ink} />
        <Circle cx={87} cy={66} r={5.5} fill={ink} />
        <Circle cx={38.5} cy={64.5} r={1.8} fill={WHITE} />
        <Circle cx={88.5} cy={64.5} r={1.8} fill={WHITE} />
        <Path d="M52 98 Q 60 104 68 98" {...stroke(ink, 3)} />
      </>
    ),
    // Family repairs: a heart, lovingly stitched back together.
    stitched: (
      <>
        {soft(heart(10, 8, 4.2))}
        <Path d="M60 30 L54 46 L64 58 L56 72 L62 86" {...stroke(WHITE, 3.5, 0.85)} />
        <Path d="M50 40 L60 44 M54 54 L66 52 M50 66 L62 70 M54 80 L66 80" {...stroke(ink, 3, 0.45)} />
        <Ellipse cx={36} cy={52} rx={6} ry={3.5} fill={k.cheek} opacity={0.35} />
        <Ellipse cx={84} cy={52} rx={6} ry={3.5} fill={k.cheek} opacity={0.35} />
      </>
    ),
    // Fair roles: a cake cut into fair slices.
    cake: (
      <>
        <Path
          d="M48 18 C 44 24, 48 30, 48 30 C 52 26, 52 22, 48 18 Z M72 18 C 68 24, 72 30, 72 30 C 76 26, 76 22, 72 18 Z"
          fill={gold}
        />
        <Path d={rr(44, 30, 8, 24, 3)} fill={pink} />
        <Path d={rr(68, 30, 8, 24, 3)} fill={sky} />
        {soft(rr(14, 56, 92, 50, 13))}
        <Path
          d="M14 66 C 14 50, 106 50, 106 66 C 100 74, 94 66, 88 74 C 82 66, 76 74, 70 66 C 64 74, 58 66, 52 74 C 46 66, 40 74, 34 66 C 28 74, 22 66, 14 66 Z"
          fill={WHITE}
          opacity={0.9}
        />
        <Path d="M37 76 L37 104 M60 76 L60 104 M83 76 L83 104" {...stroke(WHITE, 2.5, 0.55)} />
        {face(60, 88, 0.55)}
      </>
    ),
    // Checking in: a friendly telephone.
    telephone: (
      <>
        {soft('M14 46 C 14 30, 30 24, 60 24 C 90 24, 106 30, 106 46 L 92 52 L 84 40 C 70 36, 50 36, 36 40 L 28 52 Z')}
        {soft('M22 106 L30 66 C 32 60, 36 58, 42 58 L78 58 C 84 58, 88 60, 90 66 L98 106 Z')}
        <Circle cx={60} cy={84} r={15} fill={WHITE} opacity={0.8} />
        {face(60, 83, 0.5)}
      </>
    ),
    // Growing together: a family tree.
    tree: (
      <>
        <Path d={rr(52, 70, 16, 40, 6)} fill="#C99266" />
        {tinted(circ(38, 56, 24), green)}
        {tinted(circ(82, 56, 24), green)}
        {tinted(circ(60, 38, 28), green)}
        <Circle cx={36} cy={46} r={5} fill={body} />
        <Circle cx={86} cy={48} r={5} fill={body} />
        <Circle cx={72} cy={24} r={4.5} fill={body} />
        {face(60, 50, 0.7)}
      </>
    ),

    // ---------- Work ----------
    // Clear messages: a paper plane, straight to the point.
    plane: (
      <>
        <Path d="M10 90 C 24 96, 32 86, 44 94" {...stroke(ink, 3, 0.25)} strokeDasharray="4 8" />
        {soft('M8 58 L112 16 L78 104 L58 72 Z')}
        <Path d="M58 72 L112 16 L66 90 Z" fill={ink} opacity={0.12} />
        {face(66, 54, 0.55)}
      </>
    ),
    // Active listening: a notepad for jotting things down.
    notepad: (
      <>
        {soft(rr(22, 16, 66, 94, 11))}
        <Path d={rr(30, 30, 50, 70, 5)} fill={WHITE} opacity={0.85} />
        <Path d="M36 44 L74 44 M36 56 L74 56 M36 68 L60 68" {...stroke(ink, 2.5, 0.2)} />
        <Circle cx={38} cy={16} r={4} fill={ink} opacity={0.5} />
        <Circle cx={55} cy={16} r={4} fill={ink} opacity={0.5} />
        <Circle cx={72} cy={16} r={4} fill={ink} opacity={0.5} />
        <G transform="rotate(25 98 70)">
          <Path d={rr(92, 34, 12, 56, 4)} fill={gold} />
          <Path d="M92 90 L104 90 L98 102 Z" fill="#F4D6B0" />
        </G>
        {face(52, 84, 0.5)}
      </>
    ),
    // Team connection: a coffee to share.
    cup: (
      <>
        <Path d="M50 14 C 46 8, 54 4, 50 -2 M66 14 C 62 8, 70 4, 66 -2" {...stroke(ink, 3, 0.2)} />
        {soft('M30 32 L90 32 L82 106 C 82 108, 80 110, 78 110 L42 110 C 40 110, 38 108, 38 106 Z')}
        {soft(rr(24, 20, 72, 16, 8))}
        <Path d="M34 64 L86 64 L83 88 L37 88 Z" fill={pink} />
        <Path d={heart(53, 69, 0.6)} fill={WHITE} />
        {face(60, 48, 0.55)}
      </>
    ),
    // Healthy boundaries: a moon, for switching off.
    moon: (
      <>
        {soft('M76 12 C 46 14, 24 38, 24 66 C 24 94, 48 112, 76 110 C 54 102, 42 84, 42 62 C 42 40, 56 22, 76 12 Z')}
        {sleepyEyes(40, 62)}
        <Path d="M36 74 Q 40 78 44 74" {...stroke(ink, 2.6)} />
        <Path d="M92 34 L94 40 L100 42 L94 44 L92 50 L90 44 L84 42 L90 40 Z" fill={gold} />
        <Path d="M100 74 L101.5 78 L106 79.5 L101.5 81 L100 85 L98.5 81 L94 79.5 L98.5 78 Z" fill={gold} />
        <Path d="M76 92 L77 95 L80 96 L77 97 L76 100 L75 97 L72 96 L75 95 Z" fill={gold} />
      </>
    ),
    // Being dependable: a clipboard with everything ticked.
    clipboard: (
      <>
        {soft(rr(20, 18, 80, 94, 13))}
        <Path d={rr(30, 32, 60, 72, 6)} fill={WHITE} opacity={0.9} />
        <Path d={rr(44, 10, 32, 16, 7)} fill={ink} opacity={0.55} />
        {[46, 64, 82].map((y) => (
          <G key={y}>
            <Path d={rr(38, y - 6, 12, 12, 3)} fill="none" stroke={ink} strokeWidth={2} opacity={0.35} />
            <Path d={`M40 ${y} L44 ${y + 4} L52 ${y - 5}`} {...stroke('#3DBE8B', 3.5)} />
            <Path d={`M58 ${y} L80 ${y}`} {...stroke(ink, 2.5, 0.2)} />
          </G>
        ))}
      </>
    ),
    // Productive disagreement: aiming at the same target.
    target: (
      <>
        {soft(circ(56, 64, 46))}
        <Circle cx={56} cy={64} r={33} fill={WHITE} opacity={0.85} />
        <Circle cx={56} cy={64} r={21} fill={body} />
        <Circle cx={56} cy={64} r={9} fill={WHITE} opacity={0.9} />
        <Path d="M58 62 L106 14" {...stroke(ink, 4.5, 0.75)} />
        <Path d="M106 14 L96 14 L106 4 Z M106 14 L106 24 L116 14 Z" fill={pink} />
      </>
    ),
    // Useful feedback: a megaphone, said clearly and kindly.
    megaphone: (
      <>
        <Path d="M100 44 C 108 52, 108 68, 100 76 M108 34 C 120 48, 120 72, 108 86" {...stroke(ink, 3.5, 0.28)} />
        <Path d={rr(34, 68, 12, 26, 5)} fill={ink} opacity={0.45} />
        {soft(rr(12, 48, 16, 26, 6))}
        {soft('M24 50 L84 20 C 88 18, 92 20, 92 24 L92 98 C 92 102, 88 104, 84 102 L24 72 Z')}
        {face(56, 58, 0.55)}
      </>
    ),
    // Growing from feedback: a chart heading up.
    chart: (
      <>
        {soft(rr(14, 70, 24, 38, 7))}
        {soft(rr(46, 50, 24, 58, 7))}
        {soft(rr(78, 28, 24, 80, 7))}
        <Path d="M16 52 L44 36 L62 44 L104 10" {...stroke('#3DBE8B', 5)} />
        <Path d="M104 10 L92 10 M104 10 L104 22" {...stroke('#3DBE8B', 5)} />
        {face(90, 56, 0.48)}
      </>
    ),
    // Team repairs: a wrench, for fixing things together.
    wrench: (
      <G transform="rotate(-40 60 60)">
        {soft(rr(51, 40, 18, 72, 9))}
        {soft('M44 10 A22 22 0 1 0 76 10 L68 26 L52 26 Z')}
        <Path d="M54 80 Q 60 84 66 80" {...stroke(ink, 2.5)} />
        <Circle cx={55} cy={74} r={2} fill={ink} />
        <Circle cx={65} cy={74} r={2} fill={ink} />
      </G>
    ),
    // Strong teams: a trophy for everyone.
    trophy: (
      <>
        <Path d="M32 26 C 12 26, 12 56, 34 54 M88 26 C 108 26, 108 56, 86 54" {...stroke(gold, 7)} />
        {soft('M30 14 L90 14 L88 50 C 86 70, 74 78, 60 78 C 46 78, 34 70, 32 50 Z')}
        <Path d={rr(53, 76, 14, 14, 3)} fill={ink} opacity={0.35} />
        {soft(rr(34, 88, 52, 18, 7))}
        <Path d="M60 22 L63 30 L72 30 L65 35 L68 43 L60 38 L52 43 L55 35 L48 30 L57 30 Z" fill={gold} />
        {face(60, 56, 0.6)}
      </>
    ),

    // ---------- Self ----------
    // Name your feelings: a rainbow of emotions.
    rainbow: (
      <>
        <Path d="M12 96 A48 48 0 0 1 108 96" {...stroke('#FF8FB4', 10)} strokeLinecap="butt" />
        <Path d="M24 96 A36 36 0 0 1 96 96" {...stroke('#FFCB5C', 10)} strokeLinecap="butt" />
        <Path d="M36 96 A24 24 0 0 1 84 96" {...stroke('#6FD6B1', 10)} strokeLinecap="butt" />
        <Path d="M48 96 A12 12 0 0 1 72 96" {...stroke('#8FA8FF', 10)} strokeLinecap="butt" />
        {soft(
          'M2 104 C 2 92, 14 88, 20 94 C 24 84, 40 86, 40 98 C 46 98, 48 108, 40 110 L 8 110 C 4 110, 2 108, 2 104 Z'
        )}
        {soft('M80 104 C 80 92, 92 88, 98 94 C 102 84, 118 86, 118 98 L 118 110 L 86 110 C 82 110, 80 108, 80 104 Z')}
        {face(22, 100, 0.4)}
      </>
    ),
    // Open listening: a stethoscope, listening to your own heart.
    stethoscope: (
      <>
        <Path d="M30 14 L30 46 C 30 68, 66 68, 66 46 L66 14" {...stroke(ink, 5, 0.5)} />
        <Circle cx={30} cy={12} r={4.5} fill={ink} opacity={0.55} />
        <Circle cx={66} cy={12} r={4.5} fill={ink} opacity={0.55} />
        <Path d="M48 62 L48 82 C 48 100, 84 100, 84 84 L84 78" {...stroke(ink, 5, 0.5)} />
        {soft(circ(84, 70, 15))}
        <Circle cx={84} cy={70} r={6} fill={WHITE} opacity={0.6} />
        {soft(heart(4, 64, 1.9))}
        {face(27, 80, 0.38)}
      </>
    ),
    // Your needs: a battery, recharging.
    battery: (
      <>
        <Path d={rr(102, 48, 10, 24, 4)} fill={ink} opacity={0.45} />
        {soft(rr(10, 32, 94, 56, 14))}
        <Path d={rr(54, 42, 18, 36, 5)} fill="#3DBE8B" />
        <Path d={rr(76, 42, 18, 36, 5)} fill="#3DBE8B" opacity={0.45} />
        <Path d="M66 48 L58 62 L66 62 L60 74" {...stroke(gold, 3.5)} />
        {face(32, 58, 0.55)}
      </>
    ),
    // Turning toward: a sunflower that follows the light.
    sunflower: (
      <>
        <Path d="M60 76 L60 114" {...stroke('#3DBE8B', 5)} />
        <Ellipse cx={46} cy={98} rx={12} ry={6} fill={green} transform="rotate(-30 46 98)" />
        <Ellipse cx={74} cy={94} rx={12} ry={6} fill={green} transform="rotate(30 74 94)" />
        {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((a) => (
          <Ellipse key={a} cx={60} cy={20} rx={8} ry={14} fill={gold} transform={`rotate(${a} 60 46)`} />
        ))}
        {soft(circ(60, 46, 19))}
        {face(60, 46, 0.6)}
      </>
    ),
    // Trusting yourself: an anchor that keeps you steady.
    anchor: (
      <>
        <Circle cx={60} cy={18} r={9} stroke={body} strokeWidth={7} fill="none" />
        {soft(rr(53, 24, 14, 76, 7))}
        {soft(rr(32, 38, 56, 11, 5.5))}
        <Path
          d="M20 72 C 24 96, 44 106, 60 106 C 76 106, 96 96, 100 72"
          stroke={body}
          strokeWidth={12}
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M12 78 L20 64 L28 78 Z M92 78 L100 64 L108 78 Z" fill={body} />
        <Path d={heart(51, 56, 0.75)} fill={pink} />
      </>
    ),
    // Calm responses: a lotus, still on the water.
    lotus: (
      <>
        <Path d="M10 104 C 24 98, 34 110, 48 104 S 72 98, 86 104 S 104 110, 112 104" {...stroke(sky, 4)} />
        {tinted('M58 96 C 34 94, 16 80, 12 58 C 32 58, 50 70, 58 96 Z', pink)}
        {tinted('M62 96 C 86 94, 104 80, 108 58 C 88 58, 70 70, 62 96 Z', pink)}
        {soft('M60 26 C 76 44, 76 80, 60 96 C 44 80, 44 44, 60 26 Z')}
        {face(60, 66, 0.42)}
      </>
    ),
    // Owning it: a hand mirror, smiling back.
    mirror: (
      <>
        {soft(rr(50, 80, 16, 34, 8))}
        {soft(circ(58, 48, 38))}
        <Circle cx={58} cy={48} r={29} fill={WHITE} opacity={0.82} />
        <Path d="M40 34 Q 44 26 52 24" {...stroke(WHITE, 4)} />
        {face(58, 50, 0.65)}
      </>
    ),
    // Kinder thoughts: a thought bubble with a heart.
    thought: (
      <>
        {soft(circ(22, 104, 6))}
        {soft(circ(34, 88, 10))}
        {soft(
          'M30 70 C 12 70, 10 46, 26 40 C 24 22, 46 12, 58 24 C 66 8, 96 12, 98 32 C 114 34, 116 62, 100 68 C 98 72, 94 72, 90 72 Z'
        )}
        <Path d={heart(46, 26, 1.4)} fill={pink} />
      </>
    ),
    // Asking for support: a lifebuoy, there when you need it.
    lifebuoy: (
      <>
        {soft(circ(60, 60, 46))}
        <Circle cx={60} cy={60} r={22} fill={WHITE} opacity={0.92} />
        <Path
          d="M60 14 L60 38 M60 82 L60 106 M14 60 L38 60 M82 60 L106 60"
          {...stroke(WHITE, 14, 0.85)}
          strokeLinecap="butt"
        />
        {face(60, 58, 0.5)}
      </>
    ),
    // Your next chapter: a mountain, with a flag at the top.
    mountain: (
      <>
        <Circle cx={24} cy={30} r={11} fill={gold} />
        <Path d="M80 46 L80 14" {...stroke(ink, 3.5, 0.6)} />
        <Path d="M80 14 L102 22 L80 30 Z" fill={pink} />
        {soft('M6 106 L46 40 L62 66 L80 46 L114 106 Z')}
        <Path d="M46 40 L55 55 L49 52 L43 57 L38 53 Z" fill={WHITE} opacity={0.9} />
        <Path d="M80 46 L87 58 L82 56 L77 59 L74 56 Z" fill={WHITE} opacity={0.9} />
        {face(58, 86, 0.65)}
      </>
    ),
  };
}
