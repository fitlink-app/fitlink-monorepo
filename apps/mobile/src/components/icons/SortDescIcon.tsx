import React from 'react';
import Svg, {Path} from 'react-native-svg';

import {IconComponentType} from './types';

export const SortDescIcon: IconComponentType = ({
  size = 24,
  color = '#ffffff',
}) => {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <Path
        d="M20 4v12h3l-4 5-4-5h3V4h2Zm-8 14v2H3v-2h9Zm2-7v2H3v-2h11Zm0-7v2H3V4h11Z"
        fill={color}
      />
    </Svg>
  );
};

export default SortDescIcon;
