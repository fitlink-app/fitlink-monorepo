import {BlurView} from '@react-native-community/blur';
import React, {ComponentProps} from 'react';
import {View, StyleSheet} from 'react-native';
import styled from 'styled-components/native';

//@ts-ignore
const Container = styled(View)<{type: 'header' | 'footer'}>(({type}) => {
  const baseStyle = {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
  };
  if (type === 'header') {
    return {
      ...baseStyle,
      top: 0,
      borderBottomWidth: 2,
      borderBottomColor: 'rgba(255,255,255, .2)',
    };
  }
  return {
    ...baseStyle,
    bottom: 0,
    borderTopWidth: 2,
    borderTopColor: 'rgba(255,255,255, .2)',
  };
});

const CardBlur = styled(BlurView).attrs(() => ({
  blurType: 'dark',
  blurRadius: 2,
  blurAmount: 1,
  overlayColor: 'transparent',
}))({
  backgroundColor: 'rgba(0,0,0,0.2)',
  ...StyleSheet.absoluteFillObject,
});

type CardBlurSectionProps = ComponentProps<typeof Container> & {
  type: 'header' | 'footer';
  children: React.ReactNode;
};

export const ImageCardBlurSection = ({
  type,
  children,
  ...props
}: CardBlurSectionProps): JSX.Element => (
  <Container type={type} {...props}>
    <CardBlur />
    {children}
  </Container>
);
