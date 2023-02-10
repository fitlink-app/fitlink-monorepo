import React, {FC} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle, Text} from 'react-native';
import theme from '../../../theme/themes/fitlink';
import {Icon} from '@components';

interface DetailedProgressBarProps {
  currentValue: number;
  requiredValue: number;
  isBfit: boolean;
  height: number;
  width: number | string;
  backgroundColor?: string;
  foregroundColor?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
}

const DetailedProgressBar: FC<DetailedProgressBarProps> = ({
  currentValue,
  requiredValue,
  height,
  width,
  isBfit = true,
  wrapperStyle,
  foregroundColor = theme.colors.accent,
  backgroundColor = theme.colors.background,
}) => {
  const progress = currentValue / requiredValue;
  const remainingValue = requiredValue - currentValue;
  const currentBfitText = `${currentValue} BFIT`;
  const requiredBfitText = `YOU NEED ${remainingValue} BFIT`;
  const currentPointsText = `${currentValue} Points`;
  const requiredPointsText = `YOU NEED ${remainingValue} Points`;

  return (
    <View style={wrapperStyle}>
      <View
        style={[
          styles.back,
          {
            height,
            width,
            backgroundColor,
            borderRadius: height,
            borderColor: foregroundColor,
          },
        ]}>
        <View
          style={{
            width: `${progress * 100}%`,
            height,
            backgroundColor: foregroundColor,
          }}
        />
      </View>
      <View style={styles.row}>
        <View style={{flexDirection: 'row'}}>
          <Icon
            style={styles.icon}
            name="wallet-solid"
            color={theme.colors.text}
            size={18}
          />
          <Text style={styles.text}>
            {isBfit ? currentBfitText : currentPointsText}
          </Text>
        </View>
        {remainingValue > 0 && (
          <Text style={styles.text}>
            {isBfit ? requiredBfitText : requiredPointsText}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  back: {
    overflow: 'hidden',
    borderStyle: 'solid',
    borderWidth: 1,
  },
  text: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.text,
  },
  row: {
    paddingTop: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  icon: {
    marginRight: 5,
  },
});

export default DetailedProgressBar;
