import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

// Note: blur collapses when image expands
const COLLAPSED_BLUR_HEIGHT = 132;
const LEAGUE_COLLAPSED_BLUR_HEIGHT = 76;
const COLLAPSED_IMAGE_HEIGHT = 210; // + 6 border
const EXPANDED_IMAGE_HEIGHT = 354; // 348 + 6 border

export const useHeaderAnimatedStyles = (
  scrollAnimatedValue: Animated.SharedValue<number>,
  initialDescriptionHeight: number,
  isLeague: boolean = false,
  firstScrollAnchor: number = 146,
  secondScrollAnchor: number = 221,
) => {
  const blurSectionStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollAnimatedValue.value,
      [-Number.MAX_SAFE_INTEGER, 0, firstScrollAnchor, Number.MAX_SAFE_INTEGER],
      [
        isLeague ? LEAGUE_COLLAPSED_BLUR_HEIGHT : COLLAPSED_BLUR_HEIGHT,
        isLeague ? LEAGUE_COLLAPSED_BLUR_HEIGHT : COLLAPSED_BLUR_HEIGHT,
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

  const expandedCardProgressOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollAnimatedValue.value,
      [0, firstScrollAnchor, secondScrollAnchor, Number.MAX_SAFE_INTEGER],
      [1, 1, 0, 0],
    );
    return {
      opacity,
    };
  });

  const shrunkCardProgressOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollAnimatedValue.value,
      [0, firstScrollAnchor, secondScrollAnchor, Number.MAX_SAFE_INTEGER],
      [0, 0, 1, 1],
    );
    return {
      opacity,
    };
  });

  const isExpanded = useDerivedValue(() =>
    Boolean(
      interpolate(
        scrollAnimatedValue.value,
        [0, firstScrollAnchor, secondScrollAnchor, Number.MAX_SAFE_INTEGER],
        [1, 1, 0, 0],
      ),
    ),
  );

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
    expandedCardProgressOpacity,
    shrunkCardProgressOpacity,
    descriptionStyle,
    isExpanded,
  };
};
