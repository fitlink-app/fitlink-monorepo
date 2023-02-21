import React from 'react';
import {StyleProp, StyleSheet, ViewStyle} from 'react-native';
import {Svg, Path} from 'react-native-svg';
import IcoMoon, {IconProps} from 'react-icomoon';

import {BfitSpinner} from '@components';

import icoMoonConfig from '../../../assets/fitlink_icon_selection.json';
import {TouchHandler, TouchHandlerProps} from './TouchHandler';

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
        <BfitSpinner
          style={[
            styles.loadingWrapper,
            {
              height: rest.size,
              width: rest.size,
            },
          ]}
          color={rest.color}
        />
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

const styles = StyleSheet.create({
  loadingWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
