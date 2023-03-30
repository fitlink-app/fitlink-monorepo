import React, {FC} from 'react';
import {
  ImageSourcePropType,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import {Label} from '@components';

import {useMeasureLayout} from '@hooks';
import {DaysToResetProgressCircle} from 'pages/League/components/DaysToResetProgressCircle';
import theme from '../../../../theme/themes/fitlink';
import {ImageCardBlurSection} from '../../ImageCard';
import styled from 'styled-components/native';
import LinearGradient from 'react-native-linear-gradient';
import {Countback} from 'pages/League/hooks/useLeaderboardCountback';

const HEADER_HORIZONTAL_PADDING = 20;
const PROGRESS_CIRCLE_SIZE = 68;

export interface IHeaderCardImageContainerProps {
  imageBackgroundStyle: StyleProp<ViewStyle>;
  imageSource: ImageSourcePropType;
  blurSectionStyle?: StyleProp<ViewStyle>;
  animatedContainerStyle?: StyleProp<ViewStyle>;
  members: number;
  title: string;
  value?: string;
  countback?: Countback | null;
  onValuePress?: () => unknown;
  progress?: number;
  isExpanded: Animated.DerivedValue<boolean>;
}

export const LeagueHeaderCardImageContainer: FC<IHeaderCardImageContainerProps> =
  ({
    imageBackgroundStyle,
    imageSource,
    blurSectionStyle,
    members,
    title,
    countback,
    animatedContainerStyle,
    value,
    progress,
    isExpanded,
  }) => {
    const {measureLayout, layout} = useMeasureLayout();

    const titleWidth =
      layout.width - (HEADER_HORIZONTAL_PADDING * 3 + PROGRESS_CIRCLE_SIZE);
    const showValue = countback !== undefined || value !== undefined;
    const shouldTruncTitle = isExpanded.value && progress !== undefined;

    return (
      <Animated.View
        onLayout={measureLayout}
        style={[styles.container, imageBackgroundStyle]}
      >
        <Animated.Image style={styles.image} source={imageSource} />
        <ImageOverlay />
        <Animated.View style={[blurSectionStyle, styles.blurContainer]}>
          <ImageCardBlurSection style={styles.imageBlur} type="footer">
            <Label numberOfLines={1} style={styles.p1} appearance="accent">
              {members}
              <Label numberOfLines={1} style={styles.p1} appearance="primary">
                {members === 1 ? ' Member' : ' Members'}
              </Label>
            </Label>
            <AnimatedLabel
              numberOfLines={1}
              style={[
                styles.p2,
                shouldTruncTitle ? {width: titleWidth} : {width: '100%'},
              ]}
              type="title"
            >
              {title}
            </AnimatedLabel>
          </ImageCardBlurSection>
        </Animated.View>
        {showValue && (
          <Animated.View
            style={[
              countback === undefined ? styles.valueContainer : styles.v,
              animatedContainerStyle,
            ]}
          >
            {Boolean(value) && <Label style={styles.value}>{value}</Label>}
            {countback && (
              <DaysToResetProgressCircle
                counbackString={countback.countdownString}
                label={countback.countbackType}
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

const ImageOverlay = styled(LinearGradient).attrs(() => ({
  colors: ['#0000009e', '#00000000'],
}))({
  ...StyleSheet.absoluteFillObject,
  height: 112,
  // opacity: 0.9,
});

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
    right: 36,
    bottom: 16,
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
