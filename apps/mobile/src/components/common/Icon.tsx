import React from 'react';
import {ActivityIndicator, StyleProp, ViewStyle} from 'react-native';
import styled from 'styled-components/native';
import icoMoonConfig from '../../../assets/fitlink_icon_selection.json';
import {TouchHandler, TouchHandlerProps} from './TouchHandler';
import IcoMoon, {IconProps} from 'react-icomoon';
import {Svg, Path} from 'react-native-svg';

const LoadingContainer = styled.View({
  justifyContent: 'center',
  alignItems: 'center',
});

interface Props
  extends Omit<IconProps, 'onPress' | 'style' | 'icon'>,
    Pick<TouchHandlerProps, 'onPress'> {
  hitSlop?: number;
  disabled?: boolean;
  isLoading?: boolean;
  name: string;
  style?: StyleProp<ViewStyle>;
}

export const Icon = ({
  onPress,
  disabled,
  hitSlop = 10,
  isLoading,
  style,
  name,
  ...rest
}: Props) => {
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
        <IcoMoon
          icon={name}
          native
          iconSet={icoMoonConfig}
          SvgComponent={Svg}
          PathComponent={Path}
          {...rest}
        />
      )}
    </TouchHandler>
  );
};
