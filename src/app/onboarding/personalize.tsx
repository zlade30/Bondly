import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PrimaryButton } from '@/components/bondly/buttons';
import { Bondling } from '@/components/bondly/mascot';
import { Float, Screen } from '@/components/bondly/screen';
import { BText } from '@/components/bondly/text';
import { Space } from '@/constants/bondly';
import { useOnboardingFlow } from '@/features/onboarding/flow';

export default function PersonalizeScreen() {
  const { next, back } = useOnboardingFlow();

  return (
    <Screen onBack={back} footer={<PrimaryButton label="Let’s go" onPress={next} />}>
      <View style={styles.center}>
        <View style={styles.art}>
          <Float distance={10}>
            <Bondling size={190} color="lavender" mood="curious" prop="sparkles" />
          </Float>
        </View>

        <Animated.View entering={FadeInDown.duration(500)} style={styles.copy}>
          <BText variant="title" center>
            Let’s make Bondly yours
          </BText>
          <BText variant="body" center>
            A few quick questions help us shape lessons around the people who matter to you.
          </BText>
        </Animated.View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', gap: Space.xl },
  art: { alignItems: 'center' },
  copy: { gap: Space.sm, paddingHorizontal: Space.sm },
});
