import {Dimensions, Platform, PixelRatio} from 'react-native';
const {width, height} = Dimensions.get('screen');

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

  if (result === undefined) {
    result = value.default;
  }
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

const SCREEN_WIDTH = width;
const SCREEN_HEIGHT = height - 44 - 34;

const fixed_width = 428;
const fixed_height = 812 - 78;

// based on iPhoneX's scale
const wscale: number = SCREEN_WIDTH / fixed_width;
const hscale: number = SCREEN_HEIGHT / fixed_height;

/**
 * func reduce width by size of device
 * @param size
 */

export const widthLize: (size: number, w?: number) => number = (size, w) => {
  const newSize = size * (w || wscale);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * func reduce height by size of device
 * @param size
 */
export const heightLize: (size: number, h?: number) => number = (size, h) => {
  const newSize = size * (h || hscale);
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  }
  return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
};

/**
 * func cal fontsize by size of device
 */

export const fontSizeLine: (size: number, w?: number, h?: number) => number = (
  size,
  w,
  h,
) => {
  return Math.round(
    (size * (w || wscale)) / (h || hscale) -
      (Platform.OS === 'android' ? 0.5 : 0),
  );
};
