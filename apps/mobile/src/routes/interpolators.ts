import {StackCardInterpolationProps} from '@react-navigation/stack';

const forVerticalWithOverlay = ({
  current,
  layouts,
}: StackCardInterpolationProps) => {
  return {
    overlayStyle: {
      backgroundColor: 'black',
      opacity: current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.5],
      }),
    },
    cardStyle: {
      transform: [
        {
          translateY: current.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [layouts.screen.height, 0],
          }),
        },
      ],
    },
  };
};

export const CustomInterpolators = {
  forVerticalWithOverlay,
};
