import React from 'react';
import {Dimensions} from 'react-native';
import styled from 'styled-components/native';

const {width: SCREEN_WIDTH} = Dimensions.get('screen');

const Wrapper = styled.View({
  width: '100%',
  height: 12,
  backgroundColor: 'transparent',
  flexDirection: 'row',
  justifyContent: 'center',
});

const IndicatorContainer = styled.View({
  width: SCREEN_WIDTH/6,
  height: 27,
  backgroundColor: '#181818',
  borderRadius: 20,
});

const FirstIndicator = styled.View({
  alignSelf: 'center',
  width: 0.25 * SCREEN_WIDTH/6,
  height: 1,
  borderRadius: 4,
  backgroundColor: '#ACACAC',
  marginTop: 5
});

const SecondIndicator = styled.View({
  alignSelf: 'center',
  width: 0.4 * SCREEN_WIDTH/6,
  height: 1,
  borderRadius: 4,
  backgroundColor: '#ACACAC',
  marginTop: 3
});

export const Handle = () => (
  <Wrapper>
    <IndicatorContainer>
      <FirstIndicator />
      <SecondIndicator />
    </IndicatorContainer>
  </Wrapper>
);
