import type { BottomTabBarProps } from 'expo-router/js-tabs';
import type { ComponentType } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Palette, Radius, Space } from '@/constants/bondly';

import { tapFeedback } from './buttons';
import { BookIcon, HeartOutlineIcon, HomeIcon, PersonIcon } from './icons';
import { BText } from './text';

type TabIcon = ComponentType<{ size?: number; color?: string; filled?: boolean }>;

const TABS: Record<string, { label: string; Icon: TabIcon }> = {
  index: { label: 'Home', Icon: HomeIcon },
  learn: { label: 'Learn', Icon: BookIcon },
  reflect: { label: 'Reflect', Icon: HeartOutlineIcon },
  profile: { label: 'Profile', Icon: PersonIcon },
};

/** Bondly's soft white tab bar with a lilac pill behind the active tab. */
export function BondlyTabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom - 6, Space.md) }]}>
      {state.routes.map((route, index) => {
        const tab = TABS[route.name];
        if (!tab) return null;
        const focused = state.index === index;
        const color = focused ? Palette.primary : Palette.inkMuted;

        const onPress = () => {
          const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            tapFeedback();
            navigateToTab(route.key);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            onPress={onPress}
            style={styles.item}>
            <View style={[styles.pill, focused && styles.pillOn]}>
              <tab.Icon size={28} color={color} filled={focused} />
              <BText variant="caption" color={color} style={styles.label}>
                {tab.label}
              </BText>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Palette.white,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Space.sm,
    paddingHorizontal: Space.sm,
    shadowColor: '#7C5CFC',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  item: { flex: 1, alignItems: 'center' },
  pill: {
    alignItems: 'center',
    gap: 2,
    paddingVertical: Space.sm,
    paddingHorizontal: Space.lg,
    borderRadius: Radius.lg,
  },
  pillOn: { backgroundColor: Palette.lilac },
  label: { fontFamily: 'Nunito_800ExtraBold', fontSize: 13 },
});
