import React from 'react';
import {Image} from 'react-native';

const logo_resource = require('../../../assets/images/logo.png');

const LARGE_SIZE: ImageSize = {width: 180, height: 35};
const MEDIUM_SIZE: ImageSize = {width: 144, height: 28};

type LogoSize = 'medium' | 'large';

interface LogoProps {
  /** Defaults to medium */
  size?: LogoSize;
}

type ImageSize = {
  width: number;
  height: number;
};

function getImageSize(size: LogoSize): ImageSize {
  switch (size) {
    case 'medium':
      return MEDIUM_SIZE;

    case 'large':
      return LARGE_SIZE;

    default:
      return MEDIUM_SIZE;
  }
}

export const Logo = ({size = 'medium'}: LogoProps) => {
  const {width, height} = getImageSize(size);

  return (
    <Image
      source={logo_resource}
      resizeMode={'contain'}
      style={{
        width,
        height,
      }}
    />
  );
};
