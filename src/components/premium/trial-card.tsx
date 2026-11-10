import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { tapFeedback } from '@/components/bondly/buttons';
import { ClockIcon } from '@/components/bondly/icons';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { useSubscription, type TrialStatus } from '@/features/premium/subscription';

const DAY_MS = 24 * 60 * 60 * 1000;
/** From this close to the end, the card stands out more. */
const SOON_MS = 2 * DAY_MS;

function whenText(endsAt: Date, now: number) {
  const left = endsAt.getTime() - now;
  const time = endsAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  if (left < DAY_MS && endsAt.getDate() === new Date(now).getDate()) return `today at ${time}`;
  if (left < 2 * DAY_MS) return `tomorrow at ${time}`;
  return `on ${endsAt.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}`;
}

function headline(trial: TrialStatus, now: number) {
  const left = trial.endsAt.getTime() - now;
  if (left <= DAY_MS) return 'Your free trial ends soon';
  const days = Math.ceil(left / DAY_MS);
  return `Free trial: ${days} days left`;
}

/**
 * Tells people during a free trial when it ends and what they'll pay after,
 * with a direct way to cancel, so nobody is charged by surprise.
 */
export function TrialCard() {
  const { trial, manageSubscription } = useSubscription();
  const [now, setNow] = useState(() => Date.now());

  // Keep the countdown current while the screen is open.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  if (!trial || trial.endsAt.getTime() <= now) return null;

  const soon = trial.endsAt.getTime() - now <= SOON_MS;
  const when = whenText(trial.endsAt, now);
  const price = trial.priceString && trial.period ? `${trial.priceString}/${trial.period}` : null;

  const body = trial.willRenew
    ? price
      ? `Your ${price} plan starts ${when}. Not for you? Cancel before then and you won’t be charged.`
      : `Your plan starts ${when}. Not for you? Cancel before then and you won’t be charged.`
    : `You’ve cancelled, so you won’t be charged. Enjoy everything until your trial ends ${when}.`;

  return (
    <View
      style={[styles.card, soon && trial.willRenew && styles.cardSoon]}
      accessibilityRole="summary"
      accessibilityLabel={`${trial.willRenew ? headline(trial, now) : 'Free trial cancelled'}. ${body}`}>
      <View style={styles.row}>
        <ClockIcon size={18} color={Palette.primaryDeep} />
        <BText variant="bodyBold" style={styles.flex}>
          {trial.willRenew ? headline(trial, now) : 'Free trial cancelled'}
        </BText>
      </View>
      <BText variant="body">{body}</BText>
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          tapFeedback();
          manageSubscription();
        }}
        hitSlop={8}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}>
        <BText variant="bodyBold" color={Palette.primaryDeep}>
          {trial.willRenew ? 'Manage subscription' : 'Keep Bondly after the trial'}
        </BText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.sm,
    marginBottom: Space.lg,
    borderWidth: 2,
    borderColor: Palette.border,
    ...Shadow.soft,
  },
  cardSoon: { borderColor: Palette.primary, backgroundColor: Palette.lilac },
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.sm },
  flex: { flex: 1 },
  button: { alignSelf: 'flex-start', paddingVertical: Space.xs },
});
