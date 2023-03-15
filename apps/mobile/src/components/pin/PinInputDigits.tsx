import React, {FC} from 'react';
import {View, StyleSheet} from 'react-native';

import theme from '@theme';
import {WildCardIcon} from '@components';

export interface IPinInputDigitsProps {
  pin: string;
  isError?: boolean;
  length: number;
}

export const PinInputDigits: FC<IPinInputDigitsProps> = ({
  pin,
  isError,
  length,
}) => {
  const getPinDigitColor = (pinDigitPosition: number) => {
    if (isError) {
      return theme.colors.danger;
    }

    if (pin[pinDigitPosition]) {
      return theme.colors.accent;
    }

    return theme.colors.secondaryText;
  };

  const pinDigits = [];
  for (
    let pinDigitPosition = 0;
    pinDigitPosition < length;
    pinDigitPosition++
  ) {
    pinDigits.push(
      <View key={pinDigitPosition} style={styles.digitWrapper}>
        <WildCardIcon size={24} color={getPinDigitColor(pinDigitPosition)} />
      </View>,
    );
  }

  return <View style={styles.pinDigitsWrapper}>{pinDigits}</View>;
};

const styles = StyleSheet.create({
  pinDigitsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 32,
  },
  digitWrapper: {
    marginHorizontal: 5,
  },
});

export default PinInputDigits;
