import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

/**
 * Where sign-in links and Google sign-in send people back to. In a build this
 * is bondly://auth-callback; in Expo Go it's an exp:// address. Both must be
 * listed under Authentication → URL Configuration → Redirect URLs in Supabase.
 */
export function authRedirectUrl() {
  return Linking.createURL('auth-callback');
}

export type SignInParams = {
  code?: string;
  error_description?: string;
  access_token?: string;
  refresh_token?: string;
};

/** Codes already being exchanged, so a screen that re-renders can't use one twice. */
const inFlight = new Map<string, Promise<boolean>>();

/** Turns the details from a sign-in link (?code=... or #access_token=...) into a session. */
export async function completeSignIn(params: SignInParams) {
  if (params.error_description) throw new Error(params.error_description);

  const { code } = params;
  if (code) {
    let pending = inFlight.get(code);
    if (!pending) {
      pending = supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) throw error;
        return true;
      });
      inFlight.set(code, pending);
    }
    return pending;
  }

  // Older-style links carry the tokens directly.
  const { access_token, refresh_token } = params;
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) throw error;
    return true;
  }
  return false;
}

/** Reads the sign-in details from a full redirect URL (used after Google sign-in). */
export function completeSignInFromUrl(url: string) {
  const parsed = new URL(url);
  const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const get = (key: string) => parsed.searchParams.get(key) ?? hash.get(key) ?? undefined;
  return completeSignIn({
    code: get('code'),
    error_description: get('error_description'),
    access_token: get('access_token'),
    refresh_token: get('refresh_token'),
  });
}

/** Emails a sign-in link. */
export async function sendEmailSignIn(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: authRedirectUrl(), shouldCreateUser: true },
  });
  if (error) throw error;
}

/** Opens Google sign-in in a secure browser sheet. Returns false if cancelled. */
export async function signInWithGoogle() {
  const redirectTo = authRedirectUrl();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;
  if (!data.url) throw new Error('Google sign-in is not available right now.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return false;
  return completeSignInFromUrl(result.url);
}

export async function appleSignInAvailable() {
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

/** Native Sign in with Apple. Returns false if cancelled. */
export async function signInWithApple() {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) throw new Error('Apple did not return a sign-in token.');
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    if (error) throw error;
    return true;
  } catch (e) {
    if (e && typeof e === 'object' && 'code' in e && e.code === 'ERR_REQUEST_CANCELED') return false;
    throw e;
  }
}

/** Plain-language versions of common sign-in errors. */
export function friendlyAuthError(e: unknown) {
  const message = e instanceof Error ? e.message : String(e);
  if (/provider is not enabled|Unsupported provider/i.test(message)) {
    return 'This sign-in option isn’t switched on yet. Try email instead.';
  }
  if (/flow state|code verifier|both auth code and code verifier/i.test(message)) {
    return 'This link was already used, or was requested from another phone. Ask for a new email on this phone and open the newest link.';
  }
  if (/rate limit|too many/i.test(message)) {
    return 'Too many attempts. Please wait a minute and try again.';
  }
  if (/expired|invalid.*(token|otp|code)/i.test(message)) {
    return 'That sign-in link has expired or was already used. Ask for a new one.';
  }
  if (/network|fetch/i.test(message)) {
    return 'Can’t reach Bondly’s servers. Check your connection and try again.';
  }
  return message;
}
