import React, {FC} from 'react';
import {StyleProp, StyleSheet, View, ViewStyle, Text} from 'react-native';
import theme from '../../../theme/themes/fitlink';

interface DetailedProgressBarProps {
  currentPoint: number;
  requiredPoint: number;
  height: number;
  width: number | string;
  backgroundColor?: string;
  foregroundColor?: string;
  wrapperStyle?: StyleProp<ViewStyle>;
}

const DetailedProgressBar: FC<DetailedProgressBarProps> = ({
  currentPoint,
  requiredPoint,
  height,
  width,
  wrapperStyle,
  foregroundColor = theme.colors.accent,
  backgroundColor = theme.colors.background,
}) => {
  const progress = currentPoint / requiredPoint;
  const currentBfitText = `${currentPoint} $BFIT`;
  const requiredBfitText = `YOU NEED ${requiredPoint - currentPoint} $BFIT`;

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
        <Text style={[styles.text, styles.textLeft, {lineHeight: height - 1}]}>
          {currentBfitText}
        </Text>
        <Text style={[styles.text, styles.textRight, {lineHeight: height - 1}]}>
          {requiredBfitText}
        </Text>
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
    position: 'absolute',
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '500',
  },
  textLeft: {
    left: 20,
    color: theme.colors.background,
  },
  textRight: {
    right: 20,
    color: theme.colors.accent,
  },
});

export default DetailedProgressBar;
