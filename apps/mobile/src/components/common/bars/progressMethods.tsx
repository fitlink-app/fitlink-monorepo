import {Animated, Easing, ViewStyle, StyleProp} from 'react-native';

export const PROGRESS_ANIMATION_DURATION = 625;
export const PROGRESS_ANIMATION_GLOW_SHOW_DURATION = 500;
export const PROGRESS_ANIMATION_GLOW_HIDE_DURATION = 200;

/** Animate progress value and bloom effect value based on progress */
export function animateProgress(
  progress: number,
  value: Animated.Value,
  bloomValue: Animated.Value,
): void {
  const progressClamped = Math.min(Math.max(progress, 0), 1);
  // If not filled, fade out glow effect
  if (progress < 1)
    Animated.timing(bloomValue, {
      toValue: 0,
      useNativeDriver: false,
      duration: PROGRESS_ANIMATION_GLOW_HIDE_DURATION,
    }).start();

  Animated.timing(value, {
    toValue: progressClamped,
    useNativeDriver: false,
    duration: PROGRESS_ANIMATION_DURATION,
    easing: Easing.inOut(Easing.ease),
  }).start(({finished}) => {
    // If filled, animate glow effect
    if (progress >= 1 && finished)
      Animated.timing(bloomValue, {
        toValue: 1,
        useNativeDriver: false,
        duration: PROGRESS_ANIMATION_GLOW_SHOW_DURATION,
      }).start();
  });
}

/** Creates bloom effect style that can be applied to an animated view */
export const createBloomEffect = (
  bloomIntensity: number,
  bloomRadius: number,
  bloomOpacity: Animated.Value,
): Animated.WithAnimatedValue<StyleProp<ViewStyle>> => ({
  shadowOffset: {
    width: 0,
    height: 0,
  },
  shadowRadius: bloomRadius,
  shadowColor: `rgba(0,233,215, ${bloomIntensity})`,
  shadowOpacity: bloomOpacity,
});
