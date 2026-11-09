import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { tapFeedback } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { useAccount } from '@/features/account/account';

/** Settings row that opens the account screen and shows whether progress is backed up. */
export function AccountCard() {
  const { session, email, syncStatus } = useAccount();
  const subtitle = !session
    ? 'Optional. Back up your progress and use Bondly on more than one phone.'
    : syncStatus === 'error'
      ? 'Couldn’t sync. Tap to try again.'
      : syncStatus === 'syncing'
        ? 'Syncing…'
        : 'Backed up and in sync';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={session ? `Account, signed in as ${email ?? 'you'}` : 'Sign in to back up your progress'}
      onPress={() => {
        tapFeedback();
        router.push('/account' as Href);
      }}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
      <Bondling size={52} color={session ? 'mint' : 'lavender'} mood="happy" prop="shield" />
      <View style={styles.text}>
        <BText variant="bodyBold" numberOfLines={1}>
          {session ? (email ?? 'Signed in') : 'Sign in or create an account'}
        </BText>
        <BText variant="caption" color={syncStatus === 'error' && session ? Palette.danger : Palette.inkSoft}>
          {subtitle}
        </BText>
      </View>
      <BText variant="bodyBold" color={Palette.primaryDeep}>
        ›
      </BText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Space.md,
    padding: Space.md,
    paddingRight: Space.lg,
    borderRadius: Radius.lg,
    backgroundColor: Palette.white,
    ...Shadow.soft,
  },
  text: { flex: 1, gap: 2 },
});
