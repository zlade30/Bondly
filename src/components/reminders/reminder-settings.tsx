import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, Switch, View } from 'react-native';

import { tapFeedback } from '@/components/bondly/buttons';
import { BText } from '@/components/bondly/text';
import { Palette, Radius, Shadow, Space } from '@/constants/bondly';
import { formatTime, useReminders } from '@/features/reminders/reminders';

/** On/off switch and time for the daily reminder. Changes apply straight away. */
export function ReminderSettings() {
  const { enabled, hour, minute, enable, disable, setTime } = useReminders();
  const [showPicker, setShowPicker] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggle = async (on: boolean) => {
    tapFeedback();
    if (!on) {
      disable();
      setShowPicker(false);
      return;
    }
    setBusy(true);
    const result = await enable().catch(() => 'denied' as const);
    setBusy(false);
    if (result === 'denied') {
      Alert.alert(
        'Notifications are off for Bondly',
        'To get reminders, allow notifications for Bondly in your phone’s Settings.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
    }
  };

  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled, disabled: busy }}
        disabled={busy}
        onPress={() => toggle(!enabled)}
        style={styles.row}>
        <View style={styles.text}>
          <BText variant="bodyBold">Daily reminder</BText>
          <BText variant="caption" color={Palette.inkSoft}>
            {enabled ? `Every day at ${formatTime(hour, minute)}` : 'Off'}
          </BText>
        </View>
        <Switch
          accessibilityLabel="Daily reminder"
          value={enabled}
          disabled={busy}
          onValueChange={toggle}
          trackColor={{ true: Palette.primary, false: Palette.track }}
          thumbColor={Palette.white}
        />
      </Pressable>

      {enabled && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Reminder time, ${formatTime(hour, minute)}`}
            onPress={() => {
              tapFeedback();
              setShowPicker((s) => !s);
            }}
            style={styles.timeRow}>
            <BText variant="bodyBold">Time</BText>
            <View style={styles.timePill}>
              <BText variant="bodyBold" color={Palette.primaryDeep}>
                {formatTime(hour, minute)}
              </BText>
            </View>
          </Pressable>

          {showPicker && (
            <DateTimePicker
              mode="time"
              value={new Date(2000, 0, 1, hour, minute)}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              minuteInterval={5}
              onValueChange={(_, date) => {
                if (Platform.OS !== 'ios') setShowPicker(false);
                setTime(date.getHours(), date.getMinutes());
              }}
              onDismiss={() => setShowPicker(false)}
            />
          )}

          <BText variant="caption" style={styles.note}>
            We skip it on days you’ve already practised.
          </BText>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.white,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.sm,
    ...Shadow.soft,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Space.md },
  text: { flex: 1, gap: 2 },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Space.md,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    marginTop: Space.xs,
  },
  timePill: {
    backgroundColor: Palette.lilac,
    borderRadius: Radius.pill,
    paddingHorizontal: Space.md,
    paddingVertical: 4,
  },
  note: { marginTop: Space.xs },
});
