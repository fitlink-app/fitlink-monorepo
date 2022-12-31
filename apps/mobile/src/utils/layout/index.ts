import {Dimensions} from 'react-native';
const {width} = Dimensions.get('screen');

type BreakPoint = 'small' | 'medium' | 'large';

/** returns the current breakpoint based on viewport width */
function getBreakPoint(): BreakPoint {
  if (width <= 320) {
    return 'small';
  } else if (width <= 375) {
    return 'medium';
  } else {
    return 'large';
  }
}

type BreakPointValues = {
  default: any;
  small?: any;
  medium?: any;
  large?: any;
};

/** Accepts values for various breakpoints, and returns one of them
 * for the current viewport width, if the value for the given breakpoint is not set,
 * default value will be returned
 */
function breakValue(value: BreakPointValues): any {
  let result;

  switch (getBreakPoint()) {
    case 'small':
      result = value.small;
      break;

    case 'medium':
      result = value.medium;
      break;

    case 'large':
      result = value.large;
      break;
  }

  if (result === undefined) result = value.default;
  return result;
}

/** Returns the size of the screen in percentage */
function getPercentageSize(value: number): number {
  return (width / 100) * value;
}

export const LayoutUtils = {
  getPercentageSize,
  breakValue,
  getBreakPoint,
};
