import React from 'react';
import {ImageStyle, StyleProp} from 'react-native';
import styled from 'styled-components/native';

const NORMAL_IMAGE_SIZE = {width: 80, height: 44};
const SMALL_VERTICAL_IMAGE_SIZE = {width: 40, height: 44};
const SMALL_HORIZONTAL_IMAGE_SIZE = {width: 40, height: 21};

const Wrapper = styled.View({flexDirection: 'row', maxWidth: 240});

const HorizontalImageContainer = styled.View({});

const NormalImage = styled.Image({
  ...NORMAL_IMAGE_SIZE,
  marginRight: 5,
  borderRadius: 5,
});

const SmallVerticalImage = styled.Image({
  ...SMALL_VERTICAL_IMAGE_SIZE,
  marginRight: 1,
  borderTopLeftRadius: 5,
  borderBottomLeftRadius: 5,
});

const SmallHorizontalImage = styled.Image({
  ...SMALL_HORIZONTAL_IMAGE_SIZE,
});

export const FeedCollage = ({images}: {images: string[]}) => {
  const renderImages = () => {
    const imageViews: JSX.Element[] = [];
    const smallHorizontalImages: JSX.Element[] = [];

    if (images.length > 5) images.length = 5;

    for (let index = 0; index < images.length; index++) {
      const image = images[index];

      if (
        (index < 3 && images.length <= 3) ||
        (index < 2 && images.length > 3)
      ) {
        imageViews.push(<NormalImage source={{uri: image}} />);
      } else if (index === 2) {
        imageViews.push(<SmallVerticalImage source={{uri: image}} />);
      } else {
        let style: StyleProp<ImageStyle> = {
          marginBottom: 1,
          borderTopRightRadius: 5,
        };

        if (index === 4) {
          style = {
            marginTop: 1,
            borderBottomRightRadius: 5,
          };
        }

        smallHorizontalImages.push(
          <SmallHorizontalImage source={{uri: image}} style={style} />,
        );
      }
    }

    return [
      ...imageViews,
      <HorizontalImageContainer>
        {smallHorizontalImages}
      </HorizontalImageContainer>,
    ];
  };

  return <Wrapper>{renderImages()}</Wrapper>;
};
