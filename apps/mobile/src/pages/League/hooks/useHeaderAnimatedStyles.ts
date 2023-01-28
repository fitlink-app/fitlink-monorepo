import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';

// Note: blur collapses when image expands
const COLLAPSED_BLUR_HEIGHT = 132;
const COLLAPSED_IMAGE_HEIGHT = 204;
const EXPANDED_IMAGE_HEIGHT = 348;

export const useHeaderAnimatedStyles = (
  scrollAnimatedValue: Animated.SharedValue<number>,
  initialDescriptionHeight: number,
  firstScrollAnchor: number = 146,
  secondScrollAnchor: number = 221,
) => {
  const blurSectionStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollAnimatedValue.value,
      [-Number.MAX_SAFE_INTEGER, 0, firstScrollAnchor, Number.MAX_SAFE_INTEGER],
      [
        COLLAPSED_BLUR_HEIGHT,
        COLLAPSED_BLUR_HEIGHT,
        COLLAPSED_IMAGE_HEIGHT + 2,
        COLLAPSED_IMAGE_HEIGHT + 2,
      ], // 204 + 2 (border)
    );
    return {height};
  });

  const imageBackgroundStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollAnimatedValue.value,
      [-Number.MAX_SAFE_INTEGER, 0, firstScrollAnchor, Number.MAX_SAFE_INTEGER],
      [
        EXPANDED_IMAGE_HEIGHT,
        EXPANDED_IMAGE_HEIGHT,
        COLLAPSED_IMAGE_HEIGHT,
        COLLAPSED_IMAGE_HEIGHT,
      ],
    );
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
      color: textColor as string,
    };
  });

  const descriptionStyle = useAnimatedStyle(() => {
    const marginTop = interpolate(
      scrollAnimatedValue.value,
      [
        -Number.MAX_SAFE_INTEGER,
        firstScrollAnchor,
        firstScrollAnchor + initialDescriptionHeight,
        Number.MAX_SAFE_INTEGER,
      ],
      [0, 0, -initialDescriptionHeight, -initialDescriptionHeight],
    );
    return {marginTop};
  });

  const containerStyle = useAnimatedStyle(() => {
    const top = interpolate(
      scrollAnimatedValue.value,
      [
        -Number.MAX_SAFE_INTEGER,
        0,
        firstScrollAnchor + initialDescriptionHeight,
        Number.MAX_SAFE_INTEGER,
      ],
      [
        0,
        0,
        -(firstScrollAnchor + initialDescriptionHeight),
        -(firstScrollAnchor + initialDescriptionHeight),
      ],
    );
    return {top};
  });

  return {
    containerStyle,
    blurSectionStyle,
    imageBackgroundStyle,
    bfitValueContainerStyle,
    bfitValueTextStyle,
    descriptionStyle,
  };
};
