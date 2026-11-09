import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Gradients, Palette, Space } from '@/constants/bondly';

import { BText } from './text';

/** Scrollable page for a tab, with the Bondly background and a large title. */
export function TabScreen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.root}>
      <LinearGradient colors={Gradients.screen} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Space.lg }]}
        showsVerticalScrollIndicator={false}>
        <BText variant="title" style={styles.title}>
          {title}
        </BText>
        {subtitle && <BText variant="body">{subtitle}</BText>}
        <View style={styles.body}>{children}</View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Palette.surfaceSoft },
  content: { paddingHorizontal: Space.xl, paddingBottom: Space.xxl },
  title: { fontSize: 32, lineHeight: 38 },
  body: { marginTop: Space.xl, gap: Space.md },
});
