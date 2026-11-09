import * as WebBrowser from 'expo-web-browser';
import { Pressable, StyleSheet, View } from 'react-native';

import { tapFeedback } from '@/components/bondly/buttons';
import { ChevronRightIcon } from '@/components/bondly/icons';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { Links } from '@/constants/links';

const ROWS = [
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
            WebBrowser.openBrowserAsync(row.url).catch(() => {});
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
