import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, View } from 'react-native';
import { PACKAGE_TYPE, type PurchasesPackage } from 'react-native-purchases';

import { PrimaryButton, TextButton, tapFeedback } from '@/components/bondly/buttons';
import { Bondling, HeartIcon } from '@/components/bondly/mascot';
import { Check } from '@/components/bondly/option';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { Links } from '@/constants/links';
import { friendlyAuthError } from '@/features/account/auth';
import { ALL_COURSES, COURSES } from '@/features/learn/content';
import { JOURNEYS } from '@/features/learn/journeys';
import { isPlayable } from '@/features/learn/lessons';
import { useSubscription } from '@/features/premium/subscription';

const LESSON_COUNT = ALL_COURSES.reduce((n, c) => n + c.lessons.filter((l) => isPlayable(l.id)).length, 0);

/** The store's own names, so Android never reads about an Apple Account or the App Store. */
const STORE =
  Platform.OS === 'android'
    ? { account: 'Google account', settings: 'Google Play subscriptions' }
    : { account: 'Apple Account', settings: 'App Store settings' };

/** A round "380+" rather than an exact "381", which reads like a stock count. */
const LESSONS = LESSON_COUNT >= 20 ? `${Math.floor(LESSON_COUNT / 10) * 10}+` : `${LESSON_COUNT}`;

const BENEFITS = [
  JOURNEYS.length > 0
    ? `${LESSONS} bite-size lessons across ${JOURNEYS.length} ${JOURNEYS.length === 1 ? 'journey' : 'journeys'}`
    : `${LESSONS} bite-size lessons across ${COURSES.length} courses`,
  'Daily check-ins and your private journal',
  'Streaks, reminders and your connection map',
  'New lessons as they’re added',
];

/** Display order: shortest commitment first, then longer ones. */
const ORDER = [PACKAGE_TYPE.WEEKLY, PACKAGE_TYPE.MONTHLY, PACKAGE_TYPE.ANNUAL, PACKAGE_TYPE.LIFETIME];

/** The plan picked before you choose: the yearly one (best value, and usually where the trial is). */
const PRESELECTED = PACKAGE_TYPE.ANNUAL;

const PERIOD: Partial<Record<PACKAGE_TYPE, string>> = {
  [PACKAGE_TYPE.WEEKLY]: 'week',
  [PACKAGE_TYPE.MONTHLY]: 'month',
  [PACKAGE_TYPE.ANNUAL]: 'year',
};

const NAME: Partial<Record<PACKAGE_TYPE, string>> = {
  [PACKAGE_TYPE.WEEKLY]: 'Weekly',
  [PACKAGE_TYPE.MONTHLY]: 'Monthly',
  [PACKAGE_TYPE.ANNUAL]: 'Yearly',
  [PACKAGE_TYPE.LIFETIME]: 'Lifetime',
};

/**
 * A zero price in the plan's own currency, e.g. "$0.00" or "₱0.00". The App
 * Store's own string is used when it has one; otherwise the digits in the
 * plan's price are swapped for zeros, keeping the symbol and decimals.
 */
function zeroPrice(pkg: PurchasesPackage) {
  const fromStore = pkg.product.introPrice?.priceString;
  if (fromStore) return fromStore;
  // Keep the symbol and the decimal style ("49.99" → "0.00", "9,99" → "0,00", "1200" → "0").
  return pkg.product.priceString.replace(/\d[\d.,\s\u00A0]*\d|\d/, (n) => {
    const decimals = /([.,])(\d{2})$/.exec(n);
    return decimals ? `0${decimals[1]}00` : '0';
  });
}

/** The free trial on this plan, as "7-day" and "7 days" plus its "$0.00" price, or null if it has none. */
function freeTrial(pkg: PurchasesPackage) {
  const intro = pkg.product.introPrice;
  if (!intro || intro.price !== 0) return null;
  let count = intro.periodNumberOfUnits;
  let unit = intro.periodUnit.toLowerCase();
  if (unit === 'week') {
    count *= 7;
    unit = 'day';
  }
  return { label: `${count}-${unit}`, length: `${count} ${unit}${count === 1 ? '' : 's'}`, price: zeroPrice(pkg) };
}

function sortPackages(packages: PurchasesPackage[]) {
  const rank = (p: PurchasesPackage) => {
    const i = ORDER.indexOf(p.packageType);
    return i === -1 ? ORDER.length : i;
  };
  return [...packages].sort((a, b) => rank(a) - rank(b));
}

export default function PaywallScreen() {
  const { available, offering, offeringError, trialEligible, loadOffering, purchase, restore } =
    useSubscription();
  // Only offer a trial this person will actually get (one per subscription group).
  const trialFor = (pkg: PurchasesPackage) => (trialEligible.has(pkg.product.identifier) ? freeTrial(pkg) : null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState<'buy' | 'restore' | null>(null);

  useEffect(() => {
    loadOffering();
  }, [loadOffering]);

  const packages = sortPackages(offering?.availablePackages ?? []);
  const selected =
    packages.find((p) => p.identifier === selectedId) ??
    packages.find((p) => p.packageType === PRESELECTED) ??
    packages[0] ??
    null;
  const trial = selected ? trialFor(selected) : null;
  // Only promise a free trial when the plans really include one.
  const anyTrial = packages.map(trialFor).find((t) => t !== null) ?? null;
  const period = selected ? PERIOD[selected.packageType] : undefined;

  const buy = async () => {
    if (!selected) return;
    setBusy('buy');
    try {
      await purchase(selected);
      // Once unlocked, the app switches to Home on its own.
    } catch (e) {
      Alert.alert('Purchase didn’t go through', friendlyAuthError(e));
    } finally {
      setBusy(null);
    }
  };

  const restorePurchases = async () => {
    setBusy('restore');
    try {
      const found = await restore();
      if (!found) {
        Alert.alert(
          'Nothing to restore',
          `We couldn’t find a Bondly purchase for this ${STORE.account}. If you subscribed on another ${STORE.account}, sign in to the Bondly account you used then, under Settings → Account.`
        );
      }
    } catch (e) {
      Alert.alert('Couldn’t restore purchases', friendlyAuthError(e));
    } finally {
      setBusy(null);
    }
  };

  const ctaLabel = !selected
    ? 'Continue'
    : busy === 'buy'
      ? 'Just a moment…'
      : trial
        ? `Start ${trial.price} for ${trial.length}`
        : selected.packageType === PACKAGE_TYPE.LIFETIME
          ? `Unlock forever for ${selected.product.priceString}`
          : 'Subscribe';

  const terms = !selected
    ? null
    : selected.packageType === PACKAGE_TYPE.LIFETIME
      ? `One payment of ${selected.product.priceString}. No subscription, yours to keep.`
      : trial
        ? `Free for ${trial.length}, then ${selected.product.priceString} per ${period}. Cancel anytime in your ${STORE.settings} at least 24 hours before the trial ends and you won’t be charged.`
        : `${selected.product.priceString} per ${period}. Renews automatically until you cancel in your ${STORE.settings}, at least 24 hours before the renewal date.`;

  return (
    <Screen
      scroll
      footer={
        <View style={styles.footer}>
          <PrimaryButton label={ctaLabel} onPress={buy} disabled={!selected || busy !== null} />
          {terms && (
            <BText variant="caption" center>
              {terms}
            </BText>
          )}
        </View>
      }>
      <View style={styles.topBar}>
        <TextButton label="Settings" onPress={() => router.push('/settings' as Href)} />
        <TextButton
          label={busy === 'restore' ? 'Restoring…' : 'Restore'}
          onPress={restorePurchases}
          disabled={busy !== null}
        />
      </View>

      <View style={styles.hero}>
        <Float distance={8} duration={2000}>
          <Bondling size={120} color="pink" mood="happy" prop="heart" />
        </Float>
        <Float style={styles.heart} distance={10} duration={1600}>
          <HeartIcon size={30} />
        </Float>
      </View>

      <BText variant="title" center>
        Grow closer with Bondly
      </BText>
      <BText variant="body" center style={styles.sub}>
        {anyTrial
          ? `Try everything free for ${anyTrial.length}. Cancel anytime.`
          : 'Unlock every course, lesson and tool.'}
      </BText>

      <View style={styles.benefits}>
        {BENEFITS.map((b) => (
          <View key={b} style={styles.benefit}>
            <Check on />
            <BText variant="bodyBold" style={styles.flex}>
              {b}
            </BText>
          </View>
        ))}
      </View>

      {!available ? (
        <Notice text="Plans aren’t set up yet. Add the RevenueCat keys in src/constants/revenuecat-config.ts." />
      ) : packages.length === 0 ? (
        offeringError ? (
          <Notice text={`Couldn’t load plans. ${offeringError}`} onRetry={loadOffering} />
        ) : (
          <ActivityIndicator color={Palette.primary} style={styles.loading} />
        )
      ) : (
        <View accessibilityRole="radiogroup" style={styles.plans}>
          {packages.map((pkg) => (
            <PlanCard
              key={pkg.identifier}
              pkg={pkg}
              trial={trialFor(pkg)}
              selected={pkg.identifier === selected?.identifier}
              onPress={() => {
                tapFeedback();
                setSelectedId(pkg.identifier);
              }}
            />
          ))}
        </View>
      )}

      {/* After a reinstall, a new phone or switching Bondly accounts, this is the way back in. */}
      <View style={styles.restoreHint}>
        <BText variant="body" center>
          Subscribed before? Bring back a purchase made with this {STORE.account}.
        </BText>
        <TextButton
          label={busy === 'restore' ? 'Restoring…' : 'Restore purchase'}
          onPress={restorePurchases}
          disabled={busy !== null}
        />
      </View>

      <View style={styles.links}>
        <BText
          variant="caption"
          color={Palette.primaryDeep}
          onPress={() => WebBrowser.openBrowserAsync(Links.terms).catch(() => {})}>
          Terms of Use
        </BText>
        <BText variant="caption">·</BText>
        <BText
          variant="caption"
          color={Palette.primaryDeep}
          onPress={() => WebBrowser.openBrowserAsync(Links.privacy).catch(() => {})}>
          Privacy Policy
        </BText>
      </View>
    </Screen>
  );
}

function PlanCard({
  pkg,
  trial,
  selected,
  onPress,
}: {
  pkg: PurchasesPackage;
  trial: ReturnType<typeof freeTrial>;
  selected: boolean;
  onPress: () => void;
}) {
  const type = pkg.packageType;
  const period = PERIOD[type];
  const perWeek = type === PACKAGE_TYPE.ANNUAL || type === PACKAGE_TYPE.MONTHLY ? pkg.product.pricePerWeekString : null;
  const badge = type === PACKAGE_TYPE.ANNUAL ? 'Best value' : type === PACKAGE_TYPE.LIFETIME ? 'Pay once' : null;
  const detail =
    type === PACKAGE_TYPE.LIFETIME
      ? 'One-time purchase'
      : trial
        ? `${trial.label} free trial`
        : `Billed every ${period}`;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.plan, selected && styles.planOn]}>
      {badge && (
        <View style={styles.badge}>
          <BText variant="caption" color={Palette.white} style={styles.badgeText}>
            {badge}
          </BText>
        </View>
      )}
      <Check on={selected} />
      <View style={styles.flex}>
        <BText variant="bodyBold">{NAME[type] ?? pkg.product.title}</BText>
        <BText variant="caption">{detail}</BText>
      </View>
      <View style={styles.price}>
        <BText variant="bodyBold">
          {pkg.product.priceString}
          {period ? <BText variant="caption">/{period}</BText> : null}
        </BText>
        {perWeek && <BText variant="caption">{perWeek}/week</BText>}
      </View>
    </Pressable>
  );
}

function Notice({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <View style={styles.notice}>
      <BText variant="body" center>
        {text}
      </BText>
      {onRetry && <TextButton label="Try again" onPress={onRetry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Space.sm },
  hero: { alignItems: 'center', marginTop: Space.md, marginBottom: Space.md },
  heart: { position: 'absolute', top: 0, right: '30%' },
  sub: { marginTop: Space.xs },
  benefits: { gap: Space.md, marginTop: Space.xl, marginBottom: Space.xl },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  plans: { gap: Space.md },
  plan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.lg,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    borderWidth: 2,
    borderColor: 'transparent',
    ...Shadow.soft,
  },
  planOn: { borderColor: Palette.primary, backgroundColor: Palette.lilac },
  badge: {
    position: 'absolute',
    top: -11,
    right: Space.lg,
    backgroundColor: Palette.primaryDeep,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.md,
    paddingVertical: 2,
  },
  badgeText: { fontSize: 12 },
  price: { alignItems: 'flex-end' },
  notice: { backgroundColor: Palette.white, borderRadius: Radius.lg, padding: Space.lg, gap: Space.sm },
  loading: { marginVertical: Space.xl },
  restoreHint: { alignItems: 'center', gap: Space.xs, marginTop: Space.xl },
  links: { flexDirection: 'row', justifyContent: 'center', gap: Space.sm, marginTop: Space.lg },
  footer: { gap: Space.sm },
});
