import React from 'react';

import styled from 'styled-components/native';

import {ProgressCircle} from '@components';

import theme from '../../../theme/themes/fitlink';

interface DaysToResetProgressCircleProps {
  daysPercentage: number;
  daysToReset: number;
  size: number;
}

export const DaysToResetProgressCircle = ({
  daysPercentage,
  daysToReset,
  size,
}: DaysToResetProgressCircleProps) => (
  <ProgressCircle
    size={size}
    backgroundStrokeWidth={1}
    progress={daysPercentage}
    backgroundColor="#171717"
  >
    <STitle>DAYS</STitle>
    <SBigText>{daysToReset}</SBigText>
  </ProgressCircle>
);

const STitle = styled.Text({
  fontSize: 12,
  lineHeight: 14,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.text,
});

const SBigText = styled.Text({
  fontSize: 22,
  lineHeight: 26,
  fontWeight: 500,
  fontFamily: 'Roboto',
  color: theme.colors.accent,
});
