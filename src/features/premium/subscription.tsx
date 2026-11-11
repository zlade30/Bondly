import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AppState, Linking, Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

import {
  PREMIUM_ENTITLEMENT,
  REVENUECAT_APPLE_KEY,
  REVENUECAT_GOOGLE_KEY,
  REVENUECAT_TEST_KEY,
  USE_APP_STORE_IN_DEV,
} from '@/constants/revenuecat-config';
import { useAccount } from '@/features/account/account';

/** Don't hold the splash screen longer than this waiting for the store. */
const READY_TIMEOUT_MS = 4000;

function apiKey() {
  // The Test Store key only works in development builds; release builds use the store keys.
  if (__DEV__ && REVENUECAT_TEST_KEY && !USE_APP_STORE_IN_DEV) return REVENUECAT_TEST_KEY;
  return Platform.OS === 'ios' ? REVENUECAT_APPLE_KEY : REVENUECAT_GOOGLE_KEY;
}

let configured = false;
function configureOnce() {
  if (configured) return true;
  const key = apiKey();
  if (!key || Platform.OS === 'web') return false;
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.WARN);
  Purchases.configure({ apiKey: key });
  configured = true;
  return true;
}

function hasPremium(info: CustomerInfo | null) {
  return !!info?.entitlements.active[PREMIUM_ENTITLEMENT];
}

/** A free trial in progress. */
export type TrialStatus = {
  endsAt: Date;
  /** False once the person has cancelled: the trial ends and they won't be charged. */
  willRenew: boolean;
  /** What they'll pay when the trial ends, like "$49.99", if known. */
  priceString: string | null;
  /** "week", "month" or "year", if known. */
  period: string | null;
};

const PERIODS: Record<string, string> = { W: 'week', M: 'month', Y: 'year' };

function trialFrom(info: CustomerInfo | null, offering: PurchasesOffering | null): TrialStatus | null {
  const entitlement = info?.entitlements.active[PREMIUM_ENTITLEMENT];
  if (!entitlement || entitlement.periodType !== 'TRIAL' || !entitlement.expirationDate) return null;
  const product = offering?.availablePackages.find(
    (p) => p.product.identifier === entitlement.productIdentifier
  )?.product;
  // ISO 8601 period, e.g. P1W, P1M, P1Y.
  const unit = product?.subscriptionPeriod?.match(/^P1([WMY])$/)?.[1];
  return {
    endsAt: new Date(entitlement.expirationDate),
    willRenew: entitlement.willRenew,
    priceString: product?.priceString ?? null,
    period: unit ? PERIODS[unit] : null,
  };
}

type SubscriptionContextValue = {
  /** False until we know whether this person has Bondly unlocked. */
  ready: boolean;
  /** True when the store keys are set up. */
  available: boolean;
  /** An active trial, subscription or lifetime purchase. */
  isPremium: boolean;
  /** The plans to show on the paywall. */
  offering: PurchasesOffering | null;
  offeringError: string | null;
  /**
   * Product ids this person can still get a free trial on. Apple allows one
   * trial per subscription group, so after using it the paywall must not offer it again.
   */
  trialEligible: ReadonlySet<string>;
  loadOffering: () => Promise<void>;
  /** Returns false if the person cancelled. */
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  /** Returns whether a purchase was found. */
  restore: () => Promise<boolean>;
  /** A free trial in progress, so the app can say when it ends and what it costs. */
  trial: TrialStatus | null;
  /** Opens the App Store screen where people can cancel or change their plan. */
  manageSubscription: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

/**
 * Knows whether Bondly is unlocked, using RevenueCat. When someone is signed
 * in, their purchase is tied to their account so it follows them to new phones.
 * Must be inside AccountProvider.
 */
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { session, ready: accountReady } = useAccount();
  const userId = session?.user.id ?? null;

  const [available] = useState(configureOnce);
  const [ready, setReady] = useState(!available);
  const [info, setInfo] = useState<CustomerInfo | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [offeringError, setOfferingError] = useState<string | null>(null);
  const [trialEligible, setTrialEligible] = useState<ReadonlySet<string>>(() => new Set());

  // Follow purchase changes (renewals, expiries, purchases on another device).
  useEffect(() => {
    if (!available) return;
    const listener = (next: CustomerInfo) => setInfo(next);
    Purchases.addCustomerInfoUpdateListener(listener);
    return () => {
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, [available]);

  // Check again when the app returns, so renewals and expiries show up promptly.
  useEffect(() => {
    if (!available) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        Purchases.getCustomerInfo()
          .then(setInfo)
          .catch(() => {});
      }
    });
    return () => sub.remove();
  }, [available]);

  // Tie purchases to the signed-in account, then read the current status.
  useEffect(() => {
    if (!available || !accountReady) return;
    let cancelled = false;
    const timer = setTimeout(() => setReady(true), READY_TIMEOUT_MS);
    (async () => {
      try {
        if (userId) {
          const { customerInfo } = await Purchases.logIn(userId);
          if (!cancelled) setInfo(customerInfo);
        } else {
          if (!(await Purchases.isAnonymous())) await Purchases.logOut();
          const customerInfo = await Purchases.getCustomerInfo();
          if (!cancelled) setInfo(customerInfo);
        }
      } catch {
        // Offline or the store is unreachable: carry on with what we have.
      } finally {
        clearTimeout(timer);
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [available, accountReady, userId]);

  const loadOffering = useCallback(async () => {
    if (!available) return;
    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      setOffering(current);
      setOfferingError(current ? null : 'Plans aren’t available right now. Please try again later.');
      if (current) {
        // Ask Apple which trials this person can still use. If it can't say
        // (offline, or Android), show regular prices rather than promise a trial.
        const ids = current.availablePackages.map((p) => p.product.identifier);
        try {
          const result = await Purchases.checkTrialOrIntroductoryPriceEligibility(ids);
          const eligible = Purchases.INTRO_ELIGIBILITY_STATUS.INTRO_ELIGIBILITY_STATUS_ELIGIBLE;
          setTrialEligible(new Set(ids.filter((id) => result[id]?.status === eligible)));
        } catch {
          setTrialEligible(new Set());
        }
      }
    } catch (e) {
      // Store errors are written for developers; keep them out of the paywall in real builds.
      if (__DEV__) console.warn('[subscription] loading plans failed', e);
      setOfferingError('Check your connection and try again.');
    }
  }, [available]);

  const purchase = useCallback(async (pkg: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      setInfo(customerInfo);
      return true;
    } catch (e) {
      if (e && typeof e === 'object' && 'userCancelled' in e && e.userCancelled) return false;
      throw e;
    }
  }, []);

  const restore = useCallback(async () => {
    const customerInfo = await Purchases.restorePurchases();
    setInfo(customerInfo);
    return hasPremium(customerInfo);
  }, []);

  const inTrial = info?.entitlements.active[PREMIUM_ENTITLEMENT]?.periodType === 'TRIAL';

  // During a trial, load the plans too, so we can say what it will cost afterwards.
  useEffect(() => {
    if (inTrial && !offering) {
      const timer = setTimeout(loadOffering, 0);
      return () => clearTimeout(timer);
    }
  }, [inTrial, offering, loadOffering]);

  const trial = useMemo(() => trialFrom(info, offering), [info, offering]);

  const manageSubscription = useCallback(async () => {
    try {
      await Purchases.showManageSubscriptions();
    } catch {
      const url = info?.managementURL ?? 'https://apps.apple.com/account/subscriptions';
      await Linking.openURL(url).catch(() => {});
    }
  }, [info]);

  const value = useMemo(
    () => ({
      ready,
      available,
      isPremium: hasPremium(info),
      offering,
      offeringError,
      trialEligible,
      loadOffering,
      purchase,
      restore,
      trial,
      manageSubscription,
    }),
    [
      ready,
      available,
      info,
      offering,
      offeringError,
      trialEligible,
      loadOffering,
      purchase,
      restore,
      trial,
      manageSubscription,
    ]
  );

  return <SubscriptionContext value={value}>{children}</SubscriptionContext>;
}

export function useSubscription() {
  const ctx = use(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used inside SubscriptionProvider');
  return ctx;
}
