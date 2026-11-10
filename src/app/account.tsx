import * as AppleAuthentication from 'expo-apple-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { CloseButton, PrimaryButton, SecondaryButton, TextButton, tapFeedback } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { BText } from '@/components/bondly/text';
import { Font, Gradients, Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { Links } from '@/constants/links';
import { useAccount } from '@/features/account/account';
import { useProgress } from '@/features/learn/progress';
import { useOnboarding } from '@/features/onboarding/store';
import { useJournal } from '@/features/reflect/journal';
import {
  appleSignInAvailable,
  friendlyAuthError,
  sendEmailSignIn,
  signInWithApple,
  signInWithGoogle,
} from '@/features/account/auth';

export default function AccountScreen() {
  const { session } = useAccount();
  const insets = useSafeAreaInsets();
  const close = () => (router.canGoBack() ? router.back() : router.replace('/' as Href));
  // iOS shows this as a sheet below the status bar; other platforms are full screen.
  const top = Platform.OS === 'ios' ? Space.lg : insets.top + Space.sm;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={Gradients.screen} style={StyleSheet.absoluteFill} />
      <View style={[styles.header, { paddingTop: top }]}>
        <CloseButton onPress={close} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Space.xxl }]}
        keyboardShouldPersistTaps="handled">
        {session ? <SignedIn onDone={close} /> : <SignIn onDone={close} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ---------- Signed out: sign-in options ----------

function SignIn({ onDone }: { onDone: () => void }) {
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [busy, setBusy] = useState<'apple' | 'google' | 'email' | 'resend' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  /** Seconds until another email can be sent (Supabase allows one a minute). */
  const [cooldown, setCooldown] = useState(0);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    appleSignInAvailable().then(setAppleAvailable);
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const run = async (which: NonNullable<typeof busy>, action: () => Promise<boolean | void>) => {
    setError(null);
    setBusy(which);
    try {
      const done = await action();
      if (done !== false && which !== 'email' && which !== 'resend') onDone();
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setBusy(null);
    }
  };

  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());

  return (
    <>
      <View style={styles.hero}>
        <Bondling size={130} color="lavender" mood="happy" prop="shield" />
        <BText variant="title" center>
          Save your progress
        </BText>
        <BText variant="body" center>
          Back up your lessons, check-ins and journal, and pick up where you left off on any phone. It’s free,
          and completely optional.
        </BText>
      </View>

      {sentTo ? (
        <View style={styles.card}>
          <BText variant="heading">Check your email</BText>
          <BText variant="body">
            We sent a sign-in link to <BText variant="bodyBold">{sentTo}</BText>. Open the email on this phone and
            tap the link to finish signing in.
          </BText>
          {resent && cooldown > 0 && (
            <BText variant="caption">New email sent. Use the link in the newest one.</BText>
          )}
          <TextButton
            label={
              busy === 'resend'
                ? 'Sending…'
                : cooldown > 0
                  ? `Resend email in ${cooldown}s`
                  : 'Didn’t get it? Resend email'
            }
            disabled={cooldown > 0 || busy !== null}
            onPress={() =>
              run('resend', async () => {
                await sendEmailSignIn(sentTo);
                setResent(true);
                setCooldown(60);
              })
            }
          />
          <TextButton
            label="Use a different email"
            onPress={() => {
              setSentTo(null);
              setError(null);
              setResent(false);
            }}
          />
        </View>
      ) : (
        <View style={styles.options}>
          {appleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={29}
              style={styles.appleButton}
              onPress={() => run('apple', signInWithApple)}
            />
          )}
          <Pressable
            accessibilityRole="button"
            disabled={busy !== null}
            onPress={() => {
              tapFeedback();
              run('google', signInWithGoogle);
            }}
            style={({ pressed }) => [styles.googleButton, pressed && { opacity: 0.85 }]}>
            {busy === 'google' ? <ActivityIndicator color={Palette.ink} /> : <GoogleLogo />}
            <BText variant="bodyBold" style={styles.googleLabel}>
              Continue with Google
            </BText>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <BText variant="caption">or use email</BText>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={Palette.inkMuted}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect={false}
            style={[styles.input, !email && styles.placeholder]}
          />
          <PrimaryButton
            label={busy === 'email' ? 'Sending…' : 'Email me a sign-in link'}
            disabled={!validEmail || busy !== null}
            onPress={() =>
              run('email', async () => {
                const address = email.trim().toLowerCase();
                await sendEmailSignIn(address);
                setSentTo(address);
                setResent(false);
                setCooldown(60);
              })
            }
          />
        </View>
      )}

      {error && (
        <View style={styles.error}>
          <BText variant="bodyBold" color={Palette.danger}>
            {error}
          </BText>
        </View>
      )}

      <BText variant="caption" center style={styles.fine}>
        🔒 Your backup is stored securely with our cloud provider and only you can read it.{' '}
        <BText
          variant="caption"
          color={Palette.primaryDeep}
          onPress={() => WebBrowser.openBrowserAsync(Links.privacy).catch(() => {})}>
          Privacy Policy
        </BText>
      </BText>
    </>
  );
}

// ---------- Signed in: account and sync ----------

function SignedIn({ onDone }: { onDone: () => void }) {
  const { email, session, syncStatus, lastSyncedAt, syncError, syncNow, signOut, deleteAccount } = useAccount();
  const { reset: resetOnboarding } = useOnboarding();
  const { reset: resetProgress } = useProgress();
  const { reset: resetJournal } = useJournal();
  const [deleting, setDeleting] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const provider = session?.user.app_metadata?.provider;
  const via = provider === 'apple' ? 'Apple' : provider === 'google' ? 'Google' : 'email';

  /**
   * Signed out means a fresh app: the progress lives in the account, so it's
   * cleared from this phone and Bondly returns to the welcome screen, where
   * "I already have an account" brings everything back.
   */
  const signOutAndClear = async () => {
    // Sign out first, so clearing the phone isn't uploaded to the account.
    await signOut();
    await resetJournal();
    await resetProgress();
    await resetOnboarding();
    router.replace('/onboarding' as Href);
  };

  const confirmSignOut = () =>
    Alert.alert(
      'Sign out?',
      'Your progress is backed up to your account and will be removed from this phone. Sign in again any time to bring it all back.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          style: 'destructive',
          onPress: async () => {
            setSigningOut(true);
            // Back up anything recent before it's removed from this phone.
            const synced = await syncNow();
            if (synced) {
              await signOutAndClear();
              return;
            }
            setSigningOut(false);
            Alert.alert(
              'Couldn’t back up your latest progress',
              'If you sign out now, anything since your last sync will be lost. Check your connection and try again, or sign out anyway.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Sign out anyway',
                  style: 'destructive',
                  onPress: async () => {
                    setSigningOut(true);
                    await signOutAndClear();
                  },
                },
              ]
            );
          },
        },
      ]
    );

  const confirmDelete = () =>
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your account and its backup of your lessons, check-ins and journal. It can’t be undone. Bondly keeps working on this phone with what’s already here.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await deleteAccount();
              Alert.alert('Account deleted', 'Your account and its backup have been permanently deleted.');
              onDone();
            } catch (e) {
              Alert.alert('Couldn’t delete your account', friendlyAuthError(e));
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );

  const syncLabel =
    syncStatus === 'syncing'
      ? 'Syncing…'
      : syncStatus === 'error'
        ? 'Couldn’t sync'
        : lastSyncedAt
          ? `Synced at ${lastSyncedAt.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
          : 'Not synced yet';

  return (
    <>
      <View style={styles.hero}>
        <Bondling size={130} color="mint" mood="happy" prop="shield" />
        <BText variant="title" center>
          You’re signed in
        </BText>
        <BText variant="body" center>
          Your lessons, check-ins and journal are backed up to your account.
        </BText>
      </View>

      <View style={styles.card}>
        <BText variant="caption">Signed in with {via}</BText>
        <BText variant="bodyBold" style={styles.email}>
          {email ?? 'Your account'}
        </BText>
        <View style={styles.syncRow}>
          <View style={[styles.dot, syncStatus === 'error' ? styles.dotError : styles.dotOk]} />
          <BText variant="body" style={styles.syncLabel}>
            {syncLabel}
          </BText>
          <TextButton label="Sync now" onPress={syncNow} />
        </View>
        {syncStatus === 'error' && syncError && (
          <BText variant="caption" color={Palette.danger}>
            {friendlyAuthError(syncError)}
          </BText>
        )}
      </View>

      <SecondaryButton
        label={signingOut ? 'Signing out…' : 'Sign out'}
        onPress={signingOut ? () => {} : confirmSignOut}
        style={styles.signOut}
      />

      <Pressable accessibilityRole="button" disabled={deleting} onPress={confirmDelete} style={styles.delete}>
        <BText variant="bodyBold" color={Palette.danger}>
          {deleting ? 'Deleting…' : 'Delete account'}
        </BText>
      </Pressable>
    </>
  );
}

function GoogleLogo() {
  return (
    <Svg width={20} height={20} viewBox="0 0 48 48" accessibilityElementsHidden>
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.surfaceSoft },
  header: { paddingHorizontal: Space.lg, paddingBottom: Space.sm },
  content: { paddingHorizontal: Space.xl, gap: Space.lg },
  hero: { alignItems: 'center', gap: Space.sm, marginBottom: Space.sm },
  options: { gap: Space.md },
  appleButton: { height: 58, width: '100%' },
  googleButton: {
    height: 58,
    borderRadius: Radius.pill,
    backgroundColor: Palette.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.md,
    borderWidth: 1.5,
    borderColor: Palette.border,
    ...Shadow.soft,
  },
  googleLabel: { fontSize: 17 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Space.md, marginVertical: Space.xs },
  dividerLine: { flex: 1, height: 1, backgroundColor: Palette.border },
  input: {
    height: 58,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    paddingHorizontal: Space.lg,
    fontFamily: Font.bold,
    fontSize: 17,
    letterSpacing: 0,
    color: Palette.ink,
    ...Shadow.soft,
  },
  /** Placeholder text can't be styled on its own, so empty fields use the regular weight. */
  placeholder: { fontFamily: Font.regular },
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.xl,
    padding: Space.lg,
    gap: Space.sm,
    ...Shadow.soft,
  },
  error: { backgroundColor: Palette.errorTint, borderRadius: Radius.md, padding: Space.md },
  fine: { marginTop: Space.sm },
  email: { fontSize: 18 },
  syncRow: { flexDirection: 'row', alignItems: 'center', gap: Space.sm, marginTop: Space.xs },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOk: { backgroundColor: Palette.success },
  dotError: { backgroundColor: Palette.warning },
  syncLabel: { flex: 1 },
  signOut: { marginTop: Space.sm },
  delete: { alignSelf: 'center', padding: Space.sm },
});
