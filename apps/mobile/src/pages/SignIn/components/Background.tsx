import React from 'react';
import {Image} from 'react-native';
import styled from 'styled-components/native';

const BACKGROUND_IMAGE = require('../../../assets/images/BackgroundOnboarding.png');

const Wrapper = styled.View({
  position: 'absolute',
  alignItems: 'flex-end',
  justifyContent: 'center',
  width: '100%',
  height: '100%',
  zIndex: -1,
});

export const Background = () => (
  <Wrapper>
    <Image
      source={BACKGROUND_IMAGE}
      style={{
        right: -130,
        bottom: -40,
      }}
    />
  </Wrapper>
);
