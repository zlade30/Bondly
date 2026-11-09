import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { Palette } from '@/constants/bondly';

type IconProps = { size?: number; color?: string; filled?: boolean };

const line = (color: string) => ({
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export function HomeIcon({ size = 28, color = Palette.inkMuted, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 10.4 L12 3.6 L20 10.4 V19 C20 20.1 19.1 21 18 21 H15 V15.5 C15 14.7 14.3 14 13.5 14 H10.5 C9.7 14 9 14.7 9 15.5 V21 H6 C4.9 21 4 20.1 4 19 Z"
        fill={filled ? color : 'none'}
        {...line(color)}
      />
    </Svg>
  );
}

export function BookIcon({ size = 28, color = Palette.inkMuted, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 6.5 C10 4.8 7 4.5 3 5 V19 C7 18.5 10 18.8 12 20.5 Z" fill={filled ? color : 'none'} {...line(color)} />
      <Path d="M12 6.5 C14 4.8 17 4.5 21 5 V19 C17 18.5 14 18.8 12 20.5 Z" fill={filled ? color : 'none'} {...line(color)} />
    </Svg>
  );
}

export function HeartOutlineIcon({ size = 28, color = Palette.inkMuted, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 20.5 C5.5 16.2 2.5 12.8 2.5 8.7 C2.5 5.8 4.8 3.6 7.6 3.6 C9.4 3.6 11 4.6 12 6 C13 4.6 14.6 3.6 16.4 3.6 C19.2 3.6 21.5 5.8 21.5 8.7 C21.5 12.8 18.5 16.2 12 20.5 Z"
        fill={filled ? color : 'none'}
        {...line(color)}
      />
    </Svg>
  );
}

export function PersonIcon({ size = 28, color = Palette.inkMuted, filled }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={4} fill={filled ? color : 'none'} {...line(color)} />
      <Path d="M4 20.5 C4 16.6 7.6 14 12 14 C16.4 14 20 16.6 20 20.5 Z" fill={filled ? color : 'none'} {...line(color)} />
    </Svg>
  );
}

export function BellIcon({ size = 26, color = Palette.ink }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M6 16.5 V11 C6 7.7 8.7 5 12 5 C15.3 5 18 7.7 18 11 V16.5 L19.5 18 H4.5 Z" fill="none" {...line(color)} />
      <Path d="M10 20.5 C10.4 21.3 11.1 21.7 12 21.7 C12.9 21.7 13.6 21.3 14 20.5" fill="none" {...line(color)} />
      <Path d="M12 3 V5" {...line(color)} />
    </Svg>
  );
}

export function PlayIcon({ size = 26, color = Palette.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M8 5.2 C8 4.4 8.9 3.9 9.6 4.4 L19 10.9 C19.6 11.3 19.6 12.2 19 12.6 L9.6 19.1 C8.9 19.6 8 19.1 8 18.3 Z" fill={color} />
    </Svg>
  );
}

export function ClockIcon({ size = 18, color = Palette.inkSoft }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill="none" {...line(color)} />
      <Path d="M12 7.5 V12 L15 14" fill="none" {...line(color)} />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 18, color = Palette.inkSoft }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 5 L16 12 L9 19" fill="none" {...line(color)} strokeWidth={2.4} />
    </Svg>
  );
}

export function LockIcon({ size = 18, color = Palette.inkMuted }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={5} y={10.5} width={14} height={10} rx={2.5} fill={color} />
      <Path d="M8 10.5 V8 C8 5.8 9.8 4 12 4 C14.2 4 16 5.8 16 8 V10.5" fill="none" {...line(color)} />
    </Svg>
  );
}
