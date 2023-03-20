import React, {FC, ReactNode} from 'react';
import {Vibration, Platform, TouchableWithoutFeedback} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import theme from '@theme';
import styled from 'styled-components/native';

const PRESSED_BACKGROUND = theme.colors.card;
const UNPRESSED_BACKGROUND = theme.colors.background;

export interface IKeyboardKeyProps {
  onPress?(): void;
  text?: string;
  Icon?: ReactNode;
}

export const KeyboardKey: FC<IKeyboardKeyProps> = ({onPress, text, Icon}) => {
  const keyBackgroundColor = useSharedValue(UNPRESSED_BACKGROUND);

  const onPressIn = () => {
    keyBackgroundColor.value = PRESSED_BACKGROUND;
    if (Platform.OS === 'android') {
      Vibration.vibrate(50);
    }
  };

  const onPressOut = () => {
    keyBackgroundColor.value = UNPRESSED_BACKGROUND;
  };

  const keyAnimatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(keyBackgroundColor.value, {
        duration: 25,
        easing: Easing.linear,
      }),
    };
  }, []);

  return (
    <TouchableWithoutFeedback
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
    >
      <SWrapper>
        <AnimatedKey style={keyAnimatedStyle}>
          {Boolean(text) && <SText>{text}</SText>}
          {Boolean(Icon) && Icon}
        </AnimatedKey>
      </SWrapper>
    </TouchableWithoutFeedback>
  );
};

const SText = styled.Text({
  fontSize: 36,
  fontWeight: 700,
  fontFamily: 'Roboto',
  color: theme.colors.text,
});

const SWrapper = styled.View({
  width: '31%',
  margin: '1%',
  paddingVertical: 8,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'stretch',
});

const SKey = styled.View({
  flex: 1,
  borderRadius: 5,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  paddingVertical: 5,
});

const AnimatedKey = Animated.createAnimatedComponent(SKey);

export default KeyboardKey;
