import React, {FC} from 'react';
import {StyleSheet} from 'react-native';
import Animated from 'react-native-reanimated';

import {Label} from '@components';

import {useMeasureLayout} from '@hooks';
import {DaysToResetProgressCircle} from 'pages/League/components/DaysToResetProgressCircle';
import theme from '../../../../theme/themes/fitlink';
import {ImageCardBlurSection} from '../../ImageCard';
import {IHeaderCardImageContainerProps} from './HeaderCardImageContainer';

const HEADER_HORIZONTAL_PADDING = 36;
const PROGRESS_CIRCLE_SIZE = 86;

export const LeagueHeaderCardImageContainer: FC<IHeaderCardImageContainerProps> =
  ({
    imageBackgroundStyle,
    imageSource,
    blurSectionStyle,
    p1,
    p2,
    animatedValue,
    animatedContainerStyle,
    value,
    progress,
    isExpanded,
  }) => {
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
                shouldTruncTitle ? {width: titleWidth} : {width: '100%'},
              ]}
              type="title"
            >
              {p2}
            </AnimatedLabel>
          </ImageCardBlurSection>
        </Animated.View>
        {showValue && (
          <Animated.View
            style={[
              animatedValue === undefined ? styles.valueContainer : styles.v,
              animatedContainerStyle,
            ]}
          >
            {Boolean(value) && <Label style={styles.value}>{value}</Label>}
            {animatedValue !== undefined && (
              <DaysToResetProgressCircle
                daysToReset={Math.round(animatedValue.p1)}
                size={PROGRESS_CIRCLE_SIZE}
                daysPercentage={progress ?? 0}
              />
            )}
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
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: HEADER_HORIZONTAL_PADDING,
    justifyContent: 'flex-end',
  },
  p1: {
    fontSize: 14,
    letterSpacing: 1,
  },
  p2: {
    fontSize: 24,
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
    right: 20,
    bottom: 0,
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
