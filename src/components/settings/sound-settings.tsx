import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { setSoundEnabled, useSoundEnabled } from '@/features/sound/sound';

/** Turns Bondly's sound effects on or off. They also follow the silent switch. */
export function SoundSettings() {
  const enabled = useSoundEnabled();
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled }}
        onPress={() => setSoundEnabled(!enabled)}
        style={styles.row}>
        <View style={styles.text}>
          <BText variant="bodyBold">Sound effects</BText>
          <BText variant="caption" color={Palette.inkSoft}>
            {enabled ? 'On. Muted when your phone is on silent.' : 'Off'}
          </BText>
        </View>
        <Switch
          accessibilityLabel="Sound effects"
          value={enabled}
          onValueChange={setSoundEnabled}
          trackColor={{ true: Palette.primary, false: Palette.track }}
          thumbColor={Palette.white}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.lg,
    ...Shadow.soft,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  text: { flex: 1, gap: 2 },
});
