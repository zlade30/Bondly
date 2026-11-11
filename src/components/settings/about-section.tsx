import * as WebBrowser from 'expo-web-browser';
import { Linking, Platform, Pressable, StyleSheet, View } from 'react-native';

import { tapFeedback } from '@/components/bondly/buttons';
import { ChevronRightIcon } from '@/components/bondly/icons';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { Links } from '@/constants/links';

const ROWS = [
  // Shown once the App Store ID is set; opens the App Store's "Write a Review" page.
  ...(Links.writeReview ? [{ label: 'Rate Bondly', url: Links.writeReview, external: true }] : []),
  { label: 'Privacy Policy', url: Links.privacy },
  { label: 'Terms of Use', url: Links.terms },
  { label: 'Bondly website', url: Links.site },
];

/** Links to the legal pages and website, plus the "not therapy" note. */
export function AboutSection() {
  return (
    <View style={styles.card}>
      {ROWS.map((row, i) => (
        <Pressable
          key={row.url}
          accessibilityRole="link"
          onPress={() => {
            tapFeedback();
            // The store apps open from their own links; on Android, fall back to the Play website if needed.
            if ('external' in row)
              Linking.openURL(row.url).catch(() => {
                if (Platform.OS === 'android') Linking.openURL(Links.playStoreWeb).catch(() => {});
              });
            else WebBrowser.openBrowserAsync(row.url).catch(() => {});
          }}
          style={({ pressed }) => [styles.row, i > 0 && styles.divider, pressed && { opacity: 0.6 }]}>
          <BText variant="bodyBold" style={styles.label}>
            {row.label}
          </BText>
          <ChevronRightIcon size={20} color={Palette.inkSoft} />
        </Pressable>
      ))}
      <BText variant="caption" style={styles.note}>
        Bondly teaches everyday relationship skills. It isn’t therapy or medical advice. If you’re in danger or
        being hurt, please contact your local emergency services.
      </BText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    paddingHorizontal: Space.lg,
    paddingTop: Space.xs,
    paddingBottom: Space.lg,
    ...Shadow.soft,
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: Space.md },
  divider: { borderTopWidth: 1, borderTopColor: Palette.border },
  label: { flex: 1 },
  note: { marginTop: Space.sm },
});
