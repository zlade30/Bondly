import { Tabs } from 'expo-router/js-tabs';

import { BondlyTabBar } from '@/components/bondly/tab-bar';
import { Palette } from '@/constants/bondly';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BondlyTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: Palette.surfaceSoft } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="learn" />
      <Tabs.Screen name="reflect" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
