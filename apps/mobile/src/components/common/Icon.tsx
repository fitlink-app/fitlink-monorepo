import React from 'react';
import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import {IconProps as IcoMoonIconProps} from 'react-native-vector-icons/Icon';
import icoMoonConfig from '../../../assets/fitlink_icon_selection.json';
import {TouchHandler, TouchHandlerProps} from './TouchHandler';

const IcoMoonIcon = createIconSetFromIcoMoon(icoMoonConfig);

interface IconProps
  extends Omit<IcoMoonIconProps, 'onPress'>,
    Pick<TouchHandlerProps, 'onPress' | 'hitSlop'> {}

export const Icon = ({onPress, hitSlop, ...rest}: IconProps) => (
  <TouchHandler {...{onPress, hitSlop}} disabled={!onPress}>
    <IcoMoonIcon {...rest} />
  </TouchHandler>
);
