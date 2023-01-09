import React, {FC} from 'react';
import {
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import theme from '../../../../theme/themes/fitlink';
import {ImageCardBlurSection} from '../../ImageCard';
import {Label} from '@components';

export interface IHeaderCardImageContainerProps {
  imageBackgroundStyle: StyleProp<ViewStyle>;
  imageSource: ImageSourcePropType;
  blurSectionStyle?: StyleProp<ViewStyle>;
  animatedContainerStyle?: StyleProp<ViewStyle>;
  animatedValueStyle?: StyleProp<TextStyle>;
  p1: string;
  p2: string;
  p3?: string | null;
  animatedValue?: string;
}

const HeaderCardImageContainer: FC<IHeaderCardImageContainerProps> = ({
  imageBackgroundStyle,
  imageSource,
  blurSectionStyle,
  p1,
  p2,
  p3,
  animatedValue,
  animatedValueStyle,
  animatedContainerStyle,
}) => {
  return (
    <Animated.View style={[styles.container, imageBackgroundStyle]}>
      <Animated.Image style={styles.image} source={imageSource} />
      <Animated.View style={[blurSectionStyle, styles.blurContainer]}>
        <ImageCardBlurSection style={styles.imageBlur} type="footer">
          <Label style={styles.p1} appearance="accent" bold={true}>
            {p1}
          </Label>
          <Label style={styles.p2} type="title">
            {p2}
          </Label>
          {!!p3 && (
            <Label style={styles.p3} type="caption">
              {p3}
            </Label>
          )}
        </ImageCardBlurSection>
      </Animated.View>
      {animatedValue !== undefined && (
        <Animated.View style={[styles.valueContainer, animatedContainerStyle]}>
          <AnimatedLabel style={[styles.value, animatedValueStyle]}>
            {animatedValue}
          </AnimatedLabel>
        </Animated.View>
      )}
    </Animated.View>
  );
};

const AnimatedLabel = Animated.createAnimatedComponent(Label);

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  image: {
    resizeMode: 'cover',
    ...StyleSheet.absoluteFillObject,
  },
  blurContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  imageBlur: {
    top: 0,
    paddingTop: 17,
    paddingBottom: 23,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: 'flex-end',
  },
  p1: {
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  p2: {
    marginBottom: 7,
    fontSize: 32,
  },
  p3: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  valueContainer: {
    paddingRight: 30,
    paddingLeft: 30,
    paddingTop: 12,
    paddingBottom: 12,
    right: 19,
    borderRadius: 20,
    position: 'absolute',
  },
  value: {
    letterSpacing: 1,
    fontSize: 14,
    lineHeight: 16,
    textTransform: 'uppercase',
  },
});

export default HeaderCardImageContainer;
