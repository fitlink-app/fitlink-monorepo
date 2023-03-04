import React, {FC, useState} from 'react';
import {
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import {Label} from '@components';

import theme from '../../../../theme/themes/fitlink';
import {ImageCardBlurSection} from '../../ImageCard';
import AvailableBfitProgressCircle from '../../../../pages/League/components/AvailableBfitProgressCircle';
import {useMeasureLayout} from '@hooks';

export interface IHeaderCardImageContainerProps {
  imageBackgroundStyle: StyleProp<ViewStyle>;
  imageSource: ImageSourcePropType;
  blurSectionStyle?: StyleProp<ViewStyle>;
  animatedContainerStyle?: StyleProp<ViewStyle>;
  p1: string;
  p2: string;
  p3?: string | null;
  value?: string;
  animatedValue?: {p1: number; p2: number};
  onValuePress?: () => unknown;
  progress?: number;
  isExpanded: Animated.DerivedValue<boolean>;
}

const HEADER_HORIZONTAL_PADDING = 20;
const PROGRESS_CIRCLE_SIZE = 86;

export const HeaderCardImageContainer: FC<IHeaderCardImageContainerProps> = ({
  imageBackgroundStyle,
  imageSource,
  blurSectionStyle,
  p1,
  p2,
  p3,
  animatedValue,
  onValuePress,
  animatedContainerStyle,
  value,
  progress,
  isExpanded,
}) => {
  const [showAltCurrency, setShowAltCurrency] = useState(false);

  const {measureLayout, layout} = useMeasureLayout();

  const titleWidth =
    layout.width - (HEADER_HORIZONTAL_PADDING * 3 + PROGRESS_CIRCLE_SIZE);
  const showValue = animatedValue !== undefined || value !== undefined;
  const shouldTruncTitle = isExpanded.value && progress !== undefined;

  return (
    <Animated.View
      onLayout={measureLayout}
      style={[styles.container, imageBackgroundStyle]}
    >
      <Animated.Image style={styles.image} source={imageSource} />
      <Animated.View style={[blurSectionStyle, styles.blurContainer]}>
        <ImageCardBlurSection style={styles.imageBlur} type="footer">
          <Label
            numberOfLines={1}
            style={styles.p1}
            appearance="accent"
            bold={true}
          >
            {p1}
          </Label>
          <AnimatedLabel
            numberOfLines={1}
            style={[
              styles.p2,
              !p3 && styles.p3absent,
              shouldTruncTitle ? {width: titleWidth} : {width: '100%'},
            ]}
            type="title"
          >
            {p2}
          </AnimatedLabel>
          {!!p3 && (
            <Label style={styles.p3} type="caption">
              {p3}
            </Label>
          )}
        </ImageCardBlurSection>
      </Animated.View>
      {showValue && (
        <AnimatedTouchableOpacity
          activeOpacity={1}
          onPress={() => {
            onValuePress?.();
            setShowAltCurrency(prev => !prev);
          }}
          style={[
            animatedValue === undefined ? styles.valueContainer : styles.v,
            animatedContainerStyle,
          ]}
        >
          {Boolean(value) && <Label style={styles.value}>{value}</Label>}
          {animatedValue !== undefined && (
            <AvailableBfitProgressCircle
              showAltCurrency={showAltCurrency}
              distributedDaily={Math.round(animatedValue.p1)}
              distributedToday={Math.round(animatedValue.p2)}
              size={PROGRESS_CIRCLE_SIZE}
              availableCurrencyPercentage={progress ?? 0}
            />
          )}
        </AnimatedTouchableOpacity>
      )}
    </Animated.View>
  );
};

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
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
    paddingHorizontal: HEADER_HORIZONTAL_PADDING,
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
    width: 250,
  },
  p3absent: {
    marginBottom: 26,
  },
  p3: {
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: theme.fonts.regular,
    color: theme.colors.text,
  },
  v: {
    right: HEADER_HORIZONTAL_PADDING,
    bottom: 23,
    position: 'absolute',
  },
  valueContainer: {
    bottom: -20,
    backgroundColor: theme.colors.text,
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
    color: theme.colors.buttonText,
  },
});

export default HeaderCardImageContainer;
