import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import styled from 'styled-components/native';

const Wrapper = styled.View({
  position: 'absolute',
  width: '100%',
  height: '64%',
  bottom: 0,
});

const UpperAreaGradient = styled(LinearGradient).attrs(({theme: {colors}}) => ({
  colors: ['#00000000', colors.background],
}))({
  width: '100%',
  height: '100%',
  bottom: '45%',
});

const LowerAreaSolid = styled.View(({theme: {colors}}) => ({
  position: 'absolute',
  width: '100%',
  height: '45%',
  bottom: 0,
  backgroundColor: colors.background,
}));

export const GradientUnderlay = () => (
  <Wrapper>
    <UpperAreaGradient />
    <LowerAreaSolid />
  </Wrapper>
);
