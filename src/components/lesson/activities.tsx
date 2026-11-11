import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { PrimaryButton, tapFeedback } from '@/components/bondly/buttons';
import { Bondling, type BondlingColor } from '@/components/bondly/mascot';
import { OptionRow } from '@/components/bondly/option';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';

import { Feedback, StepFrame, notify, type StepProps } from './steps';
import { playSound } from '@/features/sound/sound';

const GOOD = '#1F8A60';
const GOOD_BG = '#DDF5EA';
const BAD = '#D2455A';
const BAD_BG = '#FFE4E8';

/** A different Bondling for the other person in a chat, so the two are easy to tell apart. */
const OTHER: Record<BondlingColor, BondlingColor> = {
  pink: 'blue',
  lavender: 'peach',
  blue: 'pink',
  yellow: 'lavender',
  mint: 'peach',
  purple: 'yellow',
  peach: 'mint',
};

/** Fisher–Yates shuffle that never returns the original order (when that's possible). */
function shuffled<T>(items: T[]): T[] {
  if (items.length < 2) return [...items];
  for (let attempt = 0; attempt < 5; attempt++) {
    const out = [...items];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    if (out.some((x, i) => x !== items[i])) return out;
  }
  return [...items].reverse();
}

// ---------- Chat scene ----------

const LINE_DELAY = 650;

/**
 * A short chat plays out bubble by bubble. Then you choose a reply, and the
 * other person's reaction shows how it landed.
 */
export function SceneStep({ step, onDone, color }: StepProps<'scene'>) {
  const [shown, setShown] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [missed, setMissed] = useState(false);
  const allShown = shown >= step.lines.length;
  const otherColor = OTHER[color];

  // Reveal one message at a time, like a real chat.
  useEffect(() => {
    if (allShown) return;
    const timer = setTimeout(() => setShown((n) => n + 1), LINE_DELAY);
    return () => clearTimeout(timer);
  }, [shown, allShown]);

  const chosen = selected !== null ? step.options[selected] : null;
  const correct = !!chosen?.correct;

  const check = () => {
    setChecked(true);
    notify(correct);
    if (!correct) setMissed(true);
  };

  return (
    <StepFrame
      footer={
        checked && chosen ? (
          <Feedback
            correct={correct}
            why={chosen.why}
            onContinue={() => onDone({ firstTry: !missed })}
            onRetry={() => {
              setChecked(false);
              setSelected(null);
            }}
          />
        ) : (
          <PrimaryButton label={allShown ? 'Send reply' : 'Reading…'} onPress={check} disabled={selected === null} />
        )
      }>
      <BText variant="overline" style={styles.sceneTitle}>
        {step.title}
      </BText>

      <View style={styles.chat}>
        {step.lines.slice(0, shown).map((line, i) => (
          <Bubble
            key={i}
            from={line.from}
            text={line.text}
            who={step.them}
            otherColor={otherColor}
            // Name and face only on the first of several messages in a row, like a real chat.
            first={i === 0 || step.lines[i - 1].from !== line.from}
          />
        ))}
        {checked && chosen && (
          <>
            <Bubble from="you" text={chosen.text} who={step.them} otherColor={otherColor} />
            <Bubble
              from="them"
              text={chosen.reaction}
              who={step.them}
              otherColor={otherColor}
              mood={correct ? 'happy' : 'sad'}
              delay={450}
            />
          </>
        )}
      </View>

      {allShown && !checked && (
        <Animated.View entering={FadeInDown.duration(350)} style={styles.sceneOptions}>
          <BText variant="bodyBold">{step.prompt}</BText>
          {step.options.map((o, i) => (
            <OptionRow
              key={i}
              label={o.text}
              selected={selected === i}
              onPress={() => {
                tapFeedback();
                setSelected(i);
              }}
            />
          ))}
        </Animated.View>
      )}
    </StepFrame>
  );
}

function Bubble({
  from,
  text,
  who,
  otherColor,
  mood = 'neutral',
  delay = 0,
  first = true,
}: {
  from: 'them' | 'you';
  text: string;
  who: string;
  otherColor: BondlingColor;
  mood?: 'neutral' | 'happy' | 'sad';
  delay?: number;
  first?: boolean;
}) {
  const mine = from === 'you';
  return (
    <Animated.View
      entering={(mine ? FadeInRight : FadeInLeft).delay(delay).duration(320)}
      style={[styles.bubbleRow, mine && styles.bubbleRowMine]}>
      {!mine &&
        (first ? <Bondling size={34} color={otherColor} mood={mood} noShadow /> : <View style={styles.avatarGap} />)}
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {!mine && first && (
          <BText variant="caption" color={Palette.primaryDeep} style={styles.bubbleWho}>
            {who}
          </BText>
        )}
        <BText variant="body" color={mine ? Palette.white : Palette.ink}>
          {text}
        </BText>
      </View>
    </Animated.View>
  );
}

// ---------- Swipe to sort ----------

const SWIPE_DISTANCE = 110;

/** Cards come one at a time; swipe (or tap) left or right to sort them. */
export function SortStep({ step, onDone, tint }: StepProps<'sort'>) {
  const [cards] = useState(() => shuffled(step.cards));
  const [index, setIndex] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [flash, setFlash] = useState<'good' | 'bad' | null>(null);
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  const done = index >= cards.length;
  const card = cards[Math.min(index, cards.length - 1)];

  // Lock input while a card shows its result, so a quick second tap can't skip a card.
  const busy = useRef(false);

  /** Shows whether the sort was right on the card itself, then sends it off-screen. */
  const decide = (side: 'left' | 'right') => {
    if (done || busy.current) return;
    busy.current = true;
    const right = card.side === side;
    notify(right);
    if (!right) setMistakes((m) => m + 1);
    setFlash(right ? 'good' : 'bad');
    x.value = withSpring(0, { damping: 20, stiffness: 200, overshootClamping: true });
    setTimeout(() => {
      playSound('swoosh');
      x.value = withTiming(side === 'left' ? -width : width, { duration: 220 });
      setTimeout(() => {
        setFlash(null);
        x.value = 0;
        setIndex((i) => i + 1);
        busy.current = false;
      }, 230);
    }, 850);
  };

  const pan = usePanGesture({
    onUpdate: (e) => {
      'worklet';
      x.value = e.translationX;
    },
    onDeactivate: (e) => {
      'worklet';
      if (Math.abs(e.translationX) > SWIPE_DISTANCE) {
        scheduleOnRN(decide, e.translationX < 0 ? 'left' : 'right');
      } else {
        x.value = withSpring(0, { damping: 20, stiffness: 200, overshootClamping: true });
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { rotate: `${x.value / 18}deg` }],
  }));

  if (done) {
    const right = cards.length - mistakes;
    return (
      <StepFrame
        footer={
          <Feedback correct why={step.why} onContinue={() => onDone({ firstTry: mistakes === 0 })} onRetry={() => {}} />
        }>
        <Animated.View entering={ZoomIn.duration(320)} style={styles.sortDone}>
          <BText variant="title" center>
            {right} of {cards.length} sorted right
          </BText>
          <BText variant="body" center>
            {mistakes === 0 ? 'A perfect sort!' : 'Nice work. Each one you spot gets easier next time.'}
          </BText>
        </Animated.View>
      </StepFrame>
    );
  }

  return (
    <StepFrame
      footer={
        <View style={styles.sortButtons}>
          <SortButton label={step.left} arrow="←" onPress={() => decide('left')} disabled={!!flash} />
          <SortButton label={step.right} arrow="→" onPress={() => decide('right')} disabled={!!flash} />
        </View>
      }>
      <BText variant="heading" center style={styles.sortPrompt}>
        {step.prompt}
      </BText>
      <BText variant="caption" center>
        Card {index + 1} of {cards.length} · swipe or tap
      </BText>

      <View style={styles.sortArea}>
        <View style={styles.sortLabels} pointerEvents="none">
          <BText variant="overline" color={Palette.inkSoft}>
            ← {step.left}
          </BText>
          <BText variant="overline" color={Palette.inkSoft}>
            {step.right} →
          </BText>
        </View>
        <GestureDetector gesture={pan}>
          {/* The entrance animation and the swipe movement live on separate views so they don't fight. */}
          <Animated.View key={index} entering={ZoomIn.duration(220)}>
            <Animated.View
              style={[
                styles.sortCard,
                // White until answered, so the journey tint can't be mistaken for the "right" green.
                { borderColor: tint },
                flash === 'good' && styles.sortCardGood,
                flash === 'bad' && styles.sortCardBad,
                cardStyle,
              ]}>
              <BText variant="heading" center>
                {card.text}
              </BText>
              {flash && (
                <Animated.View entering={FadeIn.duration(150)}>
                  <BText variant="bodyBold" center color={flash === 'good' ? GOOD : BAD}>
                    {flash === 'good' ? 'Right!' : `That one’s ${card.side === 'left' ? step.left : step.right}`}
                  </BText>
                </Animated.View>
              )}
            </Animated.View>
          </Animated.View>
        </GestureDetector>
      </View>
    </StepFrame>
  );
}

function SortButton({
  label,
  arrow,
  onPress,
  disabled,
}: {
  label: string;
  arrow: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => {
        tapFeedback();
        onPress();
      }}
      style={({ pressed }) => [styles.sortButton, pressed && styles.pressed, disabled && { opacity: 0.6 }]}>
      <BText variant="bodyBold" center>
        {arrow === '←' ? `${arrow} ${label}` : `${label} ${arrow}`}
      </BText>
    </Pressable>
  );
}

// ---------- Match pairs ----------

/** Tap an item on the left, then its partner on the right. */
export function MatchStep({ step, onDone }: StepProps<'match'>) {
  const [right] = useState(() => shuffled(step.pairs.map((p, i) => ({ text: p.b, pair: i }))));
  const [picked, setPicked] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const done = matched.length === step.pairs.length;
  /** Colours go in the order pairs are matched, so the first match is always green. */
  const colorFor = (pair: number) => {
    const at = matched.indexOf(pair);
    return at < 0 ? undefined : PAIR_COLORS[at % PAIR_COLORS.length];
  };

  const tryMatch = (pair: number, rightIndex: number) => {
    if (picked === null) return;
    if (pair === picked) {
      notify(true);
      setMatched((m) => [...m, pair]);
      setPicked(null);
    } else {
      notify(false);
      setMistakes((n) => n + 1);
      setWrong(rightIndex);
      setTimeout(() => setWrong(null), 500);
    }
  };

  return (
    <StepFrame
      footer={
        done ? (
          <Feedback correct why={step.why} onContinue={() => onDone({ firstTry: mistakes === 0 })} onRetry={() => {}} />
        ) : (
          <BText variant="caption" center>
            {picked === null ? 'Tap a card on the left to start' : 'Now tap its match on the right'}
          </BText>
        )
      }>
      <BText variant="heading" style={styles.matchPrompt}>
        {step.prompt}
      </BText>
      <View style={styles.matchColumns}>
        <View style={styles.matchColumn}>
          {step.pairs.map((p, i) => {
            const isDone = matched.includes(i);
            return (
              <Animated.View key={i} entering={FadeInLeft.delay(i * 60).duration(300)}>
                <MatchCard
                  text={p.a}
                  state={isDone ? 'done' : picked === i ? 'picked' : 'idle'}
                  pairColor={colorFor(i)}
                  onPress={() => {
                    if (isDone) return;
                    tapFeedback();
                    setPicked(i);
                  }}
                />
              </Animated.View>
            );
          })}
        </View>
        <View style={styles.matchColumn}>
          {right.map((r, i) => {
            const isDone = matched.includes(r.pair);
            return (
              <Animated.View key={i} entering={FadeInRight.delay(i * 60).duration(300)}>
                <MatchCard
                  text={r.text}
                  state={isDone ? 'done' : wrong === i ? 'wrong' : 'idle'}
                  pairColor={colorFor(r.pair)}
                  onPress={() => {
                    if (!isDone) tryMatch(r.pair, i);
                  }}
                />
              </Animated.View>
            );
          })}
        </View>
      </View>
    </StepFrame>
  );
}

/** Each matched pair gets its own colour, so you can still see which card went with which. */
const PAIR_COLORS = [
  { border: Palette.success, bg: GOOD_BG, text: GOOD },
  { border: '#5B7CFA', bg: '#E4E9FF', text: '#3450C4' },
  { border: '#E0A100', bg: '#FFF4D6', text: '#8A5A00' },
  { border: '#E05AA0', bg: '#FDE6F1', text: '#A8326F' },
];
type PairColor = (typeof PAIR_COLORS)[number];

function MatchCard({
  text,
  state,
  pairColor,
  onPress,
}: {
  text: string;
  state: 'idle' | 'picked' | 'done' | 'wrong';
  pairColor?: PairColor;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{
        selected: state === 'picked',
        disabled: state === 'done',
      }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.matchCard,
        state === 'picked' && styles.matchPicked,
        state === 'done' && pairColor && { borderColor: pairColor.border, backgroundColor: pairColor.bg },
        state === 'wrong' && styles.matchWrong,
        pressed && state !== 'done' && styles.pressed,
      ]}>
      <BText
        variant="bodyBold"
        center
        color={state === 'done' && pairColor ? pairColor.text : Palette.ink}
        style={styles.matchText}>
        {text}
      </BText>
    </Pressable>
  );
}

// ---------- Put in order ----------

/** Tap the items in the right order; tap a placed item to send it back. */
export function OrderStep({ step, onDone }: StepProps<'order'>) {
  const [pool] = useState(() => shuffled(step.items));
  const [placed, setPlaced] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [missed, setMissed] = useState(false);
  const full = placed.length === step.items.length;
  const correct = full && placed.every((item, i) => item === step.items[i]);

  const check = () => {
    setChecked(true);
    notify(correct);
    if (!correct) setMissed(true);
  };

  return (
    <StepFrame
      footer={
        checked ? (
          <Feedback
            correct={correct}
            why={correct ? step.why : 'Close! Have another look at what has to come first.'}
            onContinue={() => onDone({ firstTry: !missed })}
            onRetry={() => {
              setChecked(false);
              setPlaced([]);
            }}
          />
        ) : (
          <PrimaryButton label="Check order" onPress={check} disabled={!full} />
        )
      }>
      <BText variant="heading" style={styles.matchPrompt}>
        {step.prompt}
      </BText>

      <View style={styles.orderSlots}>
        {step.items.map((_, i) => {
          const item = placed[i];
          const tone = checked && item ? (item === step.items[i] ? 'good' : 'bad') : null;
          return (
            <Pressable
              key={i}
              accessibilityRole="button"
              accessibilityLabel={item ? `Step ${i + 1}: ${item}. Tap to remove.` : `Step ${i + 1}, empty`}
              disabled={!item || checked}
              onPress={() => {
                tapFeedback();
                setPlaced((p) => p.filter((x) => x !== item));
              }}
              style={[
                styles.orderSlot,
                item && styles.orderSlotFilled,
                tone === 'good' && styles.orderGood,
                tone === 'bad' && styles.matchWrong,
              ]}>
              <View style={styles.orderNumber}>
                <BText variant="bodyBold" color={Palette.white}>
                  {i + 1}
                </BText>
              </View>
              <BText variant="bodyBold" style={styles.flex} color={item ? Palette.ink : Palette.inkMuted}>
                {item ?? ' '}
              </BText>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.orderPool}>
        {pool
          .filter((item) => !placed.includes(item))
          .map((item) => (
            <Animated.View key={item} entering={FadeIn.duration(200)}>
              <Pressable
                accessibilityRole="button"
                disabled={checked}
                onPress={() => {
                  tapFeedback();
                  setPlaced((p) => [...p, item]);
                }}
                style={({ pressed }) => [styles.orderChip, pressed && styles.pressed]}>
                <BText variant="bodyBold" center>
                  {item}
                </BText>
              </Pressable>
            </Animated.View>
          ))}
      </View>
    </StepFrame>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { transform: [{ scale: 0.97 }] },

  sceneTitle: { marginBottom: Space.md },
  chat: { gap: Space.sm },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Space.xs,
    maxWidth: '88%',
  },
  bubbleRowMine: { alignSelf: 'flex-end' },
  bubble: {
    borderRadius: Radius.lg,
    paddingVertical: Space.sm,
    paddingHorizontal: Space.md,
    flexShrink: 1,
  },
  bubbleTheirs: {
    backgroundColor: Palette.white,
    borderBottomLeftRadius: 6,
    ...Shadow.soft,
  },
  bubbleMine: { backgroundColor: Palette.primary, borderBottomRightRadius: 6 },
  bubbleWho: { fontSize: 12, marginBottom: 2 },
  avatarGap: { width: 34 },
  sceneOptions: { gap: Space.sm, marginTop: Space.lg },

  sortPrompt: { marginBottom: Space.xs },
  sortArea: { flex: 1, justifyContent: 'center' },
  sortLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Space.md,
  },
  sortCard: {
    minHeight: 200,
    borderRadius: Radius.xl,
    padding: Space.xl,
    justifyContent: 'center',
    gap: Space.md,
    borderWidth: 3,
    backgroundColor: Palette.white,
    ...Shadow.soft,
  },
  sortCardGood: { borderColor: Palette.success, backgroundColor: GOOD_BG },
  sortCardBad: { borderColor: Palette.warning, backgroundColor: BAD_BG },
  sortButtons: { flexDirection: 'row', gap: Space.md },
  sortButton: {
    flex: 1,
    backgroundColor: Palette.white,
    borderRadius: Radius.pill,
    paddingVertical: Space.lg,
    paddingHorizontal: Space.md,
    borderWidth: 2,
    borderColor: Palette.border,
    ...Shadow.soft,
  },
  sortDone: { flex: 1, justifyContent: 'center', gap: Space.sm },

  matchPrompt: { marginBottom: Space.lg },
  matchColumns: { flexDirection: 'row', gap: Space.md },
  matchColumn: { flex: 1, gap: Space.sm },
  matchCard: {
    minHeight: 76,
    justifyContent: 'center',
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.md,
    borderWidth: 2,
    borderColor: Palette.border,
    ...Shadow.soft,
  },
  matchText: { fontSize: 15, lineHeight: 20 },
  matchPicked: { borderColor: Palette.primary, backgroundColor: Palette.lilac },
  matchWrong: { borderColor: Palette.warning, backgroundColor: BAD_BG },

  orderGood: { borderColor: Palette.success, backgroundColor: GOOD_BG },
  orderSlots: { gap: Space.sm },
  orderSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    minHeight: 58,
    borderRadius: Radius.lg,
    padding: Space.sm,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Palette.border,
  },
  orderSlotFilled: {
    borderStyle: 'solid',
    backgroundColor: Palette.white,
    ...Shadow.soft,
  },
  orderNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderPool: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Space.sm,
    marginTop: Space.xl,
    justifyContent: 'center',
  },
  orderChip: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    paddingVertical: Space.md,
    paddingHorizontal: Space.lg,
    borderWidth: 2,
    borderColor: Palette.border,
    ...Shadow.soft,
  },
});
