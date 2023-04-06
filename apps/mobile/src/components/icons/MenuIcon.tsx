import React from 'react';
import Svg, {Path} from 'react-native-svg';

import {IconComponentType} from './types';

export const MenuIcon: IconComponentType = ({size = 24, color = '#ffffff'}) => {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <Path d="M3 4h18v2H3V4Zm0 7h18v2H3v-2Zm0 7h18v2H3v-2Z" fill={color} />
    </Svg>
  );
};

export default MenuIcon;
