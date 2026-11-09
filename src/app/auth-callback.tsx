import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { PrimaryButton } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Palette, Space } from '@/constants/bondly';
import { completeSignIn, friendlyAuthError, type SignInParams } from '@/features/account/auth';

/** Give up waiting after this long, so the screen can never spin forever. */
const TIMEOUT_MS = 20000;

function leave() {
  // Usually opened on top of the account screen, which then shows "You're signed in".
  if (router.canGoBack()) router.back();
  else router.replace('/' as Href);
}

/**
 * Opened by the link in a sign-in email. Expo Router hands us the link's
 * query parameters, which carry the one-time code to exchange for a session.
 */
export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<SignInParams>();
  const { code, error_description, access_token, refresh_token } = params;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Signing in is taking too long. Check your connection and try again.')), TIMEOUT_MS)
    );
    Promise.race([completeSignIn({ code, error_description, access_token, refresh_token }), timeout])
      .then((signedIn) => {
        if (cancelled) return;
        if (signedIn) leave();
        else setError('This link doesn’t contain sign-in details. Ask for a new email and try again.');
      })
      .catch((e) => {
        if (!cancelled) setError(friendlyAuthError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [code, error_description, access_token, refresh_token]);

  return (
    <Screen footer={error ? <PrimaryButton label="Back to Bondly" onPress={leave} /> : undefined}>
      <View style={styles.center}>
        <Bondling size={140} color={error ? 'purple' : 'lavender'} mood={error ? 'neutral' : 'curious'} />
        {error ? (
          <>
            <BText variant="title" center>
              Couldn’t sign you in
            </BText>
            <BText variant="body" center>
              {error}
            </BText>
          </>
        ) : (
          <>
            <BText variant="title" center>
              Signing you in…
            </BText>
            <ActivityIndicator color={Palette.primary} />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Space.lg },
});
