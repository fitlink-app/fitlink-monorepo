import React from 'react';
import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import {IconProps as IcoMoonIconProps} from 'react-native-vector-icons/Icon';
import icoMoonConfig from '../../../assets/fitlink_icon_selection.json';
import {TouchHandler, TouchHandlerProps} from './TouchHandler';

const IcoMoonIcon = createIconSetFromIcoMoon(icoMoonConfig);

interface IconProps
  extends Omit<IcoMoonIconProps, 'onPress'>,
    Pick<TouchHandlerProps, 'onPress'> {
  hitSlop?: number;
  disabled?: boolean;
}

export const Icon = ({onPress, disabled, hitSlop = 10, ...rest}: IconProps) => {
  const hitSlopInsets = {
    top: hitSlop,
    left: hitSlop,
    bottom: hitSlop,
    right: hitSlop,
  };

  // TODO: Implement loading state

  return (
    <TouchHandler
      {...{onPress, disabled}}
      disabled={!onPress}
      hitSlop={hitSlopInsets}>
      <IcoMoonIcon {...rest} />
    </TouchHandler>
  );
};
