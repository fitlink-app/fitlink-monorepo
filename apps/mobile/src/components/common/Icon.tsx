import React from 'react';
import {ActivityIndicator} from 'react-native';
import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import {IconProps as IcoMoonIconProps} from 'react-native-vector-icons/Icon';
import styled from 'styled-components/native';
import icoMoonConfig from '../../../assets/fitlink_icon_selection.json';
import {TouchHandler, TouchHandlerProps} from './TouchHandler';

export const IcoMoonIcon = createIconSetFromIcoMoon(icoMoonConfig);

const LoadingContainer = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
});

interface IconProps
  extends Omit<IcoMoonIconProps, 'onPress'>,
    Pick<TouchHandlerProps, 'onPress'> {
  hitSlop?: number;
  disabled?: boolean;
  isLoading?: boolean;
}

export const Icon = ({
  onPress,
  disabled,
  hitSlop = 10,
  isLoading,
  style,
  ...rest
}: IconProps) => {
  const hitSlopInsets = {
    top: hitSlop,
    left: hitSlop,
    bottom: hitSlop,
    right: hitSlop,
  };

  return (
    <TouchHandler
      {...{onPress, style}}
      disabled={!onPress || disabled}
      hitSlop={hitSlopInsets}>
      {isLoading ? (
        <LoadingContainer style={{height: rest.size, width: rest.size}}>
          <ActivityIndicator color={rest.color} />
        </LoadingContainer>
      ) : (
        <IcoMoonIcon {...rest} />
      )}
    </TouchHandler>
  );
};
