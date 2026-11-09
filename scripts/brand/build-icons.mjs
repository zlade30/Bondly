import { writeFileSync } from 'node:fs';

const INK = '#2B1760';
// The hugging pair from the hero, in its own 300x250 space. Content bbox ~ x 40..282, y 30..228.
const pair = (id, { faces = true, mono = false } = {}) => {
  const big = 'M196 30 C 246 30, 278 84, 280 140 C 282 196, 250 222, 196 222 C 142 222, 114 196, 116 140 C 118 84, 146 30, 196 30 Z';
  const small = 'M104 88 C 142 88, 166 124, 168 164 C 170 206, 144 228, 104 228 C 64 228, 38 206, 40 164 C 42 124, 66 88, 104 88 Z';
  const arm = 'M140 176 C 160 168, 178 160, 190 152 C 200 146, 210 154, 204 164 C 196 176, 172 190, 150 196 Z';
  if (mono) {
    return `<path d="${big}" fill="#fff"/><path d="${small}" fill="#fff"/>`;
  }
  const s = `stroke="${INK}" stroke-width="7" stroke-linecap="round" fill="none"`;
  return `
  <defs>
    <linearGradient id="${id}big" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stop-color="#D6CCFF"/><stop offset="1" stop-color="#8F9CFF"/></linearGradient>
    <linearGradient id="${id}small" x1="0.2" y1="0" x2="0.7" y2="1"><stop offset="0" stop-color="#FFC9A8"/><stop offset="1" stop-color="#FF7FB2"/></linearGradient>
    <radialGradient id="${id}hi" cx="0.36" cy="0.28" r="0.55"><stop offset="0" stop-color="#fff" stop-opacity="0.7"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <path d="${big}" fill="url(#${id}big)"/><path d="${big}" fill="url(#${id}hi)"/>
  <path d="${arm}" fill="#FF9EBF"/><path d="${small}" fill="url(#${id}small)"/><path d="${small}" fill="url(#${id}hi)"/>
  ${faces ? `
  <ellipse cx="176" cy="118" rx="12" ry="7" fill="#F48FC6" opacity="0.35"/>
  <ellipse cx="246" cy="118" rx="12" ry="7" fill="#F48FC6" opacity="0.35"/>
  <circle cx="186" cy="102" r="8" fill="${INK}"/><circle cx="236" cy="104" r="8" fill="${INK}"/>
  <path d="M200 114 Q 211 126 222 114" ${s}/>
  <ellipse cx="80" cy="152" rx="11" ry="6.5" fill="#FF5C93" opacity="0.32"/>
  <ellipse cx="142" cy="146" rx="11" ry="6.5" fill="#FF5C93" opacity="0.32"/>
  <path d="M84 138 Q 92 146 100 138" ${s}/><path d="M118 134 Q 126 142 134 134" ${s}/>
  <path d="M104 154 Q 110 160 116 154" stroke="#E0457E" stroke-width="7" stroke-linecap="round" fill="none"/>` : ''}
  <ellipse cx="198" cy="156" rx="12" ry="11" fill="#FFA9C6"/>`;
};

// Heart in a 24x24 space.
const heart = (id) => `
  <defs><linearGradient id="${id}" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="#FFB3D1"/><stop offset="1" stop-color="#FF5C98"/></linearGradient></defs>
  <path d="M12 21.6 C 5 16.8, 1.5 13, 1.5 8.4 C 1.5 5.2, 4 2.7, 7.1 2.7 C 9.1 2.7, 10.9 3.8, 12 5.4 C 13.1 3.8, 14.9 2.7, 16.9 2.7 C 20 2.7, 22.5 5.2, 22.5 8.4 C 22.5 13, 19 16.8, 12 21.6 Z" fill="url(#${id})"/>
  <ellipse cx="7.2" cy="7.4" rx="2.4" ry="1.5" fill="#fff" opacity="0.55"/>`;

// Places the pair so its content is centred in a size×size canvas and spans `span` of the width.
const placedPair = (size, span, id, opts) => {
  const scale = (size * span) / 242;
  const tx = size / 2 - 161 * scale;
  const ty = size / 2 - 129 * scale + size * 0.03;
  return `<g transform="translate(${tx} ${ty}) scale(${scale})">${pair(id, opts)}</g>`;
};
const placedHeart = (size, span, id) => {
  const scale = (size * span) / 242;
  const tx = size / 2 - 161 * scale;
  const ty = size / 2 - 129 * scale + size * 0.03;
  // Heart floating above, between the two heads (pair coords ~ 150, 30).
  return `<g transform="translate(${tx + 128 * scale} ${ty - 6 * scale}) scale(${(46 * scale) / 24})">${heart(id)}</g>`;
};

const background = (size, id) => `
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE6F2"/><stop offset="1" stop-color="#E6DCFF"/></linearGradient>
    <radialGradient id="${id}glow" cx="0.3" cy="0.2" r="0.8"><stop offset="0" stop-color="#fff" stop-opacity="0.75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#${id})"/>
  <rect width="${size}" height="${size}" fill="url(#${id}glow)"/>`;

const svg = (size, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${body}</svg>`;

const out = {
  // iOS / general app icon: full-bleed, opaque. iOS rounds the corners itself.
  'icon.svg': svg(1024, background(1024, 'bg') + placedPair(1024, 0.74, 'p') + placedHeart(1024, 0.74, 'h')),
  // Android adaptive: content inside the central safe zone (~66%).
  'android-foreground.svg': svg(1024, placedPair(1024, 0.5, 'p') + placedHeart(1024, 0.5, 'h')),
  'android-background.svg': svg(1024, background(1024, 'bg')),
  'android-monochrome.svg': svg(1024, placedPair(1024, 0.5, 'p', { mono: true })),
  // Splash: transparent artwork, shown on a solid colour.
  'splash.svg': svg(1024, placedPair(1024, 0.86, 'p') + placedHeart(1024, 0.86, 'h')),
  // Favicon: small, so no faces.
  'favicon.svg': svg(256, background(256, 'bg') + placedPair(256, 0.86, 'p', { faces: false })),
};
for (const [name, content] of Object.entries(out)) writeFileSync(name, content);
console.log(Object.keys(out).join(' '));
