import {useCallback, useEffect, useState} from 'react';
import {PixelRatio, Platform} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  Extrapolate,
  interpolateColor,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

const ALLOW_ANIMATED_STYLE_TIMEOUT = 100;

export const useHeaderAnimatedStyles = (
  scrollAnimatedValue: Animated.SharedValue<number>,
  firstScrollAnchor: number = 146,
  secondScrollAnchor: number = 221,
) => {
  const blurSectionStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollAnimatedValue.value,
      [0, firstScrollAnchor, Number.MAX_SAFE_INTEGER],
      [132, 204, 204],
    );
    return {height};
  });
  const imageBackgroundStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollAnimatedValue.value,
      [0, firstScrollAnchor, Number.MAX_SAFE_INTEGER],
      [348, 204, 204],
    );
    console.log('height', height);
    return {height};
  });

  const bfitValueContainerStyle = useAnimatedStyle(() => {
    const bottom = interpolate(
      scrollAnimatedValue.value,
      [0, firstScrollAnchor, secondScrollAnchor, Number.MAX_SAFE_INTEGER],
      [-20, -20, 10, 10],
    );
    const opacity = interpolate(
      scrollAnimatedValue.value,
      [0, firstScrollAnchor, secondScrollAnchor, Number.MAX_SAFE_INTEGER],
      [1, 1, 0, 0],
    );
    return {
      bottom,
      backgroundColor: `rgba(255,255,255,${opacity})`,
    };
  });

  const bfitValueTextStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      scrollAnimatedValue.value,
      [firstScrollAnchor, secondScrollAnchor],
      ['#060606', '#FFFFFF'],
    );
    return {
      color: textColor,
    };
  });

  const descriptionStyle = useAnimatedStyle(() => {
    const marginTop = scrollAnimatedValue.value - firstScrollAnchor;
    return {
      marginTop: marginTop > 0 ? -marginTop : 0,
    }
  }, [secondScrollAnchor]);
  return {
    blurSectionStyle,
    imageBackgroundStyle,
    bfitValueContainerStyle,
    bfitValueTextStyle,
    descriptionStyle,
  };
};
