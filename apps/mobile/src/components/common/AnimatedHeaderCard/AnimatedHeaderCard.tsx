import React, {FC, PropsWithChildren} from 'react';
import Animated from 'react-native-reanimated';
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import theme from '../../../theme/themes/fitlink';
import HeaderCardNavbar, {
  IAnimatedHeaderCardNavbarProps,
} from './components/HeaderCardNavbar';
import HeaderCardImageContainer, {
  IHeaderCardImageContainerProps,
} from './components/HeaderCardImageContainer';
import HeaderCardDescription, {
  IHeaderCardDescriptionProps,
} from './components/HeaderCardDescription';
import {useMeasureInitialLayout} from '@hooks';
import {useHeaderAnimatedStyles} from '../../../pages/League/hooks/useHeaderAnimatedStyles';

interface IAnimatedHeaderCardProps {
  containerStyles?: StyleProp<ViewStyle>;
  onHeightLayout?: (height: number) => unknown;
  headerProps: IAnimatedHeaderCardNavbarProps;
  imageContainerProps: Pick<
    IHeaderCardImageContainerProps,
    'imageSource' | 'p1' | 'p2' | 'p3' | 'animatedValue'
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
  const {measureInitialLayout, initialLayoutRef} = useMeasureInitialLayout();

  const {
    blurSectionStyle,
    imageBackgroundStyle,
    bfitValueContainerStyle,
    bfitValueTextStyle,
    descriptionStyle,
  } = useHeaderAnimatedStyles(
    sharedContentOffset,
    initialLayoutRef.current.height,
  );

  const onAnimatedContainerLayout = (e: LayoutChangeEvent) => {
    if (sharedContentOffset.value === 0 && onHeightLayout) {
      onHeightLayout(e.nativeEvent.layout.height);
    }
  };

  return (
    <Animated.View
      onLayout={onAnimatedContainerLayout}
      style={[styles.container, containerStyles]}>
      <HeaderCardNavbar {...headerProps} />
      <HeaderCardImageContainer
        {...imageContainerProps}
        imageBackgroundStyle={imageBackgroundStyle}
        blurSectionStyle={blurSectionStyle}
        animatedContainerStyle={bfitValueContainerStyle}
        animatedValueStyle={bfitValueTextStyle}
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
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 5,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background,
  },
});

export default AnimatedHeaderCard;
