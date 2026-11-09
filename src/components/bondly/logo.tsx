import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

import { BText } from './text';

/** Two overlapping soft circles: the Bondly mark, plus the wordmark. */
export function Logo({ size = 34, wordmark = true }: { size?: number; wordmark?: boolean }) {
  return (
    <View style={styles.row}>
      <Svg width={size * 1.5} height={size} viewBox="0 0 51 34">
        <Defs>
          <LinearGradient id="logoPink" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#FFC1A8" />
            <Stop offset="1" stopColor="#FF7FB2" />
          </LinearGradient>
          <LinearGradient id="logoLav" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#D9CCFF" />
            <Stop offset="1" stopColor="#8E72F5" />
          </LinearGradient>
        </Defs>
        <Circle cx={33} cy={15} r={15} fill="url(#logoLav)" />
        <Circle cx={17} cy={19} r={15} fill="url(#logoPink)" opacity={0.95} />
      </Svg>
      {wordmark && (
        <BText variant="title" style={{ fontSize: size * 0.95, lineHeight: size * 1.15 }}>
          Bondly
        </BText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});
