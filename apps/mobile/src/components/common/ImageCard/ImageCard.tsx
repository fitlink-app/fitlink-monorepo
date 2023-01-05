import React, {ComponentProps} from 'react';
import {ImageSourcePropType, StyleSheet} from 'react-native';
import styled from 'styled-components/native';
import {TouchHandler} from '../TouchHandler';

const Container = styled(TouchHandler)({
  borderRadius: 20,
  overflow: 'hidden',
});

const BackgroundImage = styled.Image({
  resizeMode: 'cover',
  ...StyleSheet.absoluteFillObject,
});

type ImageCardProps = ComponentProps<typeof Container> & {
  imageSource: ImageSourcePropType;
  children: React.ReactNode;
};

export const ImageCard = ({
  imageSource,
  children,
  ...props
}: ImageCardProps): JSX.Element => {
  return (
    <Container {...props}>
      <BackgroundImage source={imageSource} />
      {children}
    </Container>
  );
};
