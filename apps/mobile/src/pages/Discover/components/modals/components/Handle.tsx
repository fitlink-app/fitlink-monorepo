import React from 'react';
import {Dimensions} from 'react-native';
import styled from 'styled-components/native';

const {width: SCREEN_WIDTH} = Dimensions.get('screen');

const Container = styled.View({
  paddingHorizontal: 16,
  paddingVertical: 5,
});

const Indicator = styled.View(({theme: {colors}}) => ({
  alignSelf: 'center',
  width: (8 * SCREEN_WIDTH) / 100,
  height: 5,
  borderRadius: 4,
  backgroundColor: colors.accentSecondary,
}));

export const Handle = () => (
  <Container>
    <Indicator />
  </Container>
);
