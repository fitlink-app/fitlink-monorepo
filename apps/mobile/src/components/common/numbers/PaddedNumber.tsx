import React, {FC} from 'react';
import {StyleProp, StyleSheet, Text, TextStyle} from 'react-native';

interface IPaddedNumberProps {
  amount: number;
  totalNumberOfDigits: number;
  textStyle?: StyleProp<TextStyle>;
  trailingString?: string;
}

const PaddedNumber: FC<IPaddedNumberProps> = ({
  amount,
  textStyle,
  trailingString,
  totalNumberOfDigits,
}) => {
  const numberOfDigits = String(amount).length;
  const zerosLength =
    totalNumberOfDigits - numberOfDigits > 0
      ? totalNumberOfDigits - numberOfDigits
      : 0;
  const zeros = new Array(zerosLength).fill(0).join('');

  return (
    <Text style={[totalAmountStyles.text, textStyle]}>
      {zerosLength && (
        <Text key="zeros" style={[totalAmountStyles.zeros, textStyle]}>
          {zeros}
        </Text>
      )}
      {amount}
      {!!trailingString && <>&nbsp;{trailingString}</>}
    </Text>
  );
};

const totalAmountStyles = StyleSheet.create({
  text: {
    fontFamily: 'Roboto',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '500',
    color: '#ffffff',
  },
  zeros: {
    color: '#565656',
  },
});

export default PaddedNumber;
