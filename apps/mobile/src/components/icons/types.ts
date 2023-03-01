import {FC} from 'react';
import {SvgProps} from 'react-native-svg';

export interface IconProps extends Omit<SvgProps, 'fill'> {
  size?: number;
  width?: number;
  height?: number;
  color?: string;
}

export type IconComponentType = FC<IconProps>;
