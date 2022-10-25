import React from 'react';
import styled from 'styled-components/native';

const Wrapper = styled.View({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
});

const UpperAreaGradient = styled.View({
  width: '100%',
  height: '100%',
  backgroundColor:
    'linear-gradient(198.06deg, rgba(6, 6, 6, 0.8) 59.02%, rgba(6, 6, 6, 0) 87.7%)',
});

const LowerAreaSolid = styled.View({
  position: 'absolute',
  width: '100%',
  height: '100%',
  top: 0,
  left: 0,
});

export const GradientUnderlay = () => (
  <Wrapper>
    <UpperAreaGradient />
    <LowerAreaSolid />
  </Wrapper>
);
