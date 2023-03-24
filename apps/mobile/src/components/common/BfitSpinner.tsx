import React, {FC} from 'react';
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  StyleProp,
  StyleSheet,
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

export const BfitSpinnerShimmer = () => (
  <BfitSpinner wrapperStyle={styles.shimmer} />
);

const styles = StyleSheet.create({
  shimmer: {
    zIndex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
});
