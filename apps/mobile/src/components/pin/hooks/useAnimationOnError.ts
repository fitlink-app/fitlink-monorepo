import {useEffect} from 'react';
import {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export const useAnimationOnError = (error?: string | boolean) => {
  const animatedContentX = useSharedValue(0);

  const startAnimation = () => {
    animatedContentX.value = 0;
    animatedContentX.value = withTiming(3);
  };

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      animatedContentX.value,
      [0, 0.5, 1, 1.5, 2, 2.5, 3],
      [0, 100, 0, -100, 0, 100, 0],
    );
    return {transform: [{translateX}]};
  });

  useEffect(() => {
    if (error) {
      startAnimation();
    }
  }, [error]);

  return {animatedStyle};
};
