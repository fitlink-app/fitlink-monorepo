import React from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

const NORMAL_IMAGE_SIZE = {width: 80, height: 44};
const SMALL_VERTICAL_IMAGE_SIZE = {width: 40, height: 44};
const SMALL_HORIZONYAL_IMAGE_SIZE = {width: 40, height: 22};

const Wrapper = styled.View({flexDirection: 'row'});

export const FeedCollage = ({images}: {images: string[]}) => {
  const renderImages = () => {
    const imageViews: JSX.Element[] = [];

    for (let index = 0; index < images.length; index++) {
      const image = images[index];

      if (index === 0 || index === 1 || (index === 2 && images.length <= 3)) {
        imageViews.push(
          <Image source={{uri: image}} style={NORMAL_IMAGE_SIZE} />,
        );
      }

      if ((index === 2 || index === 3) && images.length === 4) {
        imageViews.push(
          <Image source={{uri: image}} style={SMALL_VERTICAL_IMAGE_SIZE} />,
        );
      }
    }

    return imageViews;
  };

  return <Wrapper>{renderImages()}</Wrapper>;
};
