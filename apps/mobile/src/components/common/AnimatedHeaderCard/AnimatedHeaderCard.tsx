import React, {FC, PropsWithChildren, useState} from 'react';
import Animated from 'react-native-reanimated';
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import theme from '@theme';
import {useMeasureInitialLayout} from '@hooks';

import {useHeaderAnimatedStyles} from './hooks';
import {
  HeaderCardDescription,
  HeaderCardImageContainer,
  HeaderCardNavbar,
  HeaderCardProgressBar,
  IAnimatedHeaderCardNavbarProps,
  IHeaderCardDescriptionProps,
  IHeaderCardImageContainerProps,
} from './components';

interface IAnimatedHeaderCardProps {
  containerStyles?: StyleProp<ViewStyle>;
  onHeightLayout?: (height: number) => unknown;
  headerProps: IAnimatedHeaderCardNavbarProps;
  imageContainerProps: Pick<
    IHeaderCardImageContainerProps,
    | 'imageSource'
    | 'p1'
    | 'p2'
    | 'p3'
    | 'animatedValue'
    | 'onValuePress'
    | 'value'
  >;
  descriptionProps: Pick<
    IHeaderCardDescriptionProps,
    'description' | 'textStyle'
  >;
  sharedContentOffset: Animated.SharedValue<number>;
}

export const AnimatedHeaderCard: FC<
  PropsWithChildren<IAnimatedHeaderCardProps>
> = ({
  containerStyles,
  onHeightLayout,
  headerProps,
  imageContainerProps,
  descriptionProps,
  sharedContentOffset,
  children,
}) => {
  const {measureInitialLayout, initialLayout} = useMeasureInitialLayout();

  const [containerHeight, setContainerHeight] = useState(0);

  const progress = imageContainerProps.animatedValue?.p1
    ? (imageContainerProps.animatedValue?.p2 ?? 0) /
      imageContainerProps.animatedValue.p1
    : 0;

  const {
    blurSectionStyle,
    imageBackgroundStyle,
    descriptionStyle,
    containerStyle,
    expandedCardProgressOpacity,
    shrunkCardProgressOpacity,
    isExpanded,
  } = useHeaderAnimatedStyles(
    sharedContentOffset,
    initialLayout.height,
    progress,
  );

  const onAnimatedContainerLayout = (e: LayoutChangeEvent) => {
    if (sharedContentOffset.value === 0 && !containerHeight) {
      onHeightLayout?.(e.nativeEvent.layout.height);
      setContainerHeight(e.nativeEvent.layout.height);
    }
  };

  return (
    <Animated.View
      style={[styles.wrapper, {height: containerHeight}, containerStyle]}
    >
      <Animated.View
        onLayout={onAnimatedContainerLayout}
        style={[styles.container, containerStyles]}
      >
        <HeaderCardNavbar {...headerProps} />
        <HeaderCardImageContainer
          {...imageContainerProps}
          progress={progress}
          isExpanded={isExpanded}
          blurSectionStyle={blurSectionStyle}
          imageBackgroundStyle={imageBackgroundStyle}
          animatedContainerStyle={expandedCardProgressOpacity}
        />
        <HeaderCardProgressBar
          progress={progress}
          style={shrunkCardProgressOpacity}
        />
        {!!descriptionProps.description && (
          <HeaderCardDescription
            {...descriptionProps}
            descriptionStyle={descriptionStyle}
            measureInitialLayout={measureInitialLayout}
          />
        )}
        {children}
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    left: 0,
    right: 0,
    zIndex: 5,
    position: 'absolute',
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
  },
});

export default AnimatedHeaderCard;
