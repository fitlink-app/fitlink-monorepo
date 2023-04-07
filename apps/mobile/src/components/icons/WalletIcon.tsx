import * as React from 'react';
import Svg, {Rect, Path} from 'react-native-svg';
import {IconComponentType} from './types';

export const WalletIcon: IconComponentType = ({
  size = 26,
  color = '#ffffff',
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 20" fill="none">
      <Rect
        x={0.5}
        y={0.5}
        width={25}
        height={18.5}
        rx={1.5}
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M16.25 9.414a4 4 0 014-4H26v8.667h-5.75a4 4 0 01-4-4v-.667z"
        fill="#181818"
      />
      <Path
        d="M18.416 9.753c0-1.197.97-2.167 2.167-2.167H26v4.333h-5.417a2.167 2.167 0 01-2.166-2.166z"
        fill={color}
      />
      <Path
        d="M19.5 9.747a1.083 1.083 0 112.167 0 1.083 1.083 0 01-2.167 0z"
        fill="#181818"
      />
    </Svg>
  );
};

export default WalletIcon;
