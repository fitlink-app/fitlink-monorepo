import React, {FC} from 'react';
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import {Label} from '@components';

export interface IHeaderCardDescriptionProps {
  description: string;
  textStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<ViewStyle>;
  measureInitialLayout: (event: LayoutChangeEvent) => void;
}

export const HeaderCardDescription: FC<IHeaderCardDescriptionProps> = ({
  measureInitialLayout,
  descriptionStyle,
  description,
  textStyle,
}) => (
  <Animated.View
    style={[styles.container, descriptionStyle]}
    onLayout={measureInitialLayout}
  >
    <AnimatedLabel
      style={[styles.text, textStyle]}
      type="body"
      appearance="secondary"
    >
      {description}
    </AnimatedLabel>
  </Animated.View>
);

const AnimatedLabel = Animated.createAnimatedComponent(Label);

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    zIndex: -20,
  },
  text: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 20,
    paddingRight: 20,
    flexShrink: 1,
  },
});

export default HeaderCardDescription;
