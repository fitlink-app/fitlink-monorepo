import React from 'react';
import styled from 'styled-components/native';
import {Dots, TouchHandler, TouchHandlerProps} from '@components';

const Wrapper = styled.View(({theme: {colors}}) => ({
  backgroundColor: colors.chartUnfilled,
}));

const Touchable = styled(TouchHandler)<TouchHandlerProps>({
  height: 18,
  justifyContent: 'center',
});

export const LeaderboardSeparator = ({onPress}: TouchHandlerProps) => (
  <Wrapper>
    <Touchable {...{onPress}}>
      <Dots amount={3} current={4} size={4} />
    </Touchable>
  </Wrapper>
);
