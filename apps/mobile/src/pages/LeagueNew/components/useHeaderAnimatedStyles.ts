import {useCallback, useEffect, useState} from 'react';
import {PixelRatio, Platform} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  Extrapolate,
  interpolateColor,
} from 'react-native-reanimated';

const ALLOW_ANIMATED_STYLE_TIMEOUT = 100;

export const useHeaderAnimatedStyles = (
  scrollAnimatedValue: Animated.SharedValue<number>,
  descriptionHeight: number = 75,
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
      [firstScrollAnchor, secondScrollAnchor],
      [-9, 8],
    );
    const opacity = interpolate(
      scrollAnimatedValue.value,
      [firstScrollAnchor, secondScrollAnchor],
      [1, 0],
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
    const marginTop = interpolate(
      scrollAnimatedValue.value,
      [0, firstScrollAnchor, secondScrollAnchor],
      [40, 40, 0],
    );
    const height = interpolate(
      scrollAnimatedValue.value,
      [0, firstScrollAnchor, secondScrollAnchor],
      [descriptionHeight, descriptionHeight, 0],
    );
    return {
      marginTop,
      height,
    };
  });
  return {
    blurSectionStyle,
    imageBackgroundStyle,
    bfitValueContainerStyle,
    bfitValueTextStyle,
    descriptionStyle,
  };
};
