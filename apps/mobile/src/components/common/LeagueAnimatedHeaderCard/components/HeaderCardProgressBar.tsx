import React, {FC} from 'react';
import {View, ViewStyle} from 'react-native';
import Animated from 'react-native-reanimated';

import theme from '../../../../theme/themes/fitlink';

interface HeaderCardProgressBarProps {
  style: Animated.AnimateStyle<ViewStyle>;
  progress: number;
}

export const HeaderCardProgressBar: FC<HeaderCardProgressBarProps> = ({
  style,
  progress,
}) => {
  return (
    <Animated.View
      style={[
        {
          backgroundColor: theme.colors.navbar,
          height: 4,
          alignItems: 'flex-end',
        },
        style,
      ]}
    >
      <View
        style={{
          backgroundColor: theme.colors.accent,
          height: 4,
          width: `${progress * 100}%`,
        }}
      />
    </Animated.View>
  );
};

export default HeaderCardProgressBar;
