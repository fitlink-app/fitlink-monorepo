import React from 'react';
import {TouchableOpacity, TouchableOpacityProps} from 'react-native';
import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import {IconProps as IcoMoonIconProps} from 'react-native-vector-icons/Icon';
import icoMoonConfig from '../../assets/fitlink_icon_selection.json';

const IcoMoonIcon = createIconSetFromIcoMoon(icoMoonConfig);

interface IconProps
  extends Omit<IcoMoonIconProps, 'onPress'>,
    Pick<TouchableOpacityProps, 'onPress' | 'hitSlop'> {}

export const Icon = ({onPress, hitSlop, ...rest}: IconProps) => (
  <TouchableOpacity {...{onPress, hitSlop}} disabled={!onPress}>
    <IcoMoonIcon {...rest} />
  </TouchableOpacity>
);
