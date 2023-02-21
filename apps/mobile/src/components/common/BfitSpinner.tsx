import React, {FC} from 'react';
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';

import theme from '../../theme/themes/fitlink';

interface BfitSpinnerProps extends ActivityIndicatorProps {
  wrapperStyle?: StyleProp<ViewStyle>;
}

export const BfitSpinner: FC<BfitSpinnerProps> = ({
  color = theme.colors.accent,
  wrapperStyle,
  ...props
}) => {
  return (
    <View style={wrapperStyle}>
      <ActivityIndicator color={color} {...props} />
    </View>
  );
};
