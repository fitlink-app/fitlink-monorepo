import React from 'react';
import Svg, {Path} from 'react-native-svg';

import {IconComponentType} from './types';

export const CloseLineIcon: IconComponentType = ({
  size = 14,
  color = '#ffffff',
}) => {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <Path fill="none" d="M0 0h24v24H0z" />
      <Path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
    </Svg>
  );
};

export default CloseLineIcon;
