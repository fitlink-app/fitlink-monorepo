import React, {useRef} from 'react';
import {Animated, View} from 'react-native';
import SwipeableGesture from 'react-native-gesture-handler/Swipeable';

interface SwipeableProps {
  /** Height of this Swipeable */
  height: number;

  /** Renders the right component */
  rightComponent: (closeSwipeable: () => void) => React.ReactNode;

  /** Sets the content container's background color */
  contentBackgroundColor?: string;

  /** Renders a component on the bottom of the Swipeable, used for separator */
  bottomSeparator?: React.ReactNode;

  /** Background color for the leftComponent's wrapper, useful to change active color of TouchableOpacity*/
  buttonWrapperColor?: string;
}

export const Swipeable: React.FC<SwipeableProps> = props => {
  const {
    rightComponent,
    height,
    contentBackgroundColor,
    bottomSeparator,
    buttonWrapperColor,
    children,
  } = props;

  const swipeableRef = useRef<SwipeableGesture>(null);

  function renderRightActions(progress: Animated.AnimatedInterpolation) {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [60, 0],
      extrapolate: 'clamp',
    });

    return (
      <View style={{backgroundColor: buttonWrapperColor}}>
        <Animated.View
          style={[
            {
              transform: [{translateX: trans}],
            },
          ]}>
          {rightComponent(() => swipeableRef.current?.close())}
        </Animated.View>
      </View>
    );
  }

  return (
    <>
      <SwipeableGesture
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        friction={2}
        overshootLeft={false}>
        <View style={{backgroundColor: contentBackgroundColor}}>
          <View style={{height}}>{children}</View>
        </View>
      </SwipeableGesture>
      {bottomSeparator && bottomSeparator}
    </>
  );
};
