import React from 'react';
import Svg, {Path} from 'react-native-svg';

import {IconComponentType} from './types';

export const WildCardIcon: IconComponentType = ({
  size = 32,
  color = '#ffffff',
}) => {
  return (
    <Svg viewBox="0 0 24 24" width={size} height={size} fill={color}>
      <Path
        d="M4.49 16.24L2.18 14.62L3.71 12.43C4.11 11.85 4.62 11.28 5.24 10.72C5.88 10.14 6.42 9.67 6.86 9.31L6.77 9.13C6.19 9.09 5.49 9.02 4.67 8.92C3.85 8.8 3.12 8.62 2.48 8.38L0.0200001 7.48L0.98 4.81L3.47 5.71C4.11 5.95 4.78 6.3 5.48 6.76C6.2 7.2 6.8 7.6 7.28 7.96L7.43 7.84C7.25 7.28 7.06 6.58 6.86 5.74C6.68 4.88 6.59 4.09 6.59 3.37V0.7H9.41V3.37C9.41 4.09 9.31 4.88 9.11 5.74C8.91 6.58 8.73 7.28 8.57 7.84L8.69 7.96C9.17 7.6 9.76 7.2 10.46 6.76C11.18 6.3 11.87 5.95 12.53 5.71L15.02 4.81L15.98 7.48L13.49 8.38C12.85 8.62 12.12 8.8 11.3 8.92C10.5 9.02 9.81 9.09 9.23 9.13L9.11 9.34C9.57 9.7 10.11 10.17 10.73 10.75C11.35 11.31 11.85 11.87 12.23 12.43L13.79 14.62L11.48 16.24L9.92 14.05C9.54 13.49 9.18 12.82 8.84 12.04C8.52 11.24 8.27 10.56 8.09 10H7.88C7.7 10.56 7.44 11.24 7.1 12.04C6.78 12.82 6.42 13.49 6.02 14.05L4.49 16.24Z"
        fill={color}
      />
    </Svg>
  );
};

export default WildCardIcon;
