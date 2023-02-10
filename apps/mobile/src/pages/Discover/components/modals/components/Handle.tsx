import React from 'react';
import {Dimensions} from 'react-native';
import styled from 'styled-components/native';
const {width: SCREEN_WIDTH} = Dimensions.get('screen');

const Wrapper = styled.View({
  width: '100%',
  height: 12,
  flexDirection: 'row',
  justifyContent: 'center',
  backgroundColor: 'transparent',
  marginTop: -10,
});

const IndicatorContainer = styled.View({
  width: SCREEN_WIDTH / 5,
  height: 25,
  marginBottom: -15,
  backgroundColor: '#181818',
  borderTopRightRadius: 20,
  borderTopLeftRadius: 20,
  alignSelf: 'center',
});

const FirstIndicator = styled.View({
  alignSelf: 'center',
  width: (0.25 * SCREEN_WIDTH) / 6,
  height: 1,
  borderRadius: 4,
  backgroundColor: '#ACACAC',
  marginTop: 5,
});

const SecondIndicator = styled.View({
  alignSelf: 'center',
  width: (0.4 * SCREEN_WIDTH) / 6,
  height: 1,
  borderRadius: 4,
  backgroundColor: '#ACACAC',
  marginTop: 3,
});

export const Handle = () => (
  <Wrapper>
    <IndicatorContainer>
      <FirstIndicator />
      <SecondIndicator />
    </IndicatorContainer>
  </Wrapper>
);
