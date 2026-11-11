#!/usr/bin/env node
/**
 * Checks a relationship journey JSON file against the rules in
 * content-prompts/relationship-journeys.md before it goes into the app.
 * Also checks a skill refresher's levels file (levels 2–10; level 1 is the
 * refresher's original lessons in ./courses/<id>.ts).
 *
 *   node scripts/check-journey.mjs src/features/learn/journeys/partner.json
 *   node scripts/check-journey.mjs src/features/learn/courses/trust-levels.json
 *
 * Exits with code 1 and lists every problem if anything is wrong.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const RELATIONSHIPS = ['partner', 'dating', 'family', 'friends', 'work', 'self'];
const FOCUS = ['communication', 'trust', 'boundaries', 'conflict', 'connection', 'listening'];
const MOODS = ['happy', 'content', 'neutral', 'sad', 'upset', 'curious', 'sleepy', 'wink'];

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/check-journey.mjs <journey.json>');
  process.exit(2);
}

const problems = [];
const warnings = [];
const say = (where, msg) => problems.push(`${where}: ${msg}`);
const max = (where, value, limit) => {
  if (typeof value !== 'string' || !value.trim()) say(where, 'missing text');
  else if (value.length > limit) say(where, `too long (${value.length}/${limit} characters)`);
};
const quotes = (where, value) => {
  if (typeof value === 'string' && /['"]/.test(value))
    warnings.push(`${where}: straight quote or apostrophe (use ’ “ ”)`);
};

let data;
try {
  data = JSON.parse(readFileSync(file, 'utf8'));
} catch (e) {
  console.error(`Not valid JSON: ${e.message}`);
  process.exit(1);
}

// A skill-course activities file maps lesson id -> one mini-game step.
if (!Array.isArray(data.lessons)) {
  const ACTIVITY_KINDS = ['scene', 'sort', 'match', 'order'];
  const seen = new Map();
  const scenePositions = new Set();
  for (const [id, step] of Object.entries(data)) {
    if (!ACTIVITY_KINDS.includes(step?.kind)) {
      say(id, `kind must be one of ${ACTIVITY_KINDS.join(', ')}`);
      continue;
    }
    checkStep(step, `${id} (${step.kind})`, false);
    for (const t of [step.why, ...(step.options ?? []).map((o) => o?.why)]) {
      if (typeof t !== 'string' || t.length < 25) continue;
      if (seen.has(t)) say(id, `repeats text from ${seen.get(t)}`);
      else seen.set(t, id);
    }
    if (step.kind === 'scene') scenePositions.add(step.options.findIndex((o) => o?.correct));
  }
  if (scenePositions.size === 1) say('scenes', 'the correct reply is always in the same position; vary it');
  for (const w of warnings) console.log(`⚠︎ ${w}`);
  if (problems.length) {
    console.log(`\n✗ ${problems.length} problem(s) in ${file}:`);
    for (const p of problems) console.log(`  • ${p}`);
    process.exit(1);
  }
  console.log(`✓ ${file} looks good: ${Object.keys(data).length} activities.`);
  process.exit(0);
}

// A skill refresher's levels file: { course, levels, lessons } with lessons for levels 2–10 only.
const refresher = typeof data.course === 'string';
if (refresher) {
  if (!FOCUS.includes(data.course)) say('course', `must be one of ${FOCUS.join(', ')}`);
} else {
  if (!RELATIONSHIPS.includes(data.relationship)) say('relationship', `must be one of ${RELATIONSHIPS.join(', ')}`);
  max('journeyTitle', data.journeyTitle, 28);
  max('journeyIntro', data.journeyIntro, 140);
  quotes('journeyTitle', data.journeyTitle);
  quotes('journeyIntro', data.journeyIntro);
}
const idPrefix = refresher ? `rf-${data.course}` : data.relationship;

const lessons = Array.isArray(data.lessons) ? data.lessons : [];

// With "levels", each of the 10 levels holds 3–5 lessons, in order. The first
// lesson of level 3 is "<relationship>-3"; the others are "-3-2", "-3-3"…
// Without it, the journey is 10 lessons, one per level.
const leveled = Array.isArray(data.levels);
const expectedIds = [];
if (leveled) {
  if (data.levels.length !== 10) say('levels', `expected 10 level titles, found ${data.levels.length}`);
  const COLORS = ['pink', 'lavender', 'blue', 'yellow', 'mint', 'purple', 'peach'];
  // Every icon name the app can draw, read from the icon files so this list never goes stale.
  const iconSource = ['topic-icons.tsx', 'topic-icons-more.tsx', 'topic-icons-refreshers.tsx']
    .map((f) => readFileSync(new URL(`../src/components/bondly/${f}`, import.meta.url), 'utf8'))
    .join('\n');
  const ICONS = [...iconSource.matchAll(/^\s+'([a-z]+)',$/gm)].map((m) => m[1]);
  data.levels.forEach((lv, i) => {
    const at = `level ${i + 1}`;
    max(`${at} title`, lv?.title, 28);
    quotes(`${at} title`, lv?.title);
    if (!ICONS.includes(lv?.icon)) say(at, `icon must be one of ${ICONS.join(', ')}`);
    if (!COLORS.includes(lv?.color)) say(at, `color must be one of ${COLORS.join(', ')}`);
  });
  // Every level in the app has its own picture: no repeats here or in any other journey or refresher.
  const mine = data.levels.map((lv) => lv?.icon);
  mine.forEach((icon, i) => {
    if (mine.indexOf(icon) !== i) say(`level ${i + 1}`, `icon "${icon}" is already used by level ${mine.indexOf(icon) + 1}`);
  });
  for (const dir of ['journeys', 'courses']) {
    const folder = new URL(`../src/features/learn/${dir}/`, import.meta.url);
    for (const name of readdirSync(folder)) {
      if (!name.endsWith('.json') || new URL(name, folder).pathname === resolve(file)) continue;
      let other;
      try {
        other = JSON.parse(readFileSync(new URL(name, folder), 'utf8'));
      } catch {
        continue;
      }
      for (const lv of Array.isArray(other.levels) ? other.levels : []) {
        const i = mine.indexOf(lv?.icon);
        if (i >= 0) say(`level ${i + 1}`, `icon "${lv.icon}" is already used in ${dir}/${name}`);
      }
    }
  }
  let lastLevel = 0;
  const perLevel = new Map();
  for (const lesson of lessons) {
    const lv = lesson.level;
    if (!Number.isInteger(lv) || lv < (refresher ? 2 : 1) || lv > 10)
      say(lesson.id ?? '?', refresher ? 'level must be 2–10 (level 1 is the original lessons)' : 'level must be 1–10');
    else if (lv < lastLevel) say(lesson.id, 'lessons must be in level order');
    lastLevel = Math.max(lastLevel, lv ?? 0);
    const n = (perLevel.get(lv) ?? 0) + 1;
    perLevel.set(lv, n);
    expectedIds.push(n === 1 ? `${idPrefix}-${lv}` : `${idPrefix}-${lv}-${n}`);
  }
  for (let lv = refresher ? 2 : 1; lv <= 10; lv++) {
    const n = perLevel.get(lv) ?? 0;
    if (n < 3 || n > 5) say(`level ${lv}`, `needs 3–5 lessons, found ${n}`);
  }
} else {
  if (lessons.length !== 10) say('lessons', `expected 10, found ${lessons.length}`);
  lessons.forEach((_, i) => expectedIds.push(`${data.relationship}-${i + 1}`));
}

const usedFocus = new Set();
const seenIds = new Set();
lessons.forEach((lesson, li) => {
  const at = `lesson ${li + 1}`;
  const expectedId = expectedIds[li];
  if (lesson.id !== expectedId) say(at, `id should be "${expectedId}", found "${lesson.id}"`);
  if (seenIds.has(lesson.id)) say(at, `duplicate id "${lesson.id}"`);
  seenIds.add(lesson.id);
  max(`${at} title`, lesson.title, 28);
  max(`${at} summary`, lesson.summary, 70);
  quotes(`${at} title`, lesson.title);
  quotes(`${at} summary`, lesson.summary);
  if (![3, 4, 5].includes(lesson.minutes)) say(at, 'minutes must be 3, 4 or 5');
  if (refresher && lesson.focus !== data.course) say(at, `focus must be "${data.course}"`);
  else if (!FOCUS.includes(lesson.focus)) say(at, `focus must be one of ${FOCUS.join(', ')}`);
  else usedFocus.add(lesson.focus);

  const steps = Array.isArray(lesson.steps) ? lesson.steps : [];
  if (steps.length < 5 || steps.length > 8) say(at, `should have 5–8 steps, found ${steps.length}`);
  if (steps.at(-1)?.kind !== 'try') say(at, 'must end with a "try" step');
  if (steps.filter((s) => s.kind === 'write').length > 1) say(at, 'at most one "write" step');

  steps.forEach((step, si) => checkStep(step, `${at} step ${si + 1} (${step.kind})`, si === steps.length - 1));
});

function checkStep(step, where, isLast) {
  for (const value of Object.values(step)) quotes(where, value);
  switch (step.kind) {
    case 'read':
      max(`${where} title`, step.title, 45);
      max(`${where} body`, step.body, 220);
      if (!MOODS.includes(step.mood)) say(where, `mood must be one of ${MOODS.join(', ')}`);
      break;
    case 'choice': {
      max(`${where} prompt`, step.prompt, 160);
      const options = Array.isArray(step.options) ? step.options : [];
      if (options.length !== 3) say(where, `needs 3 options, found ${options.length}`);
      const correct = options.filter((o) => o.correct === true).length;
      if (correct !== 1) say(where, `needs exactly one correct option, found ${correct}`);
      options.forEach((o, oi) => {
        max(`${where} option ${oi + 1} text`, o.text, 90);
        max(`${where} option ${oi + 1} why`, o.why, 110);
        quotes(`${where} option ${oi + 1}`, o.text);
        quotes(`${where} option ${oi + 1}`, o.why);
      });
      break;
    }
    case 'blank':
      max(`${where} prompt`, step.prompt, 40);
      max(`${where} why`, step.why, 110);
      if (typeof step.before !== 'string' || typeof step.after !== 'string') say(where, 'needs "before" and "after"');
      if (!Array.isArray(step.words) || step.words.length !== 3) say(where, 'needs 3 words');
      else if (!step.words.includes(step.answer)) say(where, '"answer" must be one of "words"');
      break;
    case 'reflect':
      max(`${where} prompt`, step.prompt, 90);
      max(`${where} reply`, step.reply, 110);
      if (!Array.isArray(step.options) || step.options.length < 3 || step.options.length > 4)
        say(where, 'needs 3 or 4 options');
      else step.options.forEach((o, oi) => max(`${where} option ${oi + 1}`, o, 30));
      break;
    case 'write':
      max(`${where} prompt`, step.prompt, 90);
      max(`${where} placeholder`, step.placeholder, 60);
      break;
    case 'scene': {
      max(`${where} title`, step.title, 40);
      max(`${where} them`, step.them, 24);
      max(`${where} prompt`, step.prompt, 60);
      const lines = Array.isArray(step.lines) ? step.lines : [];
      if (lines.length < 2 || lines.length > 5) say(where, `needs 2–5 chat lines, found ${lines.length}`);
      lines.forEach((l, i) => {
        if (l.from !== 'them' && l.from !== 'you') say(where, `line ${i + 1} "from" must be "them" or "you"`);
        max(`${where} line ${i + 1}`, l.text, 120);
        quotes(`${where} line ${i + 1}`, l.text);
      });
      const options = Array.isArray(step.options) ? step.options : [];
      if (options.length !== 3) say(where, `needs 3 reply options, found ${options.length}`);
      if (options.filter((o) => o.correct === true).length !== 1) say(where, 'needs exactly one correct reply');
      options.forEach((o, oi) => {
        max(`${where} option ${oi + 1} text`, o.text, 90);
        max(`${where} option ${oi + 1} reaction`, o.reaction, 100);
        max(`${where} option ${oi + 1} why`, o.why, 110);
        for (const t of [o.text, o.reaction, o.why]) quotes(`${where} option ${oi + 1}`, t);
      });
      break;
    }
    case 'sort': {
      max(`${where} prompt`, step.prompt, 60);
      max(`${where} left`, step.left, 14);
      max(`${where} right`, step.right, 14);
      max(`${where} why`, step.why, 140);
      const cards = Array.isArray(step.cards) ? step.cards : [];
      if (cards.length < 4 || cards.length > 6) say(where, `needs 4–6 cards, found ${cards.length}`);
      const sides = new Set(cards.map((c) => c.side));
      if (!sides.has('left') || !sides.has('right')) say(where, 'cards must use both sides');
      cards.forEach((c, i) => {
        max(`${where} card ${i + 1}`, c.text, 70);
        quotes(`${where} card ${i + 1}`, c.text);
      });
      break;
    }
    case 'match': {
      max(`${where} prompt`, step.prompt, 60);
      max(`${where} why`, step.why, 140);
      const pairs = Array.isArray(step.pairs) ? step.pairs : [];
      if (pairs.length < 3 || pairs.length > 4) say(where, `needs 3–4 pairs, found ${pairs.length}`);
      pairs.forEach((p, i) => {
        max(`${where} pair ${i + 1} a`, p.a, 40);
        max(`${where} pair ${i + 1} b`, p.b, 40);
        quotes(`${where} pair ${i + 1}`, p.a);
        quotes(`${where} pair ${i + 1}`, p.b);
      });
      break;
    }
    case 'order': {
      max(`${where} prompt`, step.prompt, 60);
      max(`${where} why`, step.why, 140);
      const items = Array.isArray(step.items) ? step.items : [];
      if (items.length < 3 || items.length > 5) say(where, `needs 3–5 items, found ${items.length}`);
      if (new Set(items).size !== items.length) say(where, 'items must all be different');
      items.forEach((t, i) => max(`${where} item ${i + 1}`, t, 40));
      break;
    }
    case 'try':
      max(`${where} body`, step.body, 140);
      if (!isLast) say(where, '"try" must be the last step');
      break;
    default:
      say(where, `unknown step kind "${step.kind}"`);
  }
}

// Template filler: the same sentence reused across lessons, generic feedback,
// or a scene-setting step that only repeats the question after it.
const seenText = new Map();
lessons.forEach((lesson, li) => {
  const steps = Array.isArray(lesson.steps) ? lesson.steps : [];
  steps.forEach((step, si) => {
    const where = `lesson ${li + 1} step ${si + 1}`;
    const texts = [step.body, step.prompt, step.reply, step.why, ...(step.options ?? []).map((o) => o?.why)];
    for (const t of texts) {
      if (typeof t !== 'string' || t.length < 25) continue;
      if (seenText.has(t)) say(where, `repeats text from ${seenText.get(t)}: “${t.slice(0, 60)}…”`);
      else seenText.set(t, where);
    }
    const next = steps[si + 1];
    if (step.kind === 'read' && next?.prompt && next.prompt.startsWith(step.body)) {
      say(where, 'just repeats the next question; teach something or remove it');
    }
  });
});

// If the right answer is always in the same place, people learn the position, not the skill.
const correctPositions = new Set(
  lessons.flatMap((l) =>
    (l.steps ?? []).filter((s) => s.kind === 'choice').map((s) => (s.options ?? []).findIndex((o) => o?.correct))
  )
);
if (lessons.length > 3 && correctPositions.size === 1) {
  say('choices', 'the correct option is always in the same position; vary it');
}
const answerPositions = new Set(
  lessons.flatMap((l) =>
    (l.steps ?? []).filter((s) => s.kind === 'blank').map((s) => (s.words ?? []).indexOf(s.answer))
  )
);
if (lessons.length > 3 && answerPositions.size === 1) {
  say('blanks', 'the answer is always in the same place in the word bank; vary it');
}

// Journeys cover all six skills; a refresher practises just its own.
const missingFocus = refresher ? [] : FOCUS.filter((f) => !usedFocus.has(f));
if (missingFocus.length) say('focus areas', `not used: ${missingFocus.join(', ')}`);

for (const w of warnings) console.log(`⚠︎ ${w}`);
if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s) in ${file}:`);
  for (const p of problems) console.log(`  • ${p}`);
  process.exit(1);
}
console.log(
  `✓ ${file} looks good: ${lessons.length} lessons, ${refresher ? data.course : `${usedFocus.size}/6 skills`}${warnings.length ? `, ${warnings.length} quote warning(s)` : ''}.`
);
